#!/usr/bin/env node
/**
 * Draws the social share preview and the Play Store feature graphic.
 *
 * These are generated rather than hand-exported so they stay in step with the
 * app: same palette, same typeface, exact pixel sizes, and a diff anyone can
 * read. Re-run after changing the wordmark or the colours.
 *
 * Requires Playwright, which is not a project dependency — this runs by hand
 * when the artwork changes, and the PNGs are committed so nobody else needs it:
 *   npx playwright@latest install chromium && npm run images
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// The share card is served from the site, so it lives in public/. The feature
// graphic is a Play Store asset only — keeping it out of public/ stops it being
// shipped and precached for offline use by every visitor.
const OUT = join(ROOT, 'public');
const STORE_OUT = join(ROOT, 'docs');

/** The app's own palette — src/theme.ts, emerald. */
const BG = '#0B1410';
const GLOW = '#1B3A26';
const GOLD = '#D4AF37';
const TEXT = '#E8F0EA';
const SUB = '#A7B5AE';

const fontData = readFileSync(join(ROOT, 'node_modules/@fontsource/lora/files/lora-latin-700-normal.woff2')).toString('base64');
const fontRegular = readFileSync(join(ROOT, 'node_modules/@fontsource/lora/files/lora-latin-400-normal.woff2')).toString('base64');

/** One eight-point star: two squares at 45°, drawn as an outline. */
const star = (cx, cy, r) => {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
    const b = a + Math.PI / 8;
    pts.push(`${(cx + r * 0.62 * Math.cos(b)).toFixed(1)},${(cy + r * 0.62 * Math.sin(b)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="none" stroke="${GOLD}" stroke-width="1.1"/>`;
};

/** A corner cluster of stars, fading outward. */
const cluster = (x, y, flipX, flipY) => {
  const s = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cx = x + flipX * col * 74;
      const cy = y + flipY * row * 74;
      const fade = 0.16 - (row + col) * 0.022;
      if (fade <= 0.01) continue;
      s.push(`<g opacity="${fade.toFixed(3)}">${star(cx, cy, 40)}</g>`);
    }
  }
  return s.join('');
};

/**
 * The tasbih: a closed loop of beads, the imam bead, and a tassel. Drawn from
 * an ellipse so the bead spacing is even and nothing runs off the canvas.
 */
const tasbih = (cx, cy, rx, ry, beadR, count = 33) => {
  const beads = [];
  // Leave a gap at the bottom for the imam bead and tassel.
  const gap = 0.34;
  for (let i = 0; i < count; i++) {
    const t = gap / 2 + (i / (count - 1)) * (Math.PI * 2 - gap);
    const a = Math.PI / 2 + t;
    const bx = cx + rx * Math.cos(a);
    const by = cy + ry * Math.sin(a);
    beads.push(`<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${beadR}" fill="none" stroke="${GOLD}" stroke-width="2.6"/>`);
  }
  const neckY = cy + ry + beadR * 1.5;
  const neckH = beadR * 4.2;
  const capY = neckY + neckH + beadR * 0.9;
  // The strands start almost together and only spread near the ends, which is
  // how a real tassel hangs — an even fan from the top reads as a brush.
  const strands = [];
  for (let i = -3; i <= 3; i++) {
    const drop = beadR * (9.5 - Math.abs(i) * 0.55);
    const out = i * beadR * 0.62;
    strands.push(
      `<path d="M ${cx} ${(capY + beadR * 0.7).toFixed(1)}` +
        ` C ${(cx + out * 0.25).toFixed(1)} ${(capY + drop * 0.42).toFixed(1)},` +
        ` ${(cx + out * 0.85).toFixed(1)} ${(capY + drop * 0.72).toFixed(1)},` +
        ` ${(cx + out).toFixed(1)} ${(capY + drop).toFixed(1)}"` +
        ` fill="none" stroke="${GOLD}" stroke-width="1.9" stroke-linecap="round"/>`
    );
  }
  return `
    ${beads.join('')}
    <rect x="${cx - beadR * 0.72}" y="${neckY}" width="${beadR * 1.44}" height="${neckH}" rx="${beadR * 0.62}" fill="none" stroke="${GOLD}" stroke-width="2.6"/>
    <path d="M ${cx - beadR * 0.95} ${capY.toFixed(1)} a ${beadR * 0.95} ${beadR * 0.8} 0 0 1 ${beadR * 1.9} 0 z" fill="none" stroke="${GOLD}" stroke-width="2.4"/>
    ${strands.join('')}`;
};

