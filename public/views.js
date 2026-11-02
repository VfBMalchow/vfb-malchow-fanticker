import {berlinDay} from './counter-time.js';
const widget=document.querySelector('#view-counter'),number=document.querySelector('#view-count');let timer,currentDay;
async function update(increment=false){try{const r=await fetch('/api/views',{method:increment?'POST':'GET',cache:'no-store',signal:AbortSignal.timeout(7000)});if(!r.ok)throw Error();const d=await r.json();if(!Number.isSafeInteger(d.count)||d.count<0)throw Error();number.textContent=new Intl.NumberFormat('de-DE').format(d.count);widget.hidden=false;currentDay=d.date;clearTimeout(timer);timer=setTimeout(()=>update(false),Math.max(1000,d.nextResetAt-Date.now()+1000));}catch{widget.hidden=true;clearTimeout(timer);}}
// Exactly one increment per document load. Polling, SPA links and midnight reads never increment.
update(true);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&currentDay&&currentDay!==berlinDay(Date.now()))update(false);});
