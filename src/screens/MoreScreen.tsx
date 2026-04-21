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
  theme: string;
  onThemeChange: (theme: string) => void;
  language: 'en' | 'bn';
  onLanguageChange: (lang: 'en' | 'bn') => void;
  isSoundOn: boolean;
  setIsSoundOn: (on: boolean) => void;
  isHapticOn: boolean;
  setIsHapticOn: (on: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  supportEmail: string;
  arabicFontSize: number;
  setArabicFontSize: (size: number) => void;
  englishFontSize: number;
  setEnglishFontSize: (size: number) => void;
  onRateClick: () => void;
}

const MoreScreen: React.FC<MoreScreenProps> = ({
  getLocalizedText,
  theme,
  onThemeChange,
  language,
  onLanguageChange,
  isSoundOn,
  setIsSoundOn,
  isHapticOn,
  setIsHapticOn,
  isDarkMode,
  setIsDarkMode,
  supportEmail,
  arabicFontSize,
  setArabicFontSize,
  englishFontSize,
  setEnglishFontSize,
  onRateClick,
}) => {
  const sectionClass = 'bg-card rounded-3xl border border-border overflow-hidden shadow-xl';
  const cardClass = 'bg-bg/50 rounded-2xl border border-border';

  const renderToggle = (enabled: boolean, onClick: () => void) => (
    <button onClick={onClick} className={`relative h-6 w-12 rounded-full ${enabled ? 'bg-gold' : 'bg-border'} transition-all`}>
      <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${enabled ? 'right-1' : 'left-1'}`} />
    </button>
  );

  const appearancePresets = [
    { id: 'system', label: { en: 'System', bn: 'সিস্টেম' }, swatch: '#333333', active: theme === 'system', onClick: () => onThemeChange('system') },
    { id: 'light', label: { en: 'Light', bn: 'লাইট' }, swatch: '#F8F9FA', active: theme === 'light', onClick: () => onThemeChange('light') },
    { id: 'dark', label: { en: 'Dark', bn: 'ডার্ক' }, swatch: '#121212', active: theme === 'dark', onClick: () => onThemeChange('dark') },
    { id: 'midnight', label: { en: 'Midnight', bn: 'মিডনাইট' }, swatch: '#0D1117', active: theme === 'midnight', onClick: () => onThemeChange('midnight') },
    { id: 'emerald', label: { en: 'Emerald', bn: 'এমারেল্ড' }, swatch: '#0B1410', active: theme === 'emerald', onClick: () => onThemeChange('emerald') },
    { id: 'royal', label: { en: 'Royal', bn: 'রয়্যাল' }, swatch: '#101320', active: theme === 'royal', onClick: () => onThemeChange('royal') },
    { id: 'maroon', label: { en: 'Maroon', bn: 'মেরুন' }, swatch: '#160F12', active: theme === 'maroon', onClick: () => onThemeChange('maroon') },
    { id: 'sand', label: { en: 'Sand', bn: 'স্যান্ড' }, swatch: '#18140F', active: theme === 'sand', onClick: () => onThemeChange('sand') },
  ];

  const handleShare = async () => {
    const shareText = getLocalizedText({
      en: 'If this app benefits you, please share it with family and friends.',
      bn: 'অ্যাপটি উপকারে এলে পরিবার ও বন্ধুদের সাথে শেয়ার করুন।',
    });
    const appUrl = 'https://play.google.com/store/apps/details?id=com.moizit.dhikrtracker';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Dhikr Tracker', text: shareText, url: appUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(appUrl);
        alert(getLocalizedText({ en: 'App link copied.', bn: 'অ্যাপের লিংক কপি হয়েছে।' }));
      }
    } catch {}
  };

  const handleRate = () => {
    window.open('https://play.google.com/store/apps/details?id=com.moizit.dhikrtracker', '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-2 sm:px-4 pt-6 pb-12">
      <div className={sectionClass}>
        <div className="p-6 md:p-8">
          <p className="text-[10px] font-bold text-gold uppercase tracking-[0.25em] mb-2">
            {getLocalizedText({ en: 'Welcome', bn: 'স্বাগতম' })}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-text-main leading-tight">
            {getLocalizedText({ en: 'Stay consistent with remembrance', bn: 'জিকিরে ধারাবাহিক থাকুন' })}
          </h1>
          <p className="text-sm text-text-main/60 mt-3 max-w-2xl leading-relaxed">
            {getLocalizedText({ en: 'Shape the app around a calm daily worship routine.', bn: 'প্রতিদিনের ইবাদতের শান্ত রুটিন অনুযায়ী অ্যাপকে গুছিয়ে নিন।' })}
          </p>
          <div className="mt-6 p-4 bg-bg/60 border border-border rounded-2xl">
            <p className="text-[10px] font-bold text-gold uppercase tracking-[0.25em] mb-2">{getLocalizedText({ en: 'Reflection', bn: 'আত্মসমালোচনা' })}</p>
            <p className="text-sm text-text-main leading-relaxed">{getLocalizedText({ en: 'Did I remember Allah only when I was stressed, or also when I was at ease today?', bn: 'আজ আমি কি শুধু কষ্টের সময় আল্লাহকে স্মরণ করেছি, নাকি স্বস্তির সময়ও করেছি?' })}</p>
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
          
          <div className="pt-4 space-y-6">
            <p className="text-[10px] font-bold text-text-main/45 uppercase tracking-[0.22em] mb-3">{getLocalizedText({ en: 'Font Sizes', bn: 'ফন্ট সাইজ' })}</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-text-main">{getLocalizedText({ en: 'Arabic Font Size', bn: 'আরবি ফন্ট সাইজ' })}</span>
                  <span className="text-xs font-mono text-gold">{arabicFontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="48" 
                  value={arabicFontSize} 
                  onChange={(e) => setArabicFontSize(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-gold"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-text-main">{getLocalizedText({ en: 'English/Bengali Font Size', bn: 'ইংরেজি/বাংলা ফন্ট সাইজ' })}</span>
                  <span className="text-xs font-mono text-gold">{englishFontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="12" 
                  max="24" 
                  value={englishFontSize} 
                  onChange={(e) => setEnglishFontSize(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-gold"
                />
              </div>
            </div>

            <div className="p-4 bg-bg/50 rounded-2xl border border-border/50 space-y-3">
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1">{getLocalizedText({ en: 'Preview', bn: 'প্রিভিউ' })}</p>
              <p className="arabic-text text-right text-text-arabic leading-relaxed" style={{ fontSize: `${arabicFontSize}px` }}>
                سُبْحَانَ اللَّهِ وَبِحَمْدِهِ
              </p>
              <p className="text-text-main leading-relaxed" style={{ fontSize: `${englishFontSize}px` }}>
                {getLocalizedText({ en: 'Glory be to Allah and praise is to Him.', bn: 'আল্লাহর পবিত্রতা ঘোষণা করছি এবং তাঁর প্রশংসা করছি।' })}
              </p>
            </div>
          </div>
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
              <button onClick={onRateClick} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-bg px-4 py-3 text-sm font-bold text-text-main transition-all hover:border-gold/40 hover:text-gold"><Star size={16} />{getLocalizedText({ en: 'Rate Us 5 Stars', bn: '৫ স্টার রেটিং দিন' })}</button>
            </div>
            <p className="text-xs text-text-main/45">{getLocalizedText({ en: 'Version 1.0.1', bn: 'ভার্সন ১.০.১' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreScreen;
