#!/usr/bin/env node
/**
 * Translation coverage report.
 *
 * Nothing in the app fails when a translation is missing — a UI string falls
 * back to English and an item falls back to whatever text exists. That is the
 * right behaviour at runtime and the wrong behaviour for anyone trying to help,
 * because the gaps are invisible. This prints them.
 *
 * Two separate things are measured:
 *   UI strings — src/locales/<lang>.ts, keyed by the English text.
 *   Item content — the {en, bn} objects stored beside each item in src/data.
 *
 * Run: npm run i18n:report        (add --json for machine-readable output)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const LOCALES = join(SRC, 'locales');

/**
 * Which script each language is written in. Content stored under a language but
 * written in another script is not a translation — it is the English text in
 * disguise, and it reads as noise to the person who chose that language.
 */
const SCRIPTS = {
  en: { name: 'Latin', test: /[A-Za-z]/ },
  bn: { name: 'Bengali', test: /[ঀ-৿]/ }
};


const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const sourceFiles = walk(SRC).filter((f) => /\.tsx?$/.test(f));

// --- UI strings -------------------------------------------------------------

const languages = readdirSync(LOCALES)
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
  .map((f) => f.replace(/\.ts$/, ''));

/** Reads the keys of a locale file without needing to compile TypeScript. */
const localeKeys = (lang) => {
  const src = readFileSync(join(LOCALES, `${lang}.ts`), 'utf8');
  const keys = new Map();
  const re = /^\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\s*:\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\s*,?\s*$/gm;
  let m;
  while ((m = re.exec(src))) {
    const unquote = (s) => s.slice(1, -1).replace(/\\(.)/g, (_, c) => ({ n: '\n', t: '\t' }[c] ?? c));
    keys.set(unquote(m[1]), unquote(m[2]));
  }
  return keys;
};

/** Every string literal handed straight to the translate helper. */
const usedKeys = () => {
  const used = new Set();
  const call = /\b(?:t|getLocalizedText)\(([^()]*)\)/g;
  const literal = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g;
  for (const file of sourceFiles) {
    if (file.startsWith(LOCALES)) continue;
    const src = readFileSync(file, 'utf8');
    let m;
    while ((m = call.exec(src))) {
      // `{ en: ..., bn: ... }` inside a call is item content, not a UI key.
      if (/\ben:\s*['"`]/.test(m[1])) continue;
      let lit;
      while ((lit = literal.exec(m[1]))) {
        const value = (lit[1] ?? lit[2]).replace(/\\(.)/g, (_, c) => c);
        if (value.trim()) used.add(value);
      }
    }
  }
  return used;
};

/** A key still referenced somewhere in src, however indirectly. */
const appearsInSource = (key) => {
  const needle = key.replace(/\\/g, '\\\\');
  return sourceFiles.some(
    (file) => !file.startsWith(LOCALES) && readFileSync(file, 'utf8').includes(needle)
  );
};

const used = usedKeys();
const tables = Object.fromEntries(languages.map((lang) => [lang, localeKeys(lang)]));
const universe = new Set(used);
for (const table of Object.values(tables)) for (const key of table.keys()) universe.add(key);

const uiReport = languages.map((lang) => {
  const table = tables[lang];
  const script = SCRIPTS[lang]?.test;
  const missing = [...universe].filter((key) => !table.has(key)).sort();
  const untranslated = script
    ? [...table].filter(([, value]) => !script.test(value)).map(([key]) => key).sort()
    : [];
  const stale = [...table.keys()].filter((key) => !appearsInSource(key)).sort();
  return { lang, total: universe.size, translated: table.size, missing, untranslated, stale };
});

// --- Item content -----------------------------------------------------------

/**
 * Every innermost object in the data files that carries an `en:` string. That
 * covers both the named fields on an item (`title: { en, bn }`) and the bare
 * entries in the category and surah tables, which have no field name at all.
 */
const contentEntries = () => {
  const entries = [];
  const dataFiles = sourceFiles.filter((f) => f.includes(`${SRC}/data/`));
  const object = /(?:(\w+):\s*)?\{([^{}]*\ben:\s*['"`][^{}]*)\}/g;
  for (const file of dataFiles) {
    const src = readFileSync(file, 'utf8');
    let m;
    while ((m = object.exec(src))) {
      const [, field, body] = m;
      const values = {};
      for (const lang of languages.concat('en')) {
        const hit = new RegExp(`\\b${lang}:\\s*('|"|\`)([\\s\\S]*?)\\1`).exec(body);
        if (hit) values[lang] = hit[2];
      }
      // Type declarations look the same as data; only rows with real text count.
      if (values.en?.trim()) {
        entries.push({ file: relative(ROOT, file), field: field || '(entry)', values });
      }
    }
  }
  return entries;
};

const entries = contentEntries();
const contentReport = languages.map((lang) => {
  const script = SCRIPTS[lang]?.test;
  const byFile = {};
  for (const entry of entries) {
    const stat = (byFile[entry.file] ??= { total: 0, present: 0, wrongScript: 0 });
    stat.total += 1;
    const value = entry.values[lang];
    if (!value || !value.trim()) continue;
    stat.present += 1;
    if (script && !script.test(value)) stat.wrongScript += 1;
  }
  return { lang, byFile };
});

// --- Output -----------------------------------------------------------------

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ ui: uiReport, content: contentReport }, null, 2));
  process.exit(0);
}

const pct = (n, d) => (d === 0 ? '—' : `${Math.round((n / d) * 100)}%`);

console.log('\nUI strings  (src/locales/<lang>.ts)\n');
for (const r of uiReport) {
  const label = r.lang === 'en' ? `${r.lang} (keys are English)` : r.lang;
  console.log(`  ${label}: ${r.translated}/${r.total} (${pct(r.translated, r.total)})`);
  if (r.lang === 'en') continue;
  if (r.missing.length) {
    console.log(`    ${r.missing.length} missing:`);
    for (const key of r.missing.slice(0, 15)) console.log(`      · ${key}`);
    if (r.missing.length > 15) console.log(`      … and ${r.missing.length - 15} more`);
  }
  if (r.untranslated.length) {
    console.log(`    ${r.untranslated.length} present but not in ${SCRIPTS[r.lang]?.name} script:`);
    for (const key of r.untranslated.slice(0, 10)) console.log(`      · ${key}`);
  }
  if (r.stale.length) {
    console.log(`    ${r.stale.length} no longer used in the app (safe to delete):`);
    for (const key of r.stale.slice(0, 10)) console.log(`      · ${key}`);
  }
}

console.log('\nItem content  (src/data)\n');
for (const r of contentReport) {
  console.log(`  ${r.lang}:`);
  for (const [file, stat] of Object.entries(r.byFile)) {
    const wrong =
      stat.wrongScript > 0 ? `  — ${stat.wrongScript} not in ${SCRIPTS[r.lang]?.name} script` : '';
    console.log(
      `    ${file.padEnd(22)} ${String(stat.present).padStart(4)}/${String(stat.total).padEnd(4)} ${pct(
        stat.present,
        stat.total
      ).padStart(4)}${wrong}`
    );
  }
}

console.log(
  '\nA missing translation is not a bug — the app falls back to English. This is a\nto-do list, and every entry is a place a contributor can help.\n'
);
