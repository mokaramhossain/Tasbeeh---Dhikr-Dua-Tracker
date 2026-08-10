import { DhikrItem } from '../constants';
import { SURAH_TEXTS } from './surahText';

export const ADHKAR_DATA: DhikrItem[] = [
  {
    step: 1,
    id: 'core_tawhid',
    title: { en: 'Declaration of Tawhid', bn: 'তাওহিদের ঘোষণা' },
    arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ ٱلْمُلْكُ وَلَهُ ٱلْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    trn: { en: 'La ilaha illallahu wahdahu la sharika lah, lahul mulku wa lahul hamdu wa huwa ala kulli shayin qadir', bn: 'লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারিকা লাহ, লাহুল মুলকু ওয়া লাহুল হামদু ওয়া হুয়া আলা কুল্লি শাইইন কাদির' },
    meaning: { en: 'None has the right to be worshipped except Allah alone, without partner. To Him belongs dominion and praise, and He has power over all things.', bn: 'আল্লাহ ছাড়া কোনো উপাস্য নেই, তিনি একক, তাঁর কোনো শরিক নেই। রাজত্ব ও প্রশংসা তাঁরই, এবং তিনি সব কিছুর উপর ক্ষমতাবান।' },
    benefit: { en: 'A central declaration of tawhid after salah.', bn: 'নামাজের পর তাওহিদের একটি গুরুত্বপূর্ণ জিকির।' },
    target: 1,
    cat: ['After Salah']
  },
  {
    step: 1,
    id: 'core_astaghfirullah',
    title: { en: 'Istighfar', bn: 'ইস্তিগফার' },
    arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ',
    trn: { en: 'Astaghfirullah', bn: 'আস্তাগফিরুল্লাহ' },
    meaning: { en: 'I seek forgiveness from Allah.', bn: 'আমি আল্লাহর কাছে ক্ষমা প্রার্থনা করছি।' },
    benefit: { en: 'The Prophet ﷺ would seek forgiveness after prayer.', bn: 'নবী ﷺ নামাজের পর ক্ষমা প্রার্থনা করতেন।' },
    target: 3,
    cat: ['After Salah']
  },
  {
    step: 1,
    id: 'core_subhanallah',
    title: { en: 'Tasbeeh (SubhanAllah)', bn: 'তাসবিহ (সুবহানাল্লাহ)' },
    arabic: 'سُبْحَانَ ٱللَّٰهِ',
    trn: { en: 'SubhanAllah', bn: 'সুবহানাল্লাহ' },
    meaning: { en: 'Glory be to Allah.', bn: 'আল্লাহ পবিত্র।' },
    benefit: { en: "Glorification: declaring Allah free of every fault and imperfection.", bn: "তাসবিহ: আল্লাহকে সব ত্রুটি ও অপূর্ণতা থেকে মুক্ত ঘোষণা করা।" },
    target: 33,
    cat: ['After Salah']
  },
  {
    step: 1,
    id: 'core_alhamdulillah',
    title: { en: 'Tahmid (Alhamdulillah)', bn: 'তাহমিদ (আলহামদুলিল্লাহ)' },
    arabic: 'ٱلْحَمْدُ لِلَّٰهِ',
    trn: { en: 'Alhamdulillah', bn: 'আলহামদুলিল্লাহ' },
    meaning: { en: 'All praise is for Allah.', bn: 'সমস্ত প্রশংসা আল্লাহর জন্য।' },
    benefit: { en: "Praise: returning all thanks and every good to Allah alone.", bn: "তাহমিদ: সব প্রশংসা ও কল্যাণ কেবল আল্লাহর দিকে ফিরিয়ে দেওয়া।" },
    target: 33,
    cat: ['After Salah']
  },
  {
    step: 1,
    id: 'core_allahu_akbar',
    title: { en: 'Allahu Akbar', bn: 'আল্লাহু আকবার' },
    arabic: 'ٱللَّٰهُ أَكْبَرُ',
    trn: { en: 'Allahu Akbar', bn: 'আল্লাহু আকবার' },
    meaning: { en: 'Allah is the Greatest.', bn: 'আল্লাহ সর্বশ্রেষ্ঠ।' },
    benefit: { en: "Magnification: affirming that Allah is greater than all else.", bn: "তাকবির: আল্লাহ সবকিছুর চেয়ে মহান — এই ঘোষণা করা।" },
    target: 34,
    cat: ['After Salah']
  },
  {
    step: 1,
    id: 'core_dua_help',
    title: { en: 'Dua for Help', bn: 'সাহায্যের দুআ' },
    arabic: 'اللَّهُمَّ أَعِنِّي عَلَىٰ ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    trn: { en: 'Allahumma ainni ala dhikrika wa shukrika wa husni ibadatik', bn: 'আল্লাহুম্মা আঈন্নি আলা যিকরিকা ওয়া শুকরিকা ওয়া হুসনি ইবাদাতিকা' },
    meaning: { en: 'O Allah, help me to remember You, thank You, and worship You well.', bn: 'হে আল্লাহ, আমাকে আপনার জিকির, শোকর এবং সুন্দর ইবাদতে সাহায্য করুন।' },
    benefit: { en: 'A beautiful post-prayer dua for istiqamah in worship.', bn: 'ইবাদতে স্থিরতার জন্য নামাজের পরের একটি সুন্দর দুআ।' },
    target: 1,
    cat: ['After Salah']
  },
  {
    step: 1,
    id: 'core_greeting_peace',
    title: { en: 'Greeting of Peace', bn: 'শান্তির দুআ' },
    arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالإِكْرَامِ',
    trn: { en: 'Allahumma antas-salam, wa minkas-salam, tabarakta ya dhal-jalali wal-ikram', bn: 'আল্লাহুম্মা আনতাস সালাম, ওয়া মিনকাস সালাম, তাবারাকতা ইয়া যাল জালালি ওয়াল ইকরাম' },
    meaning: { en: 'O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of Majesty and Honor.', bn: 'হে আল্লাহ, আপনিই শান্তি এবং আপনার কাছ থেকেই শান্তি আসে। হে মহিমা ও সম্মানের অধিকারী, আপনি বরকতময়।' },
    benefit: { en: "The Prophet salla Allahu alayhi wa sallam said this immediately after finishing the prayer. It affirms that peace itself comes from Allah, and asks Him for that peace as the prayer ends. Said once after every fard salah.", bn: "নবী সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম নামাজ শেষ করেই এটি পড়তেন। এতে স্বীকার করা হয় যে শান্তি আল্লাহরই পক্ষ থেকে আসে এবং তাঁর কাছেই সেই শান্তি চাওয়া হয়। প্রতি ফরজ নামাজের পর একবার পড়ুন।" },
    ref: 'Sahih Muslim 582',
    target: 1,
    cat: ['After Salah']
  },
  {
    step: 1,
    id: 'core_durood_ibrahim',
    title: { en: 'Durood Ibrahim', bn: 'দরুদে ইবরাহিম' },
    arabic: `اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ
اللَّهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ`,
    trn: { en: `Allahumma salli ala Muhammadin wa ala aali Muhammadin kama sallayta ala Ibrahima wa ala aali Ibrahima innaka Hamidum Majid.
Allahumma barik ala Muhammadin wa ala aali Muhammadin kama barakta ala Ibrahima wa ala aali Ibrahima innaka Hamidum Majid.`, bn: `আল্লাহুম্মা সাল্লি আলা মুহাম্মাদিন ওয়া আলা আালি মুহাম্মাদিন কামা সাল্লাইতা আলা ইবরাহিমা ওয়া আলা আালি ইবরাহিমা ইন্নাকা হামিদুম মাজিদ।
আল্লাহুম্মা বারিক আলা মুহাম্মাদিন ওয়া আলা আালি মুহাম্মাদিন কামা বারাকতা আলা ইবরাহিমা ওয়া আলা আালি ইবরাহিমা ইন্নাকা হামিদুম মাজিদ।` },
    meaning: { en: `O Allah, send Your prayers upon Muhammad and the family of Muhammad as You sent prayers upon Ibrahim and the family of Ibrahim. Indeed, You are Praiseworthy and Glorious.
O Allah, bless Muhammad and the family of Muhammad as You blessed Ibrahim and the family of Ibrahim. Indeed, You are Praiseworthy and Glorious.`, bn: `হে আল্লাহ, মুহাম্মাদ ও তাঁর পরিবারের উপর রহমত বর্ষণ করুন, যেমন আপনি ইবরাহিম ও তাঁর পরিবারের উপর রহমত বর্ষণ করেছেন। নিশ্চয়ই আপনি সর্বপ্রশংসিত, মহিমান্বিত।
হে আল্লাহ, মুহাম্মাদ ও তাঁর পরিবারের উপর বরকত দিন, যেমন আপনি ইবরাহিম ও তাঁর পরিবারের উপর বরকত দিয়েছেন। নিশ্চয়ই আপনি সর্বপ্রশংসিত, মহিমান্বিত।` },
    benefit: { en: 'A beloved salawat that connects the heart to the Prophet ﷺ.', bn: 'নবী ﷺ এর সাথে হৃদয়ের সংযোগের একটি প্রিয় দরুদ।' },
    target: 1,
    cat: ['After Salah']
  },
  {
    step: 1,
    id: 'protection_ayatul_kursi',
    title: { en: 'Ayatul Kursi', bn: 'আয়াতুল কুরসি' },
    arabic: SURAH_TEXTS.ayatulKursi.arabic,
    trn: SURAH_TEXTS.ayatulKursi.trn,
    meaning: SURAH_TEXTS.ayatulKursi.meaning,
    benefit: { en: "The greatest verse in the Quran. 'Whoever recites Ayatul Kursi after every obligatory prayer, nothing stands between him and entering Paradise except death.' (Nasa'i)", bn: 'কুরআনের সর্বশ্রেষ্ঠ আয়াত।' },
    target: 3,
    cat: ['Protection']
  },
  {
    step: 1,
    id: 'protection_ikhlas',
    title: { en: 'Surah Al-Ikhlas', bn: 'সূরা আল-ইখলাস' },
    arabic: SURAH_TEXTS.ikhlas.arabic,
    trn: SURAH_TEXTS.ikhlas.trn,
    meaning: SURAH_TEXTS.ikhlas.meaning,
    benefit: { en: 'Equivalent to reciting one-third of the Quran. Read 1x after Dhuhr, Asr, Isha. Read 3x after Fajr and Maghrib.', bn: 'কুরআনের এক-তৃতীয়াংশের সমান।' },
    target: 3,
    cat: ['Protection']
  },
  {
    step: 1,
    id: 'protection_falaq',
    title: { en: 'Surah Al-Falaq', bn: 'সূরা আল-ফালাক' },
    arabic: SURAH_TEXTS.falaq.arabic,
    trn: SURAH_TEXTS.falaq.trn,
    meaning: SURAH_TEXTS.falaq.meaning,
    benefit: { en: 'One of the three Quls for protection from harm.', bn: 'ক্ষতি থেকে সুরক্ষার তিন কুলের একটি।' },
    target: 3,
    cat: ['Protection']
  },
  {
    step: 1,
    id: 'protection_nas',
    title: { en: 'Surah An-Nas', bn: 'সূরা আন-নাস' },
    arabic: SURAH_TEXTS.nas.arabic,
    trn: SURAH_TEXTS.nas.trn,
    meaning: SURAH_TEXTS.nas.meaning,
    benefit: { en: 'One of the three Quls for protection from whispers and evil.', bn: 'কুমন্ত্রণা ও অনিষ্ট থেকে সুরক্ষার তিন কুলের একটি।' },
    target: 3,
    cat: ['Protection']
  }
];

export const ADHKAR_ROUTINE = {
  afterSalahCore: [
    'core_tawhid',
    'core_astaghfirullah',
    'core_subhanallah',
    'core_alhamdulillah',
    'core_allahu_akbar',
    'core_dua_help',
    'core_greeting_peace',
    'core_durood_ibrahim'
  ],
  afterSalahOptional: [],
  protection: [
    'protection_ayatul_kursi',
    'protection_ikhlas',
    'protection_falaq',
    'protection_nas'
  ]
};

export default ADHKAR_DATA;
