import { NextRequest, NextResponse } from 'next/server';
import { getService, isServiceId, serviceNodes } from '@/lib/siddur';
import { sanitizeSiddurHtml } from '@/lib/siddur/sanitize';
import type { SiddurServiceText } from '@/lib/siddur';

// The nusach changes rarely: Next's data cache keeps each Sefaria node for a
// week, and the CDN serves the assembled service for a day.
const NODE_TTL = 7 * 24 * 3600;
const INDEX = 'Siddur_Edot_HaMizrach';

function nodeUrl(node: string): string {
  const path = `${INDEX}, ${node}`.replace(/, /g, '%2C_').replace(/ /g, '_').replace(/'/g, '%27');
  // context=0 returns just the node's own segments
  return `https://www.sefaria.org/api/texts/${path}?lang=he&context=0`;
}

async function fetchNode(node: string): Promise<string[] | null> {
  try {
    const res = await fetch(nodeUrl(node), { next: { revalidate: NODE_TTL } });
    if (!res.ok) return null;
    const data = await res.json() as { he?: unknown };
    if (!Array.isArray(data.he)) return null;
    return data.he.map(s => (typeof s === 'string' ? sanitizeSiddurHtml(s) : ''));
  } catch {
    return null;
  }
}

/** Public: the sanitized Sefaria text a weekday service needs, keyed by node. */
export async function GET(_req: NextRequest, { params }: { params: { service: string } }) {
  if (!isServiceId(params.service)) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const nodes = serviceNodes(getService(params.service));
  const texts = await Promise.all(nodes.map(fetchNode));

  const body: SiddurServiceText = { nodes: {}, failed: [] };
  nodes.forEach((n, i) => {
    const t = texts[i];
    if (t && t.length > 0) body.nodes[n] = t;
    else body.failed.push(n);
  });

  // A partial failure must not be cached at the edge for a whole day.
  const cache = body.failed.length === 0
    ? 'public, s-maxage=86400, stale-while-revalidate=604800'
    : 'no-store';
  return NextResponse.json(body, { headers: { 'Cache-Control': cache } });
}
