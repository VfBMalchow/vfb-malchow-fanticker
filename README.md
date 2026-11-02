# VfB Malchow · Fan-Ticker

Mobile Spielliste und Live-Spielstand beider VfB-Malchow-Mannschaften. Vereinsfarben, Logos und Salis-Twins-Footer. Keine Datenbank, kein Upstash und keine Umgebungsvariablen erforderlich.

## Verhalten

Die serverseitige Vercel Function liest die öffentliche VMV-/SAMS-Datenquelle bei jedem Abruf und filtert auf VfB Malchow. Die Oberfläche aktualisiert sich alle 15 Sekunden, solange sie sichtbar geöffnet ist.

Auch beendete Spiele werden angezeigt, einschließlich Endstand und Satzdetails. Sie bleiben genau so lange verfügbar, wie VMV/SAMS sie liefert. Es gibt keine eigene Archivierung und keine selbst garantierte Frist bis 23:59 Uhr. Nach einem Quellausfall bleibt auf einer bereits geöffneten Seite der letzte geladene Stand mit einem Verbindungsfehler sichtbar; neu geöffnete Seiten zeigen einen Ladefehler. Es werden keine fest eingebauten alten Termine als Ersatz geladen.

## Vercel

1. Repository auf GitHub hochladen bzw. die geänderten Dateien ersetzen.
2. In Vercel als neues Projekt importieren: Framework **Other**, Root **./**.
3. Build **npm run build**, Output **public**, Node.js **22.x**. Die Datei vercel.json konfiguriert den Build bereits.
4. Deploy. Bei einem bestehenden verbundenen Projekt löst ein GitHub-Commit die Veröffentlichung automatisch aus.
5. Es sind keine Umgebungsvariablen erforderlich. Eventuell früher angelegte Redis-Variablen werden vom Code nicht mehr verwendet.

## Eigene Subdomain

Vercel → Projekt → Settings → Domains → `ticker.vfb-malchow.de` hinzufügen. Den dort genannten CNAME bei eurem DNS-Anbieter für den Host `ticker` setzen. Eventuell zusätzlich den angezeigten TXT-Eintrag setzen. Bestehende Hauptdomain und Mail-Einträge nicht verändern. Nach DNS-Bestätigung wird HTTPS eingerichtet.

## Lokal

Node.js 22. `npm run dev` → http://127.0.0.1:8780. `npm test` prüft abgeschlossene Spiele, Datenfilter und Ausfälle. `npm run build` prüft Dateien und JavaScript-Syntax. Keine npm-Abhängigkeiten erforderlich.

Die Vercel-API ruft SAMS serverseitig auf. `/api/logo` erlaubt nur HTTPS-Bilder aus Uploadpfaden auf SAMS-Servern und ist kein allgemeiner Proxy.


## Vereins-Spielpläne
`public/spielplan.json` enthält nur Vereinsansetzungen und Ergebnisse (CSV-Import 02.11.2026). Die Spielplan-Seite ist unter `/spielplan.html` erreichbar. U16-Spielorte und Uhrzeiten sind noch offen.

Der Workflow „Spielplan-Ergebnisse abgleichen“ liest am Wochenende stündlich (07:17–22:17 UTC, Ausführungen können sich verzögern) unseren bestehenden `/api/games`-Endpunkt und speichert neue Endstände passender Spiele in `public/spielplan.json`. Neue Commits lösen regulär die Vercel-Veröffentlichung aus. Voraussetzung: GitHub Actions und Schreibrechte für den Workflow auf dem Standardbranch. Unter Actions lässt sich der Workflow auch manuell starten. Kein zusätzlicher Speicheranbieter erforderlich. Lokal: `node scripts/sync-results.mjs`.

Die geöffnete Spielplan-Seite zeigt bereits aktuelle Endstände aus dem Live-Abgleich. Dauerhaft bleiben diese erst nach erfolgreichem Workflow-Lauf. Falls die Quelle ein Ergebnis zwischen zwei Läufen entfernt, muss es aus einem neuen CSV-Export ergänzt werden. „Ergebnis erfasst“ kennzeichnet einen vorhandenen Endstand, keine amtliche Prüfung. Ergebnisänderungen werden bei erneuter Bereitstellung übernommen.


## Stadtliga Waren
Die zwei Stadtliga-Teams werden getrennt über `/api/stadtliga` aus der öffentlichen Druckansicht von https://www.meinspielplan.de/plan/zshcwv gelesen. Es erfolgt ein Abruf beim Laden sowie auf manuellen Klick, ohne Intervall oder Sichtbarkeitsabruf. Ein gemeinsamer Server-/CDN-Cache (60 Sekunden pro Instanz/Standort) begrenzt wiederholte Anfragen. Der Aktualisieren-Button kann daher bis zu 60 Sekunden alte Daten anzeigen.

Der Parser erwartet den Saisonplan 2026/27 und genau 13 Spiele je Team. Bei Abweichungen oder Fehlern bleibt der gespeicherte Stand aus `public/spielplan.json` bzw. `public/stadtliga.json` sichtbar und wird als solcher gekennzeichnet. Nach Änderungen des Seitenaufbaus oder Saisonwechsel muss der Parser angepasst werden. Die Herkunft und der Abrufzeitpunkt sind sichtbar. Stadtliga-Daten sind keine Live-Werte.

Auf der Startseite werden Spiele anhand des deutschen Kalenderdatums ab sieben Tagen vor dem Termin bis Spieltagsende gezeigt. Ergebnisse erscheinen erst nach Eintragung durch den Veranstalter. Der manuelle Abruf aktualisiert die Ansicht, nicht die lokale JSON-Sicherung.

### Aktuelle Einschränkung beim Stadtliga-Abruf
Bei der lokalen Node-Serverprüfung am 02.11.2026 hat die Quelle eine Browser-Schutzseite ausgeliefert. Ein Standardabruf mit Python urllib konnte denselben öffentlichen Plan lesen. Ob Vercel den Plan abrufen kann, muss nach Veröffentlichung geprüft werden. Der Aktualisieren-Button zeigt einen Quellfehler sichtbar an und lässt den importierten Stand stehen. Es werden keine Browserprüfungen automatisiert umgangen. Nach Quellfehlern wartet die Serverinstanz mindestens 60 Sekunden vor dem nächsten Versuch.

Als lokaler Import ist `python scripts/import-stadtliga.py` vorbereitet. Er liest den öffentlichen Plan und aktualisiert ausschließlich die beiden Stadtliga-Teams in den JSON-Dateien. Danach Änderungen committen und pushen. Falls auch dieser Abruf eine Schutzseite liefert, bricht er ohne Datenänderung ab.
