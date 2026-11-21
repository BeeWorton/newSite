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

// The old entries table is preserved. Unlinked browsers map to their own hash;
// an opt-in identity_links row maps additional browser hashes to the same person.
// If linked browsers have entries on the same day, count the highest only.
const SCORES_CTE = `WITH ranked AS (
  SELECT COALESCE(l.player_id, e.token_hash) AS player_id, e.name, e.day, e.score,
    e.created_at, e.updated_at,
    ROW_NUMBER() OVER (PARTITION BY COALESCE(l.player_id, e.token_hash), e.day
      ORDER BY e.score DESC, e.updated_at DESC, e.created_at ASC) AS chosen
  FROM entries e LEFT JOIN identity_links l ON l.token_hash = e.token_hash
), scores AS (SELECT player_id, name, day, score, created_at, updated_at FROM ranked WHERE chosen = 1)`;
async function playerId(db, tokenHash) {
  if (!tokenHash) return null;
  const row = await db.prepare('SELECT player_id FROM identity_links WHERE token_hash = ?').bind(tokenHash).first();
  return row?.player_id || tokenHash;
}
async function dailyBoard(db, day, tokenHash) {
  const id = await playerId(db, tokenHash);
  const [rows, stats] = await Promise.all([
    db.prepare(`${SCORES_CTE} SELECT player_id,name,score,created_at FROM scores WHERE day = ? ORDER BY score DESC, created_at ASC, player_id ASC LIMIT ?`).bind(day, LIMIT).all(),
    db.prepare(`${SCORES_CTE} SELECT COUNT(*) AS count, MAX(score) AS topScore, ROUND(AVG(score)) AS average FROM scores WHERE day = ?`).bind(day).first()
  ]);
  const entries = (rows.results || []).map((row, i) => ({name:row.name, score:row.score, created_at:row.created_at, rank:i+1, isYou:!!id && id===row.player_id}));
  let me = null;
  if (id) {
    const own = await db.prepare(`${SCORES_CTE} SELECT name,score,created_at FROM scores WHERE day = ? AND player_id = ?`).bind(day,id).first();
    if (own) {
      const ahead = await db.prepare(`${SCORES_CTE} SELECT COUNT(*) AS n FROM scores WHERE day = ? AND (score > ? OR (score = ? AND (created_at < ? OR (created_at = ? AND player_id < ?))))`)
        .bind(day,own.score,own.score,own.created_at,own.created_at,id).first();
      me = {name:own.name, score:own.score, rank:(ahead?.n || 0)+1};
    }
  }
  return {date:day, entries, count:stats?.count || 0, topScore:stats?.topScore || 0, average:stats?.average || 0, me};
}
const PLAYER_TOTALS = `${SCORES_CTE}, totals AS (
  SELECT player_id, SUM(score) AS score, COUNT(*) AS dives, MAX(score) AS best,
  (SELECT name FROM scores newest WHERE newest.player_id = scores.player_id ORDER BY day DESC, updated_at DESC LIMIT 1) AS name
  FROM scores GROUP BY player_id)`;
