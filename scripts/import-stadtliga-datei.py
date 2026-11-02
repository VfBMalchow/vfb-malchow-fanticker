"""Lokaler Dateiimport: HTML oder meinspielplan.de-PDFs; keine Netzwerkabrufe."""
from pathlib import Path
import json,re,subprocess,sys,unicodedata
from datetime import datetime,timezone
from stadtliga_credentials import get_env,configure
ROOT=Path(__file__).resolve().parent.parent
MONTHS={'Jan':1,'Feb':2,'Mär':3,'Mrz':3,'Apr':4,'Mai':5,'Jun':6,'Jul':7,'Aug':8,'Sep':9,'Okt':10,'Nov':11,'Dez':12}
def normal(s):return re.sub(r'[^a-z0-9äöüß]','',unicodedata.normalize('NFKC',s).lower())
def parse_pdf(path,schedule):
 import pdfplumber
 rows=[]
 with pdfplumber.open(path) as pdf:
  text=' '.join(p.extract_text() or '' for p in pdf.pages)
  if '2026/2027' not in text or 'Stadtliga' not in text:raise ValueError('Kein Stadtliga-Plan für die Saison 2026/27.')
  for page in pdf.pages:
   edges=[x for x in page.rects if x['height']<2 and x['width']>5]
   ys=sorted(set(round(x['top'],2) for x in edges))
   if not ys:continue
   border=max(ys,key=lambda y:sum(abs(x['top']-y)<.1 for x in edges))
   xs=sorted(set(round(v,2) for x in edges if abs(x['top']-border)<.1 for v in [x['x0'],x['x1']]))
   if len(xs)!=9:raise ValueError('PDF-Tabellenaufbau unbekannt. Bitte die HTML-Druckansicht importieren.')
   for top,bottom in zip(ys,ys[1:]):
    if bottom-top<15:continue
    cells=[page.crop((xs[i]+.6,top+1,xs[i+1]-.6,bottom-.5)).extract_text() or '' for i in range(8)]
    date=re.search(r'(\d{1,2})\.\s*([A-Za-zäöüÄÖÜ]+)\.?\s*(20\d{2})\s*-\s*(\d{1,2}:\d{2})',cells[0])
    if not date:continue
    first=re.search(r'^\s*(\d+)\s',cells[0])
    if not first:raise ValueError('Spieltag im PDF nicht erkannt.')
    d,month,y,time=date.groups()
    if month not in MONTHS:raise ValueError('Monat nicht erkannt: '+month)
    date=f'{y}-{MONTHS[month]:02d}-{int(d):02d}'
    score=re.fullmatch(r'\s*(\d+)\s*:\s*(\d+)\s*',cells[6])
    if cells[6].strip() and not score:raise ValueError('Ergebnis nicht eindeutig lesbar.')
    rows.append({'round':'Spieltag '+first[1],'date':date,'time':time.zfill(5),'team1':cells[2],'team2':cells[4],'venue':cells[1].replace('\n',' '),'result':{'team1':int(score[1]),'team2':int(score[2]),'source':'PDF meinspielplan.de','recordedAt':datetime.now(timezone.utc).isoformat()} if score else None})
 if len(rows)!=13 or len(set(x['round'] for x in rows))!=13:raise ValueError('Es müssen genau 13 eindeutige Spiele enthalten sein; erkannt: '+str(len(rows)))
 teams=[t for t in schedule['teams'] if t.get('source')=='stadtliga']
 matches=[t for t in teams if all(any(normal(t['name'])==normal(row[k]) for k in ['team1','team2']) for row in rows)]
 if len(matches)!=1:raise ValueError('Vereinsmannschaft im PDF nicht eindeutig erkannt.')
 team=json.loads(json.dumps(matches[0]));lookup={m['round']:m for m in team['matches']}
 for row in rows:
  old=lookup.get(row['round'])
  if not old or any(normal(old[k]) not in normal(row[k]) for k in ['team1','team2']):raise ValueError('Paarung stimmt nicht mit dem gespeicherten Saisonplan überein: '+row['round']+' '+repr([(old or {}).get(k) for k in ['team1','team2']])+' / '+repr([row[k] for k in ['team1','team2']]))
  # Keep the verified team names, IDs and city. Dates/times/venue/results come from the PDF.
  for k in ['date','time','venue','result']:old[k]=row[k]
  venue=row['venue']
  old['city']='Malchow' if 'Malchow' in venue else 'Röbel' if 'Röbel' in venue else 'Torgelow' if 'Torgelow' in venue else 'Waren (Müritz)' if re.search('Waren|Engels|Papenberg',venue) else None
 return [team]
