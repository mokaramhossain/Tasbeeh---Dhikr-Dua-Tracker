# Tasbeeh — Dhikr & Du'a Tracker

A simple, lightweight dhikr and du'a tracker built with React, Vite and Tailwind.
Everything runs in the browser and all user data stays on the device.

## Features

- After-salah adhkar routine with per-item targets and one-tap counting
- 70+ categorised du'as with search across titles, meanings, transliteration and tags
- Focus mode for distraction-free recitation, with next/previous navigation
- Personal collections: favourites, custom du'as, and full surahs fetched from the Quran API
- Journey stats: current and longest streak, daily/lifetime totals, 7-day chart, most-recited list
- Backup & restore to a JSON file
- Eight themes (including system-follow and light), Bangla/English UI, adjustable Arabic and Latin font sizes
- Installable PWA that works offline, fonts included

## Local development

### Prerequisites
- Node.js 20+
- npm

### Run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the local URL shown in the terminal.

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Type-check the project (`tsc --noEmit`, strict mode) |
| `npm run clean` | Remove `dist/` |

## Project layout

```
src/
  App.tsx            App shell, state, overlays
  i18n.ts            Translate helper and UI string table
  theme.ts           Theme palettes and CSS variable application
  components/        Presentational components
  screens/           Adhkar / Du'a / Personal / More tabs
  data/              Adhkar, du'as, surah list, categories, hadiths
  hooks/             Back-button history handling
  utils/             Storage, dates, search, stats, backup
```

## Notes

- User data is stored locally in the browser/app storage under `dhikr-*` keys.
  `src/utils/backup.ts` lists every key that is included in an export.
- Reads of stored data are validated and fall back to defaults, so a corrupt
  entry cannot brick the app; an error boundary provides a recovery screen.
- Day counts are pruned to the most recent 400 days. Lifetime totals are tracked
  separately, so pruning does not affect all-time numbers.
- For Android and iOS packaging, this web build can be wrapped later with Capacitor.
