"""Lokaler Stadtliga-Abruf ohne Hintergrunddienst. Danach committen und pushen."""
from pathlib import Path
import os,shutil,subprocess,urllib.request

def run_import():
    root=Path(__file__).resolve().parent
    with urllib.request.urlopen('https://www.meinspielplan.de/plan/zshcwv?a=print',timeout=25) as response:
        html=response.read(2_000_001)
    if len(html)>2_000_000:
        raise RuntimeError('Quelldatei unerwartet groß; Import abgebrochen')
    node=shutil.which('node')
    if not node:
        candidate=Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
        if candidate.exists():node=str(candidate)
    if not node:raise RuntimeError('Node.js wurde auf diesem Rechner nicht gefunden.')
    result=subprocess.run([node,str(root/'import-stadtliga.mjs')],input=html,capture_output=True,timeout=45,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
    if result.returncode:
        raise RuntimeError('Die Quelle hat keinen vollständigen, lesbaren Saisonplan geliefert. Der gespeicherte Stand bleibt erhalten. Du kannst alternativ einen aktuellen PDF-Spielplan über Stadtliga-Datei-importieren.cmd einlesen.')
    return result.stdout.decode('utf-8',errors='replace').strip()

if __name__=='__main__':print(run_import())
