import { LocalizedText } from '../constants';

/**
 * What a category is, and — where it has one — what it is *for*.
 *
 * `intro` exists because the ninety-nine names all carry the same citation and
 * the same virtue: printing it under each of the 99 said nothing 99 times, and
 * printing it under only the first made that one card look different from the
 * other 98. A set has one benefit and one source, so they live on the set.
 */
export interface CategoryIntro {
  description: LocalizedText;
  benefit?: LocalizedText;
  source?: string;
  ref?: string;
}

export const CATEGORY_META: Record<
  string,
  { en: string; bn: string; icon: string; noun?: { en: string; bn: string }; intro?: CategoryIntro }
> = {
  daily: { en: "Daily", bn: "দৈনিক", icon: "✨" },
  // Its tiles count names, not du'as.
  names: {
    en: "Asma ul Husna",
    bn: "আসমাউল হুসনা",
    icon: "💠",
    noun: { en: "names", bn: "নাম" },
    intro: {
      description: {
        en: 'The names by which Allah is called upon, read one at a time. A full round of ninety-nine is counted once.',
        bn: 'যে নামগুলো ধরে আল্লাহকে ডাকা হয়, একটি একটি করে পড়ুন। পূর্ণ ৯৯টির এক চক্র একবার গণনা হয়।'
      },
      benefit: {
        en: 'Allah says: "Allah has the Most Beautiful Names, so call upon Him by them" (Qur’an 7:180). Authentic narrations state that Allah has ninety-nine names and that whoever enumerates them will enter Paradise. The fully enumerated list, however, is reported in at-Tirmidhi through a chain graded da‘if, so scholars differ over fixing one definitive list of exactly ninety-nine.',
        bn: 'আল্লাহ বলেন: “আল্লাহর জন্যই সর্বোত্তম নামসমূহ; সুতরাং তাঁকে সেসব নামেই ডাকো” (কুরআন ৭:১৮০)। সহিহ হাদিসে এসেছে, আল্লাহর নিরানব্বইটি নাম আছে এবং যে ব্যক্তি সেগুলো যথাযথভাবে গণনা/সংরক্ষণ করবে সে জান্নাতে প্রবেশ করবে। তবে তিরমিযীতে পূর্ণ নামের যে তালিকা বর্ণিত হয়েছে, তার সনদকে দাঈফ বলা হয়েছে; তাই নির্দিষ্ট একটি তালিকাকেই চূড়ান্ত ৯৯ নাম হিসেবে স্থির করা নিয়ে আলেমদের মতভেদ আছে।'
      },
      source: 'Quran',
      ref: '7:180'
    }
  },
  // Had no entry at all, and the tile list is derived from these keys — so the
  // six occasion du'as were reachable only by search and "All supplications".
  occasions: {
    en: "Occasions",
    bn: "বিশেষ সময়",
    icon: "🗓️",
    intro: {
      description: {
        en: 'Du’as tied to a time of year rather than a time of day — Ramadan, Laylat al-Qadr, Eid, the Day of Arafah and Friday.',
        bn: 'দিনের নয়, বছরের বিশেষ সময়ের দোয়া — রমাদান, লাইলাতুল কদর, ঈদ, আরাফার দিন ও জুমুআ।'
      },
      benefit: {
        en: 'Each carries its own source and grading. Where a wording is an athar of a companion rather than a saying of the Prophet ﷺ, the du’a says so. Dates follow a calculated calendar and may differ from your local moon sighting.',
        bn: 'প্রতিটির নিজস্ব সূত্র ও মান উল্লেখ আছে। কোনো বাক্যরূপ নবী ﷺ-এর সরাসরি হাদিস না হয়ে সাহাবির আমল হলে তা দোয়ার সাথেই বলা আছে। তারিখ গণনাভিত্তিক ক্যালেন্ডার অনুসারে; আপনার এলাকার চাঁদ দেখার সাথে পার্থক্য হতে পারে।'
      }
    }
  },
  morning_evening: { en: "Morning & Evening", bn: "সকাল ও সন্ধ্যা", icon: "🌤️" },
  sleep: { en: "Sleep", bn: "ঘুম", icon: "🌙" },
  travel: { en: "Travel", bn: "সফর", icon: "🧳" },
  marriage: { en: "Marriage", bn: "বিবাহ", icon: "💍" },
  family: { en: "Family", bn: "পরিবার", icon: "👨‍👩‍👧" },
  anxiety: { en: "Peace & Anxiety", bn: "শান্তি ও দুশ্চিন্তা", icon: "🕊️" },
  grief: { en: "Grief & Sorrow", bn: "দুঃখ ও শোক", icon: "😢" },
  hardship: { en: "Hardship", bn: "কষ্ট ও বিপদ", icon: "⛰️" },
  rizq: { en: "Provision (Rizq)", bn: "রিযিক", icon: "🤲" },
  guidance: { en: "Guidance", bn: "হেদায়েত", icon: "🧭" },
  tawhid: { en: "Tawhid", bn: "তাওহীদ", icon: "📜" },
  salawat: { en: "Salawat", bn: "দরূদ", icon: "🌹" },
  forgiveness: { en: "Forgiveness", bn: "ক্ষমা", icon: "🧼" },
  repentance: { en: "Repentance", bn: "তওবা", icon: "🫶" },
  protection: { en: "Protection", bn: "সুরক্ষা", icon: "🛡️" },
  ruqyah: { en: "Ruqyah", bn: "রুকইয়াহ", icon: "📿" },
  health: { en: "Health", bn: "স্বাস্থ্য", icon: "🏥" },
  knowledge: { en: "Knowledge", bn: "জ্ঞান", icon: "🧠" },
  janazah: { en: "Janazah", bn: "জানাজা", icon: "⚰️" },
  death: { en: "Death & Akhirah", bn: "মৃত্যু ও আখিরাত", icon: "🕯️" },
  gratitude: { en: "Gratitude", bn: "শুকরিয়া", icon: "🤍" }
};

export const DUA_CATEGORIES = Object.keys(CATEGORY_META);
