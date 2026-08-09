import { writeFileSync } from 'node:fs';

// [arabic, transliteration, meaning]
const NAMES = [
  ['ٱلرَّحْمَٰنُ', 'Ar-Rahman', 'The Most Compassionate'],
  ['ٱلرَّحِيمُ', 'Ar-Raheem', 'The Most Merciful'],
  ['ٱلْمَلِكُ', 'Al-Malik', 'The King, the Sovereign'],
  ['ٱلْقُدُّوسُ', 'Al-Quddus', 'The Most Holy'],
  ['ٱلسَّلَامُ', 'As-Salam', 'The Source of Peace'],
  ['ٱلْمُؤْمِنُ', "Al-Mu'min", 'The Giver of Security'],
  ['ٱلْمُهَيْمِنُ', 'Al-Muhaymin', 'The Guardian over all'],
  ['ٱلْعَزِيزُ', 'Al-Azeez', 'The Almighty'],
  ['ٱلْجَبَّارُ', 'Al-Jabbar', 'The Compeller, the Restorer'],
  ['ٱلْمُتَكَبِّرُ', 'Al-Mutakabbir', 'The Supreme in Greatness'],
  ['ٱلْخَالِقُ', 'Al-Khaliq', 'The Creator'],
  ['ٱلْبَارِئُ', "Al-Bari'", 'The Originator'],
  ['ٱلْمُصَوِّرُ', 'Al-Musawwir', 'The Fashioner of forms'],
  ['ٱلْغَفَّارُ', 'Al-Ghaffar', 'The Ever-Forgiving'],
  ['ٱلْقَهَّارُ', 'Al-Qahhar', 'The All-Prevailing'],
  ['ٱلْوَهَّابُ', 'Al-Wahhab', 'The Bestower of gifts'],
  ['ٱلرَّزَّاقُ', 'Ar-Razzaq', 'The Provider'],
  ['ٱلْفَتَّاحُ', 'Al-Fattah', 'The Opener, the Judge'],
  ['ٱلْعَلِيمُ', 'Al-Aleem', 'The All-Knowing'],
  ['ٱلْقَابِضُ', 'Al-Qabid', 'The Withholder'],
  ['ٱلْبَاسِطُ', 'Al-Basit', 'The Extender'],
  ['ٱلْخَافِضُ', 'Al-Khafid', 'The Abaser'],
  ['ٱلرَّافِعُ', "Ar-Rafi'", 'The Exalter'],
  ['ٱلْمُعِزُّ', "Al-Mu'izz", 'The Giver of honour'],
  ['ٱلْمُذِلُّ', 'Al-Mudhill', 'The Giver of dishonour'],
  ['ٱلسَّمِيعُ', "As-Samee'", 'The All-Hearing'],
  ['ٱلْبَصِيرُ', 'Al-Baseer', 'The All-Seeing'],
  ['ٱلْحَكَمُ', 'Al-Hakam', 'The Judge'],
  ['ٱلْعَدْلُ', 'Al-Adl', 'The Utterly Just'],
  ['ٱللَّطِيفُ', 'Al-Lateef', 'The Subtle, the Gentle'],
  ['ٱلْخَبِيرُ', 'Al-Khabeer', 'The All-Aware'],
  ['ٱلْحَلِيمُ', 'Al-Haleem', 'The Forbearing'],
  ['ٱلْعَظِيمُ', 'Al-Azeem', 'The Magnificent'],
  ['ٱلْغَفُورُ', 'Al-Ghafoor', 'The Much-Forgiving'],
  ['ٱلشَّكُورُ', 'Ash-Shakoor', 'The Most Appreciative'],
  ['ٱلْعَلِيُّ', 'Al-Aliyy', 'The Most High'],
  ['ٱلْكَبِيرُ', 'Al-Kabeer', 'The Most Great'],
  ['ٱلْحَفِيظُ', 'Al-Hafeez', 'The Preserver'],
  ['ٱلْمُقِيتُ', 'Al-Muqeet', 'The Sustainer'],
  ['ٱلْحَسِيبُ', 'Al-Haseeb', 'The Reckoner'],
  ['ٱلْجَلِيلُ', 'Al-Jaleel', 'The Majestic'],
  ['ٱلْكَرِيمُ', 'Al-Kareem', 'The Most Generous'],
  ['ٱلرَّقِيبُ', 'Ar-Raqeeb', 'The Watchful'],
  ['ٱلْمُجِيبُ', 'Al-Mujeeb', 'The Responsive to prayer'],
  ['ٱلْوَاسِعُ', "Al-Wasi'", 'The All-Encompassing'],
  ['ٱلْحَكِيمُ', 'Al-Hakeem', 'The All-Wise'],
  ['ٱلْوَدُودُ', 'Al-Wadood', 'The Most Loving'],
  ['ٱلْمَجِيدُ', 'Al-Majeed', 'The Most Glorious'],
  ['ٱلْبَاعِثُ', "Al-Ba'ith", 'The Raiser of the dead'],
  ['ٱلشَّهِيدُ', 'Ash-Shaheed', 'The Witness over all'],
  ['ٱلْحَقُّ', 'Al-Haqq', 'The Absolute Truth'],
  ['ٱلْوَكِيلُ', 'Al-Wakeel', 'The Trustee, the Disposer of affairs'],
  ['ٱلْقَوِيُّ', 'Al-Qawiyy', 'The All-Strong'],
  ['ٱلْمَتِينُ', 'Al-Mateen', 'The Firm, the Steadfast'],
  ['ٱلْوَلِيُّ', 'Al-Waliyy', 'The Protecting Friend'],
  ['ٱلْحَمِيدُ', 'Al-Hameed', 'The Praiseworthy'],
  ['ٱلْمُحْصِي', 'Al-Muhsee', 'The All-Enumerating'],
  ['ٱلْمُبْدِئُ', "Al-Mubdi'", 'The Originator of creation'],
  ['ٱلْمُعِيدُ', "Al-Mu'eed", 'The Restorer of life'],
  ['ٱلْمُحْيِي', 'Al-Muhyee', 'The Giver of life'],
  ['ٱلْمُمِيتُ', 'Al-Mumeet', 'The Bringer of death'],
  ['ٱلْحَيُّ', 'Al-Hayy', 'The Ever-Living'],
  ['ٱلْقَيُّومُ', 'Al-Qayyoom', 'The Sustainer of all'],
  ['ٱلْوَاجِدُ', 'Al-Wajid', 'The Finder, the Self-Sufficient'],
  ['ٱلْمَاجِدُ', 'Al-Majid', 'The Noble, the Glorious'],
  ['ٱلْوَاحِدُ', 'Al-Wahid', 'The One'],
  ['ٱلْأَحَدُ', 'Al-Ahad', 'The Indivisible, the Unique'],
  ['ٱلصَّمَدُ', 'As-Samad', 'The Eternal Refuge'],
  ['ٱلْقَادِرُ', 'Al-Qadir', 'The All-Powerful'],
  ['ٱلْمُقْتَدِرُ', 'Al-Muqtadir', 'The Omnipotent'],
  ['ٱلْمُقَدِّمُ', 'Al-Muqaddim', 'The Expediter'],
  ['ٱلْمُؤَخِّرُ', "Al-Mu'akhkhir", 'The Delayer'],
  ['ٱلْأَوَّلُ', 'Al-Awwal', 'The First, without beginning'],
  ['ٱلْآخِرُ', 'Al-Akhir', 'The Last, without end'],
  ['ٱلظَّاهِرُ', 'Az-Zahir', 'The Manifest'],
  ['ٱلْبَاطِنُ', 'Al-Batin', 'The Hidden'],
  ['ٱلْوَالِي', 'Al-Walee', 'The Governor of all'],
  ['ٱلْمُتَعَالِي', "Al-Muta'ali", 'The Most Exalted'],
  ['ٱلْبَرُّ', 'Al-Barr', 'The Source of all goodness'],
  ['ٱلتَّوَّابُ', 'At-Tawwab', 'The Ever-Accepting of repentance'],
  ['ٱلْمُنْتَقِمُ', 'Al-Muntaqim', 'The Avenger'],
  ['ٱلْعَفُوُّ', 'Al-Afuww', 'The Pardoner'],
  ['ٱلرَّءُوفُ', "Ar-Ra'oof", 'The Most Kind'],
  ['مَالِكُ ٱلْمُلْكِ', 'Malik-ul-Mulk', 'Owner of all sovereignty'],
  ['ذُو ٱلْجَلَالِ وَٱلْإِكْرَامِ', 'Dhul-Jalali wal-Ikram', 'Lord of Majesty and Generosity'],
  ['ٱلْمُقْسِطُ', 'Al-Muqsit', 'The Equitable'],
  ['ٱلْجَامِعُ', "Al-Jami'", 'The Gatherer'],
  ['ٱلْغَنِيُّ', 'Al-Ghaniyy', 'The Self-Sufficient'],
  ['ٱلْمُغْنِي', 'Al-Mughnee', 'The Enricher'],
  ['ٱلْمَانِعُ', "Al-Mani'", 'The Withholder of harm'],
  ['ٱلضَّارُّ', 'Ad-Darr', 'The One who can cause harm'],
  ['ٱلنَّافِعُ', "An-Nafi'", 'The Bringer of benefit'],
  ['ٱلنُّورُ', 'An-Noor', 'The Light'],
  ['ٱلْهَادِي', 'Al-Hadee', 'The Guide'],
  ['ٱلْبَدِيعُ', "Al-Badee'", 'The Incomparable Originator'],
  ['ٱلْبَاقِي', 'Al-Baqee', 'The Everlasting'],
  ['ٱلْوَارِثُ', 'Al-Warith', 'The Inheritor of all'],
  ['ٱلرَّشِيدُ', 'Ar-Rasheed', 'The Guide to the right path'],
  ['ٱلصَّبُورُ', 'As-Saboor', 'The Most Patient']
];

