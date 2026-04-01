import React from 'react';
import {
  Activity,
  BarChart3,
  Clock3,
  Flame,
  Palette,
  Smartphone,
  Trophy,
  HeartHandshake,
  Share2,
  Star,
} from 'lucide-react';
import { LocalizedText } from '../constants';
import { JourneyStats } from '../utils/stats';

interface MoreScreenProps {
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
  prayerTimes: Record<string, string>;
  calcMethod: number;
  setCalcMethod: (method: number) => void;
  asrMethod: number;
  setAsrMethod: (method: number) => void;
  onFetchPrayerTimes: () => void;
  isPrayerLoading: boolean;
  theme: string;
  onThemeChange: (theme: string) => void;
  language: 'en' | 'bn';
  onLanguageChange: (lang: 'en' | 'bn') => void;
  isSoundOn: boolean;
  setIsSoundOn: (on: boolean) => void;
  isHapticOn: boolean;
  setIsHapticOn: (on: boolean) => void;
  timeFormat: '12h' | '24h';
  setTimeFormat: (format: '12h' | '24h') => void;
  formatTime: (time: string) => string;
  naflTimes: Record<string, string> | null;
  prohibitedTimes: Record<string, string> | null;
  userName: string;
  setUserName: (name: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  journeyStats: JourneyStats;
  itemMap: Record<string, { id: string; title?: unknown }>;
  supportEmail: string;
}

const MoreScreen: React.FC<MoreScreenProps> = ({
  getLocalizedText,
  prayerTimes,
  calcMethod,
  setCalcMethod,
  asrMethod,
  setAsrMethod,
  onFetchPrayerTimes,
  isPrayerLoading,
  theme,
  onThemeChange,
  language,
  onLanguageChange,
  isSoundOn,
  setIsSoundOn,
  isHapticOn,
  setIsHapticOn,
  timeFormat,
  setTimeFormat,
  formatTime,
  naflTimes,
  prohibitedTimes,
  userName,
  setUserName,
  isDarkMode,
  setIsDarkMode,
  journeyStats,
  itemMap,
  supportEmail,
}) => {
  const sectionClass = 'bg-card rounded-3xl border border-border overflow-hidden shadow-xl';
  const cardClass = 'bg-bg/50 rounded-2xl border border-border';

  const statCards = [
    { key: 'today', icon: Activity, label: { en: "Today's Count", bn: 'আজকের গণনা' }, value: journeyStats.todayCount },
    { key: 'total', icon: BarChart3, label: { en: 'Lifetime Total', bn: 'মোট গণনা' }, value: journeyStats.totalCount },
    { key: 'streak', icon: Flame, label: { en: 'Current Streak', bn: 'বর্তমান ধারাবাহিকতা' }, value: journeyStats.currentStreak },
    { key: 'days', icon: Trophy, label: { en: 'Active Days', bn: 'সক্রিয় দিন' }, value: journeyStats.activeDays },
  ];

  const calcMethodOptions = [
    { value: 2, label: 'ISNA' },
    { value: 1, label: 'Karachi' },
    { value: 3, label: 'Muslim World League' },
    { value: 4, label: 'Umm Al-Qura' },
  ];

  const renderToggle = (enabled: boolean, onClick: () => void) => (
    <button onClick={onClick} className={`relative h-6 w-12 rounded-full ${enabled ? 'bg-gold' : 'bg-border'} transition-all`}>
      <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${enabled ? 'right-1' : 'left-1'}`} />
    </button>
  );

  const titleFor = (id: string) => {
    const title = itemMap[id]?.title;
    if (!title) return id.replace(/_/g, ' ');
    return getLocalizedText(title as any) || id.replace(/_/g, ' ');
  };

  const prayerRange = (key: string) => {
    switch (key) {
      case 'Fajr':
        return prayerTimes.Sunrise ? `${formatTime(prayerTimes.Fajr)} → ${formatTime(prayerTimes.Sunrise)}` : formatTime(prayerTimes.Fajr);
      case 'Dhuhr':
        return prayerTimes.Asr ? `${formatTime(prayerTimes.Dhuhr)} → ${formatTime(prayerTimes.Asr)}` : formatTime(prayerTimes.Dhuhr);
      case 'Asr':
        return (prayerTimes.Sunset || prayerTimes.Maghrib) ? `${formatTime(prayerTimes.Asr)} → ${formatTime(prayerTimes.Sunset || prayerTimes.Maghrib)}` : formatTime(prayerTimes.Asr);
      case 'Maghrib':
        return prayerTimes.Isha ? `${formatTime(prayerTimes.Maghrib)} → ${formatTime(prayerTimes.Isha)}` : formatTime(prayerTimes.Maghrib);
      case 'Isha':
        return prayerTimes.Fajr ? `${formatTime(prayerTimes.Isha)} → ${formatTime(prayerTimes.Fajr)}` : formatTime(prayerTimes.Isha);
      default:
        return formatTime(prayerTimes[key]);
    }
  };

  const appearancePresets = [
    { id: 'light', label: { en: 'Light Mode', bn: 'লাইট মোড' }, swatch: '#F7F5F0', active: !isDarkMode, onClick: () => { setIsDarkMode(false); onThemeChange('emerald'); } },
    { id: 'dark', label: { en: 'Dark Mode', bn: 'ডার্ক মোড' }, swatch: '#0B1410', active: isDarkMode && theme === 'emerald', onClick: () => { setIsDarkMode(true); onThemeChange('emerald'); } },
    { id: 'midnight', label: { en: 'Midnight', bn: 'মিডনাইট' }, swatch: '#0D1117', active: isDarkMode && theme === 'midnight', onClick: () => { setIsDarkMode(true); onThemeChange('midnight'); } },
    { id: 'royal', label: { en: 'Royal', bn: 'রয়্যাল' }, swatch: '#101320', active: isDarkMode && theme === 'royal', onClick: () => { setIsDarkMode(true); onThemeChange('royal'); } },
    { id: 'maroon', label: { en: 'Maroon', bn: 'মেরুন' }, swatch: '#160F12', active: isDarkMode && theme === 'maroon', onClick: () => { setIsDarkMode(true); onThemeChange('maroon'); } },
    { id: 'sand', label: { en: 'Sand', bn: 'স্যান্ড' }, swatch: '#18140F', active: isDarkMode && theme === 'sand', onClick: () => { setIsDarkMode(true); onThemeChange('sand'); } },
  ];

  const handleShare = async () => {
    const shareText = getLocalizedText({
      en: 'If this app benefits you, please share it with family and friends.',
      bn: 'অ্যাপটি উপকারে এলে পরিবার ও বন্ধুদের সাথে শেয়ার করুন।',
    });
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Dhikr Tracker', text: shareText, url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        alert(getLocalizedText({ en: 'App link copied.', bn: 'অ্যাপের লিংক কপি হয়েছে।' }));
      }
    } catch {}
  };

  const handleRate = () => {
    const subject = encodeURIComponent('5 Star Feedback for Dhikr Tracker');
    const body = encodeURIComponent('Assalamu Alaikum. I would like to share positive feedback for the app.');
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-2 sm:px-4 pt-6 pb-12">
      <div className={sectionClass}>
        <div className="p-6 md:p-8">
          <p className="text-[10px] font-bold text-gold uppercase tracking-[0.25em] mb-2">
            {getLocalizedText({ en: 'Your Journey', bn: 'আপনার যাত্রা' })}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-text-main leading-tight">
            {userName ? getLocalizedText({ en: `Welcome back, ${userName}`, bn: `আবার স্বাগতম, ${userName}` }) : getLocalizedText({ en: 'Stay consistent with remembrance', bn: 'জিকিরে ধারাবাহিক থাকুন' })}
          </h1>
          <p className="text-sm text-text-main/60 mt-3 max-w-2xl leading-relaxed">
            {getLocalizedText({ en: 'Review your progress, keep prayer windows visible, and shape the app around a calm daily worship routine.', bn: 'আপনার অগ্রগতি দেখুন, নামাজের সময়সীমা সামনে রাখুন, এবং প্রতিদিনের ইবাদতের শান্ত রুটিন অনুযায়ী অ্যাপকে গুছিয়ে নিন।' })}
          </p>
          <div className="mt-6 p-4 bg-bg/60 border border-border rounded-2xl">
            <p className="text-[10px] font-bold text-gold uppercase tracking-[0.25em] mb-2">{getLocalizedText({ en: 'Reflection', bn: 'আত্মসমালোচনা' })}</p>
            <p className="text-sm text-text-main leading-relaxed">{getLocalizedText({ en: 'Did I remember Allah only when I was stressed, or also when I was at ease today?', bn: 'আজ আমি কি শুধু কষ্টের সময় আল্লাহকে স্মরণ করেছি, নাকি স্বস্তির সময়ও করেছি?' })}</p>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center text-gold"><BarChart3 size={20} /></div>
          <h2 className="text-lg font-bold text-text-main">{getLocalizedText({ en: 'Your Journey Stats', bn: 'আপনার অগ্রগতির হিসাব' })}</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return <div key={stat.key} className={`${cardClass} p-4`}><div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-3"><Icon size={18} /></div><div className="text-2xl font-bold text-text-main">{stat.value}</div><div className="text-[10px] font-bold text-text-main/45 uppercase tracking-[0.22em] mt-1 leading-relaxed">{getLocalizedText(stat.label)}</div></div>;
            })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${cardClass} p-4`}>
              <div className="flex items-center gap-2 mb-3 text-gold"><Flame size={16} /><span className="text-xs font-bold uppercase tracking-[0.2em]">{getLocalizedText({ en: 'Streak Detail', bn: 'স্ট্রিক বিস্তারিত' })}</span></div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-text-main/60">{getLocalizedText({ en: 'Current', bn: 'বর্তমান' })}</span><span className="font-bold text-text-main">{journeyStats.currentStreak}</span></div>
                <div className="flex items-center justify-between"><span className="text-text-main/60">{getLocalizedText({ en: 'Longest', bn: 'সর্বোচ্চ' })}</span><span className="font-bold text-text-main">{journeyStats.longestStreak}</span></div>
              </div>
            </div>
            <div className={`${cardClass} p-4`}>
              <div className="flex items-center gap-2 mb-3 text-gold"><Clock3 size={16} /><span className="text-xs font-bold uppercase tracking-[0.2em]">{getLocalizedText({ en: 'Last 7 Days', bn: 'শেষ ৭ দিন' })}</span></div>
              <div className="space-y-2">{journeyStats.last7Days.map((day) => <div key={day.date} className="flex items-center justify-between text-sm"><span className="text-text-main/60">{day.date}</span><span className="font-bold text-text-main">{day.total}</span></div>)}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${cardClass} p-4`}>
              <div className="flex items-center gap-2 mb-3 text-gold"><Trophy size={16} /><span className="text-xs font-bold uppercase tracking-[0.2em]">{getLocalizedText({ en: 'Top Items — Last 30 Days', bn: 'সেরা আইটেম — শেষ ৩০ দিন' })}</span></div>
              <div className="space-y-2">{journeyStats.topItemsLast30Days.length > 0 ? journeyStats.topItemsLast30Days.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 text-sm"><span className="text-text-main/70 truncate">{titleFor(item.id)}</span><span className="font-bold text-text-main">{item.count}</span></div>) : <div className="text-sm text-text-main/50">{getLocalizedText({ en: 'No data yet', bn: 'এখনও কোনো তথ্য নেই' })}</div>}</div>
            </div>
            <div className={`${cardClass} p-4`}>
              <div className="flex items-center gap-2 mb-3 text-gold"><BarChart3 size={16} /><span className="text-xs font-bold uppercase tracking-[0.2em]">{getLocalizedText({ en: 'Top Items — All Time', bn: 'সেরা আইটেম — সর্বমোট' })}</span></div>
              <div className="space-y-2">{journeyStats.topItemsAllTime.length > 0 ? journeyStats.topItemsAllTime.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 text-sm"><span className="text-text-main/70 truncate">{titleFor(item.id)}</span><span className="font-bold text-text-main">{item.count}</span></div>) : <div className="text-sm text-text-main/50">{getLocalizedText({ en: 'No data yet', bn: 'এখনও কোনো তথ্য নেই' })}</div>}</div>
            </div>
          </div>
        </div>
      </div>


      <div className={sectionClass}>
        <div className="p-6 border-b border-border flex items-center gap-3"><div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center text-gold"><Palette size={20} /></div><h2 className="text-lg font-bold text-text-main">{getLocalizedText({ en: 'Appearance & App', bn: 'অ্যাপ ও চেহারা' })}</h2></div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-[10px] font-bold text-text-main/45 uppercase tracking-[0.22em] mb-3">{getLocalizedText({ en: 'Appearance', bn: 'অ্যাপিয়ারেন্স' })}</p>
            <div className="grid grid-cols-2 gap-3">
              {appearancePresets.map((preset) => (
                <button key={preset.id} onClick={preset.onClick} className={`rounded-2xl border p-3 flex items-center gap-3 ${preset.active ? 'border-[#D4AF37] bg-gold/10' : 'border-border bg-bg/50'}`}>
                  <div className="w-6 h-6 rounded-full border border-border/40" style={{ backgroundColor: preset.swatch }} />
                  <span className="text-xs font-bold text-text-main">{getLocalizedText(preset.label)}</span>
                </button>
              ))}
            </div>
          </div>
          <div className={`${cardClass} p-4 flex items-center justify-between`}><span className="text-sm font-bold text-text-main">{getLocalizedText({ en: 'Language', bn: 'ভাষা' })}</span><div className="flex rounded-xl bg-bg/80 p-1"><button onClick={() => onLanguageChange('en')} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase ${language==='en' ? 'bg-[#D4AF37] text-bg' : 'text-text-main/60'}`}>EN</button><button onClick={() => onLanguageChange('bn')} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase ${language==='bn' ? 'bg-[#D4AF37] text-bg' : 'text-text-main/60'}`}>BN</button></div></div>
          <div className={`${cardClass} p-4 flex items-center justify-between`}><span className="text-sm font-bold text-text-main">{getLocalizedText({ en: 'Sound', bn: 'সাউন্ড' })}</span>{renderToggle(isSoundOn, () => setIsSoundOn(!isSoundOn))}</div>
          <div className={`${cardClass} p-4 flex items-center justify-between`}><span className="text-sm font-bold text-text-main">{getLocalizedText({ en: 'Haptic', bn: 'হ্যাপটিক' })}</span>{renderToggle(isHapticOn, () => setIsHapticOn(!isHapticOn))}</div>
          <div className={`${cardClass} p-4 flex items-center justify-between`}><span className="text-sm font-bold text-text-main">{getLocalizedText({ en: 'Time Format', bn: 'সময় ফরম্যাট' })}</span><div className="flex rounded-xl bg-bg/80 p-1"><button onClick={() => setTimeFormat('12h')} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase ${timeFormat==='12h' ? 'bg-[#D4AF37] text-bg' : 'text-text-main/60'}`}>12H</button><button onClick={() => setTimeFormat('24h')} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase ${timeFormat==='24h' ? 'bg-[#D4AF37] text-bg' : 'text-text-main/60'}`}>24H</button></div></div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="p-6 border-b border-border flex items-center gap-3"><div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center text-gold"><HeartHandshake size={20} /></div><h2 className="text-lg font-bold text-text-main">{getLocalizedText({ en: 'About the App & Support', bn: 'অ্যাপ সম্পর্কে ও সহায়তা' })}</h2></div>
        <div className="p-6 space-y-4">
          <div className={`${cardClass} p-4 space-y-4`}>
            <p className="text-sm leading-relaxed text-text-main">{getLocalizedText({ en: 'This app was built with a single, heartfelt purpose: to make the remembrance of Allah a seamless and beautiful part of your daily life. While we strive to organize adhkar accurately using trusted sources, please verify detailed religious matters with authentic source books and trusted scholars when needed.', bn: 'এই অ্যাপটি তৈরি করার পেছনে আমাদের একটিই বিনীত উদ্দেশ্য: আল্লাহর স্মরণকে আপনার দৈনন্দিন জীবনের একটি অবিচ্ছেদ্য ও সুন্দর অংশ করে তোলা। আমরা বিশুদ্ধ উৎস ব্যবহার করে আযকারগুলো নির্ভুলভাবে সাজানোর সর্বোচ্চ চেষ্টা করেছি, এরপরও বিস্তারিত ধর্মীয় বিষয়ে নির্ভরযোগ্য আলেম ও বিশুদ্ধ উৎসগ্রন্থের সাহায্য নেওয়ার অনুরোধ রইল।' })}</p>
            <p className="text-sm leading-relaxed text-text-main"><span className="font-bold text-gold">{getLocalizedText({ en: 'Your Privacy:', bn: 'আপনার প্রাইভেসি:' })}</span> {getLocalizedText({ en: 'All your dhikr counts, streaks, and settings are stored locally on your own device. We do not track or store your personal worship data on our servers.', bn: 'আপনার সমস্ত জিকিরের হিসাব, স্ট্রিক এবং সেটিংস শুধুমাত্র আপনার ডিভাইসেই সংরক্ষিত থাকে। আমরা আমাদের সার্ভারে আপনার ইবাদতের কোনো ডেটা সংরক্ষণ করি না।' })}</p>
            <p className="text-sm leading-relaxed text-text-main"><span className="font-bold text-gold">{getLocalizedText({ en: 'A Humble Request:', bn: 'একটি বিনীত অনুরোধ:' })}</span> {getLocalizedText({ en: 'If you find peace and benefit in this app, we humbly request you to keep us at Moiz IT, along with everyone who contributed their time and sincere advice, in your precious Duas.', bn: 'অ্যাপটি আপনার উপকারে আসলে আমাদের (Moiz IT) জন্য এবং যারা মূল্যবান মতামত ও পরামর্শ দিয়ে সহযোগিতা করেছেন, তাদের সবার জন্য দুআ করার বিনীত অনুরোধ রইল।' })}</p>
            <p className="text-sm leading-relaxed text-text-main"><span className="font-bold text-gold">{getLocalizedText({ en: 'Sadaqah Jariyah:', bn: 'সাদাকাহ জারিয়াহ:' })}</span> {getLocalizedText({ en: 'If you love this app, please share it with family and friends. The Prophet ﷺ said: "Whoever guides someone to goodness will have a reward like one who did it."', bn: 'অ্যাপটি ভালো লাগলে পরিবার ও বন্ধুদের সাথে শেয়ার করুন। রাসূলুল্লাহ ﷺ বলেছেন: "যে ব্যক্তি কোনো ভালো কাজের পথ দেখায়, সে ওই কাজকারীর সমপরিমাণ সওয়াব পায়।"' })}</p>
            <p className="text-sm leading-relaxed text-text-main"><span className="font-bold text-gold">{getLocalizedText({ en: 'Contact Us:', bn: 'যোগাযোগ:' })}</span> {getLocalizedText({ en: 'For questions, feature suggestions, or to report any errors, please reach out at:', bn: 'যেকোনো প্রশ্ন, নতুন ফিচারের পরামর্শ অথবা কোনো ভুল রিপোর্ট করতে আমাদের সাথে যোগাযোগ করুন:' })} <span className="font-bold text-gold">{supportEmail}</span></p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={handleShare} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-bg px-4 py-3 text-sm font-bold text-text-main transition-all hover:border-gold/40 hover:text-gold"><Share2 size={16} />{getLocalizedText({ en: 'Share App', bn: 'শেয়ার করুন' })}</button>
              <button onClick={handleRate} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-bg px-4 py-3 text-sm font-bold text-text-main transition-all hover:border-gold/40 hover:text-gold"><Star size={16} />{getLocalizedText({ en: 'Rate Us 5 Stars', bn: '৫ স্টার রেটিং দিন' })}</button>
            </div>
            <p className="text-xs text-text-main/45">{getLocalizedText({ en: 'Version 1.0.0', bn: 'ভার্সন ১.০.০' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreScreen;
