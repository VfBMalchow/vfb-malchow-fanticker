"""Optionaler lokaler Import. Danach JSON-Änderungen committen und pushen."""
from pathlib import Path
import subprocess
import urllib.request
root=Path(__file__).resolve().parent
with urllib.request.urlopen('https://www.meinspielplan.de/plan/zshcwv?a=print',timeout=25) as response:
    html=response.read(2_000_001)
if len(html)>2_000_000:
    raise RuntimeError('Quelldatei unerwartet groß; Import abgebrochen')
subprocess.run(['node',str(root/'import-stadtliga.mjs')],input=html,check=True)
