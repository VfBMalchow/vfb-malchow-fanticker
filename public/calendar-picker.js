import {downloadCalendar} from './calendar.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function calendarDays(matches){return [...new Set(matches.map(m=>m.date))].sort().map(date=>({date,matches:matches.filter(m=>m.date===date)}));}
export function selectCalendarMatches(matches,dates){return matches.filter(m=>dates.includes(m.date));}
export function openCalendarPicker(team){
 if(document.querySelector('#calendar-picker'))return;
 const dialog=document.createElement('dialog');dialog.id='calendar-picker';dialog.className='calendar-picker';dialog.setAttribute('aria-labelledby','calendar-picker-title');
 const days=calendarDays(team.matches);
 const dateLabel=date=>new Intl.DateTimeFormat('de-DE',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Europe/Berlin'}).format(new Date(date+'T12:00:00Z'));
 dialog.innerHTML=`<form><h2 id="calendar-picker-title">Termine im Kalender speichern</h2><p>${esc(team.label)} · Welche Termine möchtest du übernehmen?</p><fieldset class="calendar-mode"><legend>Umfang auswählen</legend><label><input type="radio" name="scope" value="season" checked> Ganze Saison (${team.matches.length} Termine)</label><label><input type="radio" name="scope" value="days"> Bestimmte Spieltage</label></fieldset><fieldset class="calendar-dates" hidden><legend>Spieltage auswählen</legend>${days.map(({date,matches})=>`<label><input type="checkbox" name="date" value="${esc(date)}"><span><strong>${esc(dateLabel(date))}</strong><small>${esc(matches[0].round||'Spieltag')} · ${matches.length} ${matches.length===1?'Termin':'Spiele'}</small></span></label>`).join('')}</fieldset><p class="calendar-note">Kalenderdatei zum Importieren. Spätere Änderungen werden nicht automatisch übernommen.</p><div class="calendar-dialog-actions"><button type="button" data-cancel>Abbrechen</button><button type="submit" class="calendar-download">Kalenderdatei herunterladen ↓</button></div></form>`;
 const form=dialog.querySelector('form'),dates=dialog.querySelector('.calendar-dates'),submit=dialog.querySelector('[type="submit"]');
 const update=()=>{const selected=form.elements.scope.value==='days';dates.hidden=!selected;submit.disabled=selected&&!dialog.querySelector('[name="date"]:checked');};
 form.addEventListener('change',update);
 form.addEventListener('submit',e=>{e.preventDefault();const matches=form.elements.scope.value==='season'?team.matches:selectCalendarMatches(team.matches,[...dialog.querySelectorAll('[name="date"]:checked')].map(el=>el.value));if(matches.length){downloadCalendar(team,matches);dialog.close();}});
 dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{dialog.remove();document.querySelector('[data-calendar="team"]')?.focus();},{once:true});
 document.body.append(dialog);dialog.showModal();
}
