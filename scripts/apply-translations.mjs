#!/usr/bin/env node
/**
 * Puts a returned translation CSV back into the data files.
 *
 * The counterpart to scripts/translation-todo.mjs: same `file,id,field` keys,
 * with the `bengali` column filled in — or `english_fixed`, for a row that was
 * flagged because the *English* was cut. Matching is by id and field, never by
 * row order, so a reordered or partially filled sheet still applies correctly.
 *
 * Two things it deliberately refuses to do:
 *
 *  - It will not touch src/data/asmaulHusna.ts, which is generated. Bengali for
 *    the names belongs in the NAMES table in scripts/build-names.mjs, or the
 *    next `npm run data:names` silently throws it away.
 *  - It will not apply a row listed in HOLD. A transliteration has to match the
 *    Arabic printed beside it; where a reviewer supplied the wording of a
 *    different narration, applying it would put a pronunciation on screen for
 *    letters that are not there.
 *
 * Run: npm run i18n:apply -- <path-to-csv>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'src/data');

/**
 * id.field → why it is not being applied. Printed on every run.
 *
 * `occ_003.trn` and `occ_003.meaning` were held here through one round: the
 * Bengali returned then followed "bil-amni … hilalu rushdin wa khayr", a
 * different narration from the Tirmidhi 3451 wording on the card, so applying
 * it would have printed a translation of words the reader could not see. The
 * replacement sourced from HadithBD reads "bil-yumni … Rabbi wa Rabbukallah"
 * and matches the Arabic phrase for phrase, so the hold is lifted rather than
 * carried on out of habit.
 */
const HOLD = {};

const GENERATED = { 'asmaulHusna.ts': 'scripts/build-names.mjs' };

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i += 1; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
};

/** Writes a JS string literal in the quote style the surrounding block uses. */
const quote = (value, q) =>
  q +
  value
    .replace(/\\/g, '\\\\')
    .replace(new RegExp(q, 'g'), `\\${q}`)
    .replace(/\n/g, '\\n') +
  q;

const rows = parseCsv(readFileSync(process.argv[2], 'utf8'));
const at = Object.fromEntries(rows[0].map((h, i) => [h.trim(), i]));
const byFile = {};
const held = [];
const skippedGenerated = [];

for (const r of rows.slice(1)) {
  const id = r[at.id];
  const bn = (r[at.bengali] || '').trim();
  const enFix = at.english_fixed === undefined ? '' : (r[at.english_fixed] || '').trim();
  if (!id || (!bn && !enFix)) continue;
  const key = `${id}.${r[at.field]}`;
  if (HOLD[key]) { held.push(key); continue; }
  if (GENERATED[r[at.file]]) { skippedGenerated.push(r[at.file]); continue; }
  (byFile[r[at.file]] ||= []).push({ id, field: r[at.field], bn, enFix });
}

let applied = 0;
const unmatched = [];

for (const [file, entries] of Object.entries(byFile)) {
  const path = join(DATA, file);
  let src = readFileSync(path, 'utf8');

  for (const { id, field, bn, enFix } of entries) {
    // Scope to this item: from its id to the start of the next one, so a field
    // name that also appears further down the file cannot be hit by mistake.
    const idAt = src.search(new RegExp(`\\bid:\\s*['"]${id}['"]`));
    if (idAt === -1) { unmatched.push(`${id} (no such id)`); continue; }
    const nextAt = src.slice(idAt + 1).search(/\bid:\s*['"]/);
    const end = nextAt === -1 ? src.length : idAt + 1 + nextAt;
    const block = src.slice(idAt, end);

    const m = new RegExp(`\\b${field}:\\s*\\{([^{}]*)\\}`).exec(block);
    if (!m) { unmatched.push(`${id}.${field} (no such field)`); continue; }

    const body = m[1];
    const en = new RegExp(`\\ben:\\s*(['"])((?:\\\\.|(?!\\1)[\\s\\S])*)\\1`).exec(body);
    if (!en) { unmatched.push(`${id}.${field} (no en value)`); continue; }
    const q = en[1];

    // A row flagged for English carries the fix in `english_fixed`; the English
    // is replaced first so the Bengali edit below still sees a matching body.
    let working = body;
    if (enFix) working = working.replace(en[0], `en: ${quote(enFix, q)}`);
    if (!bn) {
      src = src.slice(0, idAt) + block.replace(m[0], `${field}: {${working}}`) + src.slice(end);
      applied += 1;
      continue;
    }

    const literal = quote(bn, q);

    let replaced;
    const existing = /\bbn:\s*(['"])((?:\\.|(?!\1)[\s\S])*)\1/.exec(working);
    if (existing) {
      // Overwrite the value in place, leaving the comma and whitespace around
      // it exactly as they were.
      replaced = working.replace(existing[0], `bn: ${literal}`);
    } else {
      // Match the block's own layout: multi-line blocks get a new line,
      // single-line blocks stay on one.
      const multiline = working.includes('\n');
      const indent = multiline ? (/\n(\s*)en:/.exec(working)?.[1] ?? '      ') : '';
      const enNow = new RegExp(`\\ben:\\s*(['"])((?:\\\\.|(?!\\1)[\\s\\S])*)\\1`).exec(working)[0];
      const tail = multiline ? `,\n${indent}bn: ${literal}` : `, bn: ${literal}`;
      replaced = working.replace(enNow, `${enNow}${tail}`);
    }

    src = src.slice(0, idAt) + block.replace(m[0], `${field}: {${replaced}}`) + src.slice(end);
    applied += 1;
  }

  writeFileSync(path, src);
  console.log(`${file.padEnd(18)} ${entries.length} applied`);
}

if (skippedGenerated.length) {
  const counts = {};
  skippedGenerated.forEach((f) => (counts[f] = (counts[f] || 0) + 1));
  console.log('\ngenerated files — put these in the generator instead:');
  Object.entries(counts).forEach(([f, n]) => console.log(`  ${f}  ${n} rows → ${GENERATED[f]}`));
}

if (held.length) {
  console.log('\nheld back, not applied:');
  held.forEach((k) => console.log(`  ${k}\n    ${HOLD[k]}`));
}

if (unmatched.length) {
  console.log(`\ncould not be placed: ${unmatched.length}`);
  unmatched.forEach((u) => console.log(`  ${u}`));
}

console.log(`\n${applied} values written`);
process.exit(unmatched.length ? 1 : 0);
