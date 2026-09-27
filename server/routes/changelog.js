/**
 * Modul: Changelog
 * Zweck: Liest die mitgelieferte CHANGELOG.md und liefert sie versionsweise
 *        zerlegt aus. Bis hierher fragte die Route zuerst api.github.com nach
 *        den Releases von ulsklyc/yuvomi und fiel nur bei einem Fehlschlag auf
 *        die Datei zurueck - fuer einen Fork zeigte das die Historie und die
 *        Update-Frage des Ursprungsprojekts, nicht myCribs eigene. Es gibt kein
 *        "online" mehr: die Datei ist die einzige Quelle.
 * Abhängigkeiten: express, node:fs, logger
 */

import express from 'express';
import { readFileSync } from 'node:fs';
import { createLogger } from '../logger.js';

const log = createLogger('Changelog');

const CHANGELOG_PATH = new URL('../../CHANGELOG.md', import.meta.url);

const { version: APP_VERSION } = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf-8'),
);

function normalizeVersion(value) {
  return String(value || '')
    .trim()
    .replace(/^release[-_\s]*/i, '')
    .replace(/^v/i, '')
    .toLowerCase();
}

function cleanMarkdownText(value) {
  return String(value || '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_~]/g, '')
    .replace(/\b[0-9a-f]{7,40}\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isNoiseLine(value) {
  return /^(assets?|downloads?|source code|full changelog|compare|all reactions?)\b/i.test(value)
    || /^https:\/\/github\.com\/.+\/compare\//i.test(value);
}

function ensureSection(sections, title) {
  const requestedTitle = title || 'Changes';
  let current = sections[sections.length - 1];
  if (!title && current) return current;
  if (!current || current.title !== requestedTitle) {
    current = { title: requestedTitle, entries: [] };
    sections.push(current);
  }
  return current;
}

// Der fett gesetzte Vorspann am Anfang eines Eintrags. Seit v2.41.0 oeffnet
// JEDER Changelog-Eintrag so, und `test/test-changelog.js` setzt das durch
// (#850) - hier wird diese Kante wieder gelesen, statt sie einzuebnen.
const LEAD_PATTERN = /^\*\*(.+?)\*\*\s*/;

/**
 * Zerlegt eine Eintragszeile in Vorspann und Begruendung.
 *
 * OHNE Vorspann ist die ganze Zeile der Vorspann und die Begruendung leer.
 * Das ist die ehrliche Lesart: ein Eintrag ohne Kurzfassung bekommt keine
 * erfundene, und die Ansicht zeigt ihn dann eben ganz.
 */
function splitEntry(rawText) {
  const lead = rawText.match(LEAD_PATTERN);
  if (!lead) return { lead: cleanMarkdownText(rawText), detail: '' };
  return {
    lead: cleanMarkdownText(lead[1]),
    detail: cleanMarkdownText(rawText.slice(lead[0].length)),
  };
}

function parseReleaseBody(body) {
  const sections = [];
  for (const rawLine of String(body || '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      const title = cleanMarkdownText(heading[1]);
      if (title && !isNoiseLine(title)) ensureSection(sections, title);
      continue;
    }

    const bullet = line.match(/^(?:[-*+]|\d+\.)\s+(.+)$/);
    const raw = bullet ? bullet[1] : line;
    // Die Rauschpruefung laeuft auf dem GEREINIGTEN Text - sie kennt Woerter,
    // keine Auszeichnung.
    const cleaned = cleanMarkdownText(raw);
    if (!cleaned || isNoiseLine(cleaned)) continue;

    const current = ensureSection(sections);
    if (bullet || current.entries.length === 0) {
      current.entries.push(splitEntry(raw));
    } else {
      // Fortsetzungszeile: sie gehoert zur BEGRUENDUNG, nie zum Vorspann - der
      // ist genau ein Satz, und ihn waehrend des Lesens wachsen zu lassen
      // wuerde die Kurzfassung wieder zur Textwand machen.
      const last = current.entries[current.entries.length - 1];
      last.detail = `${last.detail} ${cleaned}`.trim();
    }
  }

  return sections
    .map((section) => {
      const entries = section.entries.filter((e) => e.lead || e.detail);
      return {
        title: section.title,
        entries,
        // `items` bleibt Wort fuer Wort, was es vorher war: ein Eintrag als
        // EIN String. /api/v1 ist eine zugesagte Oberflaeche, und `entries`
        // daneben zu legen kostet ein paar Bytes doppelt, aber niemandem
        // seinen Integrator. Beides stammt aus derselben Zerlegung - es sind
        // zwei Sichten auf einen Text, keine zwei Wahrheiten.
        items: entries.map((e) => `${e.lead} ${e.detail}`.trim()).filter(Boolean),
      };
    })
    .filter((section) => section.items.length);
}

/**
 * Schneidet die mitgelieferte CHANGELOG.md in Versionsbloecke.
 *
 * `[Unreleased]` faellt raus: der Abschnitt traegt keine Version und
 * beschreibt nichts, was der laufende Stand schon kann.
 */
function parseChangelogFile(text) {
  const releases = [];
  let current = null;

  for (const rawLine of String(text || '').split(/\r?\n/)) {
    const heading = rawLine.match(/^##\s+\[([^\]]+)]/);
    if (heading) {
      const version = heading[1].trim();
      if (/^unreleased$/i.test(version)) {
        current = null;
        continue;
      }
      current = { version, lines: [] };
      releases.push(current);
      continue;
    }
    if (current) current.lines.push(rawLine);
  }

  return releases.map((release) => ({
    version: release.version,
    sections: parseReleaseBody(release.lines.join('\n')),
  })).filter((release) => release.sections.length);
}

/**
 * Baut die Antwort aus der mitgelieferten Datei.
 *
 * `latest_version` bleibt bewusst null: die Datei kann nur bis zur eigenen
 * Version reichen, "die neueste ist meine" waere also eine Zusicherung, die
 * hier niemand pruefen konnte. Der Client zeigt die Version dann als
 * unbekannt an, statt faelschlich Aktualitaet zu melden.
 */
function buildLocalPayload(readFile, currentVersion = APP_VERSION) {
  const releases = parseChangelogFile(readFile());
  const currentKey = normalizeVersion(currentVersion);
  return {
    current_version: currentVersion,
    latest_version: null,
    current_in_releases: Boolean(currentKey)
      && releases.some((release) => normalizeVersion(release.version) === currentKey),
    releases,
    source: 'local',
  };
}

export function buildRouter({
  appVersion = APP_VERSION,
  readChangelogFile = () => readFileSync(CHANGELOG_PATH, 'utf-8'),
} = {}) {
  const router = express.Router();
  let cachedPayload = null;

  // CHANGELOG.md aendert sich zur Laufzeit nie - die Datei liegt im Image.
  // Sie wird deshalb einmal geparst und danach behalten.
  router.get('/', (_req, res) => {
    if (cachedPayload === null) {
      try {
        cachedPayload = buildLocalPayload(readChangelogFile, appVersion);
      } catch (err) {
        log.warn('Bundled CHANGELOG.md unavailable:', err.message);
        return res.status(502).json({ error: 'Release notes could not be loaded.', code: 502 });
      }
    }
    return res.json({ data: cachedPayload });
  });

  return router;
}

const router = buildRouter();

export default router;
export const __test = {
  normalizeVersion,
  cleanMarkdownText,
  parseReleaseBody,
  parseChangelogFile,
  buildLocalPayload,
  CHANGELOG_PATH,
};
