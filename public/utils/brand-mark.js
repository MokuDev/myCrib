/**
 * Modul: Die Bildmarke (brand-mark)
 * Zweck: EINE Quelle fuer das myCrib-Zeichen in der App - das eigene
 *        Icon-Artwork aus /icons/icon-192.png.
 * Abhaengigkeiten: keine
 *
 * WARUM (R18): die Marke stand zweimal im Code und sah zweimal anders aus.
 * - Die Seitenleiste baute sie per DOM-API in router.js: Verlaufskachel,
 *   weisse Kreise, aber der Verlauf hing an `--color-accent`, das im Dark
 *   aufhellt - dort also Weiss auf Flieder.
 * - Die Zugangsseiten (auth-ui.js) malten nur die Kreise, in `currentColor`,
 *   auf eine akzentfarbene Kachel: im Dark dunkle Punkte auf Flieder, und die
 *   Kreise fuellten rund 30 % der Kachel statt die Haelfte.
 *
 * Eine Marke kippt nicht mit dem Theme. Form und Farben sind die von
 * `docs/logo.svg` und den App-Icons (`public/icons/`): Verlauf #8B5CF6 nach
 * #6C3AED von oben links nach unten rechts, Radius 36 auf 160, drei Kreise in
 * Weiss mit 0,82 Deckung. Die beiden Verlaufsfarben stehen als Tokens in
 * tokens.css (`--brand-mark-from`/`--brand-mark-to`) und werden ueber Klassen
 * gesetzt (layout.css), nicht ueber Attribute - so traegt das Markup keine
 * Farbe.
 *
 * Ohne den Glanz (`sheen`) des App-Icons: bei 28px in der Seitenleiste ist er
 * nicht zu sehen, und zwei Fassungen waeren wieder zwei Marken.
 */

/** Die drei Kreise der Yuvomi-Marke im 160er-Raster: [cx, cy, r]. Nur noch Referenz fuer den Test gegen docs/logo.svg. */
export const BRAND_MARK_CIRCLES = Object.freeze([[64, 72, 27], [100, 78, 25], [80, 106, 24]]);

/**
 * FORK: myCrib hat sein eigenes Artwork. Die Stelle bleibt die EINE Quelle
 * (Seitenleiste und Zugangsseiten rufen sie), nur das Markup ist ein Bild
 * statt der gezeichneten Yuvomi-Kachel. Der Name steht immer daneben, das Bild
 * ist dekorativ (`alt=""`).
 *
 * @returns {string}
 */
export function brandMarkSvg() {
  return '<img class="brand-mark" src="/icons/icon-192.png" alt="" aria-hidden="true" draggable="false">';
}
