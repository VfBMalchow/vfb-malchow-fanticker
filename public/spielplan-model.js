const dateKey=value=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(new Date(value));
// Only match exact teams, order and Berlin calendar date. Never overwrite a
// known result from an unrelated fixture or treat an unfinished match as final.
export function mergeResults(schedule,data,now=new Date().toISOString()){
 if(!Array.isArray(data.matchDays))throw Error('Invalid ticker data');
 let changed=0;
 for(const day of data.matchDays)for(const m of day.matches||[]){
 const s=data.matchStates?.[m.id],a=s?.setPoints?.team1,b=s?.setPoints?.team2;
 if(!(s?.finished||s?.finalized)||!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a===b)continue;
 for(const t of schedule.teams)for(const f of t.matches){
 if(f.team1!==m.teamDescription1||f.team2!==m.teamDescription2||f.date!==dateKey(m.date))continue;
 if(f.result?.team1===a&&f.result?.team2===b)continue;
 f.result={team1:a,team2:b,source:'VMV/SAMS',recordedAt:now};changed++;
 }}return changed;
}

export function availableTickers(schedule,data){
 const links={};
 for(const day of data.matchDays||[])for(const m of day.matches||[]){
 const s=data.matchStates?.[m.id]||{};
 for(const t of schedule.teams)for(const f of t.matches){
 if(f.team1===m.teamDescription1&&f.team2===m.teamDescription2&&f.date===dateKey(m.date))links[f.id]={id:m.id,status:s.finished||s.finalized?'done':s.started?'live':'upcoming'};
 }}return links;
}