const page = ({ width, height, artCx, artCy, rx, ry, beadR, titleSize, subSize, padX }) => `
<style>
  @font-face { font-family: 'Lora'; font-weight: 700; src: url(data:font/woff2;base64,${fontData}) format('woff2'); }
  @font-face { font-family: 'Lora'; font-weight: 400; src: url(data:font/woff2;base64,${fontRegular}) format('woff2'); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: ${width}px; height: ${height}px; overflow: hidden; }
  .wrap { position: relative; width: ${width}px; height: ${height}px;
          background: radial-gradient(ellipse at 66% 50%, ${GLOW} 0%, ${BG} 60%); }
  svg { position: absolute; inset: 0; }
  .copy { position: absolute; left: ${padX}px; top: 50%; transform: translateY(-50%); width: ${width * 0.46}px; }
  h1 { font-family: 'Lora', serif; font-weight: 700; font-size: ${titleSize}px; color: ${TEXT};
       letter-spacing: -0.5px; line-height: 1.05; }
  h2 { font-family: 'Lora', serif; font-weight: 400; font-size: ${subSize}px; color: ${GOLD};
       margin-top: ${subSize * 0.5}px; letter-spacing: 0.4px; }
  .rule { width: ${subSize * 2.6}px; height: 2px; background: ${GOLD}; opacity: 0.55;
          margin: ${subSize * 0.9}px 0; }
  p { font-family: 'Lora', serif; font-weight: 400; font-size: ${subSize * 0.78}px; color: ${SUB};
      letter-spacing: 0.3px; }
</style>
<div class="wrap">
  <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    ${cluster(-10, -10, 1, 1)}
    ${cluster(width + 10, -10, -1, 1)}
    ${cluster(-10, height + 10, 1, -1)}
    ${cluster(width + 10, height + 10, -1, -1)}
    <g>${tasbih(artCx, artCy, rx, ry, beadR)}</g>
  </svg>
  <div class="copy">
    <h1>Tasbeeh</h1>
    <h2>Dhikr &amp; Du&rsquo;a Tracker</h2>
    <div class="rule"></div>
    <p>Free forever &middot; Works offline &middot; No tracking</p>
  </div>
</div>`;

const TARGETS = [
  { file: 'share-card.png', width: 1200, height: 630, artCx: 880, artCy: 268, rx: 132, ry: 150, beadR: 10, titleSize: 82, subSize: 30, padX: 78 },
  { file: 'feature-graphic.png', store: true, width: 1024, height: 500, artCx: 760, artCy: 205, rx: 108, ry: 122, beadR: 8.4, titleSize: 68, subSize: 25, padX: 64 }
];

mkdirSync(OUT, { recursive: true });
mkdirSync(STORE_OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

for (const t of TARGETS) {
  const view = await browser.newPage({ viewport: { width: t.width, height: t.height }, deviceScaleFactor: 1 });
  await view.setContent(page(t), { waitUntil: 'load' });
  await view.evaluate(() => document.fonts.ready);
  const buf = await view.screenshot({ type: 'png' });
  const dir = t.store ? STORE_OUT : OUT;
  writeFileSync(join(dir, t.file), buf);
  console.log(`${t.file.padEnd(22)} ${t.width}x${t.height}  ${(buf.length / 1024).toFixed(0)} KB  -> ${t.store ? 'docs/' : 'public/'}`);
  await view.close();
}

await browser.close();
