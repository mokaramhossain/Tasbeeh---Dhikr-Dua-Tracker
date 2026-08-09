import { DhikrItem } from '../constants';

/**
 * Du'as tied to a time of year rather than a time of day.
 *
 * The catalogue had none of these — no Ramadan, Qadr, Eid or Arafah item
 * existed — so every one here is new content and every one carries a real
 * source and reference. Where a narration is not sahih, or is an athar of a
 * companion rather than a saying of the Prophet ﷺ, the benefit text says so
 * plainly instead of letting the citation imply more than it supports.
 *
 * English only for now. These are authored, not sourced from a published
 * translation, and the project's rules forbid machine-translating religious
 * text — so the Bangla is left absent and `npm run i18n:report` lists it.
 */
export const OCCASION_DATA: DhikrItem[] = [
  {
    step: 2,
    id: 'occ_001',
    title: { en: 'The Du’a of Laylat al-Qadr' },
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    trn: { en: "Allahumma innaka 'afuwwun tuhibbul-'afwa fa'fu 'anni" },
    meaning: { en: 'O Allah, You are Most Pardoning and You love to pardon, so pardon me.' },
    benefit: {
      en: "Aisha asked the Prophet ﷺ what to say if she knew which night was Laylat al-Qadr, and he taught her these words. Said in the last ten nights of Ramadan, when the night is sought rather than known. Graded sahih by at-Tirmidhi."
    },
    cat: ['occasions'],
    tags: ['qadr', 'ramadan', 'forgiveness', 'pardon', 'laylatul qadr'],
    when: ['lastten'],
    target: 0,
    source: "Jami` at-Tirmidhi",
    ref: '3513'
  },
  {
    step: 2,
    id: 'occ_002',
    title: { en: 'Breaking the Fast' },
    arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
    trn: { en: "Dhahaba az-zama'u wabtallatil-'urooqu wa thabatal-ajru in sha Allah" },
    meaning: {
      en: 'The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.'
    },
    benefit: {
      en: 'Said by the Prophet ﷺ when he broke his fast. A statement of gratitude at the moment the fast ends, not a request. Reported by Abu Dawud; graded hasan.'
    },
    cat: ['occasions'],
    tags: ['ramadan', 'iftar', 'fasting', 'gratitude'],
    when: ['ramadan'],
    target: 0,
    source: 'Sunan Abi Dawud',
    ref: '2357'
  },
  {
    step: 2,
    id: 'occ_003',
    title: { en: 'Sighting the New Moon' },
    arabic:
      'اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْيُمْنِ وَالْإِيمَانِ وَالسَّلَامَةِ وَالْإِسْلَامِ رَبِّي وَرَبُّكَ اللَّهُ',
    trn: {
      en: "Allahumma ahillahu 'alayna bil-yumni wal-imani was-salamati wal-islam, Rabbi wa Rabbukallah"
    },
    meaning: {
      en: 'O Allah, bring it over us with blessing and faith, safety and submission. My Lord and your Lord is Allah.'
    },
    benefit: {
      en: 'Said by the Prophet ﷺ on seeing the new crescent. Marks the turn of a month — including the start of Ramadan and of Shawwal. Reported by at-Tirmidhi and graded hasan.'
    },
    cat: ['occasions'],
    tags: ['moon', 'crescent', 'ramadan', 'new month'],
    when: ['ramadan', 'eid'],
    target: 0,
    source: "Jami` at-Tirmidhi",
    ref: '3451'
  },
  {
    step: 2,
    id: 'occ_004',
    title: { en: 'The Takbir of Eid' },
    arabic: 'اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ لَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ',
    trn: {
      en: 'Allahu akbar, Allahu akbar, la ilaha illallah, wallahu akbar, Allahu akbar, wa lillahil-hamd'
    },
    meaning: {
      en: 'Allah is the Greatest, Allah is the Greatest. There is no god but Allah. Allah is the Greatest, Allah is the Greatest, and to Allah belongs all praise.'
    },
    benefit: {
      en: 'Recited on the way to the Eid prayer and through the days of Eid. This wording is an athar — the practice of Ibn Mas‘ud, reported by Ibn Abi Shaybah and al-Bayhaqi — not a saying of the Prophet ﷺ, and other wordings are also narrated.'
    },
    cat: ['occasions'],
    tags: ['eid', 'takbir', 'praise'],
    when: ['eid'],
    target: 0,
    source: 'Athar of Ibn Mas‘ud',
    ref: 'Ibn Abi Shaybah 5633'
  },
  {
    step: 2,
    id: 'occ_005',
    title: { en: 'The Best Du’a — the Day of Arafah' },
    arabic:
      'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    trn: {
      en: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadeer"
    },
    meaning: {
      en: 'There is no god but Allah alone, without partner. To Him belongs the dominion and to Him belongs all praise, and He is able to do all things.'
    },
    benefit: {
      en: 'The Prophet ﷺ said the best du’a is the du’a of the Day of Arafah, and the best thing he and the prophets before him said were these words. Recited on 9 Dhul-Hijjah, by pilgrims and by those fasting at home. Reported by at-Tirmidhi.'
    },
    cat: ['occasions', 'tawhid'],
    tags: ['arafah', 'hajj', 'dhul hijjah', 'tawhid'],
    when: ['arafah'],
    target: 0,
    source: "Jami` at-Tirmidhi",
    ref: '3585'
  },
  {
    step: 2,
    id: 'occ_006',
    title: { en: 'Abundant Salawat on Friday' },
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
    trn: { en: "Allahumma salli 'ala Muhammadin wa 'ala aali Muhammad" },
    meaning: { en: 'O Allah, send blessings upon Muhammad and upon the family of Muhammad.' },
    benefit: {
      en: 'The Prophet ﷺ instructed that salawat be sent upon him abundantly on Friday, saying that it is presented to him. Reported by Abu Dawud.'
    },
    cat: ['occasions', 'salawat'],
    tags: ['friday', 'jumuah', 'salawat', 'blessings'],
    when: ['friday'],
    target: 0,
    source: 'Sunan Abi Dawud',
    ref: '1047'
  }
];
