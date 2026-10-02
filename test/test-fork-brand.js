/**
 * Die Marke dieses Forks in sichtbarem Text.
 *
 * myCrib ist ein Fork von ulsklyc/yuvomi. Umbenannt wurde nur, was Menschen
 * lesen; die technische Seite blieb absichtlich stehen, damit bestehende
 * Installationen weiterlaufen - die Datenbankdatei, die localStorage-Schluessel,
 * das Praefix der Web Components, der Google-Drive-Ordner. Tatsachenbezuege auf
 * das Ursprungsprojekt bleiben ebenfalls stehen, weil sie sonst falsch waeren.
 *
 * DIESE SUITE GIBT ES WEGEN EINES TIPPFEHLERS. Beim Abgleich mit dem Upstream
 * kam Norwegisch als 26. Sprache dazu, und in einer Zeile stand "Yuvimi" statt
 * "Yuvomi". Die Umbenennung beim Zusammenfuehren sucht nach der richtigen
 * Schreibweise und ging daran vorbei, also hiess die App im norwegischen
 * Assistenten anders als in jeder anderen Sprache. Keine Suite hat das gesehen;
 * gefunden wurde es beim Zaehlen der Nennungen je Sprache von Hand. Ein
 * Uebersetzungspaket hat tausende Zeilen, die niemand im Diff liest - genau
 * dort gehoert eine Maschine hin.
 *
 * GEPRUEFT WIRD, WO DER UPSTREAM TEXT EINSPEIST, NICHT UEBERALL. Die
 * Sprachdateien sind die eine Stelle, an der jeder Abgleich neue Prosa
 * mitbringt, die kein Mensch durchsieht, und an der die Regel scharf ist: ausser
 * zwei technischen Vorgaben hat der fremde Name dort nichts zu suchen. In Doku
 * und README steht er dagegen zu Recht an vielen Stellen - als Dienstname in
 * `docker compose exec yuvomi`, als Pfad, als Link auf das Ursprungsprojekt -,
 * und was davon Prosa ist und was Technik, entscheidet sich nicht am Zeichen
 * davor. Dort prueft diese Suite nur die Ueberschriften: wie der Fork seine
 * eigenen Dokumente ueberschreibt, ist keine Ermessensfrage.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));

/*
 * Die zwei Vorgaben, die in Sprachdateien stehen duerfen. Beides sind Werte, die
 * eine Installation schon benutzt: der Ordner auf dem WebDAV-Ziel und der
 * Vorgabepfad fuer Dokumentdateien. Wer sie umbenennt, verschiebt die Daten
 * bestehender Haushalte, also bleiben sie, wie sie sind - in jeder Sprache
 * gleich. Jede andere Nennung in einer Sprachdatei ist ein Rest.
 */
const ERLAUBT_IN_SPRACHDATEIEN = ['/yuvomi/backups/', 'yuvomi-documents'];

const FREMDE_MARKE = /yuvomi/gi;

/*
 * Auch die Schreibweisen daneben. Der Tippfehler, der diese Suite ausgeloest
 * hat, hiess "Yuvimi" - die Suche nach der richtigen Schreibweise findet so
 * etwas nie. Das Muster nimmt jeden Vokal an beiden Stellen und deckt damit
 * Yuvimi, Yuvamy und Yuvoma mit ab.
 */
const VERSCHRIEBEN = /yuv[aeiouy]m[aeiouy]\w*/gi;

function sprachdateien() {
  const orte = ['public/locales', 'tools/installer/locales', 'tools/installer/locales/cli'];
  return orte.flatMap((ort) => readdirSync(path.join(ROOT, ort))
    .filter((name) => name.endsWith('.json') || name.endsWith('.sh'))
    .map((name) => path.join(ort, name)));
}

/*
 * Nur Werte, nie Schluessel: `backupWebdavPathPlaceholder` ist ein Bezeichner,
 * sein Inhalt ist der Text, den jemand sieht. Bei den CLI-Dateien steht der
 * Text rechts vom Gleichheitszeichen; Kommentarzeilen zaehlen als Technik.
 */
