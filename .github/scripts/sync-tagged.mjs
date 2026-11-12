// Sync Instagram posts that tag @matchazenhouse into the website's "Tagged by you" carousel.
//
// Runs in GitHub Actions (see .github/workflows/sync-tagged.yml). Needs two repo secrets:
//   IG_USER_ID       the Instagram professional account ID of @matchazenhouse
//   IG_ACCESS_TOKEN  a token with instagram_basic, instagram_manage_comments, pages_read_engagement
//
// What it does:
//   1. GET /{IG_USER_ID}/tags  (Instagram only returns posts that are not private)
//   2. Downloads each photo into assets/tagged/<id>.jpg (Instagram's own image links expire)
//   3. Writes data/tagged.json, which the site reads, and removes photos no longer listed
// Posts or accounts listed in data/tagged-blocklist.json are never shown.

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const FEED = path.join(ROOT, 'data', 'tagged.json');
const BLOCK = path.join(ROOT, 'data', 'tagged-blocklist.json');
const IMG_DIR = path.join(ROOT, 'assets', 'tagged');
const GRAPH = (process.env.GRAPH_BASE || 'https://graph.facebook.com').replace(/\/$/, '');
const MAX_POSTS = Number(process.env.MAX_POSTS || 24);
const MAX_BYTES = 8 * 1024 * 1024;
const { IG_USER_ID, IG_ACCESS_TOKEN } = process.env;

if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
  console.log('IG_USER_ID / IG_ACCESS_TOKEN secrets are not set yet. Nothing to sync.');
  process.exit(0);
}
if (!/^\d+$/.test(IG_USER_ID)) { console.error('IG_USER_ID should be the numeric Instagram account ID.'); process.exit(1); }

const FULL_FIELDS = 'id,media_type,media_url,thumbnail_url,permalink,username,timestamp,children{media_type,media_url,thumbnail_url}';
const BASIC_FIELDS = 'id,media_type,media_url,username,timestamp';

async function graph(url) {
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    const e = body.error || {};
    const err = new Error(`Graph API ${res.status}: ${e.message || 'request failed'}`);
    err.code = e.code;
    throw err;
  }
  return body;
}

async function fetchTagged() {
  let fields = FULL_FIELDS;
  const out = [];
  let after = '';
  for (let page = 0; page < 8 && out.length < MAX_POSTS * 2; page++) {
    const u = new URL(`${GRAPH}/${IG_USER_ID}/tags`);
    u.searchParams.set('fields', fields);
    u.searchParams.set('limit', '25');
    u.searchParams.set('access_token', IG_ACCESS_TOKEN);
    if (after) u.searchParams.set('after', after);
    let body;
    try { body = await graph(u); }
    catch (err) {
      if (err.code === 100 && fields === FULL_FIELDS) { console.log('Retrying with basic fields:', err.message); fields = BASIC_FIELDS; page--; continue; }
      throw err;
    }
    out.push(...(body.data || []));
    const next = body.paging && body.paging.cursors && body.paging.cursors.after;
    if (!next || !(body.data || []).length || next === after) break;
    after = next;
  }
  return out;
}

function pickImage(m) {
  if (m.media_type === 'IMAGE') return m.media_url;
  if (m.media_type === 'VIDEO') return m.thumbnail_url;
  if (m.media_type === 'CAROUSEL_ALBUM') {
    const kids = (m.children && m.children.data) || [];
    const img = kids.find(k => k.media_type === 'IMAGE' && k.media_url);
    if (img) return img.media_url;
    const vid = kids.find(k => k.thumbnail_url);
    return (vid && vid.thumbnail_url) || m.media_url;
  }
  return m.media_url;
}

async function readJSON(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return fallback; }
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`image ${res.status}`);
  const type = res.headers.get('content-type') || '';
  if (!type.startsWith('image/')) throw new Error(`not an image (${type})`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES) throw new Error('image too large');
  await fs.writeFile(dest, buf);
}

const block = await readJSON(BLOCK, { ids: [], users: [] });
const blockedIds = new Set((block.ids || []).map(String));
const blockedUsers = new Set((block.users || []).map(u => String(u).replace(/^@/, '').toLowerCase()));

const media = await fetchTagged();
console.log(`Instagram returned ${media.length} tagged posts.`);

await fs.mkdir(IMG_DIR, { recursive: true });
const posts = [];
for (const m of media) {
  if (posts.length >= MAX_POSTS) break;
  const id = String(m.id || '');
  const user = String(m.username || '').toLowerCase();
  if (!/^\d+$/.test(id) || blockedIds.has(id) || (user && blockedUsers.has(user))) continue;
  const src = pickImage(m);
  if (!src || !/^https:\/\//.test(src)) continue;
  const file = path.join(IMG_DIR, `${id}.jpg`);
  try {
    await fs.access(file).catch(() => download(src, file));
  } catch (err) { console.log(`Skipping ${id}: ${err.message}`); continue; }
  const post = { id, image: `assets/tagged/${id}.jpg` };
  if (m.username) post.user = '@' + m.username;
  if (m.permalink && /^https:\/\/(www\.)?instagram\.com\//.test(m.permalink)) post.url = m.permalink;
  posts.push(post);
}

// Remove photos that are no longer in the feed.
const keep = new Set(posts.map(p => `${p.id}.jpg`));
for (const f of await fs.readdir(IMG_DIR)) {
  if (f.endsWith('.jpg') && !keep.has(f)) await fs.unlink(path.join(IMG_DIR, f));
}

const prev = await readJSON(FEED, { posts: [] });
if (JSON.stringify(prev.posts || []) === JSON.stringify(posts)) {
  console.log(`No change (${posts.length} posts).`);
} else {
  await fs.writeFile(FEED, JSON.stringify({ posts }, null, 2) + '\n');
  console.log(`Wrote ${posts.length} posts to data/tagged.json.`);
}
