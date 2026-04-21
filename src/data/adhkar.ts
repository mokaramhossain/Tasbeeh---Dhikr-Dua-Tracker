import { DhikrItem } from '../constants';

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
    benefit: { en: 'One of the core adhkar after salah.', bn: 'নামাজের পরের মূল জিকিরগুলোর একটি।' },
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
    benefit: { en: 'One of the core adhkar after salah.', bn: 'নামাজের পরের মূল জিকিরগুলোর একটি।' },
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
    benefit: { en: 'One of the core adhkar after salah.', bn: 'নামাজের পরের মূল জিকিরগুলোর একটি।' },
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
    benefit: { en: "The Prophet ﷺ would say this immediately after finishing his prayer, seeking peace and acknowledging Allah's majesty.", bn: 'নবী ﷺ নামাজ শেষে এটি পাঠ করতেন।' },
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
    arabic: `اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ
لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ
لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ
مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ
يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ
وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ
وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ
وَلَا يَئُودُهُ حِفْظُهُمَا
وَهُوَ الْعَلِيُّ الْعَظِيمُ`,
    trn: { en: `Allahu la ilaha illa huwal-Hayyul-Qayyum
La ta’khudhuhu sinatun wa la nawm
Lahu ma fis-samawati wa ma fil-ard
Man dhal-ladhi yashfa'u 'indahu illa bi-idhnih
Ya'lamu ma bayna aydihim wa ma khalfahum
Wa la yuhituna bi-shay'im-min 'ilmihi illa bi-ma sha'
Wasi'a kursiyyuhus-samawati wal-ard
Wa la ya'uduhu hifzuhuma
Wa huwal-'Aliyyul-'Azim`, bn: 'আল্লাহু লা ইলাহা ইল্লা হুওয়াল হাইয়্যুল কাইয়্যুম...' },
    meaning: { en: `Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence.
Neither drowsiness overtakes Him nor sleep.
To Him belongs whatever is in the heavens and whatever is on the earth.
Who is it that can intercede with Him except by His permission?
He knows what is before them and what will be after them,
and they encompass not a thing of His knowledge except for what He wills.
His Kursi extends over the heavens and the earth,
and their preservation tires Him not.
And He is the Most High, the Most Great.`, bn: 'আল্লাহ! তিনি ছাড়া কোনো উপাস্য নেই, তিনি চিরঞ্জীব, সব কিছুর ধারক... এবং তিনি সর্বোচ্চ, সুমহান।' },
    benefit: { en: "The greatest verse in the Quran. 'Whoever recites Ayatul Kursi after every obligatory prayer, nothing stands between him and entering Paradise except death.' (Nasa'i)", bn: 'কুরআনের সর্বশ্রেষ্ঠ আয়াত।' },
    target: 3,
    cat: ['Protection']
  },
  {
    step: 1,
    id: 'protection_ikhlas',
    title: { en: 'Surah Al-Ikhlas', bn: 'সূরা আল-ইখলাস' },
    arabic: `قُلْ هُوَ اللَّهُ أَحَدٌ
اللَّهُ الصَّمَدُ
لَمْ يَلِدْ وَلَمْ يُولَدْ
وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ`,
    trn: { en: `Qul huwallahu ahad.
Allahus-samad.
Lam yalid wa lam yulad.
Wa lam yakun lahu kufuwan ahad.`, bn: 'কুল হুয়াল্লাহু আহাদ। আল্লাহুস সামাদ। লাম ইয়ালিদ ওয়া লাম ইউলাদ। ওয়া লাম ইয়াকুল্লাহু কুফুওয়ান আহাদ।' },
    meaning: { en: `Say, 'He is Allah, [who is] One.
Allah, the Eternal Refuge.
He neither begets nor is born.
Nor is there to Him any equivalent.'`, bn: 'বলুন, তিনি আল্লাহ, এক। আল্লাহ অমুখাপেক্ষী। তিনি জন্ম দেননি, জন্মগ্রহণও করেননি। এবং তাঁর সমতুল্য কেউ নেই।' },
    benefit: { en: 'Equivalent to reciting one-third of the Quran. Read 1x after Dhuhr, Asr, Isha. Read 3x after Fajr and Maghrib.', bn: 'কুরআনের এক-তৃতীয়াংশের সমান।' },
    target: 3,
    cat: ['Protection']
  },
  {
    step: 1,
    id: 'protection_falaq',
    title: { en: 'Surah Al-Falaq', bn: 'সূরা আল-ফালাক' },
    arabic: `قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ
مِن شَرِّ مَا خَلَقَ
وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ
وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ
وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ`,
    trn: { en: `Qul a'udhu bi rabbil-falaq.
Min sharri ma khalaq.
Wa min sharri ghasiqin idha waqab.
Wa min sharrin-naffathati fil-'uqad.
Wa min sharri hasidin idha hasad.`, bn: 'কুল আউযু বিরাব্বিল ফালাক...' },
    meaning: { en: 'Say, I seek refuge in the Lord of daybreak from the evil of that which He created... and from the evil of an envier when he envies.', bn: 'বলুন, আমি প্রভাতের রবের আশ্রয় চাই... এবং হিংসুকের অনিষ্ট থেকে যখন সে হিংসা করে।' },
    benefit: { en: 'One of the three Quls for protection from harm.', bn: 'ক্ষতি থেকে সুরক্ষার তিন কুলের একটি।' },
    target: 3,
    cat: ['Protection']
  },
  {
    step: 1,
    id: 'protection_nas',
    title: { en: 'Surah An-Nas', bn: 'সূরা আন-নাস' },
    arabic: `قُلْ أَعُوذُ بِرَبِّ النَّاسِ
مَلِكِ النَّاسِ
إِلَٰهِ النَّاسِ
مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ
الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ
مِنَ الْجِنَّةِ وَالنَّاسِ`,
    trn: { en: `Qul a'udhu bi rabbin-nas.
Malikin-nas.
Ilahin-nas.
Min sharril-waswasil-khannas.
Alladhi yuwaswisu fi sudurin-nas.
Minal-jinnati wan-nas.`, bn: 'কুল আউযু বিরাব্বিন নাস...' },
    meaning: { en: 'Say, I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer...', bn: 'বলুন, আমি মানুষের রব, মানুষের অধিপতি, মানুষের ইলাহর আশ্রয় চাই কুমন্ত্রণা দানকারীর অনিষ্ট থেকে...' },
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