async function allTimeBoard(db, tokenHash) {
  const id = await playerId(db,tokenHash);
  const [rows, stats] = await Promise.all([
    db.prepare(`${PLAYER_TOTALS} SELECT * FROM totals ORDER BY score DESC, best DESC, player_id ASC LIMIT ?`).bind(LIMIT).all(),
    db.prepare(`${SCORES_CTE} SELECT COUNT(DISTINCT player_id) AS count, COUNT(*) AS dives FROM scores`).first()
  ]);
  const entries = (rows.results || []).map((row,i)=>({name:row.name,score:row.score,dives:row.dives,best:row.best,rank:i+1,isYou:!!id&&id===row.player_id}));
  let me = null;
  if (id) {
    const own = await db.prepare(`${PLAYER_TOTALS} SELECT * FROM totals WHERE player_id = ?`).bind(id).first();
    if (own) {
      const rank = await db.prepare(`${PLAYER_TOTALS} SELECT COUNT(*)+1 AS rank FROM totals WHERE score > ? OR (score = ? AND (best > ? OR (best = ? AND player_id < ?)))`)
        .bind(own.score,own.score,own.best,own.best,id).first();
      me={score:own.score,dives:own.dives,best:own.best,rank:rank.rank};
    }
  }
  return {entries,count:stats?.count||0,dives:stats?.dives||0,topScore:entries[0]?.score||me?.score||0,average:0,me};
}
async function statsBoard(db, days, today) {
  const date = new Date(`${today}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate()-days+1);
  const since=date.toISOString().slice(0,10);
  const [daily, top] = await Promise.all([
    db.prepare(`${SCORES_CTE} SELECT day,COUNT(*) AS count,ROUND(AVG(score)) AS average,MAX(score) AS best FROM scores WHERE day >= ? AND day <= ? GROUP BY day ORDER BY day`).bind(since,today).all(),
    db.prepare(`${PLAYER_TOTALS} SELECT player_id,name,score FROM totals ORDER BY score DESC,player_id ASC LIMIT 5`).all()
  ]);
  const players = [];
  for (const row of top.results||[]) {
    const recent=await db.prepare(`${SCORES_CTE} SELECT day,score FROM scores WHERE player_id = ? AND day >= ? AND day <= ? ORDER BY day`).bind(row.player_id,since,today).all();
    players.push({name:row.name,total:row.score,results:(recent.results||[]).map(r=>({day:r.day,score:r.score}))});
  }
  return {days, since, until:today, daily:daily.results||[],players};
}
// V4: extended, read-only analytics. Never expose token hashes or linked player IDs.
// The overview includes every unique player/day; detailed profiles are limited to
// the 60 most active players in the selected window to bound the API response.
async function insightsBoard(db, days, today) {
  const date = new Date(`${today}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days + 1);
  const since = date.toISOString().slice(0, 10);
  const where = 'day >= ? AND day <= ?';
  const [overview, dailyRows, distributionRows, profileRows] = await Promise.all([
    db.prepare(`${SCORES_CTE} SELECT COUNT(*) AS plays, COUNT(DISTINCT player_id) AS players,
      ROUND(AVG(score),1) AS average, MAX(score) AS best FROM scores WHERE ${where}`)
      .bind(since, today).first(),
    db.prepare(`${SCORES_CTE} SELECT day, COUNT(*) AS count, ROUND(AVG(score),1) AS average,
      MAX(score) AS best FROM scores WHERE ${where} GROUP BY day ORDER BY day`)
      .bind(since, today).all(),
    db.prepare(`${SCORES_CTE} SELECT MIN(6, CAST(score / 100 AS INTEGER)) AS bucket,
      COUNT(*) AS count FROM scores WHERE ${where} GROUP BY bucket ORDER BY bucket`)
      .bind(since, today).all(),
    db.prepare(`${SCORES_CTE} SELECT s.player_id,
      (SELECT n.name FROM scores n WHERE n.player_id=s.player_id
        ORDER BY n.day DESC, n.updated_at DESC LIMIT 1) AS name,
      COUNT(*) AS plays, SUM(s.score) AS total, ROUND(AVG(s.score),1) AS average,
      MAX(s.score) AS best FROM scores s WHERE s.day >= ? AND s.day <= ?
      GROUP BY s.player_id ORDER BY plays DESC, total DESC, s.player_id ASC LIMIT 60`)
      .bind(since, today).all()
  ]);
  const profiles = profileRows.results || [];
  const profileIds = profiles.map(row => row.player_id);
  let scores = [];
  if (profileIds.length) {
    const placeholders = profileIds.map(() => '?').join(',');
    const history = await db.prepare(`${SCORES_CTE} SELECT player_id,day,score FROM scores
      WHERE ${where} AND player_id IN (${placeholders}) ORDER BY day`)
      .bind(since, today, ...profileIds).all();
    scores = history.results || [];
  }
  const resultsById = new Map(profileIds.map(id => [id, []]));
  for (const row of scores) resultsById.get(row.player_id)?.push({day:row.day, score:row.score});
  return {
    days, since, until:today,
    summary:{plays:overview?.plays || 0,players:overview?.players || 0,
      average:overview?.average || 0,best:overview?.best || 0,
      activeDays:(dailyRows.results || []).length},
    daily:(dailyRows.results || []).map(r => ({day:r.day,count:r.count,average:r.average,best:r.best})),
    distribution:(distributionRows.results || []).map(r => ({bucket:r.bucket,count:r.count})),
    playerLimit:60, limited:(overview?.players || 0) > profiles.length,
    players:profiles.map((r,i) => ({id:`p${i+1}`, name:r.name, plays:r.plays,
      total:r.total,average:r.average,best:r.best,results:resultsById.get(r.player_id) || []}))
  };
}

