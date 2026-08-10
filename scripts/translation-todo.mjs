#!/usr/bin/env node
/**
 * Writes the Bengali worklist as a CSV a translator can fill in.
 *
 * The coverage report says how much is missing; this says exactly what, item by
 * item, with the English alongside so nobody has to open the source to work.
 * Fill the `bengali` column, send it back, and scripts/apply-translations.mjs
 * puts it where it belongs.
 *
 * Run: npm run i18n:todo
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'src/data');
const BENGALI = /[ঀ-৿]/;

/**
 * Reads a quoted string literal, honouring backslash escapes.
 *
 * A naive `(['"])(.*?)\1` stops at the apostrophe inside `'Al-Mu\'min'` and
 * hands the translator `Al-Mu\` — which is what happened to sixteen of the
 * ninety-nine Names on the first pass. The alternation below consumes `\x` as
 * a unit so the closing quote is the real one.
 */
const literal = (key, src) => {
  // Backticks included: the Protection entries write their multi-line Arabic
  // and English as template literals, and a parser that only knew quotes
  // simply could not see them.
  const m = new RegExp(`\\b${key}:\\s*(['"\`])((?:\\\\.|(?!\\1)[\\s\\S])*)\\1`).exec(src);
  if (!m) return null;
  return m[2]
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\(['"`\\])/g, '$1');
};

/** What each field is for, so a translator knows the register to use. */
const FIELD_NOTE = {
  title: 'Short name shown in lists',
  meaning: 'What the du’a asks for — plain, faithful',
  benefit: 'When it is said and what the cited narration says',
  trn: 'PRONUNCIATION in Bengali script, not a translation'
};

/**
 * A value that is present but obviously unfinished.
 *
 * An ellipsis in scripture means the text was cut to fit and never restored —
 * three Bengali transliterations and two meanings shipped that way, and the
 * report counted them as done because something was there. A Bengali value far
 * shorter than its English is the same defect without the punctuation.
 */
export const incompleteReason = (value, source) => {
  if (!value || !value.trim()) return '';
  if (/(\.\.\.|…)/.test(value)) return 'truncated — ends or breaks mid-text';
  if (source && source.trim().length > 60 && value.trim().length < source.trim().length * 0.4) {
    return 'much shorter than the English — looks cut';
  }
  return '';
};

const rows = [];

/** Pulls `field: { en: '…', bn: '…' }` blocks with their item id. */
const scan = (file) => {
  const src = readFileSync(join(DATA, file), 'utf8');
  // Split on top-level entry boundaries so each block keeps its own id. Both
  // shapes count: an array of items (`  {`) and a keyed table (`  falaq: {`),
  // which is how the shared Surah text is stored.
  const blocks = src.split(/\n\s{2}(?:[A-Za-z_$][\w$]*:\s*)?\{\n/).slice(1);
  for (const block of blocks) {
    const id = /id:\s*['"]([^'"]+)/.exec(block)?.[1];
    if (!id) continue;
    for (const field of Object.keys(FIELD_NOTE)) {
      const m = new RegExp(`\\b${field}:\\s*\\{([^{}]*)\\}`).exec(block);
      if (!m) continue;
      const en = literal('en', m[1]) ?? '';
      const bn = literal('bn', m[1]) ?? '';
      if (!en.trim()) continue;

      // English is the fallback every other language leans on, so a truncated
      // English value is worth a row of its own.
      const enGap = incompleteReason(en);
      if (enGap) rows.push({ file, id, field, need: `english ${enGap}`, en, current: en });

      let need = '';
      if (!bn.trim()) need = 'missing';
      else if (!BENGALI.test(bn)) need = field === 'trn' ? 'latin — needs Bengali script' : 'not Bengali';
      else need = incompleteReason(bn, en);
      if (!need) continue;

      rows.push({ file, id, field, need, en, current: bn });
    }
  }
};

readdirSync(DATA)
  .filter((f) => f.endsWith('.ts') && !f.includes('generated'))
  .forEach(scan);

const csv = (v) => `"${String(v).replace(/"/g, '""').replace(/\s+/g, ' ').trim()}"`;
const header = ['file', 'id', 'field', 'what_is_needed', 'note', 'english', 'current_value', 'bengali'];
const lines = [header.join(',')];
for (const r of rows) {
  lines.push(
    [r.file, r.id, r.field, r.need, FIELD_NOTE[r.field], r.en, r.current, ''].map(csv).join(',')
  );
}

writeFileSync(join(ROOT, 'docs/translation-todo.csv'), lines.join('\n') + '\n');

const byFile = {};
const byField = {};
for (const r of rows) {
  byFile[r.file] = (byFile[r.file] || 0) + 1;
  byField[`${r.field} (${r.need})`] = (byField[`${r.field} (${r.need})`] || 0) + 1;
}

console.log(`\n${rows.length} fields need Bengali\n`);
console.log('by file:');
for (const [f, n] of Object.entries(byFile).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${f.padEnd(20)} ${n}`);
}
console.log('\nby kind:');
for (const [f, n] of Object.entries(byField).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${f.padEnd(34)} ${n}`);
}
console.log('\nwrote docs/translation-todo.csv');
