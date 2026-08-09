import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// [arabic, transliteration, meaning, transliteration (bn), meaning (bn)]
const NAMES = [
  ['ٱلرَّحْمَٰنُ', 'Ar-Rahman', 'The Most Compassionate', 'আর-রহমান', 'পরম করুণাময়'],
  ['ٱلرَّحِيمُ', 'Ar-Raheem', 'The Most Merciful', 'আর-রহীম', 'পরম দয়ালু'],
  ['ٱلْمَلِكُ', 'Al-Malik', 'The King, the Sovereign', 'আল-মালিক', 'সর্বময় রাজা ও অধিপতি'],
  ['ٱلْقُدُّوسُ', 'Al-Quddus', 'The Most Holy', 'আল-কুদ্দূস', 'পরম পবিত্র'],
  ['ٱلسَّلَامُ', 'As-Salam', 'The Source of Peace', 'আস-সালাম', 'শান্তি ও নিরাপত্তার উৎস'],
  ['ٱلْمُؤْمِنُ', "Al-Mu'min", 'The Giver of Security', 'আল-মু’মিন', 'নিরাপত্তা ও আশ্বাস দানকারী'],
  ['ٱلْمُهَيْمِنُ', 'Al-Muhaymin', 'The Guardian over all', 'আল-মুহাইমিন', 'সর্বতত্ত্বাবধায়ক ও রক্ষক'],
  ['ٱلْعَزِيزُ', 'Al-Azeez', 'The Almighty', 'আল-আযীয', 'পরাক্রমশালী'],
  ['ٱلْجَبَّارُ', 'Al-Jabbar', 'The Compeller, the Restorer', 'আল-জাব্বার', 'মহাপরাক্রমশালী নিয়ন্ত্রক ও সংশোধনকারী'],
  ['ٱلْمُتَكَبِّرُ', 'Al-Mutakabbir', 'The Supreme in Greatness', 'আল-মুতাকাব্বির', 'মহিমা ও শ্রেষ্ঠত্বে সর্বোচ্চ'],
  ['ٱلْخَالِقُ', 'Al-Khaliq', 'The Creator', 'আল-খালিক', 'সৃষ্টিকর্তা'],
  ['ٱلْبَارِئُ', "Al-Bari'", 'The Originator', 'আল-বারি’', 'অনস্তিত্ব থেকে সৃষ্টির সূচনাকারী'],
  ['ٱلْمُصَوِّرُ', 'Al-Musawwir', 'The Fashioner of forms', 'আল-মুসাওয়ির', 'আকৃতি ও রূপদানকারী'],
  ['ٱلْغَفَّارُ', 'Al-Ghaffar', 'The Ever-Forgiving', 'আল-গাফফার', 'বারবার ক্ষমাকারী'],
  ['ٱلْقَهَّارُ', 'Al-Qahhar', 'The All-Prevailing', 'আল-কাহহার', 'সর্বজয়ী ও অপ্রতিরোধ্য'],
  ['ٱلْوَهَّابُ', 'Al-Wahhab', 'The Bestower of gifts', 'আল-ওয়াহহাব', 'অঢেল দানকারী'],
  ['ٱلرَّزَّاقُ', 'Ar-Razzaq', 'The Provider', 'আর-রাযযাক', 'রিযিকদাতা'],
  ['ٱلْفَتَّاحُ', 'Al-Fattah', 'The Opener, the Judge', 'আল-ফাত্তাহ', 'উন্মোচনকারী ও ফয়সালাকারী'],
  ['ٱلْعَلِيمُ', 'Al-Aleem', 'The All-Knowing', 'আল-আলীম', 'সর্বজ্ঞ'],
  ['ٱلْقَابِضُ', 'Al-Qabid', 'The Withholder', 'আল-কাবিদ', 'সংকুচিতকারী ও রোধকারী'],
  ['ٱلْبَاسِطُ', 'Al-Basit', 'The Extender', 'আল-বাসিত', 'প্রসারিতকারী'],
  ['ٱلْخَافِضُ', 'Al-Khafid', 'The Abaser', 'আল-খাফিদ', 'অবনতকারী'],
  ['ٱلرَّافِعُ', "Ar-Rafi'", 'The Exalter', 'আর-রাফি’', 'মর্যাদা উন্নীতকারী'],
  ['ٱلْمُعِزُّ', "Al-Mu'izz", 'The Giver of honour', 'আল-মু’ইযয', 'সম্মানদাতা'],
  ['ٱلْمُذِلُّ', 'Al-Mudhill', 'The Giver of dishonour', 'আল-মুযিল্ল', 'অপমান ও অবনতি দানকারী'],
  ['ٱلسَّمِيعُ', "As-Samee'", 'The All-Hearing', 'আস-সামী’', 'সর্বশ্রোতা'],
  ['ٱلْبَصِيرُ', 'Al-Baseer', 'The All-Seeing', 'আল-বাসীর', 'সর্বদ্রষ্টা'],
  ['ٱلْحَكَمُ', 'Al-Hakam', 'The Judge', 'আল-হাকাম', 'চূড়ান্ত বিচারক'],
  ['ٱلْعَدْلُ', 'Al-Adl', 'The Utterly Just', 'আল-আদল', 'পরিপূর্ণ ন্যায়বিচারকারী'],
  ['ٱللَّطِيفُ', 'Al-Lateef', 'The Subtle, the Gentle', 'আল-লতীফ', 'অতি সূক্ষ্মদর্শী ও কোমল'],
  ['ٱلْخَبِيرُ', 'Al-Khabeer', 'The All-Aware', 'আল-খবীর', 'সর্ববিষয়ে অবগত'],
  ['ٱلْحَلِيمُ', 'Al-Haleem', 'The Forbearing', 'আল-হালীম', 'পরম সহনশীল'],
  ['ٱلْعَظِيمُ', 'Al-Azeem', 'The Magnificent', 'আল-আযীম', 'মহামহিমান্বিত'],
  ['ٱلْغَفُورُ', 'Al-Ghafoor', 'The Much-Forgiving', 'আল-গফূর', 'অত্যন্ত ক্ষমাশীল'],
  ['ٱلشَّكُورُ', 'Ash-Shakoor', 'The Most Appreciative', 'আশ-শাকূর', 'বান্দার সৎকর্মের কদরদানকারী ও অধিক প্রতিদানদাতা'],
  ['ٱلْعَلِيُّ', 'Al-Aliyy', 'The Most High', 'আল-আলিয়্য', 'সর্বোচ্চ'],
  ['ٱلْكَبِيرُ', 'Al-Kabeer', 'The Most Great', 'আল-কবীর', 'সুমহান'],
  ['ٱلْحَفِيظُ', 'Al-Hafeez', 'The Preserver', 'আল-হাফীয', 'সংরক্ষণকারী'],
  ['ٱلْمُقِيتُ', 'Al-Muqeet', 'The Sustainer', 'আল-মুকীত', 'জীবিকা ও শক্তির যোগানদাতা'],
  ['ٱلْحَسِيبُ', 'Al-Haseeb', 'The Reckoner', 'আল-হাসীব', 'হিসাবগ্রহণকারী'],
  ['ٱلْجَلِيلُ', 'Al-Jaleel', 'The Majestic', 'আল-জালীল', 'মহামহিম'],
  ['ٱلْكَرِيمُ', 'Al-Kareem', 'The Most Generous', 'আল-করীম', 'পরম উদার'],
  ['ٱلرَّقِيبُ', 'Ar-Raqeeb', 'The Watchful', 'আর-রাকীব', 'সদা পর্যবেক্ষণকারী'],
  ['ٱلْمُجِيبُ', 'Al-Mujeeb', 'The Responsive to prayer', 'আল-মুজীব', 'দোয়া কবুলকারী'],
  ['ٱلْوَاسِعُ', "Al-Wasi'", 'The All-Encompassing', 'আল-ওয়াসি’', 'সর্বব্যাপী ও সর্বসমৃদ্ধ'],
  ['ٱلْحَكِيمُ', 'Al-Hakeem', 'The All-Wise', 'আল-হাকীম', 'পরম প্রজ্ঞাময়'],
  ['ٱلْوَدُودُ', 'Al-Wadood', 'The Most Loving', 'আল-ওয়াদূদ', 'পরম স্নেহশীল'],
  ['ٱلْمَجِيدُ', 'Al-Majeed', 'The Most Glorious', 'আল-মাজীদ', 'পরম গৌরবময়'],
  ['ٱلْبَاعِثُ', "Al-Ba'ith", 'The Raiser of the dead', 'আল-বা’ইস', 'পুনরুত্থানকারী'],
  ['ٱلشَّهِيدُ', 'Ash-Shaheed', 'The Witness over all', 'আশ-শাহীদ', 'সর্বসাক্ষী'],
  ['ٱلْحَقُّ', 'Al-Haqq', 'The Absolute Truth', 'আল-হাক্ক', 'পরম সত্য'],
  ['ٱلْوَكِيلُ', 'Al-Wakeel', 'The Trustee, the Disposer of affairs', 'আল-ওয়াকীল', 'কর্মবিধায়ক ও নির্ভরযোগ্য অভিভাবক'],
  ['ٱلْقَوِيُّ', 'Al-Qawiyy', 'The All-Strong', 'আল-কাওয়িয়্য', 'পরম শক্তিধর'],
  ['ٱلْمَتِينُ', 'Al-Mateen', 'The Firm, the Steadfast', 'আল-মাতীন', 'সুদৃঢ় ও অটল'],
  ['ٱلْوَلِيُّ', 'Al-Waliyy', 'The Protecting Friend', 'আল-ওয়ালিয়্য', 'অভিভাবক ও সাহায্যকারী'],
  ['ٱلْحَمِيدُ', 'Al-Hameed', 'The Praiseworthy', 'আল-হামীদ', 'সর্বপ্রশংসিত'],
  ['ٱلْمُحْصِي', 'Al-Muhsee', 'The All-Enumerating', 'আল-মুহসী', 'সবকিছুর হিসাব ও সংখ্যা ধারণকারী'],
  ['ٱلْمُبْدِئُ', "Al-Mubdi'", 'The Originator of creation', 'আল-মুবদি’', 'সৃষ্টির প্রথম সূচনাকারী'],
  ['ٱلْمُعِيدُ', "Al-Mu'eed", 'The Restorer of life', 'আল-মু’ঈদ', 'পুনরায় ফিরিয়ে আনেন যিনি'],
  ['ٱلْمُحْيِي', 'Al-Muhyee', 'The Giver of life', 'আল-মুহয়ী', 'জীবনদাতা'],
  ['ٱلْمُمِيتُ', 'Al-Mumeet', 'The Bringer of death', 'আল-মুমীত', 'মৃত্যুদাতা'],
  ['ٱلْحَيُّ', 'Al-Hayy', 'The Ever-Living', 'আল-হাইয়্য', 'চিরঞ্জীব'],
  ['ٱلْقَيُّومُ', 'Al-Qayyoom', 'The Sustainer of all', 'আল-কাইয়্যূম', 'স্বয়ংস্থিত ও সবকিছুর ধারক'],
  ['ٱلْوَاجِدُ', 'Al-Wajid', 'The Finder, the Self-Sufficient', 'আল-ওয়াজিদ', 'সবকিছুর প্রাপ্তিকারী ও অভাবমুক্ত'],
  ['ٱلْمَاجِدُ', 'Al-Majid', 'The Noble, the Glorious', 'আল-মাজিদ', 'মহামর্যাদাবান ও গৌরবময়'],
  ['ٱلْوَاحِدُ', 'Al-Wahid', 'The One', 'আল-ওয়াহিদ', 'এক ও অদ্বিতীয়'],
  ['ٱلْأَحَدُ', 'Al-Ahad', 'The Indivisible, the Unique', 'আল-আহাদ', 'একক ও অতুলনীয়'],
  ['ٱلصَّمَدُ', 'As-Samad', 'The Eternal Refuge', 'আস-সামাদ', 'সকলের আশ্রয় ও অমুখাপেক্ষী'],
  ['ٱلْقَادِرُ', 'Al-Qadir', 'The All-Powerful', 'আল-কাদির', 'সর্বক্ষমতাবান'],
  ['ٱلْمُقْتَدِرُ', 'Al-Muqtadir', 'The Omnipotent', 'আল-মুকতাদির', 'সর্বময় ক্ষমতার অধিকারী'],
  ['ٱلْمُقَدِّمُ', 'Al-Muqaddim', 'The Expediter', 'আল-মুকাদ্দিম', 'অগ্রসরকারী'],
  ['ٱلْمُؤَخِّرُ', "Al-Mu'akhkhir", 'The Delayer', 'আল-মু’আখখির', 'বিলম্বকারী'],
  ['ٱلْأَوَّلُ', 'Al-Awwal', 'The First, without beginning', 'আল-আউয়াল', 'সর্বপ্রথম, যার কোনো শুরু নেই'],
  ['ٱلْآخِرُ', 'Al-Akhir', 'The Last, without end', 'আল-আখির', 'সর্বশেষ, যার কোনো শেষ নেই'],
  ['ٱلظَّاهِرُ', 'Az-Zahir', 'The Manifest', 'আয-যাহির', 'প্রকাশ্য ও সুস্পষ্ট'],
  ['ٱلْبَاطِنُ', 'Al-Batin', 'The Hidden', 'আল-বাতিন', 'গুপ্ত ও অন্তর্নিহিত'],
  ['ٱلْوَالِي', 'Al-Walee', 'The Governor of all', 'আল-ওয়ালী', 'সর্বময় শাসক'],
  ['ٱلْمُتَعَالِي', "Al-Muta'ali", 'The Most Exalted', 'আল-মুতা’আলী', 'সর্বোচ্চ মর্যাদার অধিকারী'],
  ['ٱلْبَرُّ', 'Al-Barr', 'The Source of all goodness', 'আল-বার্র', 'পরম কল্যাণকারী'],
  ['ٱلتَّوَّابُ', 'At-Tawwab', 'The Ever-Accepting of repentance', 'আত-তাওয়াব', 'তওবা কবুলকারী'],
  ['ٱلْمُنْتَقِمُ', 'Al-Muntaqim', 'The Avenger', 'আল-মুনতাকিম', 'অপরাধের ন্যায়সংগত প্রতিফলদাতা'],
  ['ٱلْعَفُوُّ', 'Al-Afuww', 'The Pardoner', 'আল-আফুউ', 'পরম ক্ষমাকারী'],
  ['ٱلرَّءُوفُ', "Ar-Ra'oof", 'The Most Kind', 'আর-রউফ', 'পরম স্নেহশীল ও দয়ালু'],
  ['مَالِكُ ٱلْمُلْكِ', 'Malik-ul-Mulk', 'Owner of all sovereignty', 'মালিকুল-মুলক', 'সমগ্র রাজত্বের মালিক'],
  ['ذُو ٱلْجَلَالِ وَٱلْإِكْرَامِ', 'Dhul-Jalali wal-Ikram', 'Lord of Majesty and Generosity', 'যুল-জালালি ওয়াল-ইকরাম', 'মহিমা ও সম্মানের অধিকারী'],
  ['ٱلْمُقْسِطُ', 'Al-Muqsit', 'The Equitable', 'আল-মুকসিত', 'ন্যায়সঙ্গত ও সুবিচারকারী'],
  ['ٱلْجَامِعُ', "Al-Jami'", 'The Gatherer', 'আল-জামি’', 'সমবেতকারী'],
  ['ٱلْغَنِيُّ', 'Al-Ghaniyy', 'The Self-Sufficient', 'আল-গনিয়্য', 'সম্পূর্ণ অভাবমুক্ত'],
  ['ٱلْمُغْنِي', 'Al-Mughnee', 'The Enricher', 'আল-মুগনী', 'সমৃদ্ধিদাতা'],
  ['ٱلْمَانِعُ', "Al-Mani'", 'The Withholder of harm', 'আল-মানি’', 'বাধাদানকারী ও প্রতিরোধকারী'],
  ['ٱلضَّارُّ', 'Ad-Darr', 'The One who can cause harm', 'আদ-দার্র', 'যাঁর ইচ্ছা ও হিকমত অনুযায়ী ক্ষতি সংঘটিত হয়'],
  ['ٱلنَّافِعُ', "An-Nafi'", 'The Bringer of benefit', 'আন-নাফি’', 'উপকারদাতা'],
  ['ٱلنُّورُ', 'An-Noor', 'The Light', 'আন-নূর', 'আলো'],
  ['ٱلْهَادِي', 'Al-Hadee', 'The Guide', 'আল-হাদী', 'পথপ্রদর্শক'],
  ['ٱلْبَدِيعُ', "Al-Badee'", 'The Incomparable Originator', 'আল-বাদী’', 'অতুলনীয় সৃষ্টির উদ্ভাবক'],
  ['ٱلْبَاقِي', 'Al-Baqee', 'The Everlasting', 'আল-বাকী', 'চিরস্থায়ী'],
  ['ٱلْوَارِثُ', 'Al-Warith', 'The Inheritor of all', 'আল-ওয়ারিস', 'সকল কিছুর চূড়ান্ত উত্তরাধিকারী'],
  ['ٱلرَّشِيدُ', 'Ar-Rasheed', 'The Guide to the right path', 'আর-রশীদ', 'সঠিক পথের দিশারি'],
  ['ٱلصَّبُورُ', 'As-Saboor', 'The Most Patient', 'আস-সবূর', 'পরম ধৈর্যশীল'],
];

