import React from 'react';
import { Palette, HeartHandshake, Share2, Star, ShieldCheck, Quote } from 'lucide-react';
import { Language, LocalizedText } from '../constants';
import { getHadithOfTheDay } from '../data/hadiths';

interface MoreScreenProps {
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
  theme: string;
  onThemeChange: (theme: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isSoundOn: boolean;
  setIsSoundOn: (on: boolean) => void;
  isHapticOn: boolean;
  setIsHapticOn: (on: boolean) => void;
  supportEmail: string;
  storeUrl: string;
  arabicFontSize: number;
  setArabicFontSize: (size: number) => void;
  englishFontSize: number;
  setEnglishFontSize: (size: number) => void;
  arabicLeading: number;
  setArabicLeading: (value: number) => void;
  showTransliteration: boolean;
  setShowTransliteration: (on: boolean) => void;
  showTranslation: boolean;
  setShowTranslation: (on: boolean) => void;
  onRateClick: () => void;
  onBackupClick: () => void;
  currentDate: string;
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
  supportEmail,
  storeUrl,
  arabicFontSize,
  setArabicFontSize,
  englishFontSize,
  setEnglishFontSize,
  arabicLeading,
  setArabicLeading,
  showTransliteration,
  setShowTransliteration,
  showTranslation,
  setShowTranslation,
  onRateClick,
  onBackupClick,
  currentDate
}) => {
  const hadith = getHadithOfTheDay(currentDate);
  const sectionClass = 'bg-card rounded-3xl border border-border overflow-hidden shadow-xl';
  const cardClass = 'bg-bg/50 rounded-2xl border border-border';

  // The off state used to use the border colour, which in the Light theme left
  // a white knob on a near-white track — the toggle looked empty.
  const renderToggle = (enabled: boolean, onClick: () => void, label: string) => (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      className={`relative h-6 w-12 rounded-full transition-all ${enabled ? 'bg-gold' : 'bg-text-muted/50'}`}
    >
      <div
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${enabled ? 'right-1' : 'left-1'}`}
      />
    </button>
  );

  const appearancePresets = [
    { id: 'system', label: { en: 'System', bn: 'সিস্টেম' }, swatch: '#333333' },
    { id: 'light', label: { en: 'Light', bn: 'লাইট' }, swatch: '#F8F9FA' },
    { id: 'dark', label: { en: 'Dark', bn: 'ডার্ক' }, swatch: '#121212' },
    { id: 'midnight', label: { en: 'Midnight', bn: 'মিডনাইট' }, swatch: '#0D1117' },
    { id: 'emerald', label: { en: 'Emerald', bn: 'এমারেল্ড' }, swatch: '#0B1410' },
    { id: 'royal', label: { en: 'Royal', bn: 'রয়্যাল' }, swatch: '#101320' },
    { id: 'maroon', label: { en: 'Maroon', bn: 'মেরুন' }, swatch: '#160F12' },
    { id: 'sand', label: { en: 'Sand', bn: 'স্যান্ড' }, swatch: '#18140F' }
  ];

  const handleShare = async () => {
    const shareText = getLocalizedText({
      en: 'If this app benefits you, please share it with family and friends.',
      bn: 'অ্যাপটি উপকারে এলে পরিবার ও বন্ধুদের সাথে শেয়ার করুন।'
    });
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Dhikr Tracker', text: shareText, url: storeUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(storeUrl);
        alert(getLocalizedText({ en: 'App link copied.', bn: 'অ্যাপের লিংক কপি হয়েছে।' }));
      }
    } catch {
      /* user dismissed the share sheet */
    }
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
          <p className="text-sm text-text-sub mt-3 max-w-2xl leading-relaxed">
            {getLocalizedText({
              en: 'Shape the app around a calm daily worship routine.',
              bn: 'প্রতিদিনের ইবাদতের শান্ত রুটিন অনুযায়ী অ্যাপকে গুছিয়ে নিন।'
            })}
          </p>
          {/* HADITH_DATA already existed in the codebase but nothing rendered
              it. Keyed off the date so it changes once a day. */}
          <div className="mt-6 p-4 bg-bg/60 border border-border rounded-2xl">
            <p className="flex items-center gap-1.5 text-[10px] font-bold text-gold uppercase tracking-[0.25em] mb-2">
              <Quote size={11} />
              {getLocalizedText({ en: 'Hadith of the day', bn: 'আজকের হাদিস' })}
            </p>
            <p className="text-sm text-text-main leading-relaxed italic">{getLocalizedText(hadith.text)}</p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">{hadith.source}</p>
          </div>

          <div className="mt-3 p-4 bg-bg/60 border border-border rounded-2xl">
            <p className="text-[10px] font-bold text-gold uppercase tracking-[0.25em] mb-2">
              {getLocalizedText({ en: 'Reflection', bn: 'আত্মসমালোচনা' })}
            </p>
            <p className="text-sm text-text-main leading-relaxed">
              {getLocalizedText({
                en: 'Did I remember Allah only when I was stressed, or also when I was at ease today?',
                bn: 'আজ আমি কি শুধু কষ্টের সময় আল্লাহকে স্মরণ করেছি, নাকি স্বস্তির সময়ও করেছি?'
              })}
            </p>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
            <Palette size={20} />
          </div>
          <h2 className="text-lg font-bold text-text-main">{getLocalizedText({ en: 'Appearance & App', bn: 'অ্যাপ ও চেহারা' })}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-[10px] font-bold text-text-sub uppercase tracking-[0.22em] mb-3">
              {getLocalizedText({ en: 'Appearance', bn: 'অ্যাপিয়ারেন্স' })}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {appearancePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onThemeChange(preset.id)}
                  aria-pressed={theme === preset.id}
                  className={`rounded-2xl border p-3 flex items-center gap-3 ${
                    theme === preset.id ? 'border-gold bg-gold/10' : 'border-border bg-bg/50'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full border border-border/40" style={{ backgroundColor: preset.swatch }} />
                  <span className="text-xs font-bold text-text-main">{getLocalizedText(preset.label)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={`${cardClass} p-4 flex items-center justify-between`}>
            <span className="text-sm font-bold text-text-main">{getLocalizedText({ en: 'Language', bn: 'ভাষা' })}</span>
            <div className="flex rounded-xl bg-bg/80 p-1">
              <button
                onClick={() => onLanguageChange('en')}
                aria-pressed={language === 'en'}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase ${
                  language === 'en' ? 'bg-gold text-bg' : 'text-text-sub'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('bn')}
                aria-pressed={language === 'bn'}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase ${
                  language === 'bn' ? 'bg-gold text-bg' : 'text-text-sub'
                }`}
              >
                BN
              </button>
            </div>
          </div>

          <div className={`${cardClass} p-4 flex items-center justify-between`}>
            <span className="text-sm font-bold text-text-main">{getLocalizedText({ en: 'Sound', bn: 'সাউন্ড' })}</span>
            {renderToggle(isSoundOn, () => setIsSoundOn(!isSoundOn), getLocalizedText({ en: 'Sound', bn: 'সাউন্ড' }))}
          </div>
          <div className={`${cardClass} p-4 flex items-center justify-between`}>
            <span className="text-sm font-bold text-text-main">{getLocalizedText({ en: 'Haptic', bn: 'হ্যাপটিক' })}</span>
            {renderToggle(isHapticOn, () => setIsHapticOn(!isHapticOn), getLocalizedText({ en: 'Haptic', bn: 'হ্যাপটিক' }))}
          </div>

          <div className="pt-4 space-y-6">
            <p className="text-[10px] font-bold text-text-sub uppercase tracking-[0.22em] mb-3">
              {getLocalizedText({ en: 'Reading', bn: 'পড়া' })}
            </p>

            <div className={`${cardClass} p-4 flex items-center justify-between`}>
              <span className="text-sm font-bold text-text-main">
                {getLocalizedText({ en: 'Show transliteration', bn: 'উচ্চারণ দেখান' })}
              </span>
              {renderToggle(
                showTransliteration,
                () => setShowTransliteration(!showTransliteration),
                getLocalizedText({ en: 'Show transliteration', bn: 'উচ্চারণ দেখান' })
              )}
            </div>
            <div className={`${cardClass} p-4 flex items-center justify-between`}>
              <span className="text-sm font-bold text-text-main">
                {getLocalizedText({ en: 'Show translation', bn: 'অনুবাদ দেখান' })}
              </span>
              {renderToggle(
                showTranslation,
                () => setShowTranslation(!showTranslation),
                getLocalizedText({ en: 'Show translation', bn: 'অনুবাদ দেখান' })
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="arabic-size" className="text-sm font-bold text-text-main">
                    {getLocalizedText({ en: 'Arabic Font Size', bn: 'আরবি ফন্ট সাইজ' })}
                  </label>
                  <span className="text-xs font-mono text-gold">{arabicFontSize}px</span>
                </div>
                <input
                  id="arabic-size"
                  type="range"
                  min="20"
                  max="48"
                  value={arabicFontSize}
                  onChange={(e) => setArabicFontSize(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-gold"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="english-size" className="text-sm font-bold text-text-main">
                    {getLocalizedText({ en: 'English/Bengali Font Size', bn: 'ইংরেজি/বাংলা ফন্ট সাইজ' })}
                  </label>
                  <span className="text-xs font-mono text-gold">{englishFontSize}px</span>
                </div>
                <input
                  id="english-size"
                  type="range"
                  min="12"
                  max="24"
                  value={englishFontSize}
                  onChange={(e) => setEnglishFontSize(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-gold"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="arabic-leading" className="text-sm font-bold text-text-main">
                    {getLocalizedText({ en: 'Arabic Line Spacing', bn: 'আরবি লাইন স্পেসিং' })}
                  </label>
                  <span className="text-xs font-mono text-gold">{arabicLeading.toFixed(1)}</span>
                </div>
                <input
                  id="arabic-leading"
                  type="range"
                  min="1.6"
                  max="3"
                  step="0.1"
                  value={arabicLeading}
                  onChange={(e) => setArabicLeading(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-gold"
                />
              </div>
            </div>

            <div className="p-4 bg-bg/50 rounded-2xl border border-border/50 space-y-3">
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1">
                {getLocalizedText({ en: 'Preview', bn: 'প্রিভিউ' })}
              </p>
              <p
                lang="ar"
                dir="rtl"
                className="arabic-text arabic-text--short text-right text-text-arabic"
                style={{ fontSize: `${arabicFontSize}px`, lineHeight: arabicLeading }}
              >
                سُبْحَانَ اللَّهِ وَبِحَمْدِهِ
              </p>
              <p className="text-text-main leading-relaxed" style={{ fontSize: `${englishFontSize}px` }}>
                {getLocalizedText({
                  en: 'Glory be to Allah and praise is to Him.',
                  bn: 'আল্লাহর পবিত্রতা ঘোষণা করছি এবং তাঁর প্রশংসা করছি।'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
            <ShieldCheck size={20} />
          </div>
          <h2 className="text-lg font-bold text-text-main">{getLocalizedText({ en: 'Your Data', bn: 'আপনার ডেটা' })}</h2>
        </div>
        <div className="p-6">
          <p className="text-sm leading-relaxed text-text-sub mb-4">
            {getLocalizedText({
              en: 'Everything is stored on this device only. Keep a backup so a reinstall or a new phone does not lose your history.',
              bn: 'সব কিছু কেবল এই ডিভাইসেই সংরক্ষিত। রিইনস্টল বা নতুন ফোনে যাতে হিসাব না হারায়, তাই ব্যাকআপ রাখুন।'
            })}
          </p>
          <button
            onClick={onBackupClick}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-bg px-4 py-3.5 text-sm font-bold text-text-main transition-all hover:border-gold/40 hover:text-gold"
          >
            <ShieldCheck size={16} />
            {getLocalizedText({ en: 'Backup & Restore', bn: 'ব্যাকআপ ও রিস্টোর' })}
          </button>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
            <HeartHandshake size={20} />
          </div>
          <h2 className="text-lg font-bold text-text-main">
            {getLocalizedText({ en: 'About the App & Support', bn: 'অ্যাপ সম্পর্কে ও সহায়তা' })}
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className={`${cardClass} p-4 space-y-4`}>
            <p className="text-sm leading-relaxed text-text-main">
              {getLocalizedText({
                en: 'This app was built with a single, heartfelt purpose: to make the remembrance of Allah a seamless and beautiful part of your daily life. While we strive to organize adhkar accurately using trusted sources, please verify detailed religious matters with authentic source books and trusted scholars when needed.',
                bn: 'এই অ্যাপটি তৈরি করার পেছনে আমাদের একটিই বিনীত উদ্দেশ্য: আল্লাহর স্মরণকে আপনার দৈনন্দিন জীবনের একটি অবিচ্ছেদ্য ও সুন্দর অংশ করে তোলা। আমরা বিশুদ্ধ উৎস ব্যবহার করে আযকারগুলো নির্ভুলভাবে সাজানোর সর্বোচ্চ চেষ্টা করেছি, এরপরও বিস্তারিত ধর্মীয় বিষয়ে নির্ভরযোগ্য আলেম ও বিশুদ্ধ উৎসগ্রন্থের সাহায্য নেওয়ার অনুরোধ রইল।'
              })}
            </p>
            <p className="text-sm leading-relaxed text-text-main">
              <span className="font-bold text-gold">{getLocalizedText({ en: 'Your Privacy:', bn: 'আপনার প্রাইভেসি:' })}</span>{' '}
              {getLocalizedText({
                en: 'All your dhikr counts and settings are stored locally on your own device. We do not track or store your personal worship data on our servers.',
                bn: 'আপনার সমস্ত জিকিরের হিসাব ও সেটিংস শুধুমাত্র আপনার ডিভাইসেই সংরক্ষিত থাকে। আমরা আমাদের সার্ভারে আপনার ইবাদতের কোনো ডেটা সংরক্ষণ করি না।'
              })}
            </p>
            <p className="text-sm leading-relaxed text-text-main">
              <span className="font-bold text-gold">{getLocalizedText({ en: 'A Humble Request:', bn: 'একটি বিনীত অনুরোধ:' })}</span>{' '}
              {getLocalizedText({
                en: 'If you find peace and benefit in this app, we humbly request you to keep us at Moiz IT, along with everyone who contributed their time and sincere advice, in your precious Duas.',
                bn: 'অ্যাপটি আপনার উপকারে আসলে আমাদের (Moiz IT) জন্য এবং যারা মূল্যবান মতামত ও পরামর্শ দিয়ে সহযোগিতা করেছেন, তাদের সবার জন্য দুআ করার বিনীত অনুরোধ রইল।'
              })}
            </p>
            <p className="text-sm leading-relaxed text-text-main">
              <span className="font-bold text-gold">{getLocalizedText({ en: 'Sadaqah Jariyah:', bn: 'সাদাকাহ জারিয়াহ:' })}</span>{' '}
              {getLocalizedText({
                en: 'If you love this app, please share it with family and friends. The Prophet ﷺ said: "Whoever guides someone to goodness will have a reward like one who did it."',
                bn: 'অ্যাপটি ভালো লাগলে পরিবার ও বন্ধুদের সাথে শেয়ার করুন। রাসূলুল্লাহ ﷺ বলেছেন: "যে ব্যক্তি কোনো ভালো কাজের পথ দেখায়, সে ওই কাজকারীর সমপরিমাণ সওয়াব পায়।"'
              })}
            </p>
            <p className="text-sm leading-relaxed text-text-main">
              <span className="font-bold text-gold">{getLocalizedText({ en: 'Contact Us:', bn: 'যোগাযোগ:' })}</span>{' '}
              {getLocalizedText({
                en: 'For questions, feature suggestions, or to report any errors, please reach out at:',
                bn: 'যেকোনো প্রশ্ন, নতুন ফিচারের পরামর্শ অথবা কোনো ভুল রিপোর্ট করতে আমাদের সাথে যোগাযোগ করুন:'
              })}{' '}
              <a href={`mailto:${supportEmail}`} className="font-bold text-gold underline underline-offset-2">
                {supportEmail}
              </a>
            </p>
            <p className="text-sm leading-relaxed text-text-main">
              <a
                href={`${import.meta.env.BASE_URL}privacy.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-gold underline underline-offset-2"
              >
                {getLocalizedText({ en: 'Privacy Policy', bn: 'প্রাইভেসি পলিসি' })}
              </a>
              {' · '}
              <span className="text-text-muted">
                {getLocalizedText({ en: 'Free software, GPL-3.0', bn: 'ফ্রি সফটওয়্যার, GPL-3.0' })}
              </span>
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-bg px-4 py-3 text-sm font-bold text-text-main transition-all hover:border-gold/40 hover:text-gold"
              >
                <Share2 size={16} />
                {getLocalizedText({ en: 'Share App', bn: 'শেয়ার করুন' })}
              </button>
              <button
                onClick={onRateClick}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-bg px-4 py-3 text-sm font-bold text-text-main transition-all hover:border-gold/40 hover:text-gold"
              >
                <Star size={16} />
                {getLocalizedText({ en: 'Rate Us 5 Stars', bn: '৫ স্টার রেটিং দিন' })}
              </button>
            </div>
            <p className="text-xs text-text-muted">{getLocalizedText({ en: 'Version 1.0.2', bn: 'ভার্সন ১.০.২' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreScreen;
