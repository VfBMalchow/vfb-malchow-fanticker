import {readFileSync} from 'node:fs';
import {saveCity} from '../lib/results-store.js';
const d=JSON.parse(readFileSync(new URL('../public/stadtliga.json',import.meta.url),'utf8'));
const count=await saveCity(d);console.log('Stadtliga online gespeichert: '+count+' Ergebnisse.');
