export async function fetchCity(){
 const r=await fetch('/api/stadtliga',{signal:AbortSignal.timeout(18000)});
 if(!r.ok)throw Error('Stadtliga-Daten nicht erreichbar');const data=await r.json();
 if(!Array.isArray(data.teams)||data.teams.length!==2||data.teams.some(t=>t.matches.length!==13))throw Error('Unvollständiger Spielplan');return data;
}
export const cityTime=value=>new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
