# Habit Island

Habit-Tracker fuer den Haushalt: Habits abhaken, **Seeds** verdienen, damit Baeume, Deko und Tiere kaufen und die **Insel** vergroessern. Dazu Statistiken (Heatmap, Serien, Abschlussrate, Wochentage) und eine **Rangliste**.

## Aufbau
- Browser-Modul: `module.json`, `index.js`, `js/`, `style.css`, `locales/` (de, en), `widgets/summary.js`.
- Sidecar `sidecar/` (Node >= 22, keine Abhaengigkeiten, eigene SQLite). Warum: myCrib hat keinen gemeinsamen Speicher fuer Module, und die Rangliste braucht Daten, die allen Mitgliedern gehoeren. Der Sidecar oeffnet nie `yuvomi.db`.

## Installation
1. Ordner nach `modules/habit-island/` kopieren.
2. Sidecar starten (siehe `sidecar/compose.example.yml`): `PUBLIC_ORIGIN` (Pflicht), `MYCRIB_URL`, optional `DATA_DIR`, `PORT`.
3. Reverse Proxy: `/api/extensions/habit-island` -> Sidecar (gleicher Host wie myCrib).
4. In myCrib: Einstellungen -> Module -> Aktive Module -> Habit Island aktivieren (Admin).
5. Optional: Rechte unter Haushalt -> Rollen & Rechte (`ext:habit-island`: keine/lesen/schreiben).

Es wird **kein API-Token** benoetigt (keine geplanten Jobs).

## Spielregeln
- 10 Seeds je abgehaktem Habit und Tag. Rueckgaengig macht die Seeds wieder rueckgaengig.
- Serien-Bonus einmalig je Habit: 7 Tage +50, 30 Tage +200, 100 Tage +1000.
- Insel startet bei 6x6, jede Erweiterung kostet mehr (150, 300, ...), max. 14x14.
- Rangliste zaehlt *verdiente* Seeds im Zeitraum; jede Person kann sich ausblenden.
- Abhaken ist fuer heute und +-1 Tag moeglich (Zeitzonen), nicht fuer beliebige Vergangenheit.

## Sicherheit (Sidecar)
Identitaet nur ueber `GET /api/v1/auth/me` mit dem durchgereichten Cookie (5 s Cache); Schreibzugriffe pruefen Origin und eigenes Double-Submit-CSRF; `ext:habit-island` = `none` -> 403, `read` -> nur lesen. Tests: `cd sidecar && npm test`.
