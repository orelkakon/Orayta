#!/usr/bin/env python3
"""
Builds the offline OpenStreetMap snapshot used by מניין קרוב and מקווה בסביבה.

Why: the public Overpass servers block or time out requests from Vercel, so
the live OSM source almost never answered. The snapshot is the fallback the
API always has; live Overpass is still tried first when it responds.

Usage (needs `pip install osmium`, ~120MB download):
  curl -L -o /tmp/israel.osm.pbf https://download.geofabrik.de/asia/israel-and-palestine-latest.osm.pbf
  python3 scripts/osm-snapshot.py /tmp/israel.osm.pbf

Writes src/lib/minyan/data/osm-synagogues.json, osm-mikvaot.json, osm-tombs.json and osm-meta.json
(osm-tombs.json is raw input for scripts/kivrei-build.ts, not shipped as is)
(ODbL — © OpenStreetMap contributors, credited in the UI).
"""
import datetime
import json
import os
import re
import sys

import osmium

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'lib', 'minyan', 'data')

SYN_TAGS = ['name', 'name:he', 'alt_name', 'old_name', 'addr:full', 'addr:street', 'addr:housenumber', 'addr:city',
            'nusach', 'nusach:he', 'phone', 'contact:phone', 'website', 'contact:website', 'check_date',
            'service_times', 'check_date:service_times', 'source', 'religion', 'amenity', 'building']
MIK_TAGS = SYN_TAGS + ['opening_hours', 'fee', 'charge', 'female', 'male', 'gender', 'unisex', 'wheelchair',
                       'mikveh', 'mikveh:type', 'description', 'access', 'bath:type', 'disused:amenity']


MIKVEH_WORD = re.compile(r'(^|[\s"\'(])מקו(ו)?ה(?=$|[\s"\')-])')
NOT_A_MIKVEH = ('highway', 'public_transport', 'railway', 'place', 'landuse', 'historic', 'shop', 'office',
                'tourism', 'natural', 'water', 'man_made', 'boundary', 'route', 'leisure')


def is_mikveh(t):
    if t.get('amenity') == 'mikveh' or t.get('building') == 'mikveh' or t.get('bath:type') == 'mikveh' or 'mikveh' in t:
        return True
    # Untagged by type: only a working bath/building named "מקווה" — not bus stops,
    # ancient ritual baths (historic=*), or the place name "מקווה ישראל".
    name = t.get('name:he') or t.get('name') or ''
    if not MIKVEH_WORD.search(name) or 'מקווה ישראל' in name or 'בור מים' in name:
        return False
    if t.get('religion', 'jewish') != 'jewish' or any(k in t for k in NOT_A_MIKVEH):
        return False
    return t.get('amenity') in (None, 'public_bath', 'place_of_worship') or 'building' in t


TOMB_TAGS = ['name', 'name:he', 'name:en', 'alt_name', 'wikidata', 'wikipedia', 'wikipedia:he', 'opening_hours',
             'description', 'description:he', 'historic', 'tomb', 'religion', 'website', 'wheelchair', 'access',
             'check_date', 'addr:city', 'addr:street', 'addr:housenumber', 'phone']
TOMB_NAME = re.compile(r'^(קבר|קברי|ציון|מערת|אוהל|מצבת)\s')


def is_tomb(t):
    """An individual Jewish grave site: historic=tomb or a tomb-named place, not another faith's shrine."""
    if t.get('religion') not in (None, 'jewish') or 'highway' in t or 'public_transport' in t:
        return False
    name = t.get('name:he') or t.get('name') or ''
    if t.get('historic') == 'tomb' or 'tomb' in t:
        return bool(re.search(r'[\u0590-\u05FF]', name)) or t.get('religion') == 'jewish'
    return bool(TOMB_NAME.search(name)) and (t.get('religion') == 'jewish' or 'historic' in t or 'building' in t
                                             or t.get('amenity') == 'place_of_worship')


def is_synagogue(t):
    if is_mikveh(t):
        return False
    return ((t.get('amenity') == 'place_of_worship' and t.get('religion') == 'jewish')
            or (t.get('building') == 'synagogue' and t.get('religion', 'jewish') == 'jewish'))


class Collector(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.syn, self.mik, self.tomb = [], [], []

    def add(self, kind, oid, tags, ts, lat, lng):
        t = {k: v for k, v in tags}
        if t.get('disused:amenity') or t.get('abandoned:amenity'):
            return
        target, keys = ((self.mik, MIK_TAGS) if is_mikveh(t) else (self.tomb, TOMB_TAGS) if is_tomb(t)
                        else (self.syn, SYN_TAGS) if is_synagogue(t) else (None, None))
        if target is None:
            return
        rec = {'k': f'{kind}/{oid}', 'la': round(lat, 6), 'lo': round(lng, 6), 'ts': ts.strftime('%Y-%m-%d')}
        rec.update({k: t[k] for k in keys if k in t})
        target.append(rec)

    def node(self, n):
        if n.tags and n.location.valid():
            self.add('node', n.id, n.tags, n.timestamp, n.location.lat, n.location.lon)

    def way(self, w):
        if not w.tags:
            return
        pts = [(nd.lat, nd.lon) for nd in w.nodes if nd.location.valid()]
        if pts:
            self.add('way', w.id, w.tags, w.timestamp,
                     sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts))


def main(path):
    c = Collector()
    c.apply_file(path, locations=True)
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, rows in (('osm-synagogues.json', c.syn), ('osm-mikvaot.json', c.mik), ('osm-tombs.json', c.tomb)):
        rows.sort(key=lambda r: r['k'])
        with open(os.path.join(OUT_DIR, name), 'w', encoding='utf-8') as f:
            json.dump(rows, f, ensure_ascii=False, separators=(',', ':'))
        print(name, len(rows))
    with open(os.path.join(OUT_DIR, 'osm-meta.json'), 'w', encoding='utf-8') as f:
        json.dump({'date': datetime.date.today().isoformat()}, f)


if __name__ == '__main__':
    main(sys.argv[1])