async function createPairCode(db, tokenHash) {
  if (!tokenHash) return error('Missing player token.');
  const id=await playerId(db,tokenHash);
  const hasScores=await db.prepare(`${SCORES_CTE} SELECT 1 AS yes FROM scores WHERE player_id = ? LIMIT 1`).bind(id).first();
  if (!hasScores) return error('Submit a score on this browser before pairing.',409);
  const bytes=crypto.getRandomValues(new Uint8Array(8));
  const code=[...bytes].map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase();
  const time=Math.floor(Date.now()/1000);
  await db.prepare('INSERT INTO device_pair_codes (code_hash,source_hash,expires_at,created_at) VALUES (?,?,?,?)')
    .bind(await hashToken(code),tokenHash,time+600,time).run();
  return json({code,expiresInSeconds:600});
}
async function redeemPairCode(request, db, tokenHash) {
  if (!tokenHash) return error('Missing player token.');
  if (!(request.headers.get('Content-Type')||'').includes('application/json')) return error('Please send JSON.');
  const raw=await request.text();
  if (raw.length>256) return error('Code is too large.',413);
  let payload;try{payload=JSON.parse(raw);}catch{return error('Invalid pairing code.');}
  const code=String(payload?.code||'').replace(/[\s-]/g,'').toUpperCase();
  if (!/^[A-F0-9]{16}$/.test(code)) return error('Invalid pairing code.');
  const codeHash=await hashToken(code), time=Math.floor(Date.now()/1000);
  const pair=await db.prepare('SELECT source_hash FROM device_pair_codes WHERE code_hash=? AND redeemed_at IS NULL AND expires_at > ?').bind(codeHash,time).first();
  if (!pair) return error('Pairing code is invalid, expired or already used.',400);
  const sourceId=await playerId(db,pair.source_hash);
  const receiverId=await playerId(db,tokenHash);
  if (sourceId===receiverId) {
    await db.prepare('UPDATE device_pair_codes SET redeemed_at=? WHERE code_hash=? AND redeemed_at IS NULL').bind(time,codeHash).run();
    return json({ok:true,alreadyLinked:true});
  }
  // Batched statements are transactional in D1. Conditional writes ensure a
  // consumed or expired code cannot be raced to attach a second browser.
  const valid='EXISTS (SELECT 1 FROM device_pair_codes WHERE code_hash=? AND redeemed_at IS NULL AND expires_at > ?)';
  await db.batch([
    db.prepare(`UPDATE identity_links SET player_id=? WHERE player_id=? AND ${valid}`).bind(sourceId,receiverId,codeHash,time),
    db.prepare(`INSERT OR REPLACE INTO identity_links (token_hash,player_id) SELECT ?,? WHERE ${valid}`).bind(receiverId,sourceId,codeHash,time),
    db.prepare(`INSERT OR REPLACE INTO identity_links (token_hash,player_id) SELECT ?,? WHERE ${valid}`).bind(tokenHash,sourceId,codeHash,time),
    db.prepare('UPDATE device_pair_codes SET redeemed_at=? WHERE code_hash=? AND redeemed_at IS NULL AND expires_at > ?').bind(time,codeHash,time)
  ]);
  return json({ok:true,alreadyLinked:false});
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
  if (request.method === 'GET' && url.pathname === '/api/insights') {
    const days = Number(url.searchParams.get('days') || 90);
    if (![7,30,90,365].includes(days)) return error('Select 7, 30, 90 or 365 days.');
    return json(await insightsBoard(env.DB, days, today));
  }
  if (request.method === 'GET' && url.pathname === '/api/stats') {
    const days = Number(url.searchParams.get('days') || 30);
    if (![7,30,90].includes(days)) return error('Select 7, 30, or 90 days.');
    return json(await statsBoard(env.DB, days, today));
  }
  if (request.method === 'POST' && url.pathname === '/api/link/create') return createPairCode(env.DB,hash);
  if (request.method === 'POST' && url.pathname === '/api/link/redeem') return redeemPairCode(request,env.DB,hash);
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
