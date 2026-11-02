# Stadtliga ohne Coding-Plattform aktualisieren

1. Den aktuellen Mannschaftsspielplan auf meinspielplan.de als PDF speichern. Bitte den vollständigen Saisonplan mit allen 13 Spielen verwenden. Alternativ die vollständige HTML-Druckansicht speichern.
2. Im Repository-Ordner die Datei **Stadtliga-Datei-importieren.cmd** doppelklicken.
3. Eine oder beide aktuellen Mannschafts-PDFs auswählen. Für jede Mannschaft nur eine Datei auswählen.
4. Die Import-Zusammenfassung kontrollieren und bestätigen. Der Import ersetzt nur die ausgewählten Stadtliga-Mannschaften; die übrigen Spielpläne bleiben erhalten.
5. GitHub Desktop öffnen, die Änderungen prüfen, einen Commit erstellen und **Push origin** anklicken. Nach der Vercel-Veröffentlichung sind die Daten für alle sichtbar.

Ohne Push bleibt die Änderung nur auf deinem Rechner. Es ist kein neuer Dienst nötig. Der Import nutzt auf diesem Rechner die bereits vorhandene Python-Laufzeit mit PDF-Unterstützung und Node.js. Die Dateien `public/spielplan.json` und `public/stadtliga.json` werden aktualisiert. PDFs selbst werden nicht ins Repository kopiert.

Bei unvollständigen PDFs, unbekanntem Tabellenaufbau oder abweichenden Paarungen bricht der Import ab. Dann bitte die aktuelle vollständige HTML-Druckansicht verwenden oder den Import anpassen lassen. Über GitHub Desktop lassen sich importierte Änderungen vor dem Commit wieder verwerfen.

## Einmaliger Abruf per Desktop-Verknüpfung
Auf diesem Rechner startet die Verknüpfung **Fan-Ticker - Stadtliga aktualisieren** einen einmaligen Abruf. Ein kleines Fenster zeigt Fortschritt und Ergebnis. Danach das Fenster schließen und die Änderungen in GitHub Desktop committen und pushen. Es läuft kein dauerhafter Dienst. Falls die Quelle den lokalen Abruf ebenfalls verweigert, bleibt der PDF-/HTML-Import als Alternative bestehen.
