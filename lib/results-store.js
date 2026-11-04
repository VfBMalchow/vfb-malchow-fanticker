import {applyCityOverrides} from './stadtliga-overrides.js';
import {readFile} from 'node:fs/promises';
import {mergeResults} from '../public/spielplan-model.js';
export const VMV_KEY='fanticker:results:2026-27';
export const CITY_KEY='fanticker:stadtliga:2026-27';
export function createRedis({env=process.env,fetcher=fetch}={}){
 const raw=env.UPSTASH_REDIS_REST_URL?.trim(),token=env.UPSTASH_REDIS_REST_TOKEN?.trim().replace(/^Bearer\s+/i,'');
 if(!raw||!token)throw Error('Ergebnisspeicher nicht eingerichtet');
 let url;try{url=new URL(raw);}catch{throw Error('Ungültige Upstash-URL');}
 if(url.protocol!=='https:'||!url.hostname.endsWith('.upstash.io')||url.username||url.password||url.search||url.hash)throw Error('Ungültige Upstash-URL');
 return async function command(args){
 const res=await fetcher(url.origin,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(10000)});
 if(!res.ok)throw Error('Ergebnisspeicher nicht erreichbar (HTTP '+res.status+')');
 const d=await res.json();if(d.error)throw Error('Ergebnisspeicher hat den Befehl abgelehnt');return d.result;
 };
}
export const loadSeed=async()=>JSON.parse(await readFile(new URL('../public/spielplan.json',import.meta.url),'utf8'));
export function hashRecords(raw){
 const entries=Array.isArray(raw)?Array.from({length:raw.length/2},(_,i)=>[raw[i*2],raw[i*2+1]]):Object.entries(raw||{});
 return Object.fromEntries(entries.map(([key,val])=>[key,typeof val==='string'?JSON.parse(val):val]));
}
function validResult(r){return r&&Number.isInteger(r.team1)&&Number.isInteger(r.team2)&&r.team1>=0&&r.team2>=0&&r.team1!==r.team2;}
function sameFixture(a,b){return a.id===b.id&&a.date===b.date&&a.team1===b.team1&&a.team2===b.team2;}
export function applyResults(seed,records,city){
 const plan=structuredClone(seed);
 for(const team of plan.teams){if(team.source==='stadtliga')continue;for(const m of team.matches){const saved=records[m.id];if(saved&&sameFixture(m,saved)&&validResult(saved.result))m.result=saved.result;}}
 if(city){validateCity(city);for(const team of city.teams){const i=plan.teams.findIndex(t=>t.id===team.id);if(i>=0)plan.teams[i]=team;}}
 return applyCityOverrides(plan);
}
export function validateCity(d){
 const names={'stadtliga-malchower':'Malchower Volleys','stadtliga-vfb':'VfB Volleys'};
 if(d?.season!=='2026/27'||!Array.isArray(d.teams)||d.teams.length!==2||new Set(d.teams.map(t=>t.id)).size!==2)throw Error('Unvollständige Stadtliga-Daten');
 for(const t of d.teams){if(t.name!==names[t.id]||t.source!=='stadtliga'||t.matches?.length!==13||new Set(t.matches.map(m=>m.id)).size!==13)throw Error('Ungültige Stadtliga-Mannschaft');for(const m of t.matches){if(![m.team1,m.team2].includes(t.name)||!/^\d{4}-\d{2}-\d{2}$/.test(m.date)||!/^\d{2}:\d{2}$/.test(m.time)||m.result&&!validResult(m.result))throw Error('Ungültige Stadtliga-Ansetzung');}}
 return d;
}
export async function readStoredSchedule({command=createRedis(),seed}={}){
 seed??=await loadSeed();
 // A single read of a hash and a separate small city snapshot; no writes on page visits.
 const raw=await command(['HGETALL',VMV_KEY]);const cityRaw=await command(['GET',CITY_KEY]);
 const city=cityRaw?JSON.parse(cityRaw):null;
 return {...applyResults(seed,hashRecords(raw),city),storageAvailable:true,cityUpdatedAt:city?.fetchedAt??null};
}
export async function syncVmv({command=createRedis(),seed,live,now=new Date().toISOString()}={}){
 seed??=await loadSeed();const existing=hashRecords(await command(['HGETALL',VMV_KEY]));
 const plan=applyResults(seed,existing,null);mergeResults(plan,live,now);
 const pending=new Map();
 for(const t of plan.teams){if(t.source==='stadtliga')continue;for(const m of t.matches){if(!validResult(m.result))continue;const old=existing[m.id];if(old&&sameFixture(old,m)&&old.result.team1===m.result.team1&&old.result.team2===m.result.team2)continue;pending.set(m.id,{id:m.id,date:m.date,team1:m.team1,team2:m.team2,result:m.result});}}
 if(pending.size)await command(['HSET',VMV_KEY,...[...pending].flatMap(([id,record])=>[id,JSON.stringify(record)])]);
 // Seed city once without overwriting later uploads. Results never expire.
 const city={season:seed.season,teams:seed.teams.filter(t=>t.source==='stadtliga'),fetchedAt:seed.importedAt||now};validateCity(city);
 await command(['SET',CITY_KEY,JSON.stringify(city),'NX']);
 return pending.size;
}
export async function saveCity(data,{command=createRedis()}={}){applyCityOverrides(data);validateCity(data);await command(['SET',CITY_KEY,JSON.stringify(data)]);return data.teams.reduce((n,t)=>n+t.matches.filter(m=>m.result).length,0);}
