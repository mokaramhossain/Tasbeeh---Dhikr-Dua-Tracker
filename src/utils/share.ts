import { DhikrItem, LocalizedText } from '../constants';

type Translate = (text: LocalizedText | string | undefined) => string;

/**
 * Lays a dua out as plain text for sharing or pasting elsewhere: title, Arabic,
 * transliteration, meaning, then the citation. Blank sections are dropped so a
 * short dhikr does not arrive padded with empty lines.
 */
export const formatDuaAsText = (item: DhikrItem, t: Translate, appUrl?: string): string => {
  const citation = [item.source, item.ref].filter(Boolean).join(', ');
  return [
    t(item.title),
    item.arabic,
    t(item.trn),
    t(item.meaning),
    citation ? `— ${citation}` : '',
    appUrl ? `\n${appUrl}` : ''
  ]
    .map((part) => (part || '').trim())
    .filter(Boolean)
    .join('\n\n');
};

export type ShareResult = 'shared' | 'copied' | 'failed';

/**
 * Uses the native share sheet where available and falls back to the clipboard.
 * A share the user dismisses is reported as `shared` rather than `failed`, so
 * cancelling never shows an error.
 */
export const shareText = async (text: string, title?: string): Promise<ShareResult> => {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text });
      return 'shared';
    } catch (error) {
      // AbortError means the user closed the sheet on purpose.
      if (error instanceof Error && error.name === 'AbortError') return 'shared';
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
};
