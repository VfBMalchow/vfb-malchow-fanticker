export function berlinDay(value=Date.now()){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value))}
export async function retainResults(d,bucket,now=Date.now()){
 if(!bucket)throw Error('Result storage unavailable');
 const today=berlinDay(now),prefix='results/'+today+'/',records=new Map();
 let cursor;do{const page=await bucket.list({prefix,cursor});for(const item of page.objects){const obj=await bucket.get(item.key);if(obj){const record=await obj.json();if(record.day===today)records.set(record.match.id,record)}}cursor=page.truncated?page.cursor:undefined}while(cursor);
 for(const day of d.matchDays||[])for(const match of day.matches||[]){const state=d.matchStates?.[match.id];if(berlinDay(match.date)!==today||!(state?.finished||state?.finalized))continue;const record={day:today,match,state,series:d.matchSeries?.[match.matchSeries]};const old=records.get(match.id);if(JSON.stringify(old)!==JSON.stringify(record))await bucket.put(prefix+match.id+'.json',JSON.stringify(record),{httpMetadata:{contentType:'application/json'}});records.set(match.id,record)}
 const merged={...d,matchDays:(d.matchDays||[]).map(day=>({...day,matches:[...(day.matches||[])]})),matchStates:{...d.matchStates},matchSeries:{...d.matchSeries}};
 for(const record of records.values()){let found=false;for(const day of merged.matchDays){if(day.matches.some(m=>m.id===record.match.id)){found=true;break}}if(!found){let day=merged.matchDays.find(day=>berlinDay(day.date)===today);if(!day){day={date:record.match.date,matches:[]};merged.matchDays.push(day)}day.matches.push(record.match)}const current=merged.matchStates[record.match.id];if(!current?.finished&&!current?.finalized)merged.matchStates[record.match.id]=record.state;if(record.series)merged.matchSeries[record.match.matchSeries]??=record.series}
 return merged;
}

