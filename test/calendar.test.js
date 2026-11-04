import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeCalendar} from '../public/calendar.js';
import {sharePage} from '../api/share.js';
const team={id:'maenner',label:'VfB Malchow',matches:[]};
test('Kalender verwendet deutsche Winter- und Sommerzeit ohne erfundenes Spielende',()=>{for(const [date,start] of [['2026-11-15','20261115T090000Z'],['2026-09-06','20260906T080000Z']]){const text=makeCalendar(team,[{id:'a',date,time:'10:00',team1:'VfB',team2:'Gast'}]);assert.ok(text.includes('DTSTART:'+start));assert.ok(!text.includes('DTEND'));}});
test('Unbekannter Beginn wird Ganztagstermin, UID bleibt bei Verschiebung stabil',()=>{const m={id:'u16-3',date:'2027-01-30',time:null,round:'Finale'};const a=makeCalendar(team,[m]);const b=makeCalendar(team,[{...m,date:'2027-01-31'}]);assert.ok(a.includes('DTSTART;VALUE=DATE:20270130'));assert.ok(a.includes('DTEND;VALUE=DATE:20270131'));assert.equal(a.match(/UID:.*/)[0],b.match(/UID:.*/)[0]);});
test('Kalender maskiert Sonderzeichen und faltet UTF-8-Zeilen',()=>{const text=makeCalendar(team,[{id:'a',date:'2026-11-15',team1:'VfB, Test;\nText',team2:'ä'.repeat(100)}]);assert.ok(text.includes('VfB\\, Test\\;\\nText'));for(const line of text.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);});
test('Linkvorschau enthält serverseitige Metadaten und maskiert fremde Teamnamen',()=>{const html=sharePage('VfB <script> – Gast','/?match=abc');assert.ok(html.includes('og:title'));assert.ok(html.includes('VfB &lt;script&gt;'));assert.ok(html.includes('share.jpg'));assert.ok(html.includes('location.replace'));});

import {calendarDays,selectCalendarMatches} from '../public/calendar-picker.js';
test('Spieltagsauswahl bündelt beide Spiele und exportiert nur angehakte Tage',()=>{const matches=[{id:'a',date:'2026-11-15'},{id:'b',date:'2026-11-15'},{id:'c',date:'2026-11-28'}];assert.equal(calendarDays(matches).length,2);assert.deepEqual(selectCalendarMatches(matches,['2026-11-15']).map(m=>m.id),['a','b']);assert.deepEqual(selectCalendarMatches(matches,[]),[]);});
