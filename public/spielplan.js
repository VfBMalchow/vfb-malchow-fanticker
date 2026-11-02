import {mergeResults} from './spielplan-model.js';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let schedule,live={},loading=false;
const day=d=>new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'2-digit',month:'long',year:'numeric',timeZone:'Europe/Berlin'}).format(new Date(d+'T12:00:00+01:00'));
function render(){
 const requested=new URLSearchParams(location.search).get('team'),team=schedule.teams.find(t=>t.id===requested)||schedule.teams[0];
 $('#team-picker').innerHTML=schedule.teams.map(t=>`<a class="team-choice ${t.id===team.id?'selected':''}" ${t.id===team.id?'aria-current="page"':''} href="?team=${encodeURIComponent(t.id)}">${esc(t.label)}</a>`).join('');
 let html=`<div class="schedule-heading"><div><h2>${esc(team.label)}</h2><p>${esc(team.league)} · ${esc(schedule.season)}</p></div><span class="badge">${team.matches.length} ${team.id.startsWith('u16')?'Termine':'Spiele'}</span></div>`;
 const dates=[...new Set(team.matches.map(m=>m.date))].sort();
 for(const date of dates){const games=team.matches.filter(m=>m.date===date),past=date<new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(new Date());
 html+=`<article class="schedule-day"><div class="schedule-day-head"><h3>${esc(day(date))}</h3><span>${esc(games[0].round)}</span></div>`;
 for(const m of games){
 if(!m.team1){html+=`<div class="youth-fixture"><p>Spielort: ${esc(m.venue||'noch offen')} · Beginn: ${esc(m.time||'noch offen')}</p><p>Gegner und Ansetzungen werden ergänzt.</p></div>`;continue;}
 const result=m.result,st=live[m.id],home=/^Sporthalle\s+Malchow\b/i.test(m.venue||'');
 const name=(n,first)=>`<span class="schedule-team ${result&&(first?result.team1>result.team2:result.team2>result.team1)?'winner-team':''}">${n===team.name?'<strong>'+esc(n)+'</strong>':esc(n)}${result&&(first?result.team1>result.team2:result.team2>result.team1)?'<span class="winner-label">Sieger</span>':''}</span>`;
 html+=`<div class="schedule-fixture"><div class="schedule-time">${esc(m.time||'Offen')}<small>${m.time?'Uhr':''}</small></div><div class="schedule-opponents">${name(m.team1,true)}${name(m.team2,false)}<p class="venue">${home?'<span class="result-recorded">Heimspiel</span>':esc(m.venue||'Spielort noch offen')}</p></div><div class="schedule-result">${result?`<strong>${result.team1} : ${result.team2}</strong><span class="result-recorded">✓ Ergebnis erfasst</span>`:st?`<a href="./?match=${encodeURIComponent(st.id)}"><span class="badge live">● LIVE</span><small>Zum Ticker →</small></a>`:`<span class="badge">${past?'Ergebnis offen':'Angesetzt'}</span>`}</div></div>`;
 }html+='</article>';
 }
 if(team.id.startsWith('u16'))html+='<p class="schedule-note">U16 männlich und weiblich spielen an denselben Terminen, an unterschiedlichen Spielorten.</p>';
 $('#schedule-content').innerHTML=html;
}
async function refresh(){if(!schedule||loading)return;loading=true;try{const r=await fetch('/api/games',{signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error();const d=await r.json();mergeResults(schedule,d);live={};for(const day of d.matchDays||[])for(const m of day.matches||[]){const st=d.matchStates?.[m.id];if(!st?.started||st.finished||st.finalized)continue;for(const t of schedule.teams)for(const f of t.matches)if(f.team1===m.teamDescription1&&f.team2===m.teamDescription2&&f.date===new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(new Date(m.date)))live[f.id]=m;}
 render();$('#schedule-sync').textContent='Live-Abgleich aktiv · Aktualisierung alle 15 Sekunden bei geöffneter Seite.';
 }catch{$('#schedule-sync').textContent='Live-Abgleich gerade nicht verfügbar. Der gespeicherte Spielplan bleibt sichtbar.';}finally{loading=false;}}
try{const r=await fetch('spielplan.json');if(!r.ok)throw Error();schedule=await r.json();render();refresh();}catch{$('#schedule-content').innerHTML='<div class="empty">Der Spielplan konnte nicht geladen werden. Bitte lade die Seite erneut.</div>';}
document.addEventListener('click',e=>{const a=e.target.closest('.team-choice');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();history.pushState({},'',a.href);render();});window.addEventListener('popstate',()=>schedule&&render());
setInterval(()=>{if(!document.hidden)refresh();},15000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
$('#share').onclick=async()=>{try{if(navigator.share)await navigator.share({title:'VfB Malchow · Spielplan',url:location.href});else{await navigator.clipboard.writeText(location.href);$('#share').textContent='Link kopiert ✓';setTimeout(()=>$('#share').textContent='Link teilen ↗',2500);}}catch{}};
