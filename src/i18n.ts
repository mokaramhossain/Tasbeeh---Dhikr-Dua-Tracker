import { Language, LocalizedText } from './constants';

export type Translate = (text: LocalizedText | string | undefined) => string;

/**
 * Bengali strings for bare English keys used across the app. Defined once at
 * module scope — the previous version rebuilt this object on every single call
 * of the translate helper, i.e. hundreds of times per render.
 */
const UI_STRINGS: Record<string, Record<Language, string>> = {
  'Dhikr Tracker': { en: 'Dhikr Tracker', bn: 'জিকির ট্র্যাকার' },
  'Assalamu Alaikum': { en: 'Assalamu Alaikum', bn: 'আসসালামু আলাইকুম' },
  Today: { en: 'Today', bn: 'আজ' },
  'Reset All': { en: 'Reset All', bn: 'সব রিসেট' },
  'Reset All Progress?': { en: 'Reset All Progress?', bn: 'সব অগ্রগতি রিসেট করবেন?' },
  'This will clear all your counts for today. This action cannot be undone.': {
    en: 'This will clear all your counts for today. This action cannot be undone.',
    bn: 'এটি আজকের সব হিসাব মুছে ফেলবে। এই কাজটি আর ফিরিয়ে আনা যাবে না।'
  },
  'Reset Routine?': { en: 'Reset Routine?', bn: 'রুটিন রিসেট করবেন?' },
  'This will reset counts for all items in your current routine.': {
    en: 'This will reset counts for all items in your current routine.',
    bn: 'এটি আপনার বর্তমান রুটিনের সব আইটেমের হিসাব রিসেট করবে।'
  },
  'Delete Item?': { en: 'Delete Item?', bn: 'আইটেমটি ডিলিট করবেন?' },
  'Are you sure you want to remove this item from your collection?': {
    en: 'Are you sure you want to remove this item from your collection?',
    bn: 'আপনি কি নিশ্চিত যে আপনি এটি আপনার সংগ্রহ থেকে মুছে ফেলতে চান?'
  },
  'Title *': { en: 'Title *', bn: 'শিরোনাম *' },
  'Arabic Text': { en: 'Arabic Text', bn: 'আরবি টেক্সট' },
  Transliteration: { en: 'Transliteration', bn: 'উচ্চারণ' },
  Meaning: { en: 'Meaning', bn: 'অর্থ' },
  'Benefit / Source': { en: 'Benefit / Source', bn: 'উপকারিতা / উৎস' },
  'Default Target (0 for infinite)': { en: 'Default Target (0 for infinite)', bn: 'ডিফল্ট টার্গেট (০ মানে অসীম)' },
  'Add to Collection': { en: 'Add to Collection', bn: 'সংগ্রহে যোগ করুন' },
  'e.g., Morning Dua': { en: 'e.g., Morning Dua', bn: "যেমন: সকালের দু'আ" },
  'Arabic text here...': { en: 'Arabic text here...', bn: 'এখানে আরবি টেক্সট লিখুন...' },
  'Add Custom Dhikr': { en: 'Add Custom Dhikr', bn: 'কাস্টম জিকির যোগ করুন' },
  'Hadith Book / Source': { en: 'Hadith Book / Source', bn: 'হাদিস গ্রন্থ / উৎস' },
  'e.g., Sahih Bukhari': { en: 'e.g., Sahih Bukhari', bn: 'যেমন: সহিহ বুখারি' },
  Reference: { en: 'Reference', bn: 'রেফারেন্স' },
  'e.g., 6407': { en: 'e.g., 6407', bn: 'যেমন: ৬৪০৭' },
  Collection: { en: 'Collection', bn: 'কালেকশন' }
};

const isLocalizedObject = (value: unknown): value is { en?: string; bn?: string } =>
  typeof value === 'object' && value !== null;

export const createTranslate = (language: Language): Translate => (text) => {
  if (text === null || text === undefined) return '';

  if (typeof text === 'string') {
    const entry = UI_STRINGS[text];
    return entry ? entry[language] ?? entry.en ?? text : text;
  }

  if (isLocalizedObject(text)) {
    return text[language] ?? text.en ?? text.bn ?? '';
  }

  return String(text);
};

/**
 * Bengali digits for counts and targets, so numerals match the rest of the UI
 * when the app is in Bangla.
 */
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const formatNumber = (value: number, language: Language): string => {
  const base = String(value);
  if (language !== 'bn') return base;
  return base.replace(/\d/g, (digit) => BN_DIGITS[Number(digit)]);
};
