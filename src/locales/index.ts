import bn from './bn';

export interface LanguageInfo {
  /** BCP-47 tag. Used for the `lang` attribute and Intl formatting. */
  code: string;
  /** Written in the language's own script — a picker in English is no help. */
  nativeLabel: string;
  /** For English-language contexts: the README, the coverage report. */
  englishLabel: string;
  dir: 'ltr' | 'rtl';
  /** Digits 0–9 in the language's own numerals, or null for Western digits. */
  digits: readonly string[] | null;
  /**
   * Body font stack. The Arabic face is chosen per block rather than per
   * language, because Arabic appears whatever the interface language is.
   */
  fontStack: string;
  /**
   * The script this language is written in. Used to tell a real translation
   * apart from English text stored under the language's key.
   * Kept in step with the copy in scripts/i18n-report.mjs, which cannot import
   * TypeScript.
   */
  script: RegExp;
  /**
   * Whether the shipped catalogue carries a pronunciation guide written in this
   * language's script. False hides the transliteration block (Latin text is no
   * help to someone reading Bangla) and explains the reading toggle rather than
   * leaving it looking broken. `npm run i18n:report` is what this tracks.
   */
  hasTransliteration: boolean;
  /**
   * Whether Latin-style letter-spacing suits this script. Tracking gives a
   * small-caps label its air in Latin; in a connected script it pulls the
   * conjuncts apart, so "গণনা" renders as "গ ণ না". False zeroes the tracking
   * utilities for the whole document.
   */
  tracking: boolean;
  /** UI strings keyed by their English text; empty for English itself. */
  strings: Record<string, string>;
}

const LATIN = "'Lora', serif";

/**
 * Every language the app ships. Adding one means adding an entry here and a
 * strings file next to bn.ts — the `Language` type, the settings picker, the
 * document direction and the coverage report all read from this object.
 */
export const LANGUAGES = {
  en: {
    code: 'en-US',
    nativeLabel: 'English',
    englishLabel: 'English',
    dir: 'ltr',
    digits: null,
    fontStack: LATIN,
    script: /[A-Za-z]/,
    hasTransliteration: true,
    tracking: true,
    // Keys are the English text, so English needs no table.
    strings: {}
  },
  bn: {
    code: 'bn-BD',
    nativeLabel: 'বাংলা',
    englishLabel: 'Bangla',
    dir: 'ltr',
    digits: ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'],
    // Lora has no Bengali glyphs, so Bengali falls through to Noto Sans Bengali
    // where it is installed and the platform default otherwise.
    fontStack: `'Noto Sans Bengali', 'Hind Siliguri', ${LATIN}`,
    script: /[ঀ-৿]/,
    // All but one catalogue item now carries a reviewed Bengali-script
    // pronunciation. This stays false so the last one falls back to showing
    // nothing rather than to Latin text a Bangla reader cannot sound out; flip
    // it once occ_003 is settled.
    hasTransliteration: false,
    tracking: false,
    strings: bn
  }
} as const satisfies Record<string, LanguageInfo>;

export type Language = keyof typeof LANGUAGES;

export const LANGUAGE_CODES = Object.keys(LANGUAGES) as Language[];

export const DEFAULT_LANGUAGE: Language = 'en';

export const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(LANGUAGES, value);

export const languageInfo = (language: Language): LanguageInfo => LANGUAGES[language];
