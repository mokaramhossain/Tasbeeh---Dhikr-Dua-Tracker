import React from 'react';
import { Palette, HeartHandshake, Share2, Star, ShieldCheck, Quote } from 'lucide-react';
import { DhikrItem, Language, LocalizedText } from '../constants';
import { LANGUAGES, LANGUAGE_CODES, languageInfo } from '../locales';
import { formatDigits } from '../i18n';
import RecordPanel from '../components/RecordPanel';
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
  dayCounts: Record<string, Record<string, number>>;
  lifetimeCounts: Record<string, number>;
  itemsById: Map<string, DhikrItem>;
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
  currentDate,
  dayCounts,
  lifetimeCounts,
  itemsById
}) => {
  const hadith = getHadithOfTheDay(currentDate);
  const hasFullTransliteration = languageInfo(language).hasTransliteration;
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
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${enabled ? 'end-1' : 'start-1'}`}
      />
    </button>
  );

  const appearancePresets = [
    { id: 'system', label: 'System', swatch: '#333333' },
    { id: 'light', label: 'Light', swatch: '#F8F9FA' },
    { id: 'dark', label: 'Dark', swatch: '#121212' },
    { id: 'midnight', label: 'Midnight', swatch: '#0D1117' },
    { id: 'emerald', label: 'Emerald', swatch: '#0B1410' },
    { id: 'royal', label: 'Royal', swatch: '#101320' },
    { id: 'maroon', label: 'Maroon', swatch: '#160F12' },
    { id: 'sand', label: 'Sand', swatch: '#18140F' }
  ];

  const handleShare = async () => {
    const shareText = getLocalizedText('If this app benefits you, please share it with family and friends.');
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Dhikr Tracker', text: shareText, url: storeUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(storeUrl);
        alert(getLocalizedText('App link copied.'));
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
            {getLocalizedText('Welcome')}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-text-main leading-tight">
            {getLocalizedText('Stay consistent with remembrance')}
          </h1>
          <p className="text-sm text-text-sub mt-3 max-w-2xl leading-relaxed">
            {getLocalizedText('Shape the app around a calm daily worship routine.')}
          </p>
          {/* HADITH_DATA already existed in the codebase but nothing rendered
              it. Keyed off the date so it changes once a day. */}
          <div className="mt-6 p-4 bg-bg/60 border border-border rounded-2xl">
            <p className="flex items-center gap-1.5 text-[10px] font-bold text-gold uppercase tracking-[0.25em] mb-2">
              <Quote size={11} />
              {getLocalizedText('Hadith of the day')}
            </p>
            <p className="text-sm text-text-main leading-relaxed italic">{getLocalizedText(hadith.text)}</p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">{hadith.source}</p>
          </div>

          <div className="mt-3 p-4 bg-bg/60 border border-border rounded-2xl">
            <p className="text-[10px] font-bold text-gold uppercase tracking-[0.25em] mb-2">
              {getLocalizedText('Reflection')}
            </p>
            <p className="text-sm text-text-main leading-relaxed">
              {getLocalizedText('Did I remember Allah only when I was stressed, or also when I was at ease today?')}
            </p>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
            <Palette size={20} />
          </div>
          <h2 className="text-lg font-bold text-text-main">{getLocalizedText('Appearance & App')}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-[10px] font-bold text-text-sub uppercase tracking-[0.22em] mb-3">
              {getLocalizedText('Appearance')}
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
            <span className="text-sm font-bold text-text-main">{getLocalizedText('Language')}</span>
            {/* Driven by the registry, so a new locale file appears here
                without this markup being touched. */}
            <div className="flex rounded-xl bg-bg/80 p-1">
              {LANGUAGE_CODES.map((code) => (
                <button
                  key={code}
                  onClick={() => onLanguageChange(code)}
                  aria-pressed={language === code}
                  lang={LANGUAGES[code].code}
                  className={`px-4 py-2 rounded-lg text-[11px] font-bold ${
                    language === code ? 'bg-gold text-bg' : 'text-text-sub'
                  }`}
                >
                  {LANGUAGES[code].nativeLabel}
                </button>
              ))}
            </div>
          </div>

          <div className={`${cardClass} p-4 flex items-center justify-between`}>
            <span className="text-sm font-bold text-text-main">{getLocalizedText('Sound')}</span>
            {renderToggle(isSoundOn, () => setIsSoundOn(!isSoundOn), getLocalizedText('Sound'))}
          </div>
          <div className={`${cardClass} p-4 flex items-center justify-between`}>
            <span className="text-sm font-bold text-text-main">{getLocalizedText('Haptic')}</span>
            {renderToggle(isHapticOn, () => setIsHapticOn(!isHapticOn), getLocalizedText('Haptic'))}
          </div>

          <div className="pt-4 space-y-6">
            <p className="text-[10px] font-bold text-text-sub uppercase tracking-[0.22em] mb-3">
              {getLocalizedText('Reading')}
            </p>

            <div className={`${cardClass} p-4`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-text-main">
                  {getLocalizedText('Show transliteration')}
                </span>
                {renderToggle(
                  showTransliteration,
                  () => setShowTransliteration(!showTransliteration),
                  getLocalizedText('Show transliteration')
                )}
              </div>
              {/* Most transliterations exist only in Latin script, so the toggle
                  looks broken in Bangla unless we say why. */}
              {!hasFullTransliteration ? (
                <p className="mt-2 text-xs leading-relaxed text-text-muted">
                  {getLocalizedText('Only a few du’as have a pronunciation guide in this language yet.')}
                </p>
              ) : null}
            </div>
            <div className={`${cardClass} p-4 flex items-center justify-between`}>
              <span className="text-sm font-bold text-text-main">
                {getLocalizedText('Show translation')}
              </span>
              {renderToggle(
                showTranslation,
                () => setShowTranslation(!showTranslation),
                getLocalizedText('Show translation')
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="arabic-size" className="text-sm font-bold text-text-main">
                    {getLocalizedText('Arabic Font Size')}
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
                    {getLocalizedText('English/Bengali Font Size')}
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
                    {getLocalizedText('Arabic Line Spacing')}
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
                {getLocalizedText('Preview')}
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
                {getLocalizedText('Glory be to Allah and praise is to Him.')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <RecordPanel
        getLocalizedText={getLocalizedText}
        language={language}
        dayCounts={dayCounts}
        lifetimeCounts={lifetimeCounts}
        itemsById={itemsById}
      />

      <div className={sectionClass}>
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
            <ShieldCheck size={20} />
          </div>
          <h2 className="text-lg font-bold text-text-main">{getLocalizedText('Your Data')}</h2>
        </div>
        <div className="p-6">
          <p className="text-sm leading-relaxed text-text-sub mb-4">
            {getLocalizedText('Everything is stored on this device only. Keep a backup so a reinstall or a new phone does not lose your history.')}
          </p>
          <button
            onClick={onBackupClick}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-bg px-4 py-3.5 text-sm font-bold text-text-main transition-all hover:border-gold/40 hover:text-gold"
          >
            <ShieldCheck size={16} />
            {getLocalizedText('Backup & Restore')}
          </button>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
            <HeartHandshake size={20} />
          </div>
          <h2 className="text-lg font-bold text-text-main">
            {getLocalizedText('About the App & Support')}
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className={`${cardClass} p-4 space-y-4`}>
            <p className="text-sm leading-relaxed text-text-main">
              {getLocalizedText('This app was built with a single, heartfelt purpose: to make the remembrance of Allah a seamless and beautiful part of your daily life. While we strive to organize adhkar accurately using trusted sources, please verify detailed religious matters with authentic source books and trusted scholars when needed.')}
            </p>
            <p className="text-sm leading-relaxed text-text-main">
              <span className="font-bold text-gold">{getLocalizedText('Your Privacy:')}</span>{' '}
              {getLocalizedText('All your dhikr counts and settings are stored locally on your own device. We do not track or store your personal worship data on our servers.')}
            </p>
            <p className="text-sm leading-relaxed text-text-main">
              <span className="font-bold text-gold">{getLocalizedText('A Humble Request:')}</span>{' '}
              {getLocalizedText('If you find peace and benefit in this app, we humbly request you to keep us at Qubeq, along with everyone who contributed their time and sincere advice, in your precious Duas.')}
            </p>
            <p className="text-sm leading-relaxed text-text-main">
              <span className="font-bold text-gold">{getLocalizedText('Sadaqah Jariyah:')}</span>{' '}
              {getLocalizedText('If you love this app, please share it with family and friends. The Prophet ﷺ said: "Whoever guides someone to goodness will have a reward like one who did it."')}
            </p>
            <p className="text-sm leading-relaxed text-text-main">
              <span className="font-bold text-gold">{getLocalizedText('Contact Us:')}</span>{' '}
              {getLocalizedText('For questions, feature suggestions, or to report any errors, please reach out at:')}{' '}
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
                {getLocalizedText('Privacy Policy')}
              </a>
              {' · '}
              <span className="text-text-muted">
                {getLocalizedText('Free software, GPL-3.0')}
              </span>
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-bg px-4 py-3 text-sm font-bold text-text-main transition-all hover:border-gold/40 hover:text-gold"
              >
                <Share2 size={16} />
                {getLocalizedText('Share App')}
              </button>
              <button
                onClick={onRateClick}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-bg px-4 py-3 text-sm font-bold text-text-main transition-all hover:border-gold/40 hover:text-gold"
              >
                <Star size={16} />
                {getLocalizedText('Rate Us 5 Stars')}
              </button>
            </div>
            <p className="text-xs text-text-muted">{getLocalizedText('Version')} {formatDigits(__APP_VERSION__, language)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreScreen;
