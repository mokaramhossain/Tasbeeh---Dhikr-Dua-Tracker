/**
 * Downloading a surah with its translation and transliteration.
 *
 * Every request uses `/v1/surah/{id}/{edition}` — the shape already proven in
 * production. A single multi-edition request would be tidier, but it is not the
 * call this app has ever made and there is no way to verify it without the
 * network, so the known-good endpoint is used several times instead.
 *
 * Only the Arabic is required. A translation or transliteration that fails —
 * wrong edition id, edition withdrawn, partial outage — is dropped and the
 * surah still downloads. Adding text must never be able to break the thing that
 * already worked.
 */

/** Edition identifiers, in one place so a wrong one is a one-line correction. */
export const QURAN_EDITIONS = {
  arabic: 'quran-simple',
  transliteration: 'en.transliteration',
  translation: { en: 'en.sahih', bn: 'bn.bengali' } as Record<string, string>
};

export interface SurahAyah {
  text: string;
  numberInSurah: number;
}

export interface SurahDownload {
  number: number;
  englishName: string;
  englishNameTranslation: string;
  name: string;
  arabic: string;
  transliteration: string;
  translations: Record<string, string>;
  /** Editions that were asked for and did not arrive. */
  missing: string[];
}

const BASE = 'https://api.alquran.cloud/v1/surah';

/**
 * Verse numbering, so the three blocks line up ayah for ayah when read
 * together.
 *
 * The Arabic gets the proper end-of-ayah mark, which Scheherazade draws. The
 * Latin and Bengali blocks get a leading number instead: Lora has no glyph for
 * U+06DD, so the marker rendered there as an empty box.
 */
const withMarkers = (ayahs: SurahAyah[], script: 'arabic' | 'latin'): string =>
  script === 'arabic'
    ? ayahs.map((ayah) => `${ayah.text} ۝${ayah.numberInSurah}`).join(' ')
    : ayahs.map((ayah) => `${ayah.numberInSurah}. ${ayah.text}`).join('\n');

const fetchEdition = async (surahId: string, edition: string) => {
  const res = await fetch(`${BASE}/${surahId}/${edition}`);
  if (!res.ok) throw new Error(`${edition} failed with status ${res.status}`);
  const data = await res.json();
  if (data?.code !== 200 || !Array.isArray(data?.data?.ayahs)) {
    throw new Error(`${edition} returned an unexpected shape`);
  }
  return data.data as {
    number: number;
    englishName: string;
    englishNameTranslation: string;
    name: string;
    ayahs: SurahAyah[];
  };
};

/** Resolves only if the Arabic arrives; anything else is best effort. */
export const downloadSurah = async (surahId: string, languages: string[]): Promise<SurahDownload> => {
  const wanted = [...new Set(languages)]
    .map((lang) => ({ lang, edition: QURAN_EDITIONS.translation[lang] }))
    .filter((entry): entry is { lang: string; edition: string } => Boolean(entry.edition));

  const [arabic, transliteration, ...translations] = await Promise.all([
    fetchEdition(surahId, QURAN_EDITIONS.arabic),
    fetchEdition(surahId, QURAN_EDITIONS.transliteration).catch(() => null),
    ...wanted.map((entry) => fetchEdition(surahId, entry.edition).catch(() => null))
  ]);

  const missing: string[] = [];
  if (!transliteration) missing.push(QURAN_EDITIONS.transliteration);

  const byLanguage: Record<string, string> = {};
  translations.forEach((result, index) => {
    const entry = wanted[index];
    if (result) byLanguage[entry.lang] = withMarkers(result.ayahs, 'latin');
    else missing.push(entry.edition);
  });

  return {
    number: arabic.number,
    englishName: arabic.englishName,
    englishNameTranslation: arabic.englishNameTranslation,
    name: arabic.name,
    arabic: withMarkers(arabic.ayahs, 'arabic'),
    transliteration: transliteration ? withMarkers(transliteration.ayahs, 'latin') : '',
    translations: byLanguage,
    missing
  };
};
