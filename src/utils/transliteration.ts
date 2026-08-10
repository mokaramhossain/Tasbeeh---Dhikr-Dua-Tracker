import { Language } from '../constants';
import { languageInfo } from '../locales';

/**
 * A transliteration is a pronunciation guide, so it only helps when it is
 * written in a script the reader actually uses.
 *
 * 71 of the 83 catalogue items store the same Latin transliteration under both
 * languages, so someone reading the Bangla interface gets "Subhaanallahi wa
 * bihamdih" — text they cannot sound out. Showing it is worse than showing
 * nothing: it occupies the line where a real pronunciation guide belongs and
 * implies one exists. Where a language's catalogue is incomplete, only the
 * entries actually written in its script are shown; the other 12 Bengali ones
 * still appear.
 *
 * Text the user typed themselves is always shown — they chose the script.
 */
export const readableTransliteration = (
  text: string,
  language: Language,
  isUserAuthored = false
): string => {
  if (!text || isUserAuthored) return text;
  const { hasTransliteration, script } = languageInfo(language);
  if (hasTransliteration) return text;
  return script.test(text) ? text : '';
};

/**
 * True when a transliteration exists but is being withheld for this language.
 *
 * Hiding it is right — Latin script is no help to someone reading Bangla — but
 * hiding it *silently* leaves a downloaded surah looking as though it simply
 * has no pronunciation, when what happened is that the only edition published
 * is in the wrong script. The reader says so instead.
 */
export const isTransliterationHidden = (
  text: string,
  language: Language,
  isUserAuthored = false
): boolean => Boolean(text) && !readableTransliteration(text, language, isUserAuthored);

/** Items the user created or edited, as opposed to the shipped catalogue. */
export const isUserAuthored = (id: string | undefined): boolean =>
  typeof id === 'string' && id.startsWith('manual_');