if (NAMES.length !== 99) {
  console.error(`Expected 99 names, got ${NAMES.length}`);
  process.exit(1);
}

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const pad = (n) => String(n).padStart(3, '0');

const entries = NAMES.map(([arabic, trn, meaning], i) => {
  const n = i + 1;
  // The enumeration note belongs on the first card a reader opens, not on all
  // 99 — repeating it would turn a caveat into noise.
  const benefit =
    n === 1
      ? `\n    benefit: {\n      en: 'Allah says: "To Allah belong the most beautiful names, so call upon Him by them." The list of exactly these ninety-nine comes from a narration in at-Tirmidhi; many scholars hold the enumeration itself to be the words of a narrator rather than of the Prophet \\u0635\\u0644\\u0649 \\u0627\\u0644\\u0644\\u0647 \\u0639\\u0644\\u064a\\u0647 \\u0648\\u0633\\u0644\\u0645, though every name in it is attested. Other lists differ slightly.'\n    },`
      : '';
  return `  {
    step: 3,
    id: 'asma_${pad(n)}',
    title: { en: '${esc(trn)}' },
    arabic: '${esc(arabic)}',
    trn: { en: '${esc(trn)}' },
    meaning: { en: '${esc(meaning)}' },${benefit}
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
 * Prophet's \\u0635\\u0644\\u0649 \\u0627\\u0644\\u0644\\u0647 \\u0639\\u0644\\u064a\\u0647 \\u0648\\u0633\\u0644\\u0645 own words, and other lists differ slightly. So the citation on
 * every entry is 7:180 — the principle, which is certain — and the caveat is
 * stated once on the first name rather than asserted away.
 *
 * Meanings are English only for now; a single English gloss cannot carry a
 * divine name's full sense, and the Bangla is left absent rather than machine
 * translated. \`npm run i18n:report\` lists the gap.
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
  meaning: { en: 'One complete round of the names of Allah.' },
  cat: [],
  target: 1,
  source: 'Quran',
  ref: '7:180'
};

/** True for the names themselves, not the cycle marker. */
export const isAsmaId = (id: string): boolean => id.startsWith('asma_') && id !== 'asma_cycle';
`;

writeFileSync('/home/user/Tasbeeh---Dhikr-Dua-Tracker/src/data/asmaulHusna.ts', file);
console.log(`wrote ${NAMES.length} names`);