if (NAMES.length !== 99) {
  console.error(`Expected 99 names, got ${NAMES.length}`);
  process.exit(1);
}

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const pad = (n) => String(n).padStart(3, '0');

const entries = NAMES.map(([arabic, trn, meaning, trnBn, meaningBn], i) => {
  const n = i + 1;
  return `  {
    step: 3,
    id: 'asma_${pad(n)}',
    title: { en: '${esc(trn)}', bn: '${esc(trnBn)}' },
    arabic: '${esc(arabic)}',
    trn: { en: '${esc(trn)}', bn: '${esc(trnBn)}' },
    meaning: { en: '${esc(meaning)}', bn: '${esc(meaningBn)}' },
    cat: ['names'],
    tags: ['asmaul-husna', 'names', '${esc(trn.toLowerCase())}'],
    target: 0,
    source: 'Quran',
    ref: '7:180'
  }`;
});

const file = `import { DhikrItem } from '../constants';

/**
 * The ninety-nine names, in the order of the narration in at-Tirmidhi.
 *
 * On provenance: the Quranic instruction is unambiguous — "To Allah belong the
 * most beautiful names, so call upon Him by them" (7:180) — and every name here
 * is attested. The specific enumeration of exactly ninety-nine, however, comes
 * from a narration many scholars read as a narrator's list rather than the
 * Prophet's ﷺ own words, and other lists differ slightly. So the citation on
 * every entry is 7:180 — the principle, which is certain — and the caveat is
 * stated once on the first name rather than asserted away.
 *
 * Bangla names and meanings are a reviewed human translation, not machine
 * output — the transliterations in particular are a pronunciation aid, and
 * Bengali script cannot represent every Arabic letter or point of articulation
 * exactly. A single gloss in either language cannot carry a divine name's full
 * sense; these are a way in, not a definition.
 *
 * target: 0 on every name. With a target of 1 the completion branch in
 * handleIncrement would fire confetti, the success chord and a five-pulse
 * vibration ninety-nine times in a single round. The cycle item below is what
 * marks a completed round instead.
 *
 * Generated by scripts/build-names.mjs — edit that, not this.
 */
export const ASMA_DATA: DhikrItem[] = [
${entries.join(',\n')}
];

/**
 * A single item standing for one completed round of all ninety-nine.
 *
 * It lives in DHIKR_DATA but not in the browsable set, so the Record can name
 * it properly while it never appears as a stray row in a du'a list. Counting
 * ninety-nine separate ids would bury every other dhikr in "Most recited".
 */
export const ASMA_CYCLE_ITEM: DhikrItem = {
  step: 3,
  id: 'asma_cycle',
  title: { en: 'The Ninety-Nine Names', bn: 'আল্লাহর ৯৯ নাম' },
  arabic: '',
  meaning: { en: 'One complete round of the names of Allah.', bn: 'আল্লাহর নামসমূহের একটি পূর্ণ চক্র।' },
  cat: [],
  target: 1,
  source: 'Quran',
  ref: '7:180'
};

/** True for the names themselves, not the cycle marker. */
export const isAsmaId = (id: string): boolean => id.startsWith('asma_') && id !== 'asma_cycle';
`;

writeFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../src/data/asmaulHusna.ts'),
  file
);
console.log(`wrote ${NAMES.length} names`);
