export const SOURCE='https://www.meinspielplan.de/plan/zshcwv';
const definitions=[{id:'stadtliga-malchower',name:'Malchower Volleys',label:'Malchower Volleys',league:'Stadtliga Waren · Stadtliga 1'},{id:'stadtliga-vfb',name:'VfB Volleys',label:'VfB Volleys',league:'Stadtliga Waren · Stadtliga 2'}];
const decode=s=>s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,(all,key)=>{if(key[0]==='#'){const n=key[1].toLowerCase()==='x'?parseInt(key.slice(2),16):Number(key.slice(1));return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';}return ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',shy:'',auml:'ä',ouml:'ö',uuml:'ü',Auml:'Ä',Ouml:'Ö',Uuml:'Ü',szlig:'ß'})[key]??all;});
const text=s=>decode(s.replace(/<[^>]*>/g,' ')).replace(/\u00ad/g,'').replace(/\s+/g,' ').trim();
function city(venue){return /Malchow/i.test(venue)?'Malchow':/Röbel/i.test(venue)?'Röbel':/Torgelow/i.test(venue)?'Torgelow':/Waren|Engels|Papenberg/i.test(venue)?'Waren (Müritz)':null;}
export function parseStadtliga(html,now=new Date().toISOString()){
 if(!html.includes('Stadtliga Waren Volleyball 2026/2027'))throw Error('Unbekannter Stadtliga-Spielplan');
 const teams=definitions.map(t=>({...t,source:'stadtliga',matches:[]}));const seen=new Set();
 for(const row of html.matchAll(/<tr\b([^>]*\bmatchid_[^>]*)>([\s\S]*?)<\/tr>/gi)){
 const attrs=row[1],body=row[2],id=attrs.match(/\bmatchid_(\d+)/)?.[1],date=attrs.match(/\bmatch_date_(\d{4}-\d{2}-\d{2})/)?.[1];
 if(!id||!date||seen.has(id))continue;
 const names=[...body.matchAll(/class=["'][^"']*\bteam_name_inner\b[^"']*["'][^>]*>([\s\S]*?)<\//g)].map(m=>text(m[1]));
 if(names.length!==2||!teams.some(t=>names.includes(t.name)))continue;
 const cells=[...body.matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi)];
 const teamIndex=cells.findIndex(c=>/\bmatch_team1\b/.test(c[1]));
 const venue=teamIndex>0?text(cells[teamIndex-1][2]):'';
 const results=cells.filter(c=>/\btd_resultset\b/.test(c[1]));
 const score=results[1]&&text(results[1][2]).match(/^(\d+)\s*:\s*(\d+)$/);
 const time=text(body.match(/class=["']match_time["'][^>]*>([\s\S]*?)<\//)?.[1]||'');
 if(!time.match(/^\d{1,2}:\d{2}$/))throw Error('Spielbeginn nicht lesbar');
 const match={id:'stadtliga-'+id,date,time,round:'Spieltag '+(attrs.match(/\bmatch_round_first_(\d+)/)?.[1]||'?'),team1:names[0],team2:names[1],venue,city:city(venue),result:score?{team1:Number(score[1]),team2:Number(score[2]),source:'meinspielplan.de',recordedAt:now}:null};
 seen.add(id);for(const team of teams)if(names.includes(team.name))team.matches.push({...match});
 }
 // A partial/error page must never silently replace the full season schedule.
 for(const t of teams){if(t.matches.length!==13)throw Error('Stadtliga-Spielplan unvollständig');t.matches.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));}
 return {season:'2026/27',source:SOURCE,fetchedAt:now,teams};
}
export async function getStadtliga(fetcher=fetch){const r=await fetcher(SOURCE+'?a=print',{headers:{Accept:'text/html'},signal:AbortSignal.timeout(14000)});if(!r.ok)throw Error('Stadtliga-Quelle nicht erreichbar');return parseStadtliga(await r.text());}
