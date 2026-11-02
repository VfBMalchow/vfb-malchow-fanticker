import {syncVmv} from '../lib/results-store.js';
const response=await fetch('https://ticker.vfb-malchow.de/api/games',{signal:AbortSignal.timeout(20000)});
if(!response.ok)throw Error('Ergebnisabgleich fehlgeschlagen: '+response.status);
const count=await syncVmv({live:await response.json()});
console.log(count+' VMV-Ergebnisse dauerhaft in Upstash gespeichert. Kein Commit/Push erforderlich.');
