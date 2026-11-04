// Confirmed fixture changes that differ from the source schedule.
export function applyCityOverrides(data){
 for(const team of data.teams||[])for(const match of team.matches||[]){
  if(team.id==='stadtliga-malchower'&&match.id==='stadtliga-59600540'){
   match.originalDate='2026-10-27';
   match.date='2026-11-03';
   match.venue='Sporthalle Malchow';
   match.city='Malchow';
  }
 }
 return data;
}
