export function filtered(d){if(!Array.isArray(d.matchDays))throw Error('Invalid upstream data');const own=m=>/^VfB\s+Malchow(?:\s|$)/i.test(m.teamDescription1)||/^VfB\s+Malchow(?:\s|$)/i.test(m.teamDescription2);const days=d.matchDays.map(day=>({...day,matches:(day.matches||[]).filter(own)}));const series=new Set(days.flatMap(d=>d.matches).map(m=>m.matchSeries));return {...d,matchDays:days,matchSeries:Object.fromEntries(Object.entries(d.matchSeries||{}).filter(([id])=>series.has(id)))};}
export async function getGames({fetcher=fetch,now=Date.now()}={}){
 const r=await fetcher('https://backend.sams-ticker.de/live/indoor/tickers/vmv',{headers:{Accept:'application/json',Origin:'https://vmv.sams-ticker.de'},signal:AbortSignal.timeout(9000)});
 if(!r.ok)throw Error('Upstream unavailable');
 return {...filtered(await r.json()),stale:false,fetchedAt:new Date(now).toISOString()};
}
