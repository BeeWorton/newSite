/**
 * Kriljoona: an independent, player-submitted daily Krillion scoreboard.
 * Cloudflare Worker + D1, with no third-party runtime dependencies.
 */
const TZ = 'America/New_York';
const LIMIT = 100;
const MAX_BODY_BYTES = 1024;
const MAX_ADMIN_BODY_BYTES = 16384;
const MAX_ADMIN_ROWS = 25;
const formatter = new Intl.DateTimeFormat('en-US', {timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit'});

function newYorkDate(now = new Date()) {
  const p = Object.fromEntries(formatter.formatToParts(now).map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {status, headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...headers
  }});
}
function error(message, status = 400) {return json({error: message}, status);}
function getToken(request) {
  // Github Pages and *.workers.dev are different sites, so an HttpOnly cookie
  // would be blocked by third-party-cookie protections. Instead, a random token
  // is stored in the visitor's browser and sent explicitly with each request.
  const token = request.headers.get('X-Kriljoona-Player') || '';
  return /^[a-f0-9]{64}$/.test(token) ? token : null;
}
function allowedOrigins(env) {
  const configured = env.ALLOWED_ORIGINS || 'https://benworton.com,https://www.benworton.com';
  return configured.split(',').map(item => item.trim()).filter(Boolean);
}
function corsHeaders(origin, env) {
  return origin && allowedOrigins(env).includes(origin) ? {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Kriljoona-Player, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  } : {'Vary':'Origin'};
}
async function hashToken(token) {
  const encoded = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}
// The administrator credential is set only through `wrangler secret put ADMIN_KEY`.
// It is never included in GitHub Pages assets or stored in the browser.
async function adminAuthorized(request, env) {
  if (typeof env.ADMIN_KEY !== 'string' || env.ADMIN_KEY.length < 32) return false;
  const supplied = request.headers.get('Authorization') || '';
  if (!supplied.startsWith('Bearer ')) return false;
  const candidate = supplied.slice(7);
  if (!candidate || candidate.length > 512) return false;
  const a = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(env.ADMIN_KEY)));
  const b = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(candidate)));
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}
function realISODate(day) {
  if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const parsed = new Date(`${day}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === day;
}
function validateAdminRow(row, index, today) {
  const prefix = `Row ${index + 1}`;
  if (!row || typeof row !== 'object' || Array.isArray(row)) throw Error(`${prefix}: Invalid entry.`);
  if (!realISODate(row.day) || row.day >= today) throw Error(`${prefix}: Enter a real past date (YYYY-MM-DD).`);
  const name = typeof row.name === 'string' ? row.name.trim() : '';
  if (name.length < 2 || name.length > 22 || /[\x00-\x1f\x7f<>]/.test(name)) throw Error(`${prefix}: Name must be 2–22 characters without markup.`);
  if (!Number.isInteger(row.score) || row.score < 0 || row.score > 700) throw Error(`${prefix}: Score must be an integer from 0 to 700.`);
  // Supplying a stable playerId links results across dates, even if display names change.
  // When omitted, the display name becomes the historical identity.
  const playerId = row.playerId == null || row.playerId === '' ? name.normalize('NFKC').toLowerCase() : row.playerId;
  if (typeof playerId !== 'string') throw Error(`${prefix}: Player ID must be text.`);
  const id = playerId.trim().normalize('NFKC').toLowerCase();
  if (id.length < 2 || id.length > 60 || /[\x00-\x1f\x7f<>]/.test(id)) throw Error(`${prefix}: Player ID must be 2–60 safe characters.`);
  return {name, day:row.day, score:row.score, id};
}
async function importHistory(request, env, today) {
  if (typeof env.ADMIN_KEY !== 'string' || env.ADMIN_KEY.length < 32) return error('Admin access is not configured.', 503);
  if (!(await adminAuthorized(request, env))) return error('Invalid administrator key.', 401);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) return error('Please send JSON.');
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > MAX_ADMIN_BODY_BYTES) return error('Import is too large.', 413);
  const body = await request.text();
  if (body.length > MAX_ADMIN_BODY_BYTES) return error('Import is too large.', 413);
  let payload;
  try { payload = JSON.parse(body); } catch { return error('Invalid JSON.'); }
  if (!payload || !Array.isArray(payload.entries) || payload.entries.length === 0 || payload.entries.length > MAX_ADMIN_ROWS) {
    return error(`Supply 1–${MAX_ADMIN_ROWS} historical entries per import.`);
  }
  let rows;
  try { rows = payload.entries.map((row, i) => validateAdminRow(row, i, today)); }
  catch (e) { return error(e.message); }
  const keys = new Set();
  for (const row of rows) {
    const key = `${row.id}\u0000${row.day}`;
    if (keys.has(key)) return error('Duplicate player ID and date in the same import.');
    keys.add(key);
  }
  const statements = [];
  for (const row of rows) {
    const identity = await hashToken(`admin-import:${row.id}`);
    statements.push(env.DB.prepare(`INSERT INTO entries (token_hash, name, day, score) VALUES (?, ?, ?, ?)
      ON CONFLICT(token_hash, day) DO UPDATE SET name = excluded.name, score = excluded.score,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`).bind(identity, row.name, row.day, row.score));
  }
  // Cloudflare D1 executes a batch as a transaction: either all rows save or none.
  await env.DB.batch(statements);
  return json({ok:true, imported:rows.length, dates:[...new Set(rows.map(r=>r.day))].sort()});
}

async function dailyBoard(db, day, tokenHash) {
  const [rows, stats] = await Promise.all([
    db.prepare('SELECT name, score, created_at FROM entries WHERE day = ? ORDER BY score DESC, created_at ASC LIMIT ?').bind(day, LIMIT).all(),
    db.prepare('SELECT COUNT(*) AS count, MAX(score) AS topScore, ROUND(AVG(score)) AS average FROM entries WHERE day = ?').bind(day).first()
  ]);
  const entries = (rows.results || []).map((row, index) => ({name: row.name, score: row.score, created_at: row.created_at, rank: index + 1}));
  let me = null;
  if (tokenHash) {
    const own = await db.prepare('SELECT name, score, created_at FROM entries WHERE day = ? AND token_hash = ?').bind(day, tokenHash).first();
    if (own) {
      const ahead = await db.prepare('SELECT COUNT(*) AS n FROM entries WHERE day = ? AND (score > ? OR (score = ? AND created_at < ?))').bind(day, own.score, own.score, own.created_at).first();
      me = {name:own.name, score:own.score, rank:(ahead?.n || 0) + 1};
      if (me.rank <= entries.length) entries[me.rank - 1].isYou = true;
    }
  }
  return {date: day, entries, count: stats?.count || 0, topScore: stats?.topScore || 0, average: stats?.average || 0, me};
}
async function allTimeBoard(db, tokenHash) {
  const query = `SELECT token_hash, SUM(score) AS score, COUNT(*) AS dives, MAX(score) AS best,
    (SELECT name FROM entries newer WHERE newer.token_hash = entries.token_hash ORDER BY day DESC, updated_at DESC LIMIT 1) AS name
    FROM entries GROUP BY token_hash ORDER BY score DESC, best DESC, token_hash ASC LIMIT ?`;
  const [rows, stats] = await Promise.all([
    db.prepare(query).bind(LIMIT).all(),
    db.prepare('SELECT COUNT(DISTINCT token_hash) AS count, COUNT(*) AS dives FROM entries').first()
  ]);
  const entries = (rows.results || []).map((row, index) => ({name:row.name, score:row.score, dives:row.dives, best:row.best, rank:index+1, isYou:!!tokenHash && row.token_hash===tokenHash}));
  // Never expose anonymous identity hashes to the client.
  let me = null;
  if (tokenHash) {
    const own = await db.prepare('SELECT SUM(score) AS score, COUNT(*) AS dives, MAX(score) AS best FROM entries WHERE token_hash = ?').bind(tokenHash).first();
    if (own?.dives) {
      const rank = await db.prepare(`SELECT COUNT(*) + 1 AS rank FROM (
        SELECT token_hash, SUM(score) AS total, MAX(score) AS best FROM entries GROUP BY token_hash
      ) WHERE total > ? OR (total = ? AND best > ?) OR (total = ? AND best = ? AND token_hash < ?)`)
        .bind(own.score, own.score, own.best, own.score, own.best, tokenHash).first();
      me = {score:own.score, dives:own.dives, best:own.best, rank:rank.rank};
    }
  }
  return {entries, count: stats?.count || 0, dives:stats?.dives || 0, topScore:entries[0]?.score || me?.score || 0, average:0, me};
}

async function handleAPI(request, env) {
  if (!env.DB) return error('The scoreboard database is not configured.', 503);
  const url = new URL(request.url);
  const token = getToken(request);
  const hash = token ? await hashToken(token) : null;
  const today = newYorkDate();
  if (request.method === 'GET' && url.pathname === '/api/health') return json({ok:true, today, timezone:TZ});
  if (request.method === 'POST' && url.pathname === '/api/admin/import') return importHistory(request, env, today);
  if (request.method === 'GET' && url.pathname === '/api/leaderboard') {
    const day = url.searchParams.get('date') || today;
    if (!realISODate(day) || day > today) return error('Choose a valid current or past date.');
    return json(await dailyBoard(env.DB, day, hash));
  }
  if (request.method === 'GET' && url.pathname === '/api/all-time') return json(await allTimeBoard(env.DB, hash));
  if (request.method === 'POST' && url.pathname === '/api/submit') {
    if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) return error('Please send JSON.');
    const length = Number(request.headers.get('Content-Length') || 0);
    if (length > MAX_BODY_BYTES) return error('Submission is too large.', 413);
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return error('Submission is too large.', 413);
    let payload;
    try {payload=JSON.parse(raw);} catch {return error('Invalid submission.');}
    if (!payload || typeof payload !== 'object') return error('Invalid submission.');
    const name = typeof payload.name==='string'?payload.name.trim():'';
    const score = payload.score;
    if (name.length < 2 || name.length > 22 || /[\x00-\x1f\x7f<>]/.test(name)) return error('Display name must be 2–22 characters with no markup.');
    if (!Number.isInteger(score) || score < 0 || score > 700) return error('Score must be a whole number from 0 to 700.');
    if (!token || !hash) return error('Missing player token.', 400);
    const tokenHash = hash;
    // One updatable entry per browser/ET day. Only the SHA-256 token hash is stored.
    await env.DB.prepare(`INSERT INTO entries (token_hash, name, day, score) VALUES (?, ?, ?, ?)
      ON CONFLICT(token_hash, day) DO UPDATE SET name = excluded.name, score = excluded.score,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`)
      .bind(tokenHash, name, today, score).run();
    return json({ok:true, day:today, name, score});
  }
  return error('API route not found.', 404);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const headers = corsHeaders(origin, env);
    if (origin && !allowedOrigins(env).includes(origin)) {
      return error('Origin not allowed.', 403);
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, {status: 204, headers});
    }
    try {
      const url = new URL(request.url);
      const response = url.pathname.startsWith('/api/')
        ? await handleAPI(request, env)
        : error('API route not found.', 404);
      const result = new Response(response.body, response);
      for (const [name,value] of Object.entries(headers)) result.headers.set(name,value);
      return result;
    } catch (e) {
      console.error('Kriljoona API error:', e);
      const response = error('Scoreboard temporarily unavailable.', 500);
      for (const [name,value] of Object.entries(headers)) response.headers.set(name,value);
      return response;
    }
  }
};
