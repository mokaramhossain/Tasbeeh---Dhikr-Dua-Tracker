import { LocalizedText } from './constants';
import { DEFAULT_LANGUAGE, Language, languageInfo } from './locales';

export type Translate = (text: LocalizedText | string | undefined) => string;

const isLocalizedObject = (value: unknown): value is Partial<Record<Language, string>> =>
  typeof value === 'object' && value !== null;

/**
 * Resolves either kind of translatable value.
 *
 * A bare string is a UI key: it is looked up in the language's strings table
 * and falls back to itself, so a missing translation shows readable English
 * rather than a placeholder. An object is per-item content and falls back to
 * English, then to whatever translation exists, so a partially translated
 * du'a still renders.
 */
export const createTranslate = (language: Language): Translate => {
  const { strings } = languageInfo(language);

  return (text) => {
    if (text === null || text === undefined) return '';

    if (typeof text === 'string') return strings[text] ?? text;

    if (isLocalizedObject(text)) {
      const own = text[language];
      if (own) return own;
      const fallback = text[DEFAULT_LANGUAGE];
      if (fallback) return fallback;
      return Object.values(text).find(Boolean) ?? '';
    }

    return String(text);
  };
};

/**
 * Rewrites the digits in a string into the language's own numerals, leaving
 * everything else alone — so a version reads ১.১.০ without the dots moving.
 */
export const formatDigits = (value: string, language: Language): string => {
  const { digits } = languageInfo(language);
  if (!digits) return value;
  return value.replace(/\d/g, (digit) => digits[Number(digit)]);
};

/**
 * Counts and targets in the language's own numerals, so a Bangla screen does
 * not mix ৩৩ with 33.
 */
export const formatNumber = (value: number, language: Language): string =>
  formatDigits(String(value), language);
