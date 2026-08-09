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
    title: { en: 'The Du’a of Laylat al-Qadr', bn: 'লাইলাতুল কদরের দোয়া' },
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    trn: { en: "Allahumma innaka 'afuwwun tuhibbul-'afwa fa'fu 'anni", bn: "আল্লাহুম্মা ইন্নাকা আফুউন তুহিব্বুল-আফওয়া ফা’ফু আন্নী" },
    meaning: { en: 'O Allah, You are Most Pardoning and You love to pardon, so pardon me.', bn: 'হে আল্লাহ, নিশ্চয়ই আপনি পরম ক্ষমাশীল; আপনি ক্ষমা করতে ভালোবাসেন; অতএব আমাকে ক্ষমা করুন।' },
    benefit: {
      en: "Aisha asked the Prophet ﷺ what to say if she knew which night was Laylat al-Qadr, and he taught her these words. Said in the last ten nights of Ramadan, when the night is sought rather than known. Graded sahih by at-Tirmidhi.",
      bn: "আয়িশা (রা.) নবী ﷺ-কে জিজ্ঞেস করেছিলেন, লাইলাতুল কদর পেলে কী দোয়া করবেন; তিনি তাঁকে এই দোয়া শিখিয়েছিলেন। রমজানের শেষ দশ রাতে এটি পড়া হয় — যে রাতটি নিশ্চিতভাবে জানা যায় না, বরং সন্ধান করা হয়। হাদিসটি তিরমিযীতে বর্ণিত এবং সহিহ হিসেবে গ্রেড করা হয়েছে।"
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
    title: { en: 'Breaking the Fast', bn: 'ইফতার করার সময়' },
    arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
    trn: { en: "Dhahaba az-zama'u wabtallatil-'urooqu wa thabatal-ajru in sha Allah", bn: "যাহাবায-যামাউ, ওয়াবতাল্লাতিল-উরূকু, ওয়া সাবাতাল-আজরু ইন শা’ আল্লাহ" },
    meaning: {
      en: 'The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.',
      bn: 'তৃষ্ণা দূর হলো, শিরাগুলো সিক্ত হলো এবং আল্লাহ চাইলে সওয়াব নিশ্চিত হলো।'
    },
    benefit: {
      en: 'Said by the Prophet ﷺ when he broke his fast. A statement of gratitude at the moment the fast ends, not a request. Reported by Abu Dawud; graded hasan.',
      bn: 'নবী ﷺ ইফতারের সময় এই কথাগুলো বলতেন। এটি ইফতার শেষে আল্লাহর প্রতি কৃতজ্ঞতার যিকর; আবু দাউদে বর্ণিত এবং হাসান হিসেবে গ্রেড করা হয়েছে।'
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
    title: { en: 'Sighting the New Moon', bn: 'নতুন চাঁদ দেখার দোয়া' },
    arabic:
      'اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْيُمْنِ وَالْإِيمَانِ وَالسَّلَامَةِ وَالْإِسْلَامِ رَبِّي وَرَبُّكَ اللَّهُ',
    trn: {
      en: "Allahumma ahillahu 'alayna bil-yumni wal-imani was-salamati wal-islam, Rabbi wa Rabbukallah"
    },
    meaning: {
      en: 'O Allah, bring it over us with blessing and faith, safety and submission. My Lord and your Lord is Allah.'
    },
    benefit: {
      en: 'Said by the Prophet ﷺ on seeing the new crescent. Marks the turn of a month — including the start of Ramadan and of Shawwal. Reported by at-Tirmidhi and graded hasan.',
      bn: 'নতুন চাঁদ দেখলে নবী ﷺ এই দোয়া করতেন। মাস শুরুর — রমজান ও শাওয়ালেরও — সন্ধিক্ষণ চিহ্নিত করে। তিরমিযীতে বর্ণিত; হাসান হিসেবে গ্রেড করা হয়েছে।'
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
    title: { en: 'The Takbir of Eid', bn: 'ঈদের তাকবীর' },
    arabic: 'اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ لَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ',
    trn: {
      en: 'Allahu akbar, Allahu akbar, la ilaha illallah, wallahu akbar, Allahu akbar, wa lillahil-hamd',
      bn: 'আল্লাহু আকবার, আল্লাহু আকবার, লা ইলাহা ইল্লাল্লাহ; ওয়াল্লাহু আকবার, আল্লাহু আকবার, ওয়া লিল্লাহিল-হামদ'
    },
    meaning: {
      en: 'Allah is the Greatest, Allah is the Greatest. There is no god but Allah. Allah is the Greatest, Allah is the Greatest, and to Allah belongs all praise.',
      bn: 'আল্লাহ সর্বশ্রেষ্ঠ, আল্লাহ সর্বশ্রেষ্ঠ। আল্লাহ ছাড়া কোনো উপাস্য নেই। আল্লাহ সর্বশ্রেষ্ঠ, আল্লাহ সর্বশ্রেষ্ঠ, আর সমস্ত প্রশংসা আল্লাহর।'
    },
    benefit: {
      en: 'Recited on the way to the Eid prayer and through the days of Eid. It is one well-known formula of the takbir, transmitted from the Companions and the early Muslims rather than as a saying of the Prophet ﷺ, and other valid wordings are also reported.',
      bn: 'এটি ঈদের তাকবীরের একটি সুপরিচিত বাক্যরূপ, যা সাহাবি ও সালাফদের থেকে বর্ণিত হয়েছে। এটিকে এখানে নবী ﷺ-এর সরাসরি হাদিস হিসেবে উপস্থাপন করা হচ্ছে না; অন্য বৈধ বাক্যরূপও বর্ণিত আছে।'
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
    title: { en: 'The Best Du’a — the Day of Arafah', bn: 'আরাফার দিনের শ্রেষ্ঠ দোয়া' },
    arabic:
      'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    trn: {
      en: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadeer",
      bn: "লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারীকা লাহ, লাহুল-মুলকু ওয়া লাহুল-হামদ, ওয়া হুয়া আলা কুল্লি শাই’ইন কাদীর"
    },
    meaning: {
      en: 'There is no god but Allah alone, without partner. To Him belongs the dominion and to Him belongs all praise, and He is able to do all things.',
      bn: 'আল্লাহ ছাড়া কোনো উপাস্য নেই; তিনি একক, তাঁর কোনো শরিক নেই। রাজত্ব তাঁরই এবং সমস্ত প্রশংসা তাঁরই; তিনি সবকিছুর ওপর ক্ষমতাবান।'
    },
    benefit: {
      en: 'Recited on 9 Dhul-Hijjah, by pilgrims and by those fasting at home. The report describing the supplication of the Day of Arafah as the best supplication is in at-Tirmidhi 3585, which he graded hasan gharib; later gradings differ.',
      bn: 'আরাফার দিনের দোয়াকে শ্রেষ্ঠ দোয়া বলে যে বর্ণনাটি আছে, তা তিরমিযী ৩৫৮৫-এ এসেছে। তিরমিযী এটিকে হাসান গরীব বলেছেন; পরবর্তী মুহাদ্দিসদের গ্রেডিংয়ে মতভেদ আছে।'
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
    title: { en: 'Abundant Salawat on Friday', bn: 'জুমার দিনে বেশি বেশি সালাওয়াত' },
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
    trn: { en: "Allahumma salli 'ala Muhammadin wa 'ala aali Muhammad", bn: "আল্লাহুম্মা সাল্লি আলা মুহাম্মাদিন ওয়া আলা আালি মুহাম্মাদ" },
    meaning: { en: 'O Allah, send blessings upon Muhammad and upon the family of Muhammad.', bn: 'হে আল্লাহ, মুহাম্মাদ ﷺ এবং তাঁর পরিবারের ওপর রহমত ও বরকত নাযিল করুন।' },
    benefit: {
      en: 'The Prophet ﷺ instructed that salawat be sent upon him abundantly on Friday, saying that it is presented to him. Reported by Abu Dawud.',
      bn: 'নবী ﷺ জুমার দিনে তাঁর ওপর বেশি বেশি সালাওয়াত পাঠ করতে বলেছেন এবং বলেছেন যে উম্মতের সালাওয়াত তাঁর কাছে পেশ করা হয়। আবু দাউদে বর্ণিত।'
    },
    cat: ['occasions', 'salawat'],
    tags: ['friday', 'jumuah', 'salawat', 'blessings'],
    when: ['friday'],
    target: 0,
    source: 'Sunan Abi Dawud',
    ref: '1047'
  }
];
