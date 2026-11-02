# Stadtliga direkt online aktualisieren

## Einmalige Einrichtung
Beim ersten Start der Desktop-Verknüpfung **Fan-Ticker - Stadtliga aktualisieren** die REST URL und den normalen REST Token aus der vorhandenen Upstash-Datenbank eingeben. Dieselben Werte sind in Vercel hinterlegt. Keine Werte hier oder in GitHub-Dateien veröffentlichen. Die lokalen Zugangsdaten werden mit Windows DPAPI für dein Windows-Benutzerkonto verschlüsselt unter `%LOCALAPPDATA%/VfB-FanTicker/upstash.bin` gespeichert. Über **Upstash-Zugang ändern** kannst du sie ersetzen.

## Normaler Abruf
Verknüpfung doppelklicken. Die Daten werden aus dem öffentlichen Plan gelesen, lokal gesichert und direkt in Upstash gespeichert. Nach erfolgreicher Speicherung sind sie innerhalb von etwa 60 Sekunden beim nächsten Laden der Website verfügbar. **Für Ergebnisaktualisierungen ist kein Commit oder Push mehr erforderlich.** Bei einem Fehler wird der bisherige Online-Stand nicht gelöscht.

## PDF-/HTML-Import
Falls der normale Abruf nicht funktioniert: vollständigen aktuellen Saisonplan der Mannschaft mit allen 13 Spielen als PDF oder die vollständige HTML-Druckansicht speichern. **Stadtliga-Datei-importieren.cmd** doppelklicken, Dateien auswählen, Zusammenfassung prüfen und bestätigen. Der geprüfte Stand wird ebenfalls in Upstash gespeichert. Lokale JSON-Dateien dienen als Sicherung; ihre Veröffentlichung ist für die Online-Anzeige nicht erforderlich. Bei unvollständigen oder unbekannten Dateien bricht der Import ab.

Nach lokalem Programmstart, Dateiimport oder Einrichtung werden keine Zugangsdaten automatisch zu GitHub übertragen. Einmalige Codeänderungen müssen weiterhin veröffentlicht werden; nur die späteren Ergebnisupdates erfolgen ohne Commit/Push.
