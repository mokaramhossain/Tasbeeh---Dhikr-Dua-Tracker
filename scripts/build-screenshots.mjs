#!/usr/bin/env node
/**
 * Captures the Play Store screenshots from the real app.
 *
 * These must be genuine captures, not mock-ups: a listing that shows something
 * the app does not do is both a policy problem and a promise the app cannot
 * keep. So this drives the built app in a browser, with seeded data that looks
 * like a few weeks of ordinary use — never an empty state, and never a fake
 * number.
 *
 * Requires the production build to be served, and Playwright installed:
 *   npm run build && npx vite preview --port 4177
 *   npx playwright@latest install chromium
 *   npm run shots
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs/screenshots');
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4177/';

/** 1080x1920 is the safe Play phone size: 9:16, well inside the limits. */
const VIEWPORT = { width: 432, height: 768 };
const SCALE = 2.5;

const dayKey = (back) => {
  const d = new Date();
  d.setDate(d.getDate() - back);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * A few weeks of unremarkable use. Counts are deliberately uneven — a tidy
 * 33 every day would look staged, and a screenshot should look like someone's
 * actual phone.
 */
const seed = () => {
  const counts = {};
  const pattern = [33, 0, 33, 12, 33, 7, 100, 33, 0, 45, 33, 33, 3, 66, 33, 0, 11, 33, 33, 20];
  pattern.forEach((n, i) => {
    if (!n) return;
    counts[dayKey(i + 1)] = { core_tasbeeh: n, core_tahmid: Math.round(n / 3), db_001: i % 4 === 0 ? 3 : 0 };
  });
  counts[dayKey(0)] = { core_tasbeeh: 21, core_tahmid: 7 };
  return {
    'dhikr-setup-done-v1': '1',
    'dhikr-tracker-v2': JSON.stringify(counts),
    'dhikr-favorites-v1': JSON.stringify(['db_001', 'db_002', 'db_025']),
    'dhikr-pinned-v1': JSON.stringify(['db_034']),
    'dhikr-recent-v1': JSON.stringify(['db_034', 'db_001'])
  };
};

const SHOTS = [
  {
    file: '1-home.png',
    caption: 'Home — the day, top to bottom',
    go: async (page) => {
      await page.locator('nav button').first().click();
      await page.waitForTimeout(700);
    }
  },
  {
    file: '2-reader.png',
    caption: 'Focus mode — read without distraction',
    go: async (page) => {
      await page.locator('nav button').nth(1).click();
      await page.waitForTimeout(600);
      await page.getByRole('button', { name: /Daily/i }).first().click();
      await page.waitForTimeout(600);
      const rows = page.locator('button').filter({ hasText: /.{18,}/ });
      await rows.nth(1).click();
      await page.waitForTimeout(900);
    }
  },
  {
    file: '3-categories.png',
    caption: 'Browse by category',
    go: async (page) => {
      await page.locator('nav button').nth(1).click();
      await page.waitForTimeout(800);
      await page.evaluate(() => window.scrollTo(0, 260));
      await page.waitForTimeout(400);
    }
  },
  {
    file: '4-names.png',
    caption: 'The ninety-nine names',
    go: async (page) => {
      await page.locator('nav button').nth(1).click();
      await page.waitForTimeout(600);
      await page.getByRole('button', { name: /Names of Allah/i }).first().click();
      await page.waitForTimeout(800);
    }
  },
  {
    file: '5-record.png',
    caption: 'Your record — no streaks to break',
    go: async (page) => {
      await page.locator('nav button').last().click();
      await page.waitForTimeout(800);
      await page.evaluate(() => {
        const heading = [...document.querySelectorAll('h2')].find((h) => /record/i.test(h.textContent || ''));
        heading?.scrollIntoView({ block: 'start' });
      });
      await page.waitForTimeout(500);
    }
  },
  {
    file: '6-settings.png',
    caption: 'Eight themes, adjustable text',
    go: async (page) => {
      await page.locator('nav button').last().click();
      await page.waitForTimeout(700);
      await page.evaluate(() => {
        const heading = [...document.querySelectorAll('h2')].find((h) => /appearance/i.test(h.textContent || ''));
        heading?.scrollIntoView({ block: 'start' });
      });
      await page.waitForTimeout(500);
    }
  }
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

// One light, the rest dark: the listing should show both, and a light shot
// proves the app is not dark-only.
const themes = ['emerald', 'emerald', 'light', 'emerald', 'emerald', 'light'];
const captured = [];

for (const [index, shot] of SHOTS.entries()) {
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: SCALE });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    ([state, theme]) => {
      localStorage.clear();
      Object.entries(state).forEach(([k, v]) => localStorage.setItem(k, v));
      localStorage.setItem('dhikr-theme-v1', theme);
    },
    [seed(), themes[index]]
  );
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await shot.go(page);
  await page.screenshot({ path: join(OUT, shot.file) });
  captured.push(shot);
  console.log(`${shot.file.padEnd(18)} ${VIEWPORT.width * SCALE}x${VIEWPORT.height * SCALE}  ${shot.caption}`);
  await ctx.close();
}

await browser.close();

writeFileSync(
  join(OUT, 'README.md'),
  `# Play Store screenshots\n\nGenerated by \`npm run shots\` from the real app — never mocked up, so the\nlisting cannot promise something the app does not do. Re-run after any UI\nchange rather than letting these drift.\n\n${captured
    .map((s, i) => `${i + 1}. \`${s.file}\` — ${s.caption}`)
    .join('\n')}\n\nSize: ${VIEWPORT.width * SCALE}x${VIEWPORT.height * SCALE} (9:16).\n`
);

console.log(`\nwrote ${captured.length} screenshots to docs/screenshots/`);
