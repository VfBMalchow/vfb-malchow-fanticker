# VfB Malchow · Fan-Ticker

Mobile Spielliste und Live-Spielstand für beide VfB-Malchow-Mannschaften, mit Vereinslogos und Farben. Statische Oberfläche und serverseitige Vercel Functions, ohne zusätzliche npm-Abhängigkeiten.

## 1. Auf Vercel importieren

1. Vercel Dashboard → Add New… → Project.
2. GitHub-Repository `VfBMalchow/vfb-malchow-fanticker` auswählen → Import.
3. Projektname: `vfb-malchow-fanticker`.
4. Framework Preset: **Other**. Root Directory: **./**.
5. Die Datei `vercel.json` konfiguriert den Build (`npm run build`) und das Ausgabeverzeichnis (`public`). Keine anderen Werte überschreiben.
6. Node.js: **22.x** (auch in package.json festgelegt).
7. Deploy. Erst die erhaltene Produktionsadresse mit `.vercel.app` prüfen.

Die aktuelle Spielliste funktioniert auch ohne Speicher. In diesem Fall weist die Seite darauf hin, dass Ergebnisse nur so lange sichtbar sind, wie VMV sie liefert.

## 2. Ergebnisspeicherung bis 23:59 Uhr aktivieren

1. Im Vercel Marketplace **Upstash for Redis** installieren bzw. unter Storage eine Upstash-Datenbank anlegen.
2. Name z. B. `vfb-fanticker-results`; eine passende Region und einen passenden Tarif auswählen. Etwaige Kosten vor der Bestätigung prüfen.
3. Die Datenbank mit dem Vercel-Projekt verbinden, mindestens für **Production**.
4. Unter Settings → Environment Variables prüfen, ob diese Variablen gesetzt sind:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
5. Falls sie fehlen: REST-URL und Standard-Token aus der Upstash-Konsole direkt in Vercel eintragen. Der Read-only-Token reicht nicht. Alternativ unterstützt der Code `KV_REST_API_URL` und `KV_REST_API_TOKEN`.
6. Deployments → letztes Production Deployment → Redeploy. Geänderte Variablen gelten erst nach einem neuen Deployment.
7. `/api/games` auf der Produktionsadresse öffnen. `"retention":"ready"` bestätigt, dass der Speicher gelesen werden kann. `"retention":"unavailable"` bedeutet, dass die Verbindung fehlt oder gestört ist. Schreibrechte werden beim Speichern eines Endstands benötigt.

Es werden von SAMS gelieferte und von der Anwendung abgerufene Endstände gespeichert. Wird ein solches Spiel am selben Tag aus SAMS entfernt, bleibt es bis 23:59:59 Uhr deutscher Ortszeit sichtbar, einschließlich Satzstand und Satzdetails. Die Tagesgrenze berücksichtigt Sommer-/Winterzeit. Danach kann ein gespeicherter Eintrag aus der Ansicht verschwinden; von SAMS weiterhin gelieferte Spiele bleiben sichtbar. Redis-Daten laufen nach zwei Tagen ohne erneutes Speichern ab.

Die Anwendung fragt während geöffneter, sichtbarer Seiten alle 15 Sekunden ab. Ohne Besucher gibt es keinen Hintergrundabruf. Ein Endstand, den die Anwendung nie von SAMS erhalten hat, kann nicht rekonstruiert werden. Es ist keine automatische Zeitplanung eingerichtet.

## 3. ticker.vfb-malchow.de verbinden

1. Vercel-Projekt → Settings → Domains → Add Domain.
2. `ticker.vfb-malchow.de` hinzufügen.
3. Beim DNS-Anbieter von `vfb-malchow.de` den von Vercel angezeigten CNAME setzen: Host `ticker`, Ziel exakt aus Vercel kopieren.
4. Falls gefordert, auch den TXT-Eintrag zur Verifizierung setzen.
5. Auf gültige DNS-Konfiguration und HTTPS warten. Hauptdomain und E-Mail-Einträge nicht verändern.
6. Produktionsadresse in einem privaten Browserfenster ohne Anmeldung prüfen. Falls die Produktionsseite geschützt ist, die gewünschte Zugriffsregel unter Deployment Protection konfigurieren.

## Lokale Entwicklung und Tests

Node.js 22 erforderlich. `npm run dev` startet die Seite unter `http://127.0.0.1:8780`. Ohne Umgebungsvariablen sind aktuelle Spiele abrufbar; dauerhafte Ergebnisspeicherung ist deaktiviert. Lokale Umgebungsvariablen vor dem Start setzen oder Node mit `--env-file=.env.local` verwenden. `.env.example` enthält ausschließlich die Variablennamen.

- `npm test`: Tests für Ergebniserhalt, Tagesgrenzen, Speicheradapter und Fehlerfälle.
- `npm run build`: prüft Dateien und JavaScript-Syntax.

## Daten und Sicherheit

- `/api/games`: fragt die öffentliche SAMS-Datenquelle serverseitig ab, filtert ausschließlich VfB Malchow und ergänzt archivierte Endstände des aktuellen Tages.
- `/api/logo`: liefert ausschließlich Bilder aus HTTPS-Uploadpfaden auf SAMS-Servern; kein allgemeiner URL-Proxy.
- `data/schedule.json` und `public/schedule.json`: gespeicherter Stand vom 26.10.2026 als ausdrücklich gekennzeichneter Ausfallrückfall. Dieser ist kein vollständiger Saisonplan und aktualisiert sich nicht selbst.
- Zugangsdaten ausschließlich serverseitig als Vercel-Umgebungsvariablen hinterlegen, niemals in `public/` oder GitHub.
- Die bisherige ChatGPT-Sites-Version wird durch dieses Repository nicht verändert.

Offizielle Anleitungen: [Vercel GitHub](https://vercel.com/docs/git), [Upstash-Integration](https://upstash.com/docs/redis/howto/vercelintegration), [Domain einrichten](https://vercel.com/docs/domains/set-up-custom-domain).
