# Contributing

Thank you for wanting to help. This app is free software and will never be
monetized — no ads, no analytics, no tracking of any kind.

## Licence

Code is **GPL-3.0-or-later** (see `LICENSE`). By contributing you agree your
contribution is released under the same licence. In practice this means anyone
may use and modify the app, but any distributed derivative must also be open
source.

The religious content (du'a texts, translations, transliterations, benefit
notes) is the work of its contributors and is distributed with the app under the
same terms.

## Religious content rules

These matter more than the code style. The app is used for worship, and a
mistake here is worse than a bug.

1. **No virtue claim without a citation.** If you state that a dhikr carries a
   particular reward or benefit, the item must carry a `source` and `ref`, and
   the claim must be supported by *that* narration — not by a general
   impression, and not by a stronger narration you have not cited.
2. **Do not upgrade a citation.** If an item has no source, leave it without
   one rather than attaching a reference that seems to fit.
3. **Describe, don't embellish.** State what the du'a asks, when it is said,
   and the virtue the cited narration itself names. Nothing further.
4. **Translations need a named source or a native-speaker review.** Do not
   submit machine translation of du'a meanings or hadith text. Where an
   established published translation exists, prefer it and say which one.
5. **Arabic must be verified** against a printed mushaf or a recognised
   collection, including harakat.

Anything that cannot meet these should be raised as an issue for discussion
rather than opened as a pull request.

## Translating

Two separate things get translated, and they live in different places.

**UI strings** — `src/locales/<lang>.ts`, one file per language, keyed by the
English text:

```ts
const bn: Record<string, string> = {
  'Set Target': 'টার্গেট নির্ধারণ',
  ...
};
```

Because the key *is* the English string, a missing entry renders readable
English rather than a placeholder, and you never have to invent key names.
Translating is editing one file.

**Item content** — the du'a titles, meanings, benefits and transliterations,
which stay beside each item in `src/data` so a translation sits next to the text
it translates:

```ts
title: { en: 'Morning Remembrance', bn: 'সকালের জিকির' },
```

Run the coverage report to see what is missing:

```bash
npm run i18n:report
```

It lists untranslated UI keys, entries that are stored under a language but
written in the wrong script, and keys no longer used by the app. Nothing here
fails a build — a gap is a to-do, not an error.

### Adding a new language

1. Copy `src/locales/bn.ts` to `src/locales/<code>.ts` and translate the values.
2. Add an entry to `LANGUAGES` in `src/locales/index.ts`: language tag, native
   label, text direction, numerals, font stack, and its script. The `Language`
   type, the settings picker, the document direction and the report all read
   from that object — nothing else needs editing.
3. Add the language's key to the content objects in `src/data` as translators
   work through them. Partial is fine: content falls back to English.

Please also note:

- Every string needs a translator who reads it natively. Machine translation of
  religious content is not accepted (see the rules above).
- **Right-to-left** (Urdu, Farsi) needs `dir: 'rtl'` in the registry entry and
  nothing more in principle — the layout uses logical CSS properties
  (`text-start`, `ps-*`, `end-*`) rather than physical ones. Check it and fix
  any spot that was missed rather than adding a physical override.
- **Transliteration must be in the language's own script.** A Latin
  pronunciation guide is no help to someone reading Bangla or Urdu, so the app
  hides it unless it is written in the reader's script. Set
  `hasTransliteration: false` until the catalogue is genuinely covered.
- Scripts that need their own typeface (Devanagari, Nastaliq) should load that
  font only when the language is selected. The app is offline-first and its
  download size is a feature; do not make every user carry every script.

## Development

```bash
npm install
npm run dev     # dev server on :3000, reachable from other devices
npm run lint    # strict TypeScript, must be clean
npm run build   # production build
```

`npm run lint` is a real gate — the project builds with `strict` on and CI runs
it before deploying. Please keep it passing.

## Pull requests

- One topic per pull request.
- Say what you changed and why. If it is a content change, cite your source.
- Screenshots for any visual change, at a phone width (~420px).
