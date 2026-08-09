/** Latin combining diacritics (U+0300–U+036F) plus Arabic harakat (U+064B–U+065F, U+0670). */
const DIACRITICS = /[\u0300-\u036f\u064b-\u065f\u0670]/g;
const PUNCTUATION = /['‘’ʼ`\-_.,!?()[\]{}:;"“”]/g;

/**
 * Normalises text for search.
 *
 * Decomposing to NFD and dropping combining marks makes Latin transliterations
 * accent-insensitive ("du'a" vs "dua", "Salawat" vs "Salāwāt") and strips
 * Arabic harakat, so typing unvowelled Arabic still matches fully vowelled
 * source text.
 */
export const normalizeForSearch = (value: string): string =>
  (value || '')
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(PUNCTUATION, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
