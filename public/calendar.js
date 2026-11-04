import {cityTimestamp} from './stadtliga-model.js';
const escapeText=s=>String(s??'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
const stamp=d=>new Date(d).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
function fold(line){let out='',part='';for(const c of line){if(new TextEncoder().encode(part+c).length>73){out+=part+'\r\n';part=' ';}part+=c;}return out+part;}
export function makeCalendar(team,matches=team.matches,now=new Date()){
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//VfB Malchow//Fan-Ticker//DE','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:'+escapeText(team.label)];
 for(const m of matches){
 const timed=/^\d{2}:\d{2}$/.test(m.time||'');
 lines.push('BEGIN:VEVENT','UID:'+escapeText(team.id+'-'+m.id)+'@ticker.vfb-malchow.de','DTSTAMP:'+stamp(now));
 if(timed)lines.push('DTSTART:'+stamp(cityTimestamp(m)));
 else{const next=new Date(m.date+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+1);lines.push('DTSTART;VALUE=DATE:'+m.date.replaceAll('-',''),'DTEND;VALUE=DATE:'+next.toISOString().slice(0,10).replaceAll('-',''));}
 lines.push('SUMMARY:'+escapeText(m.team1?m.team1+' – '+m.team2:team.label+' · '+m.round),'LOCATION:'+escapeText(m.city||m.venue||'Spielort noch offen'),'DESCRIPTION:'+escapeText((timed?'Spielende offen.':'Beginn noch offen.')+' Änderungen möglich. Aktueller Spielplan: https://ticker.vfb-malchow.de/spielplan.html?team='+encodeURIComponent(team.id)),'URL:https://ticker.vfb-malchow.de/spielplan.html?team='+encodeURIComponent(team.id),'END:VEVENT');
 }
 return [...lines,'END:VCALENDAR'].map(fold).join('\r\n')+'\r\n';
}
export function downloadCalendar(team,matches){const url=URL.createObjectURL(new Blob([makeCalendar(team,matches)],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=team.id+(matches.length===1?'-'+matches[0].date:'-saison')+'.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
