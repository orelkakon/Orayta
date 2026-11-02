#!/usr/bin/env python3
"""
Builds the list of cities and towns used to name the area of a nearby search
in the admin statistics (lib/nearbyStats/area.ts) — so a search is stored as
"ירושלים", never as coordinates.

Usage (same extract as scripts/osm-snapshot.py, needs `pip install osmium`):
  python3 scripts/osm-towns.py /tmp/israel.osm.pbf

Writes src/lib/nearbyStats/data/towns.json: [[name, lat, lng], ...]
(ODbL — © OpenStreetMap contributors).
"""
import json
import os
import re
import sys

import osmium

OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'lib', 'nearbyStats', 'data', 'towns.json')
HEBREW = re.compile(r'[֐-׿]')


class Towns(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.rows = {}

    def node(self, n):
        if n.tags.get('place') not in ('city', 'town') or not n.location.valid():
            return
        name = n.tags.get('name:he') or n.tags.get('name') or ''
        if HEBREW.search(name):
            self.rows[name] = [name, round(n.location.lat, 4), round(n.location.lon, 4)]


def main(path):
    t = Towns()
    t.apply_file(path)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    rows = sorted(t.rows.values())
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(rows, f, ensure_ascii=False, separators=(',', ':'))
    print('towns', len(rows))


if __name__ == '__main__':
    main(sys.argv[1])
