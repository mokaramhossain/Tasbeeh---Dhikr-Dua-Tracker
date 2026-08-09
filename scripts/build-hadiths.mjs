#!/usr/bin/env node
/**
 * Selects the hadith-of-the-day pool from an open corpus.
 *
 * Source: https://github.com/fawazahmed0/hadith-api, released under the
 * Unlicense (public domain), which carries matched Arabic, English and
 * *published* Bengali editions keyed by hadith number. That matters: the
 * Bengali here is a real translation, not machine output, which the project's
 * content rules would otherwise forbid.
 *
 * Only Bukhari and Muslim. They are sahih by consensus, so authenticity does
 * not depend on the corpus's grade metadata — which is empty for these
 * editions anyway. Reaching a larger pool by pulling in collections that carry
 * hasan and da'if narrations would mean shipping unmarked weak material in a
 * worship app.
 *
 * Selection is mechanical and therefore not final: it produces a candidate
 * list for a human to read before release. Run it, read the output, prune.
 *
 * Run: npm run data:hadiths
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = 'https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions';

const BOOKS = [
  { slug: 'bukhari', name: 'Sahih al-Bukhari' },
  { slug: 'muslim', name: 'Sahih Muslim' }
];

/**
 * The narration must be *about* dhikr, du'a or seeking forgiveness — not merely
 * mention a word that appears near them. An earlier, looser filter matched
 * "Paradise" and "mercy" and pulled in narrations that need context a one-line
 * daily quote cannot give.
 */
const KEEP = /\b(remember(s|ed|ing)? (his lord|allah)|remembrance of allah|dhikr|glorif(y|ies|ied) allah|subhan|alhamdu|la ilaha|there is no (god|deity) but|tasbih|takbir|supplicat|invocat|whoever (says|recites|reads|utters)|seeks? forgiveness|istighfar|astaghfir|asks? allah|calls? upon (allah|his lord)|praise (be )?to allah|send blessings upon|salawat|words (are|most) (dearer|beloved)|two words)/i;

/**
 * Cross-references to a previous narration rather than a narration itself:
 * "…with the same chain of transmitters…". They read as fragments out of
 * context, because that is what they are.
 */
const CHAIN_ONLY = /\b(same chain of transmitters|similar chain|another chain|chain of narrators|this chain|as mentioned above|a hadith like it|the like of it|has been narrated (on the authority of|by) .{0,60}(with|through))\b/i;

/**
 * Topics a "hadith of the day" on a dhikr app should not surface unprompted.
 * The filter above is thematic, not exhaustive, and these appear in narrations
 * that also mention forgiveness or mercy.
 */
// No trailing \b: these are prefixes. With one, "menstruat" failed to match
// "menstruating" and the blocklist quietly passed everything it was written to
// stop.
const DROP = /\b(menstruat|menses|janaba|ghusl|semen|sexual|intercourse|urinat|urine|stoning|stoned|lashes|flog|adulter|fornicat|slave girl|bondwoman|booty|spoils of war|blood money|amputat|cut off (his|her) hand|majority of its residents|deficient in|virgin girls)/i;

const MIN_EN = 90;
const MAX_EN = 420;
/** Bengali is ~3 bytes per character; this keeps a card quotable. */
const MAX_BN_BYTES = 900;

