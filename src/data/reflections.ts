import { LocalizedText } from '../constants';
import { dayIndex } from '../utils/date';

/**
 * A question to sit with at the end of the day's page.
 *
 * These are self-examination prompts, not narrations: they carry no citation
 * because they claim nothing. They are written the way the rest of the app is
 * written — no guilt, no scoring, nothing that treats a quiet day as a failure.
 * A question, then silence.
 *
 * The Bangla here is app copy rather than translated scripture, so it follows
 * the same rule as every other UI string: a native reader should review it.
 * The single prompt this replaced showed the same question every day, which
 * survived on a settings screen nobody reads twice and would go stale within a
 * week on the home page.
 */
export const REFLECTIONS: LocalizedText[] = [
  {
    en: 'Did I remember Allah only when I was stressed, or also when I was at ease today?',
    bn: 'আজ আমি কি শুধু কষ্টের সময় আল্লাহকে স্মরণ করেছি, নাকি স্বস্তির সময়ও করেছি?'
  },
  {
    en: 'What did my tongue say most today?',
    bn: 'আজ আমার জিহ্বা সবচেয়ে বেশি কী বলেছে?'
  },
  {
    en: 'Was there a moment today I could have been gentler with someone?',
    bn: 'আজ কি এমন কোনো মুহূর্ত ছিল যখন আমি কারও সাথে আরও নরম হতে পারতাম?'
  },
  {
    en: 'What am I grateful for right now that I did not notice this morning?',
    bn: 'এই মুহূর্তে আমি কীসের জন্য কৃতজ্ঞ, যা সকালে খেয়াল করিনি?'
  },
  {
    en: 'Did I rush through my salah today, or stand in it?',
    bn: 'আজ কি আমি নামাজ তাড়াহুড়ো করে শেষ করেছি, নাকি তাতে দাঁড়িয়েছি?'
  },
  {
    en: 'Who did I forgive today, even quietly?',
    bn: 'আজ আমি কাকে ক্ষমা করেছি, নীরবে হলেও?'
  },
  {
    en: 'What worry am I carrying that I have not yet handed over in du’a?',
    bn: 'কোন দুশ্চিন্তা আমি বয়ে বেড়াচ্ছি, যা এখনো দুআয় সঁপে দিইনি?'
  },
  {
    en: 'Did I speak about someone today in a way I would not say to their face?',
    bn: 'আজ কি আমি কারও সম্পর্কে এমন কিছু বলেছি, যা তার মুখের সামনে বলতাম না?'
  },
  {
    en: 'What small good did I do today that no one saw?',
    bn: 'আজ আমি কোন ছোট ভালো কাজটি করেছি, যা কেউ দেখেনি?'
  },
  {
    en: 'Am I asking Allah for what I want, or for what is good for me?',
    bn: 'আমি কি আল্লাহর কাছে যা চাই তা চাইছি, নাকি যা আমার জন্য কল্যাণকর তা চাইছি?'
  },
  {
    en: 'When did I last sit quietly with no screen in front of me?',
    bn: 'শেষ কবে আমি কোনো স্ক্রিন ছাড়া চুপচাপ বসেছিলাম?'
  },
  {
    en: 'What did I learn today that I did not know yesterday?',
    bn: 'আজ আমি এমন কী শিখলাম, যা গতকাল জানতাম না?'
  },
  {
    en: 'Did I give anything away today — time, money, attention, patience?',
    bn: 'আজ কি আমি কিছু দিয়েছি — সময়, অর্থ, মনোযোগ, ধৈর্য?'
  },
  {
    en: 'Is there someone I owe an apology to?',
    bn: 'এমন কেউ কি আছে যার কাছে আমার ক্ষমা চাওয়া বাকি?'
  },
  {
    en: 'What am I doing today that I would want to be remembered for?',
    bn: 'আজ আমি এমন কী করছি, যার জন্য আমি স্মরণীয় হতে চাইব?'
  },
  {
    en: 'Did I let anger decide anything for me today?',
    bn: 'আজ কি রাগ আমার হয়ে কোনো সিদ্ধান্ত নিয়েছে?'
  },
  {
    en: 'What blessing am I treating as ordinary?',
    bn: 'কোন নিয়ামতকে আমি সাধারণ বলে ধরে নিচ্ছি?'
  },
  {
    en: 'Have I checked on my parents lately?',
    bn: 'আমি কি সম্প্রতি আমার বাবা-মায়ের খোঁজ নিয়েছি?'
  },
  {
    en: 'Did I keep a promise today that would have been easy to break?',
    bn: 'আজ কি আমি এমন কোনো ওয়াদা রেখেছি, যা ভাঙা সহজ ছিল?'
  },
  {
    en: 'What is one thing I keep postponing that I could begin today?',
    bn: 'কোন একটি কাজ আমি বারবার পিছিয়ে দিচ্ছি, যা আজই শুরু করতে পারি?'
  },
  {
    en: 'Did my work today feel like worship, or only like work?',
    bn: 'আজ আমার কাজকে কি ইবাদত মনে হয়েছে, নাকি শুধুই কাজ?'
  },
  {
    en: 'Who needed me today, and did I notice?',
    bn: 'আজ কার আমাকে দরকার ছিল, আর আমি কি খেয়াল করেছি?'
  },
  {
    en: 'What am I afraid of that I have not named?',
    bn: 'আমি কীসে ভয় পাচ্ছি, যার নাম আমি এখনো দিইনি?'
  },
  {
    en: 'Did I take more than I needed today?',
    bn: 'আজ কি আমি প্রয়োজনের চেয়ে বেশি নিয়েছি?'
  },
  {
    en: 'When I was alone today, what did I choose to do?',
    bn: 'আজ যখন আমি একা ছিলাম, তখন আমি কী করা বেছে নিয়েছি?'
  },
  {
    en: 'Is my heart lighter or heavier than it was this morning, and why?',
    bn: 'সকালের তুলনায় আমার অন্তর কি হালকা নাকি ভারী, আর কেন?'
  },
  {
    en: 'What would I change about today if I could live it again?',
    bn: 'আজকের দিনটি আবার পেলে আমি কী বদলাতাম?'
  },
  {
    en: 'Did I thank anyone out loud today?',
    bn: 'আজ কি আমি কাউকে মুখ ফুটে ধন্যবাদ দিয়েছি?'
  },
  {
    en: 'What am I holding on to that is not mine to carry?',
    bn: 'আমি এমন কী আঁকড়ে আছি, যা বহন করা আমার কাজ নয়?'
  },
  {
    en: 'If today were my last, what would I want to have said?',
    bn: 'আজই যদি আমার শেষ দিন হতো, আমি কী বলে যেতে চাইতাম?'
  }
];

/**
 * Offset from the hadith so the two do not advance in lockstep: with different
 * list lengths and a shifted start, the pairing keeps changing rather than
 * repeating the same combination every cycle.
 */
export const REFLECTION_OFFSET = 7;

/** The day's prompt, advancing by exactly one per local day. */
export const getReflectionOfTheDay = (dateKey: string): LocalizedText => {
  const i = (dayIndex(dateKey, REFLECTIONS.length) + REFLECTION_OFFSET) % REFLECTIONS.length;
  return REFLECTIONS[i];
};
