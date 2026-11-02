import {readFile,writeFile} from 'node:fs/promises';
import {mergeResults} from '../public/spielplan-model.js';
const path=new URL('../public/spielplan.json',import.meta.url),schedule=JSON.parse(await readFile(path,'utf8'));
const response=await fetch('https://ticker.vfb-malchow.de/api/games',{signal:AbortSignal.timeout(20000)});
if(!response.ok)throw Error('Ergebnisabgleich fehlgeschlagen: '+response.status);
const count=mergeResults(schedule,await response.json());
if(count)await writeFile(path,JSON.stringify(schedule,null,2)+'\n');
console.log(count+' Spielplaneinträge aktualisiert.');
