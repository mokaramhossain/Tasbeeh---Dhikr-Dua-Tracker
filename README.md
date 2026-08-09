# Tasbeeh — Dhikr & Du'a Tracker

A simple, lightweight dhikr and du'a tracker built with React, Vite and Tailwind.
Everything runs in the browser and all user data stays on the device.

## Features

- After-salah adhkar routine with per-item targets and one-tap counting
- 70+ categorised du'as with search across titles, meanings, transliteration and tags
- Focus mode for distraction-free recitation, with next/previous navigation
- Personal collections: favourites, custom du'as, and full surahs fetched from the Quran API
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
| `npm run dev` | Dev server on port 3000, reachable from other devices on the network |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Type-check the project (`tsc --noEmit`, strict mode) |
| `npm run clean` | Remove `dist/` |

## Testing on a phone

### Option 1 — the deployed build (needed for install and offline)

Pushing to `main` (or running the workflow from the **Actions** tab) builds the
app via `.github/workflows/deploy.yml` and publishes it to GitHub Pages:

```
https://mokaramhossain.github.io/Tasbeeh---Dhikr-Dua-Tracker/
```

The workflow enables Pages itself on first run. This requires the repository to
be **public** — GitHub Pages cannot publish a private repository on the free
plan.

Because Pages serves from `/<repo-name>/` rather than the domain root, the
workflow builds with `VITE_BASE=/<repo-name>/` so asset URLs and the
service-worker scope carry that prefix.

Open the URL on the phone to test everything, including installing the app and
running it offline. To check offline mode:

1. Open the URL, then use *Add to Home Screen* (Share menu on iOS, ⋮ menu on Android).
2. Open the app once from the home screen so the service worker caches the assets.
3. Turn on airplane mode and reopen it — the app should load normally, with the
   Arabic typeface intact (Google Fonts are runtime-cached).

### Option 2 — the dev server over Wi-Fi (UI checks only)

`npm run dev` binds `0.0.0.0:3000`, so with the phone on the same network:

```bash
npm run dev
# find your computer's LAN IP:
#   macOS/Linux: ipconfig getifaddr en0   or   hostname -I
#   Windows:     ipconfig
# then open http://<that-ip>:3000 on the phone
```

Useful for checking layout, fonts and touch targets with live reload.

**This cannot test install or offline mode.** Service workers only run in a
secure context, and a plain `http://192.168.x.x` address is not one, so the
service worker never registers. That is browser policy, not a bug in the app —
use option 1 for anything PWA-related.

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
  utils/             Storage, dates, search, counts, backup
```

## Notes

- User data is stored locally in the browser/app storage under `dhikr-*` keys.
  `src/utils/backup.ts` lists every key that is included in an export.
- Reads of stored data are validated and fall back to defaults, so a corrupt
  entry cannot brick the app; an error boundary provides a recovery screen.
- Day counts are pruned to the most recent 400 days so storage cannot grow
  without bound.
- The base path is set from the `VITE_BASE` env var at build time, so the same
  source serves correctly from a domain root (local preview, or a host like
  Cloudflare Pages) and from a sub-path (GitHub Pages). It defaults to `/`.
- For Android and iOS packaging, this web build can be wrapped later with Capacitor.
