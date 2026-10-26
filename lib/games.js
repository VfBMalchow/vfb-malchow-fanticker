import {readFileSync} from 'node:fs';
import {retainResults} from './retention.js';
import {redisBucket} from './storage.js';
const SNAPSHOT=JSON.parse(readFileSync(new URL('../data/schedule.json',import.meta.url),'utf8'));
let lastData=null,lastAt=0;
export function filtered(d){if(!Array.isArray(d.matchDays))throw Error('Invalid upstream data');const own=m=>/^VfB\s+Malchow(?:\s|$)/i.test(m.teamDescription1)||/^VfB\s+Malchow(?:\s|$)/i.test(m.teamDescription2);const days=d.matchDays.map(day=>({...day,matches:(day.matches||[]).filter(own)}));const series=new Set(days.flatMap(d=>d.matches).map(m=>m.matchSeries));return {...d,matchDays:days,matchSeries:Object.fromEntries(Object.entries(d.matchSeries||{}).filter(([id])=>series.has(id)))};}
export async function getGames({env=process.env,fetcher=fetch,now=Date.now(),cache=true}={}){
 let d,stale=false,stamp;
 try{if(cache&&lastData&&now-lastAt<10000){d=lastData;stamp=lastAt}else{const r=await fetcher('https://backend.sams-ticker.de/live/indoor/tickers/vmv',{headers:{Accept:'application/json'},signal:AbortSignal.timeout(9000)});if(!r.ok)throw Error('Upstream unavailable');d=filtered(await r.json());lastData=d;lastAt=now;stamp=now}}
 catch{d=lastData||SNAPSHOT;stamp=lastData?lastAt:SNAPSHOT.snapshotAt;stale=true}
 let retention='unavailable';
 try{const bucket=redisBucket(env,fetcher);if(bucket){d=await retainResults(d,bucket,now);retention='ready'}}catch{retention='unavailable'}
 return {...d,stale,fetchedAt:new Date(stamp).toISOString(),retention};
}
