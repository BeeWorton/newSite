import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker from './src/worker.js';
const db = new DatabaseSync(':memory:');
db.exec(readFileSync('./schema.sql','utf8'));
const mockDB = {batch: async (statements) => {db.exec('BEGIN');try{const results=[];for(const statement of statements)results.push(await statement.run());db.exec('COMMIT');return results;}catch(e){db.exec('ROLLBACK');throw e;}},prepare(sql) {const stmt = db.prepare(sql);return {first:async () => stmt.get() || null, all:async () => ({results:stmt.all()}), run:async () => stmt.run(), bind(...params){return {
  all: async () => ({results:stmt.all(...params)}),
  first: async () => stmt.get(...params) || null,
  run: async () => stmt.run(...params)
}}};}};
const env={DB:mockDB,ALLOWED_ORIGINS:'https://benworton.com,http://localhost:8000',ADMIN_KEY:'a secure randomly generated key that is at least 32 characters long'};
const token='0'.repeat(64),secondToken='1'.repeat(64);
const call=(path, init={})=>worker.fetch(new Request('https://kriljoona-api.example.workers.dev'+path, init),env);
const baseHeaders={'Origin':'https://benworton.com','X-Kriljoona-Player':token};
const get=async(path,headers=baseHeaders)=>await(await call(path,{headers})).json();
const today=(await get('/api/health')).today;
const empty=await get('/api/leaderboard');assert.equal(empty.count,0);
const preflight=await call('/api/submit',{method:'OPTIONS',headers:{'Origin':'https://benworton.com','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type, x-kriljoona-player'}});
assert.equal(preflight.status,204);
assert.match(preflight.headers.get('access-control-allow-headers'),/Authorization/);
assert.equal(preflight.headers.get('access-control-allow-origin'),'https://benworton.com');
const add=await call('/api/submit',{method:'POST',headers:{...baseHeaders,'Content-Type':'application/json'},body:JSON.stringify({name:'Meritähti',score:480})});
assert.equal(add.status,200);
assert.equal(add.headers.get('access-control-allow-origin'),'https://benworton.com');
assert.equal(add.headers.get('set-cookie'),null);
const mine=await get('/api/leaderboard');assert.equal(mine.me.name,'Meritähti');assert.equal(mine.me.rank,1);
assert.equal((await get(`/api/leaderboard?date=${today}`)).count,1);
const update=await call('/api/submit',{method:'POST',headers:{...baseHeaders,'Content-Type':'application/json'},body:JSON.stringify({name:'Meritähti',score:575})});assert.equal(update.status,200);
assert.equal((await get('/api/leaderboard')).topScore,575);
const addAnother=await call('/api/submit',{method:'POST',headers:{'Origin':'https://benworton.com','X-Kriljoona-Player':secondToken,'Content-Type':'application/json'},body:JSON.stringify({name:'Mustekala',score:600})});assert.equal(addAnother.status,200);
const all=await get('/api/all-time');assert.equal(all.count,2);assert.equal(all.me.rank,2);assert.equal(all.entries[0].name,'Mustekala');assert.equal(all.entries[0].token_hash,undefined);
const missing=await call('/api/submit',{method:'POST',headers:{'Origin':'https://benworton.com','Content-Type':'application/json'},body:JSON.stringify({name:'Sneak',score:700})});assert.equal(missing.status,400);
const bad=await call('/api/submit',{method:'POST',headers:{...baseHeaders,'Content-Type':'application/json'},body:JSON.stringify({name:'Sneak',score:701})});assert.equal(bad.status,400);
const evil=await call('/api/submit',{method:'POST',headers:{...baseHeaders,'Origin':'https://evil.example','Content-Type':'application/json'},body:JSON.stringify({name:'Sneak',score:600})});assert.equal(evil.status,403);assert.equal(evil.headers.has('access-control-allow-origin'),false);
const adminHeaders = {'Origin':'https://benworton.com','Authorization':`Bearer ${env.ADMIN_KEY}`,'Content-Type':'application/json'};
const historicalDay = '2026-11-01';
const unauthorized=await call('/api/admin/import',{method:'POST',headers:{'Origin':'https://benworton.com','Content-Type':'application/json'},body:JSON.stringify({entries:[{day:historicalDay,name:'Meritähti',score:500}]})});
assert.equal(unauthorized.status,401);
const badKey=await call('/api/admin/import',{method:'POST',headers:{...adminHeaders,Authorization:'Bearer wrong'},body:JSON.stringify({entries:[{day:historicalDay,name:'Meritähti',score:500}]})});
assert.equal(badKey.status,401);
const badHistory=await call('/api/admin/import',{method:'POST',headers:adminHeaders,body:JSON.stringify({entries:[{day:'2026-02-30',name:'Meritähti',score:500}]})});
assert.equal(badHistory.status,400);
const todayImport=await call('/api/admin/import',{method:'POST',headers:adminHeaders,body:JSON.stringify({entries:[{day:today,name:'Meritähti',score:500}]})});
assert.equal(todayImport.status,400);
const history=await call('/api/admin/import',{method:'POST',headers:adminHeaders,body:JSON.stringify({entries:[
  {day:historicalDay,name:'Jäämeri',score:430,playerId:'old-player-one'},
  {day:'2026-11-02',name:'Jäämeri',score:510,playerId:'old-player-one'},
  {day:historicalDay,name:'Kalastaja',score:390,playerId:'old-player-two'}
]})});
assert.equal(history.status,200);
assert.equal((await history.json()).imported,3);
const earlier=await get(`/api/leaderboard?date=${historicalDay}`);assert.equal(earlier.count,2);
const updated=await call('/api/admin/import',{method:'POST',headers:adminHeaders,body:JSON.stringify({entries:[{day:historicalDay,name:'Jäämeri',score:620,playerId:'old-player-one'}]})});
assert.equal(updated.status,200);
assert.equal((await get(`/api/leaderboard?date=${historicalDay}`)).topScore,620);
const allWithHistory=await get('/api/all-time');
assert.equal(allWithHistory.count,4); // 2 regular browser IDs + 2 distinct imported IDs
assert.equal(allWithHistory.entries.find(e=>e.name==='Jäämeri').score,1130);
const duplicate=await call('/api/admin/import',{method:'POST',headers:adminHeaders,body:JSON.stringify({entries:[
  {day:historicalDay,name:'Jäämeri',score:500,playerId:'same'},
  {day:historicalDay,name:'Jäämeri',score:600,playerId:'same'}
]})});
assert.equal(duplicate.status,400);
const tooMany=await call('/api/admin/import',{method:'POST',headers:adminHeaders,body:JSON.stringify({entries:Array.from({length:26},()=>({day:historicalDay,name:'Jäämeri',score:500}))})});
assert.equal(tooMany.status,400);
const evilAdmin=await call('/api/admin/import',{method:'POST',headers:{...adminHeaders,Origin:'https://evil.example'},body:JSON.stringify({entries:[{day:historicalDay,name:'Jäämeri',score:600}]})});
assert.equal(evilAdmin.status,403);
console.log('PASS: protected admin imports, dates, batch insert/update, identity grouping, validation');
console.log('PASS: daily, shared submissions, updates, all-time, identity, origin/CORS, validation');