def read_updates(paths,schedule):
 updates={}
 for path in paths:
  if path.suffix.lower()=='.pdf':teams=parse_pdf(path,schedule)
  elif path.suffix.lower() in ['.html','.htm']:
   code="import{readFileSync}from'node:fs';import{parseStadtliga}from'./lib/stadtliga.js';process.stdout.write(JSON.stringify(parseStadtliga(readFileSync(0,'utf8'))));"
   result=subprocess.run(['node','--input-type=module','-e',code],cwd=ROOT,input=path.read_bytes(),capture_output=True,check=True)
   teams=json.loads(result.stdout)['teams']
  else:raise ValueError('Bitte einen PDF- oder HTML-Spielplan auswählen.')
  for t in teams:
   if t['id'] in updates:raise ValueError('Mehrere Dateien für dieselbe Mannschaft ausgewählt. Bitte nur die aktuelle Datei verwenden.')
   updates[t['id']]=t
 return updates

def run():
 check='--check' in sys.argv
 paths=[Path(p) for p in sys.argv[1:] if p!='--check']
 gui=None
 if not paths:
  import tkinter as tk
  from tkinter import filedialog,messagebox
  gui=tk.Tk();gui.withdraw()
  paths=[Path(p) for p in filedialog.askopenfilenames(title='Aktuelle Stadtliga-Spielpläne auswählen',filetypes=[('Spielpläne','*.pdf *.html *.htm')])]
  if not paths:return
 try:
  file=ROOT/'public/spielplan.json';schedule=json.loads(file.read_text(encoding='utf-8'))
  updates=read_updates(paths,schedule)
  summary='\n'.join(t['name']+': 13 Spiele, '+str(sum(m['result'] is not None for m in t['matches']))+' Ergebnisse' for t in updates.values())
  if check:print(summary);return
  if gui:
   from tkinter import messagebox
   if not messagebox.askyesno('Import prüfen',summary+'\n\nDie gespeicherten Termine und Ergebnisse dieser Teams werden durch die ausgewählten Dateien ersetzt. Wirklich übernehmen?'):return
  if gui and not configure(gui):return
  upload_env=get_env()
  # Complete validation before writing either file; files remain recoverable through Git.
  for i,t in enumerate(schedule['teams']):
   if t['id'] in updates:schedule['teams'][i]=updates[t['id']]
  city={'season':'2026/27','source':'https://www.meinspielplan.de/plan/zshcwv','fetchedAt':datetime.now(timezone.utc).isoformat(),'teams':[t for t in schedule['teams'] if t.get('source')=='stadtliga']}
  file.write_text(json.dumps(schedule,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
  (ROOT/'public/stadtliga.json').write_text(json.dumps(city,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
  subprocess.run(['node',str(ROOT/'scripts/publish-city.mjs')],env=upload_env,check=True,capture_output=True)
  if gui:messagebox.showinfo('Import erfolgreich',summary+'\n\nOnline gespeichert. Die Website übernimmt den neuen Stand innerhalb von etwa 60 Sekunden. Kein Commit oder Push nötig.')
  else:print(summary+'\nOnline gespeichert. Kein Commit oder Push nötig.')
 except Exception as error:
  if gui:
   from tkinter import messagebox
   messagebox.showerror('Import abgebrochen',str(error)+'\n\nDie Online-Speicherung wurde nicht bestätigt. Eine lokale Sicherung kann bereits aktualisiert worden sein. Bitte Zugang prüfen und erneut versuchen.')
  else:raise
 finally:
  if gui:gui.destroy()
if __name__=='__main__':run()
