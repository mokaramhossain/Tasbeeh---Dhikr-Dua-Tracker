import { LocalizedText } from '../constants';
import { dayIndex } from '../utils/date';

export interface HadithEntry {
  text: LocalizedText;
  /** Collection name, e.g. "Sahih al-Bukhari". */
  source: string;
  /** Hadith number within the collection, so any claim is checkable. */
  ref?: string;
  /** Kept out of the quote itself; the chain is not what a reader needs here. */
  narrator?: string;
}

export const HADITH_DATA: HadithEntry[] = [
  {
    text: {
      en: 'The comparison of the one who remembers his Lord and the one who does not, is like that of the living and the dead.',
      bn: 'যে ব্যক্তি তার রবকে স্মরণ করে আর যে করে না, তাদের উদাহরণ জীবিত ও মৃত ব্যক্তির মতো।'
    },
    source: 'Sahih Bukhari'
  },
  {
    text: {
      en: 'Should I not inform you of the best of your deeds... and the most exalted in your ranks? It is the remembrance of Allah.',
      bn: 'আমি কি তোমাদের সর্বোত্তম আমল... এবং মর্যাদায় সর্বোচ্চ বিষয়ের কথা জানিয়ে দেব না? তা হলো আল্লাহর স্মরণ।'
    },
    source: 'At-Tirmidhi'
  },
  {
    text: {
      en: 'Keep your tongue moist with the remembrance of Allah.',
      bn: 'তোমার জিহ্বা যেন সর্বদা আল্লাহর স্মরণে সিক্ত থাকে।'
    },
    source: 'At-Tirmidhi'
  },
  {
    text: {
      en: "Allah says: 'I am as My servant thinks I am, and I am with him when he remembers Me.'",
      bn: 'আল্লাহ বলেন: "আমি আমার বান্দার ধারণা অনুযায়ী, আর সে যখন আমাকে স্মরণ করে আমি তার সঙ্গে থাকি।"'
    },
    source: 'Sahih Bukhari'
  },
  {
    text: {
      en: 'For everything there is a polish, and the polish for the hearts is the remembrance of Allah.',
      bn: 'প্রতিটি জিনিসের একটি পরিষ্কারক আছে, আর অন্তরের পরিষ্কারক হলো আল্লাহর স্মরণ।'
    },
    source: 'Sahih Bukhari'
  }
];

/**
 * Picks a hadith deterministically from the local date, so everyone opening the
 * app on the same day sees the same one and it changes at midnight rather than
 * on every render.
 *
 * The seed used to be `year + month + day` summed, which jumped backwards at
 * every month boundary — 31 Aug 2026 scored 2065 and 1 Sep scored 2036 — so
 * the sequence neither advanced by one nor cycled cleanly. `dayIndex` counts
 * days from a fixed epoch instead.
 */
export const getHadithOfTheDay = (dateKey: string): HadithEntry =>
  HADITH_DATA[dayIndex(dateKey, HADITH_DATA.length)];
