export function upcomingCityMatches(teams,now=new Date()){
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(now);
 const last=new Date(Date.parse(today+'T12:00:00Z')+7*86400000).toISOString().slice(0,10);
 return teams.flatMap(t=>t.matches.filter(m=>m.date>=today&&m.date<=last).map(m=>({...m,club:t.name,teamId:t.id,league:t.league}))).filter((m,i,all)=>all.findIndex(x=>x.id===m.id)===i).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
}