const fetchEdition = async (slug) => {
  const url = `${RAW}/${slug}.min.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
};

/** English arrives as `Narrated Abu Huraira:The Prophet…` — no space after the colon. */
const splitEnglish = (text) => {
  const head = text.slice(0, 160);
  const colon = head.indexOf(':');
  if (colon > 0 && /narrat|reported|said/i.test(head.slice(0, colon))) {
    return { narrator: text.slice(0, colon).trim(), body: text.slice(colon + 1).trim() };
  }
  return { narrator: '', body: text.trim() };
};

/** Bengali carries the full chain, ending in বর্ণিতঃ or বর্ণিত। */
const stripBengaliChain = (text) => {
  const m = /বর্ণিতঃ|বর্ণিত।/.exec(text);
  const body = m ? text.slice(m.index + m[0].length) : text;
  return body.replace(/^[\s।:-]+/, '').trim();
};

const normalise = (s) => s.toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();

console.log('downloading editions…');
const candidates = [];
for (const book of BOOKS) {
  const [eng, ben] = await Promise.all([fetchEdition(`eng-${book.slug}`), fetchEdition(`ben-${book.slug}`)]);
  const bnByNumber = new Map(ben.hadiths.map((h) => [h.hadithnumber, h.text]));

  let kept = 0;
  for (const h of eng.hadiths) {
    // A handful of numbers are fractional; they have no stable counterpart.
    if (!Number.isInteger(h.hadithnumber)) continue;
    const bnRaw = bnByNumber.get(h.hadithnumber);
    if (!bnRaw) continue;

    const { narrator, body } = splitEnglish(h.text || '');
    const bn = stripBengaliChain(bnRaw);
    if (!body || !bn) continue;
    if (body.length < MIN_EN || body.length > MAX_EN) continue;
    if (Buffer.byteLength(bn, 'utf8') > MAX_BN_BYTES) continue;
    if (!KEEP.test(body)) continue;
    if (DROP.test(body)) continue;
    if (CHAIN_ONLY.test(body)) continue;

    const score = (body.match(KEEP) || []).length + (/whoever (says|recites)/i.test(body) ? 2 : 0);
    candidates.push({ book: book.name, number: h.hadithnumber, narrator, en: body, bn, score });
    kept += 1;
  }
  console.log(`  ${book.name}: ${eng.hadiths.length} scanned, ${kept} on-theme with Bengali`);
}

// Bukhari repeats narrations across chapters constantly.
// Only function words and the formulas every narration carries. An earlier
// version also stopped "none right worshipped", which is precisely the phrase
// two tellings of the same hadith share — so the duplicate survived.
const STOP = new Set('allah messenger prophet said peace upon blessings narrated reported that this these those with from have been will would they them their there when then what which while your yours'.split(' '));
const fingerprints = [];
const unique = [];
for (const c of candidates.sort((a, b) => b.score - a.score || a.number - b.number)) {
  const words = new Set(normalise(c.en).split(' ').filter((w) => w.length > 3 && !STOP.has(w)));
  // Overlap, not equality: Bukhari 4860 and 6107 are the same narration told
  // differently, and an exact key let both through.
  const duplicate = fingerprints.some((prev) => {
    let shared = 0;
    for (const w of words) if (prev.has(w)) shared += 1;
    return shared / Math.min(words.size, prev.size) >= 0.5;
  });
  if (duplicate) continue;
  fingerprints.push(words);
  unique.push(c);
}
console.log(`  ${candidates.length} candidates -> ${unique.length} after dedup`);

// Interleave the two books so the year is not one collection then the other.
const byBook = BOOKS.map((b) => unique.filter((c) => c.book === b.name));
const ordered = [];
for (let i = 0; ordered.length < unique.length; i++) {
  for (const list of byBook) if (list[i]) ordered.push(list[i]);
}

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

const entries = ordered.map(
  (c) => `  {
    text: {
      en: '${esc(c.en)}',
      bn: '${esc(c.bn)}'
    },${c.narrator ? `\n    narrator: '${esc(c.narrator)}',` : ''}
    source: '${c.book}',
    ref: '${c.number}'
  }`
);

const file = `import { HadithEntry } from './hadiths';

/**
 * GENERATED — do not edit by hand. Run \`npm run data:hadiths\` to rebuild.
 *
 * Source: fawazahmed0/hadith-api, branch 1, editions eng-bukhari, ben-bukhari,
 * eng-muslim, ben-muslim. Released under the Unlicense (public domain). The
 * Bengali is a published translation redistributed by that project, not machine
 * output.
 *
 * Restricted to Bukhari and Muslim, which are sahih by consensus, so nothing
 * here depends on grade metadata. Chains of narration are stripped from both
 * languages; the narrator is kept as its own field.
 *
 * Selection is keyword-based and therefore a starting point, not a verdict — a
 * narration can match a keyword and still not belong on a dhikr app's home
 * screen. Read before release.
 *
 * ${ordered.length} entries.
 */
export const GENERATED_HADITHS: HadithEntry[] = [
${entries.join(',\n')}
];
`;

writeFileSync(join(ROOT, 'src/data/hadiths.generated.ts'), file);
console.log(`\nwrote ${ordered.length} entries to src/data/hadiths.generated.ts`);
console.log('Read them before shipping — selection is mechanical.');