function sichtbareWerte(relativerPfad) {
  const text = readFileSync(path.join(ROOT, relativerPfad), 'utf8');
  if (relativerPfad.endsWith('.json')) {
    const werte = [];
    const sammeln = (knoten) => {
      if (typeof knoten === 'string') werte.push(knoten);
      else if (knoten && typeof knoten === 'object') Object.values(knoten).forEach(sammeln);
    };
    sammeln(JSON.parse(text));
    return werte;
  }
  return text.split('\n')
    .filter((zeile) => !zeile.trimStart().startsWith('#'))
    .map((zeile) => zeile.match(/=(.*)$/)?.[1] ?? '')
    .filter(Boolean);
}

function ohneErlaubtes(wert) {
  return ERLAUBT_IN_SPRACHDATEIEN.reduce((rest, vorgabe) => rest.split(vorgabe).join(''), wert);
}

test('keine Sprachdatei nennt die fremde Marke ausserhalb der zwei Vorgaben', () => {
  const funde = [];
  for (const datei of sprachdateien()) {
    for (const wert of sichtbareWerte(datei)) {
      if (ohneErlaubtes(wert).match(FREMDE_MARKE)) funde.push(`${datei}: ${wert.trim().slice(0, 120)}`);
    }
  }
  assert.deepEqual(funde, [],
    `Diese uebersetzten Texte nennen noch die fremde Marke:\n  ${funde.join('\n  ')}`);
});

test('keine Sprachdatei nennt eine verschriebene Fassung der fremden Marke', () => {
  const funde = [];
  for (const datei of sprachdateien()) {
    for (const wert of sichtbareWerte(datei)) {
      for (const treffer of ohneErlaubtes(wert).match(VERSCHRIEBEN) ?? []) {
        funde.push(`${datei}: "${treffer}" in ${wert.trim().slice(0, 100)}`);
      }
    }
  }
  assert.deepEqual(funde, [],
    `Diese uebersetzten Texte nennen die fremde Marke verschrieben:\n  ${funde.join('\n  ')}`);
});

test('die eigenen Dokumente ueberschreiben sich nicht mit der fremden Marke', () => {
  const dokumente = ['README.md', 'README.de.md', 'MODULES.md', 'CONTRIBUTING.md', 'DESIGN.md',
    ...readdirSync(path.join(ROOT, 'docs')).filter((n) => n.endsWith('.md')).map((n) => `docs/${n}`)];
  const funde = [];
  for (const datei of dokumente) {
    const zeilen = readFileSync(path.join(ROOT, datei), 'utf8').split('\n');
    zeilen.forEach((zeile, i) => {
      if (/^#{1,6} /.test(zeile) && zeile.match(FREMDE_MARKE)) funde.push(`${datei}:${i + 1}: ${zeile}`);
    });
  }
  assert.deepEqual(funde, [],
    `Diese Ueberschriften nennen noch die fremde Marke:\n  ${funde.join('\n  ')}`);
});

/*
 * REICHWEITE. Eine Wache, die nichts mehr liest, ist still gruen - der Leser
 * oben haengt an der Ordnerstruktur und an der Form der CLI-Dateien, und beides
 * kann sich aendern, ohne dass jemand an diese Datei denkt. Darum hier: findet
 * er die zwei erlaubten Vorgaben noch, und schlaegt er an, wenn man ihm einen
 * Rest unterschiebt?
 */
test('der Leser liest wirklich - er findet die Vorgaben und erkennt einen untergeschobenen Rest', () => {
  const dateien = sprachdateien();
  assert.ok(dateien.length >= 60, `nur ${dateien.length} Sprachdateien gefunden`);

  const mitVorgabe = dateien.filter((datei) => sichtbareWerte(datei)
    .some((wert) => ERLAUBT_IN_SPRACHDATEIEN.some((v) => wert.includes(v))));
  assert.equal(mitVorgabe.length, dateien.length,
    'nicht jede Sprachdatei traegt eine der zwei Vorgaben - liest der Leser noch ihre Werte?');

  assert.ok(ohneErlaubtes('Starte Yuvomi neu.').match(FREMDE_MARKE), 'ein echter Rest wird nicht erkannt');
  assert.ok(ohneErlaubtes('Kjør Yuvimi hjemme.').match(VERSCHRIEBEN), 'ein Verschreiber wird nicht erkannt');
  assert.equal(ohneErlaubtes('Leer lassen für yuvomi-documents.').match(FREMDE_MARKE), null,
    'die erlaubte Vorgabe schlaegt faelschlich an');
});
