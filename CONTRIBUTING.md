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

## Adding a language

Localised content lives alongside the item data. When adding a language:

- Every string needs a translator who reads it natively; partial translations
  are fine and fall back to English rather than blocking the release.
- Right-to-left languages (Urdu, Farsi) need the interface direction handled,
  not only the text — see the direction handling in `src/index.css`.
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
