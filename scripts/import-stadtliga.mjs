import {saveCity} from '../lib/results-store.js';
import {readFileSync,writeFileSync} from 'node:fs';
import {parseStadtliga} from '../lib/stadtliga.js';
const d=parseStadtliga(readFileSync(0,'utf8'));
const planFile=new URL('../public/spielplan.json',import.meta.url),snapshot=new URL('../public/stadtliga.json',import.meta.url);
const schedule=JSON.parse(readFileSync(planFile,'utf8'));
for(const team of d.teams){const i=schedule.teams.findIndex(t=>t.id===team.id);if(i<0)schedule.teams.push(team);else schedule.teams[i]=team;}
writeFileSync(snapshot,JSON.stringify(d,null,2)+'\n');writeFileSync(planFile,JSON.stringify(schedule,null,2)+'\n');
await saveCity(d);
console.log('Stadtliga online gespeichert: '+d.teams.map(t=>t.name+' ('+t.matches.length+' Spiele)').join(', '));
