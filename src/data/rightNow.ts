import { LocalizedText } from '../constants';

export type Slot = 'morning' | 'midday' | 'evening' | 'night' | 'friday' | 'ramadan' | 'lastten' | 'eid' | 'arafah';

export const SLOT_META: Record<Slot, { label: LocalizedText; icon: string; occasion?: boolean }> = {
  morning: { label: { en: 'This morning', bn: 'আজ সকালে' }, icon: '🌤️' },
  midday: { label: { en: 'Right now', bn: 'এখন' }, icon: '☀️' },
  evening: { label: { en: 'This evening', bn: 'আজ সন্ধ্যায়' }, icon: '🌇' },
  night: { label: { en: 'Before sleep', bn: 'ঘুমের আগে' }, icon: '🌙' },
  friday: { label: { en: 'It’s Friday', bn: 'আজ জুমুআ' }, icon: '🕌' },
  ramadan: { label: { en: 'Ramadan', bn: 'রমাদান' }, icon: '🌙', occasion: true },
  lastten: { label: { en: 'The last ten nights', bn: 'শেষ দশ রাত' }, icon: '✨', occasion: true },
  eid: { label: { en: 'Eid', bn: 'ঈদ' }, icon: '🎉', occasion: true },
  arafah: { label: { en: 'The Day of Arafah', bn: 'আরাফার দিন' }, icon: '⛰️', occasion: true }
};

/**
 * Which items each slot offers, curated by id.
 *
 * Deliberately a hand-picked list rather than a query over `tags`: tags are
 * free text with 170 distinct values, so anything derived from them surfaces
 * near-misses and the strip stops being trustworthy. Three at most — this is a
 * nudge, not a second catalogue. Ids are resolved through `itemsById` and
 * filtered, so a renamed or removed item shortens the strip instead of
 * rendering a blank row.
 */
export const SLOT_ITEMS: Record<Slot, string[]> = {
  morning: ['db_034', 'db_036'],
  midday: ['db_001', 'db_002'],
  evening: ['db_035', 'db_036'],
  night: ['db_028', 'db_030', 'db_031'],
  friday: ['occ_006', 'db_025'],
  ramadan: ['occ_002', 'occ_003'],
  lastten: ['occ_001', 'occ_002'],
  eid: ['occ_004', 'occ_003'],
  arafah: ['occ_005']
};

/**
 * The Hijri date, or null on an engine without the Islamic calendars.
 *
 * Umm al-Qura is *calculated*. Local moon sighting commonly differs from it by
 * a day — Bangladesh included — so nothing here may assert that today is a
 * particular sacred date. The windows below are deliberately wide and the
 * labels name a period ("the last ten nights") rather than a claim ("tonight is
 * Laylat al-Qadr"). Offering the du'a and letting the reader judge the date is
 * the only honest option.
 */
const hijri = (now: Date): { month: number; day: number } | null => {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      month: 'numeric',
      day: 'numeric'
    }).formatToParts(now);
    const month = Number(parts.find((p) => p.type === 'month')?.value);
    const day = Number(parts.find((p) => p.type === 'day')?.value);
    if (!Number.isFinite(month) || !Number.isFinite(day)) return null;
    return { month, day };
  } catch {
    return null;
  }
};

/** Occasion beats weekday beats time of day. One strip, never two. */
export const currentSlot = (now: Date = new Date()): Slot => {
  const h = hijri(now);
  if (h) {
    if (h.month === 9 && h.day >= 20) return 'lastten';
    // Arafah is the 9th. The 10th is Eid al-Adha, so the window stops at 9 —
    // widened only to the 8th, which people commonly fast alongside it.
    if (h.month === 12 && h.day >= 8 && h.day <= 9) return 'arafah';
    if ((h.month === 10 && h.day <= 2) || (h.month === 12 && h.day >= 10 && h.day <= 13)) return 'eid';
    if (h.month === 9) return 'ramadan';
  }

  if (now.getDay() === 5) return 'friday';

  const hour = now.getHours();
  if (hour < 4) return 'night';
  if (hour < 11) return 'morning';
  if (hour < 16) return 'midday';
  if (hour < 20) return 'evening';
  return 'night';
};

/** Shown under an occasion strip, never under a time-of-day one. */
export const HIJRI_NOTE: LocalizedText = {
  en: 'Dates follow the Umm al-Qura calendar and may differ from your local moon sighting.',
  bn: 'তারিখ উম্মুল কুরা ক্যালেন্ডার অনুসারে; আপনার এলাকার চাঁদ দেখার সাথে পার্থক্য হতে পারে।'
};
