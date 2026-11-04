# Linkvorschau, Kalender und Sicherungsmeldung

Nach Commit und Push veröffentlicht Vercel die Ergänzungen.

## WhatsApp
Startseite und Spielpläne haben Vorschau mit Vereinslogo. Der Teilen-Button eines Spiels verwendet einen eigenen Vorschau-Link mit Mannschaftsnamen, solange das Spiel aus dem Ticker verfügbar ist. Danach bleibt die allgemeine Fan-Ticker-Vorschau. WhatsApp kann alte Vorschauen zwischenspeichern.

## Ergebnissicherung
Der bestehende Wochenend-Workflow erstellt bei Fehlern ein GitHub-Issue, ohne doppelte offene Meldungen anzulegen. Der nächste erfolgreiche Lauf schließt es. Vorhandene Ergebnisse bleiben erhalten. Kein neuer Dienst erforderlich.

Für E-Mails: Repository auf GitHub → Watch → Custom → Issues aktivieren. Außerdem unter https://github.com/settings/notifications die Zustellung per E-Mail aktivieren. Dies ist eine persönliche Einstellung und wird nicht durch den Code verändert. Falls Issues im Repository deaktiviert sind, unter Settings → General aktivieren. Fehlermeldung und Entwarnung lassen sich nach Veröffentlichung anhand eines kontrollierten Testlaufs prüfen; es wurde absichtlich kein produktiver Sicherungsfehler ausgelöst.

## Kalender
In den Spielplänen gibt es pro Mannschaft einen zentralen Kalenderbutton. Dort lassen sich die gesamte Saison oder bestimmte Spieltage auswählen. Die .ics-Datei im gewünschten Kalender importieren. Deutsche Sommer-/Winterzeit wird berücksichtigt. Unbekannte Startzeit wird als Ganztagstermin dargestellt. Termine mit bekannter Uhrzeit werden mit zwei Stunden Dauer angesetzt. Die Datei ist eine Momentaufnahme, kein automatisch aktualisiertes Kalenderabo. Bei späteren Änderungen den Kalender prüfen; manche Kalenderprogramme erzeugen bei wiederholtem Import doppelte Termine.
