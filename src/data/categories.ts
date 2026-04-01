export const CATEGORY_META: Record<string, { en: string, bn: string, icon: string }> = {
  daily: { en: "Daily", bn: "দৈনিক", icon: "✨" },
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
