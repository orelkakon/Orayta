/**
 * Deactivates Instagram reels whose embeds are preview-only ("Watch on
 * Instagram") — IG disallows inline playback for some media, which shows up
 * in the feed as a dead play button. Playable embeds contain `video_url`
 * in the embed page HTML; preview-only ones don't.
 *
 * Guarded against false positives: a reel is only deactivated when IG
 * returned a real embed page (HTTP 200, substantial HTML) that lacks the
 * marker. Blocked/failed fetches are skipped and reported, never touched.
 *
 * Usage: node scripts/validate-reels.js [--dry-run]
 */
const { PrismaClient } = require('@prisma/client');

const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 ' +
  '(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function checkReel(code) {
  try {
    const res = await fetch(`https://www.instagram.com/reel/${code}/embed/`, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en' },
      redirect: 'follow',
    });
    if (!res.ok) return 'skip';
    const html = await res.text();
    if (html.length < 20000) return 'skip'; // login wall / blocked — not a real embed page
    return html.includes('video_url') ? 'ok' : 'broken';
  } catch {
    return 'skip';
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const prisma = new PrismaClient();
  const reels = await prisma.instagramReel.findMany({
    where: { active: true },
    select: { id: true, code: true },
  });
  console.log(`checking ${reels.length} active reels${dryRun ? ' (dry run)' : ''}...`);

  const broken = [];
  let ok = 0, skipped = 0;
  for (const reel of reels) {
    const verdict = await checkReel(reel.code);
    if (verdict === 'ok') ok++;
    else if (verdict === 'skip') { skipped++; console.log(`  skip (unverifiable): ${reel.code}`); }
    else { broken.push(reel); console.log(`  BROKEN: ${reel.code}`); }
    await sleep(350);
  }

  if (!dryRun && broken.length > 0) {
    await prisma.instagramReel.updateMany({
      where: { id: { in: broken.map(r => r.id) } },
      data: { active: false },
    });
  }
  console.log(`\ndone: ${ok} playable, ${broken.length} broken${dryRun ? ' (not deactivated)' : ' → deactivated'}, ${skipped} unverifiable (left untouched)`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
