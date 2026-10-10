import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseProfileEmbed, parseReelEmbed, parseGraphMedia } from '@/lib/igSources';

/** Builds a page shaped like Instagram's profile embed (double-encoded contextJSON). */
function embedPage(media: object[]): string {
  const ctx = JSON.stringify({ context: { graphql_media: media.map(m => ({ shortcode_media: m })) } });
  return `<script>{"contextJSON":${JSON.stringify(ctx)}}</script>`;
}

test('profile embed: videos, sidecars and pins are distinguished', () => {
  const posts = parseProfileEmbed(embedPage([
    { shortcode: 'PIN', __typename: 'GraphVideo', is_video: true, pinned_for_users: [{ id: '1' }] },
    { shortcode: 'CAR', __typename: 'GraphSidecar', is_video: false, pinned_for_users: [] },
    { shortcode: 'VID', __typename: 'GraphVideo', is_video: true, pinned_for_users: [] },
  ]));
  assert.deepEqual(posts, [
    { code: 'PIN', isVideo: true, pinned: true },
    { code: 'CAR', isVideo: false, pinned: false },
    { code: 'VID', isVideo: true, pinned: false },
  ]);
});

test('profile embed: missing blob → null (blocked / login wall)', () => {
  assert.equal(parseProfileEmbed('<html>login</html>'), null);
});

test('reel embed: duration + playability, and short pages are unverifiable', () => {
  const pad = 'x'.repeat(20000);
  assert.deepEqual(parseReelEmbed(200, `${pad}"video_url":"..","video_duration\\":42.2`), { durationSec: 42.2, playable: true });
  assert.deepEqual(parseReelEmbed(200, pad), { durationSec: 0, playable: false });
  assert.deepEqual(parseReelEmbed(200, 'short'), { durationSec: null, playable: null });
  assert.deepEqual(parseReelEmbed(429, pad), { durationSec: null, playable: null });
});

test('graph media: permalinks → codes, cursor only when data present', () => {
  const page = parseGraphMedia({
    business_discovery: { media: {
      data: [
        { permalink: 'https://www.instagram.com/reel/ABCDE12/', media_type: 'VIDEO' },
        { permalink: 'https://www.instagram.com/p/FGHIJ34/', media_type: 'IMAGE' },
        { media_type: 'VIDEO' },
      ],
      paging: { cursors: { after: 'CUR' } },
    } },
  });
  assert.deepEqual(page.posts, [
    { code: 'ABCDE12', isVideo: true, pinned: false },
    { code: 'FGHIJ34', isVideo: false, pinned: false },
  ]);
  assert.equal(page.nextCursor, 'CUR');
  assert.equal(parseGraphMedia({ business_discovery: { media: { data: [], paging: { cursors: { after: 'X' } } } } }).nextCursor, null);
});
