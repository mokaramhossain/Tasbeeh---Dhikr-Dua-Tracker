import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCcw,
  Plus,
  X,
  Edit2,
  BookOpen,
  Loader2,
  Star,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DhikrItem, Language, LocalizedText, THEMES } from './constants';
import { ADHKAR_DATA, ADHKAR_ROUTINE } from './data/adhkar';
import { DUA_DATA } from './data/duas';
import { ALL_SURAHS } from './data/surahs';
import { CATEGORY_META as CATEGORY_LABELS, DUA_CATEGORIES } from './data/categories';
import { createTranslate } from './i18n';
import { LANGUAGE_CODES, DEFAULT_LANGUAGE, languageInfo } from './locales';
import { applyTheme, resolveThemeId } from './theme';
import { getLocalDateString, msUntilNextLocalMidnight, parseLocalDate } from './utils/date';
import { normalizeForSearch } from './utils/search';
import { formatDuaAsText, shareText } from './utils/share';
import { pruneDayCounts, readDayCounts, reconcileLifetime } from './utils/counts';
import {
  readJSON,
  writeJSON,
  readString,
  writeString,
  isPlainObject,
  isStringArray
} from './utils/storage';

const DHIKR_DATA: DhikrItem[] = [...ADHKAR_DATA, ...DUA_DATA];
const SUPPORT_EMAIL = 'app@qubeq.com';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.moizit.dhikrtracker';

// Components
import BottomNav from './components/BottomNav';
import FocusModeOverlay from './components/FocusModeOverlay';
import BackupModal from './components/BackupModal';
import UpdatePrompt from './components/UpdatePrompt';
import useBackNavigation from './hooks/useBackNavigation';

// Screens
import AdhkarScreen from './screens/AdhkarScreen';
import DuaScreen from './screens/DuaScreen';
import PersonalScreen from './screens/PersonalScreen';
import MoreScreen from './screens/MoreScreen';

// --- Types ---
type Counts = Record<string, number>;
type PersonalSection = { id: string; name: LocalizedText };

type ConfirmAction =
  | { type: 'reset-all' }
  | { type: 'reset-routine' }
  | { type: 'delete-item'; id: string }
  | { type: 'delete-section'; id: string };

type Overlay =
  | { kind: 'manual' }
  | { kind: 'surah' }
  | { kind: 'section' }
  | { kind: 'rating' }
  | { kind: 'backup' }
  | { kind: 'target'; itemId: string }
  | { kind: 'confirm'; title: string; message: string; action: ConfirmAction }
  | { kind: 'focus'; ids: string[]; index: number };

type ManualDraft = {
  title: string;
  arabic: string;
  trn: string;
  meaning: string;
  benefit: string;
  source: string;
  ref: string;
  target: number;
  sectionId: string;
};

const EMPTY_DRAFT: ManualDraft = {
  title: '',
  arabic: '',
  trn: '',
  meaning: '',
  benefit: '',
  source: '',
  ref: '',
  target: 0,
  sectionId: 'all'
};

const DEFAULT_SECTIONS: PersonalSection[] = [{ id: 'all', name: 'All Items' }];

/** Reads one language out of a stored value without falling back to the other. */
const localeField = (value: LocalizedText | undefined, lang: Language): string =>
  typeof value === 'string' ? value : value?.[lang] ?? '';

/**
 * Writes `next` into the active language while keeping whatever was stored for
 * the other one. Editing a bilingual item in English must not overwrite its
 * Bengali text with the English.
 */
const mergeLocalized = (existing: LocalizedText | undefined, next: string, lang: Language) => ({
  en: lang === 'en' ? next : localeField(existing, 'en') || next,
  bn: lang === 'bn' ? next : localeField(existing, 'bn') || next
});

/** Quick-pick counts offered in the Set Target dialog. Kept odd (witr). */
const TARGET_PRESETS = [3, 7, 11, 33, 101, 999];

export default function App() {
  const [activeTab, setActiveTab] = useState(0); // 0: Adhkar, 1: Du'a, 2: Personal, 3: More
  const [duaSearchQuery, setDuaSearchQuery] = useState('');
  const [duaSelectedCategory, setDuaSelectedCategory] = useState('All');
  const [personalSearchQuery, setPersonalSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState(() => getLocalDateString());

  const [counts, setCounts] = useState<Record<string, Counts>>(() => pruneDayCounts(readDayCounts()));
  // Kept separately from day counts, which are pruned to 400 days, so the
  // all-time total survives. Writing was paused in v1.0.2 but the key was never
  // deleted, so anyone who used an earlier build keeps their history.
  // Reconciled against the day buckets on load rather than trusted as-is:
  // lifetime writes were paused in v1.0.2, so the stored map is missing that
  // window for older users and absent entirely for anyone who installed then.
  const [lifetimeCounts, setLifetimeCounts] = useState<Counts>(() =>
    reconcileLifetime(
      readJSON<Counts>('dhikr-lifetime-counts-v1', {}, isPlainObject),
      pruneDayCounts(readDayCounts())
    )
  );
  const [customItems, setCustomItems] = useState<DhikrItem[]>(() =>
    readJSON<DhikrItem[]>('dhikr-custom-v1', [], Array.isArray)
  );
  const [personalSections, setPersonalSections] = useState<PersonalSection[]>(() => {
    const saved = readJSON<PersonalSection[]>('dhikr-personal-sections-v1', DEFAULT_SECTIONS, Array.isArray);
    // The "all" bucket must always exist or the Personal screen has no home
    // section to fall back to.
    return saved.some((section) => section.id === 'all') ? saved : [...DEFAULT_SECTIONS, ...saved];
  });
  const [favoritesMetadata, setFavoritesMetadata] = useState<Record<string, { sectionId?: string }>>(() =>
    readJSON('dhikr-favorites-metadata-v1', {}, isPlainObject)
  );
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => readJSON<string[]>('dhikr-pinned-v1', [], isStringArray));
  const [favorites, setFavorites] = useState<string[]>(() =>
    readJSON<string[]>('dhikr-favorites-v1', [], isStringArray)
  );
  const [customTargets, setCustomTargets] = useState<Counts>(() =>
    readJSON<Counts>('dhikr-targets-v1', {}, isPlainObject)
  );

  const [selectedPersonalSectionId, setSelectedPersonalSectionId] = useState('all');

  const [currentTheme, setCurrentTheme] = useState<string>(() =>
    readString(
      'dhikr-theme-v1',
      // Follow the phone rather than imposing a dark look on someone whose
      // device is in light mode. A stored choice still wins.
      'system',
      THEMES.map((t) => t.id)
    )
  );
  const [language, setLanguage] = useState<Language>(() =>
    readString<Language>('dhikr-language-v1', DEFAULT_LANGUAGE, LANGUAGE_CODES)
  );
  const [isHapticEnabled, setIsHapticEnabled] = useState<boolean>(() => readJSON('dhikr-haptic-v1', true));
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => readJSON('dhikr-sound-v1', false));
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => readJSON('dhikr-arabic-font-size-v1', 28));
  const [englishFontSize, setEnglishFontSize] = useState<number>(() => readJSON('dhikr-english-font-size-v1', 16));
  const [arabicLeading, setArabicLeading] = useState<number>(() => readJSON('dhikr-arabic-leading-v1', 2.1));
  const [showTransliteration, setShowTransliteration] = useState<boolean>(() =>
    readJSON('dhikr-show-transliteration-v1', true)
  );
  const [showTranslation, setShowTranslation] = useState<boolean>(() => readJSON('dhikr-show-translation-v1', true));
  // Most people return to the same handful of du'as; this saves hunting for
  // them again. Ids only, newest first, capped.
  const [recentIds, setRecentIds] = useState<string[]>(() => readJSON<string[]>('dhikr-recent-v1', [], isStringArray));
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  // --- Overlays -------------------------------------------------------------
  // Exactly one overlay can be open at a time, which keeps the back-button
  // history stack trivially balanced.
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [manualDraft, setManualDraft] = useState<ManualDraft>(EMPTY_DRAFT);
  const [targetDraft, setTargetDraft] = useState(0);
  const [surahSearchQuery, setSurahSearchQuery] = useState('');
  const [isFetchingSurah, setIsFetchingSurah] = useState(false);
  const [surahError, setSurahError] = useState<string | null>(null);
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState<{ en: string; bn: string }>({ en: '', bn: '' });
  const [ratingValue, setRatingValue] = useState(0);

  const t = useMemo(() => createTranslate(language), [language]);

  const closeOverlay = useCallback(() => setOverlay(null), []);

  const handleBack = useCallback(() => {
    if (overlay) {
      setOverlay(null);
      return;
    }
    setActiveTab(0);
  }, [overlay]);

  // The overlay and any non-default tab each own one history entry, so a single
  // Back press dismisses exactly one layer and the next one leaves the app.
  useBackNavigation({
    depth: (overlay ? 1 : 0) + (activeTab !== 0 ? 1 : 0),
    onBack: handleBack
  });

  // --- Persistence ----------------------------------------------------------
  useEffect(() => { writeJSON('dhikr-tracker-v2', counts); }, [counts]);
  useEffect(() => { writeJSON('dhikr-lifetime-counts-v1', lifetimeCounts); }, [lifetimeCounts]);
  useEffect(() => { writeJSON('dhikr-custom-v1', customItems); }, [customItems]);
  useEffect(() => { writeJSON('dhikr-personal-sections-v1', personalSections); }, [personalSections]);
  useEffect(() => { writeJSON('dhikr-favorites-v1', favorites); }, [favorites]);
  useEffect(() => { writeJSON('dhikr-favorites-metadata-v1', favoritesMetadata); }, [favoritesMetadata]);
  useEffect(() => { writeJSON('dhikr-pinned-v1', pinnedIds); }, [pinnedIds]);
  useEffect(() => { writeJSON('dhikr-targets-v1', customTargets); }, [customTargets]);
  useEffect(() => { writeJSON('dhikr-haptic-v1', isHapticEnabled); }, [isHapticEnabled]);
  useEffect(() => { writeJSON('dhikr-sound-v1', isSoundEnabled); }, [isSoundEnabled]);
  useEffect(() => { writeJSON('dhikr-arabic-font-size-v1', arabicFontSize); }, [arabicFontSize]);
  useEffect(() => { writeJSON('dhikr-english-font-size-v1', englishFontSize); }, [englishFontSize]);
  useEffect(() => { writeJSON('dhikr-arabic-leading-v1', arabicLeading); }, [arabicLeading]);
  useEffect(() => { writeJSON('dhikr-show-transliteration-v1', showTransliteration); }, [showTransliteration]);
  useEffect(() => { writeJSON('dhikr-show-translation-v1', showTranslation); }, [showTranslation]);
  useEffect(() => { writeJSON('dhikr-recent-v1', recentIds); }, [recentIds]);
  useEffect(() => { writeString('dhikr-language-v1', language); }, [language]);

  // The document's own language settings, taken from the registry: `lang` picks
  // the right glyph forms and hyphenation, `dir` flows the whole layout, and the
  // font stack falls back per language because Lora carries no Bengali. An RTL
  // language needs a registry entry and nothing here.
  useEffect(() => {
    const { code, dir, fontStack } = languageInfo(language);
    const root = document.documentElement;
    root.setAttribute('lang', code);
    root.setAttribute('dir', dir);
    root.style.setProperty('--font-ui', fontStack);
  }, [language]);

  // --- Day rollover ---------------------------------------------------------
  // `currentDate` used to be captured once at mount, so an app left open past
  // midnight (the normal case for an installed PWA) kept writing counts into
  // the previous day and reported the wrong "today".
  useEffect(() => {
    let timer: number;

    const scheduleRollover = () => {
      timer = window.setTimeout(() => {
        setCurrentDate(getLocalDateString());
        scheduleRollover();
      }, msUntilNextLocalMidnight());
    };

    const syncNow = () => {
      const today = getLocalDateString();
      setCurrentDate((prev) => (prev === today ? prev : today));
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') syncNow();
    };

    scheduleRollover();
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', syncNow);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', syncNow);
    };
  }, []);

  // --- Theme ----------------------------------------------------------------
  useEffect(() => {
    writeString('dhikr-theme-v1', currentTheme);
    applyTheme(currentTheme, { arabicFontSize, englishFontSize, arabicLeading });
  }, [currentTheme, arabicFontSize, englishFontSize, arabicLeading]);

  useEffect(() => {
    if (currentTheme !== 'system' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system', { arabicFontSize, englishFontSize, arabicLeading });
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [currentTheme, arabicFontSize, englishFontSize, arabicLeading]);

  // --- Scroll lock ----------------------------------------------------------
  useEffect(() => {
    document.body.style.overflow = overlay ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [overlay]);

  // --- Feedback (sound + haptics) -------------------------------------------
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = async () => {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const playClickSound = useCallback(async () => {
    if (!isSoundEnabled) return;
    try {
      const ctx = await getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.error('Audio play failed', e);
    }
  }, [isSoundEnabled]);

  const playSuccessSound = useCallback(async () => {
    if (!isSoundEnabled) return;
    try {
      const ctx = await getAudioContext();
      if (!ctx) return;
      const playNote = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      const now = ctx.currentTime;
      playNote(523.25, now, 0.15); // C5
      playNote(659.25, now + 0.15, 0.15); // E5
      playNote(783.99, now + 0.3, 0.3); // G5
    } catch (e) {
      console.error('Audio play failed', e);
    }
  }, [isSoundEnabled]);

  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (!isHapticEnabled) return;
      if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
      try {
        navigator.vibrate(pattern);
      } catch {
        /* ignore */
      }
    },
    [isHapticEnabled]
  );

  // --- Derived data ---------------------------------------------------------
  const allItems = useMemo(() => [...DHIKR_DATA, ...customItems], [customItems]);

  const itemsById = useMemo(() => {
    const map = new Map<string, DhikrItem>();
    allItems.forEach((item) => map.set(item.id, item));
    return map;
  }, [allItems]);

  const routineItems = useMemo(() => {
    const resolve = (ids: string[]) => ids.map((id) => itemsById.get(id)).filter(Boolean) as DhikrItem[];
    return {
      core: resolve(ADHKAR_ROUTINE.afterSalahCore),
      optional: resolve(ADHKAR_ROUTINE.afterSalahOptional),
      protection: resolve(ADHKAR_ROUTINE.protection)
    };
  }, [itemsById]);

  const routineIds = useMemo(
    () => [
      ...ADHKAR_ROUTINE.afterSalahCore,
      ...ADHKAR_ROUTINE.afterSalahOptional,
      ...ADHKAR_ROUTINE.protection
    ],
    []
  );

  const getLocalizedCategory = useCallback((cat: string) => CATEGORY_LABELS[cat]?.[language] || cat, [language]);

  // Only offer categories that actually contain duas — "Repentance" was listed
  // but had no items, so selecting it always produced an empty list.
  const categories = useMemo(() => {
    const used = new Set<string>();
    DUA_DATA.forEach((item) => (item.cat || []).forEach((cat) => used.add(cat)));
    return DUA_CATEGORIES.filter((cat) => used.has(cat));
  }, []);

  /** Search now covers transliteration, tags and the Arabic itself, not just title + meaning. */
  const buildHaystack = useCallback(
    (item: DhikrItem) =>
      normalizeForSearch(
        [
          t(item.title),
          t(item.meaning),
          t(item.trn),
          t(item.benefit),
          item.arabic,
          item.source ?? '',
          ...(item.tags || []),
          ...(item.cat || []).map(getLocalizedCategory)
        ].join(' ')
      ),
    [t, getLocalizedCategory]
  );

  const filteredDuaItems = useMemo(() => {
    const query = normalizeForSearch(duaSearchQuery);
    return DUA_DATA.filter((item) => {
      const matchesCategory = duaSelectedCategory === 'All' || item.cat?.includes(duaSelectedCategory);
      if (!matchesCategory) return false;
      return query === '' || buildHaystack(item).includes(query);
    });
  }, [duaSearchQuery, duaSelectedCategory, buildHaystack]);

  const filteredPersonalItems = useMemo(() => {
    const favoriteBase = DHIKR_DATA.filter((item) => favorites.includes(item.id));
    const byId = new Map<string, DhikrItem>();
    [...favoriteBase, ...customItems].forEach((item) => {
      const sectionId = item.sectionId || favoritesMetadata[item.id]?.sectionId || 'all';
      byId.set(item.id, { ...item, sectionId });
    });
    const query = normalizeForSearch(personalSearchQuery);
    return Array.from(byId.values()).filter((item) => {
      const matchesSection = selectedPersonalSectionId === 'all' || item.sectionId === selectedPersonalSectionId;
      if (!matchesSection) return false;
      return query === '' || buildHaystack(item).includes(query);
    });
  }, [personalSearchQuery, customItems, favorites, favoritesMetadata, selectedPersonalSectionId, buildHaystack]);

  /** Everything saved, before the collection filter — lets Personal tell
   *  "nothing saved at all" apart from "nothing in this collection". */
  const personalItemsBySection = useMemo(() => {
    const favoriteBase = DHIKR_DATA.filter((item) => favorites.includes(item.id));
    const byId = new Map<string, DhikrItem>();
    [...favoriteBase, ...customItems].forEach((item) => {
      const sectionId = item.sectionId || favoritesMetadata[item.id]?.sectionId || 'all';
      byId.set(item.id, { ...item, sectionId });
    });
    const counts: Record<string, number> = {};
    byId.forEach((item) => {
      const key = item.sectionId || 'all';
      counts[key] = (counts[key] || 0) + 1;
    });
    // Selecting "All Items" is a wildcard that shows every saved item, so its
    // chip has to count them all. Counting only the ones filed under `all` made
    // the chip read 0 while opening it listed the item.
    counts.all = byId.size;
    return { total: byId.size, counts };
  }, [favorites, customItems, favoritesMetadata]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    DUA_DATA.forEach((item) => (item.cat || []).forEach((cat) => { map[cat] = (map[cat] || 0) + 1; }));
    return map;
  }, []);

  const duaFavoriteItems = useMemo(
    () => DUA_DATA.filter((item) => favorites.includes(item.id)),
    [favorites]
  );

  const recentItems = useMemo(
    () => recentIds.map((id) => itemsById.get(id)).filter(Boolean) as DhikrItem[],
    [recentIds, itemsById]
  );

  const handleShare = useCallback(
    async (item: DhikrItem) => {
      const text = formatDuaAsText(item, t, PLAY_STORE_URL);
      const result = await shareText(text, t(item.title));
      if (result === 'copied') setShareStatus(t('Copied'));
      else if (result === 'failed') setShareStatus(t('Failed'));
      else setShareStatus(null);
      if (result !== 'shared') window.setTimeout(() => setShareStatus(null), 2000);
    },
    [t]
  );

  const currentCounts = counts[currentDate] || {};

  const getTarget = useCallback(
    (item: DhikrItem) => customTargets[item.id] ?? item.target,
    [customTargets]
  );

  // --- Actions --------------------------------------------------------------
  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        if (prev.includes(id)) {
          // Dropping the metadata too, so re-favouriting later starts fresh
          // rather than reviving a collection the user has since forgotten.
          setFavoritesMetadata((meta) => {
            if (!meta[id]) return meta;
            const next = { ...meta };
            delete next[id];
            return next;
          });
          return prev.filter((f) => f !== id);
        }
        // A favourite used to always land in "all", so with any other
        // collection selected the Personal tab filtered it straight back out
        // and reported nothing saved. It now joins the collection you are in,
        // the same way Add Personal Dua already behaves.
        setFavoritesMetadata((meta) => ({
          ...meta,
          [id]: { ...(meta[id] || {}), sectionId: selectedPersonalSectionId }
        }));
        return [...prev, id];
      });
    },
    [selectedPersonalSectionId]
  );

  const handleIncrement = useCallback(
    (id: string, target: number) => {
      const current = counts[currentDate]?.[id] || 0;
      const next = current + 1;
      // `next === target` missed the celebration whenever a target was lowered
      // below the running count; crossing the line in either direction counts.
      const justCompleted = target > 0 && current < target && next >= target;

      if (justCompleted) {
        playSuccessSound();
        vibrate([100, 50, 100, 50, 200]);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          // Resolved, not raw: with 'system' selected the raw id matches the
          // placeholder entry rather than the light or dark palette actually on
          // screen, so the confetti came out the wrong gold.
          colors: [THEMES.find((theme) => theme.id === resolveThemeId(currentTheme))?.gold || '#D4AF37', '#ffffff']
        });
      } else {
        playClickSound();
        vibrate(15);
      }

      setCounts((prev) => {
        const prevDayCounts = prev[currentDate] || {};
        return { ...prev, [currentDate]: { ...prevDayCounts, [id]: (prevDayCounts[id] || 0) + 1 } };
      });
      setLifetimeCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    },
    // The sound helpers close over isSoundEnabled, so they must take part in
    // this callback's identity. Leaving them out meant the first tap after
    // toggling Sound used the previous setting.
    [counts, currentDate, currentTheme, vibrate, playClickSound, playSuccessSound]
  );

  const handleResetItem = useCallback(
    (id: string) => {
      setCounts((prev) => {
        const dayCounts = { ...(prev[currentDate] || {}) };
        delete dayCounts[id];
        return { ...prev, [currentDate]: dayCounts };
      });
    },
    [currentDate]
  );

  const askConfirm = useCallback((title: string, message: string, action: ConfirmAction) => {
    setOverlay({ kind: 'confirm', title, message, action });
  }, []);

  const handleReset = useCallback(() => {
    askConfirm(
      t('Reset All Progress?'),
      t('This will clear all your counts for today. This action cannot be undone.'),
      { type: 'reset-all' }
    );
  }, [askConfirm, t]);

  const handleResetRoutine = useCallback(() => {
    askConfirm(t('Reset Routine?'), t('This will reset counts for all items in your current routine.'), {
      type: 'reset-routine'
    });
  }, [askConfirm, t]);

  const handleDeletePersonalItem = useCallback(
    (id: string) => {
      askConfirm(t('Delete Item?'), t('Are you sure you want to remove this item from your collection?'), {
        type: 'delete-item',
        id
      });
    },
    [askConfirm, t]
  );

  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      if (sectionId === 'all') return;
      askConfirm(
        t('Delete Collection?'),
        t('This will remove the collection. Items inside will be moved to "All Items".'),
        { type: 'delete-section', id: sectionId }
      );
    },
    [askConfirm, t]
  );

  const handleConfirm = useCallback(() => {
    if (!overlay || overlay.kind !== 'confirm') return;
    const { action } = overlay;

    if (action.type === 'reset-all') {
      setCounts((prev) => ({ ...prev, [currentDate]: {} }));
    } else if (action.type === 'reset-routine') {
      // Previously this cleared the whole day, wiping Du'a and Personal counts
      // that had nothing to do with the after-salah routine.
      setCounts((prev) => {
        const dayCounts = { ...(prev[currentDate] || {}) };
        routineIds.forEach((id) => delete dayCounts[id]);
        return { ...prev, [currentDate]: dayCounts };
      });
    } else if (action.type === 'delete-item') {
      setCustomItems((prev) => prev.filter((item) => item.id !== action.id));
      setFavorites((prev) => prev.filter((id) => id !== action.id));
      setPinnedIds((prev) => prev.filter((id) => id !== action.id));
    } else if (action.type === 'delete-section') {
      setPersonalSections((prev) => prev.filter((section) => section.id !== action.id));
      setCustomItems((prev) =>
        prev.map((item) => (item.sectionId === action.id ? { ...item, sectionId: 'all' } : item))
      );
      setFavoritesMetadata((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          if (next[id]?.sectionId === action.id) next[id] = { ...next[id], sectionId: 'all' };
        });
        return next;
      });
      setSelectedPersonalSectionId((prev) => (prev === action.id ? 'all' : prev));
    }

    closeOverlay();
  }, [overlay, currentDate, routineIds, closeOverlay]);

  const handleMoveToCollection = useCallback((itemId: string, sectionId: string) => {
    setCustomItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, sectionId } : item)));
    setFavoritesMetadata((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] || {}), sectionId } }));
  }, []);

  const handleSaveSection = useCallback(() => {
    const trimmed = { en: newSectionName.en.trim(), bn: newSectionName.bn.trim() };
    if (!trimmed.en && !trimmed.bn) return;

    if (isEditingSection && editingSectionId) {
      setPersonalSections((prev) =>
        prev.map((section) => (section.id === editingSectionId ? { ...section, name: trimmed } : section))
      );
    } else {
      setPersonalSections((prev) => [...prev, { id: `section_${Date.now()}`, name: trimmed }]);
    }

    setIsEditingSection(false);
    setEditingSectionId(null);
    setNewSectionName({ en: '', bn: '' });
    closeOverlay();
  }, [newSectionName, isEditingSection, editingSectionId, closeOverlay]);

  const openManualModal = useCallback(
    (item?: DhikrItem) => {
      if (item) {
        setEditingItemId(item.id);
        setManualDraft({
          title: localeField(item.title, language) || t(item.title),
          arabic: item.arabic,
          trn: localeField(item.trn, language),
          meaning: localeField(item.meaning, language),
          benefit: localeField(item.benefit, language),
          source: item.source || '',
          ref: item.ref || '',
          target: item.target,
          sectionId: item.sectionId || 'all'
        });
      } else {
        setEditingItemId(null);
        setManualDraft({
          ...EMPTY_DRAFT,
          target: 33,
          sectionId: selectedPersonalSectionId
        });
      }
      setOverlay({ kind: 'manual' });
    },
    [t, language, selectedPersonalSectionId]
  );

  const handleManualSave = useCallback(() => {
    const title = manualDraft.title.trim();
    if (!title) return;

    const existing = editingItemId ? customItems.find((item) => item.id === editingItemId) : undefined;

    // The form has one field per value, so writing it to both languages would
    // wipe the other translation — a downloaded surah stores an English name
    // and an Arabic one. Only the language being edited is replaced.
    const newItem: DhikrItem = {
      ...existing,
      step: existing?.step ?? 4,
      id: editingItemId || `manual_${Date.now()}`,
      title: mergeLocalized(existing?.title, title, language),
      arabic: manualDraft.arabic.trim(),
      trn: mergeLocalized(existing?.trn, manualDraft.trn, language),
      meaning: mergeLocalized(existing?.meaning, manualDraft.meaning, language),
      benefit: manualDraft.benefit
        ? mergeLocalized(existing?.benefit, manualDraft.benefit, language)
        : 'Personal collection',
      source: manualDraft.source.trim(),
      ref: manualDraft.ref.trim(),
      target: Math.max(0, manualDraft.target || 0),
      badge: existing?.badge ?? 'Custom',
      sectionId: manualDraft.sectionId || selectedPersonalSectionId
    };

    setCustomItems((prev) =>
      existing ? prev.map((item) => (item.id === existing.id ? newItem : item)) : [newItem, ...prev]
    );

    setEditingItemId(null);
    setManualDraft(EMPTY_DRAFT);
    closeOverlay();
  }, [manualDraft, editingItemId, customItems, language, selectedPersonalSectionId, closeOverlay]);

  const handleSaveTarget = useCallback(() => {
    if (overlay?.kind !== 'target') return;
    const itemId = overlay.itemId;
    setCustomTargets((prev) => ({ ...prev, [itemId]: Math.max(0, targetDraft || 0) }));
    closeOverlay();
  }, [overlay, targetDraft, closeOverlay]);

  const handleAddSurah = useCallback(
    async (surahId: string) => {
      setIsFetchingSurah(true);
      setSurahError(null);
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/quran-simple`);
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const data = await res.json();
        if (data?.code !== 200 || !data?.data?.ayahs) throw new Error('Unexpected response');

        const surah = data.data;
        // Ayah end markers so a long surah reads as verses rather than one
        // unbroken block of text.
        const fullArabic = surah.ayahs
          .map((ayah: { text: string; numberInSurah: number }) => `${ayah.text} ۝${ayah.numberInSurah}`)
          .join(' ');

        const newItem: DhikrItem = {
          step: 4,
          id: `surah_${surahId}_${Date.now()}`,
          title: { en: surah.englishName, bn: surah.name },
          arabic: fullArabic,
          // No transliteration: the API gives the name's meaning, not a
          // pronunciation guide, and putting it under the transliteration
          // label said the wrong thing about it.
          meaning: {
            en: `Surah ${surah.englishName} — ${surah.englishNameTranslation}`,
            bn: `সূরা ${surah.englishName} — ${surah.englishNameTranslation}`
          },
          source: 'Quran',
          ref: `${surah.number}`,
          target: 1,
          badge: 'Surah',
          sectionId: selectedPersonalSectionId
        };
        setCustomItems((prev) => [newItem, ...prev]);
        setSurahSearchQuery('');
        closeOverlay();
      } catch (err) {
        // Previously the modal just closed and nothing appeared, which looked
        // identical to the app ignoring the tap.
        console.error('Failed to fetch surah', err);
        setSurahError(
          t('Could not download that surah. Check your connection and try again.')
        );
      } finally {
        setIsFetchingSurah(false);
      }
    },
    [selectedPersonalSectionId, closeOverlay, t]
  );

  const rememberRead = useCallback((id: string) => {
    setRecentIds((prev) => [id, ...prev.filter((entry) => entry !== id)].slice(0, 12));
  }, []);

  const openFocus = useCallback((item: DhikrItem, list: DhikrItem[]) => {
    rememberRead(item.id);
    const ids = list.length > 0 ? list.map((entry) => entry.id) : [item.id];
    const index = Math.max(0, ids.indexOf(item.id));
    setOverlay({ kind: 'focus', ids, index });
  }, [rememberRead]);

  const moveFocus = useCallback((delta: number) => {
    setOverlay((prev) => {
      if (prev?.kind !== 'focus') return prev;
      const next = prev.index + delta;
      if (next < 0 || next >= prev.ids.length) return prev;
      return { ...prev, index: next };
    });
  }, []);

  const openTargetModal = useCallback(
    (item: DhikrItem) => {
      setTargetDraft(getTarget(item));
      setOverlay({ kind: 'target', itemId: item.id });
    },
    [getTarget]
  );

  const focusItem = overlay?.kind === 'focus' ? itemsById.get(overlay.ids[overlay.index]) ?? null : null;

  const ownedIds = useMemo(() => new Set(customItems.map((item) => item.id)), [customItems]);

  const headerDate = useMemo(() => {
    const parsed = parseLocalDate(currentDate);
    if (Number.isNaN(parsed.getTime())) return '';
    // `new Date("YYYY-MM-DD")` parses as UTC, which showed the previous day for
    // anyone west of Greenwich.
    return parsed.toLocaleDateString(languageInfo(language).code, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }, [currentDate, language]);

  const overlayShell = 'fixed inset-0 overflow-y-auto bg-bg/90 backdrop-blur-sm';
  const inputClass =
    'w-full bg-bg border border-border rounded-xl p-3 text-sm text-text-main outline-none focus:border-gold';
  const labelClass = 'block text-[10px] font-bold text-text-sub uppercase mb-1';

  return (
    <div className="min-h-screen bg-bg text-text-main font-serif pb-24 transition-colors duration-500">
      {/* Header */}
      <header className="relative bg-card border-b border-border px-4 py-6 shadow-sm">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-transparent flex items-center justify-center">
                  {/* Vite rewrites root-relative asset URLs in index.html but
                      not inside JSX, so this must carry the base itself or it
                      404s when served from a sub-path (GitHub Pages). */}
                  <img
                    src={`${import.meta.env.BASE_URL}icon.svg`}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-contain"
                  />
                </div>
                {t('Dhikr Tracker')}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-text-sub font-bold uppercase tracking-widest opacity-90">
                  {t('Assalamu Alaikum')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-center min-w-[100px] mr-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('Today')}</span>
              <span className="text-xs font-bold text-gold-ink">{headerDate}</span>
            </div>
            {/* Was white-on-translucent-black, which disappeared in the Light theme. */}
            <button
              onClick={handleReset}
              className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-bg px-4 text-text-sub transition-colors hover:border-gold/50 hover:text-gold-ink"
              title={t('Reset All')}
            >
              <RotateCcw size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">{t('Reset All')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-3 sm:px-4 pt-6 max-w-3xl mx-auto pb-28">
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <AdhkarScreen
              routineItems={routineItems}
              onResetRoutine={handleResetRoutine}
              counts={currentCounts}
              onCountChange={handleIncrement}
              onResetItem={handleResetItem}
              customTargets={customTargets}
              onSetTarget={openTargetModal}
              getLocalizedText={t}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              language={language}
              onFocus={openFocus}
              pinnedIds={pinnedIds}
              onTogglePin={togglePin}
              allDhikrItems={allItems}
              sections={personalSections}
              onMoveToCollection={handleMoveToCollection}
              onBrowseDuas={() => setActiveTab(1)}
              showTransliteration={showTransliteration}
              showTranslation={showTranslation}
            />
          )}

          {activeTab === 1 && (
            <DuaScreen
              getLocalizedText={t}
              searchQuery={duaSearchQuery}
              onSearchChange={setDuaSearchQuery}
              selectedCategory={duaSelectedCategory}
              onCategorySelect={setDuaSelectedCategory}
              categories={categories}
              categoryCounts={categoryCounts}
              filteredItems={filteredDuaItems}
              totalCount={DUA_DATA.length}
              favoriteItems={duaFavoriteItems}
              recentItems={recentItems}
              isFavorite={(id) => favorites.includes(id)}
              isPinned={(id) => pinnedIds.includes(id)}
              onOpen={openFocus}
            />
          )}

          {activeTab === 2 && (
            <PersonalScreen
              getLocalizedText={t}
              counts={currentCounts}
              onCountChange={handleIncrement}
              onResetItem={handleResetItem}
              customTargets={customTargets}
              onSetTarget={openTargetModal}
              searchQuery={personalSearchQuery}
              onSearchChange={setPersonalSearchQuery}
              filteredItems={filteredPersonalItems}
              savedTotal={personalItemsBySection.total}
              sectionCounts={personalItemsBySection.counts}
              ownedIds={ownedIds}
              onEditItem={openManualModal}
              onDeleteItem={handleDeletePersonalItem}
              onManualAdd={() => openManualModal()}
              onAddSurah={() => {
                setSurahError(null);
                setSurahSearchQuery('');
                setOverlay({ kind: 'surah' });
              }}
              isFavorite={(id) => favorites.includes(id)}
              onFavorite={toggleFavorite}
              onFocus={openFocus}
              language={language}
              isPinned={(id) => pinnedIds.includes(id)}
              onTogglePin={togglePin}
              sections={personalSections}
              selectedSectionId={selectedPersonalSectionId}
              onSelectSection={setSelectedPersonalSectionId}
              onAddSection={() => {
                setIsEditingSection(false);
                setEditingSectionId(null);
                setNewSectionName({ en: '', bn: '' });
                setOverlay({ kind: 'section' });
              }}
              onEditSection={(section) => {
                setIsEditingSection(true);
                setEditingSectionId(section.id);
                // t() returns only the active language; using it for both
                // fields overwrote the other translation on save.
                setNewSectionName({
                  en: localeField(section.name, 'en'),
                  bn: localeField(section.name, 'bn')
                });
                setOverlay({ kind: 'section' });
              }}
              onDeleteSection={handleDeleteSection}
              onMoveToCollection={handleMoveToCollection}
              showTransliteration={showTransliteration}
              showTranslation={showTranslation}
            />
          )}

          {activeTab === 3 && (
            <MoreScreen
              getLocalizedText={t}
              theme={currentTheme}
              onThemeChange={setCurrentTheme}
              language={language}
              onLanguageChange={setLanguage}
              isSoundOn={isSoundEnabled}
              setIsSoundOn={setIsSoundEnabled}
              isHapticOn={isHapticEnabled}
              setIsHapticOn={setIsHapticEnabled}
              supportEmail={SUPPORT_EMAIL}
              storeUrl={PLAY_STORE_URL}
              arabicFontSize={arabicFontSize}
              setArabicFontSize={setArabicFontSize}
              englishFontSize={englishFontSize}
              setEnglishFontSize={setEnglishFontSize}
              arabicLeading={arabicLeading}
              setArabicLeading={setArabicLeading}
              showTransliteration={showTransliteration}
              setShowTransliteration={setShowTransliteration}
              showTranslation={showTranslation}
              setShowTranslation={setShowTranslation}
              onRateClick={() => setOverlay({ kind: 'rating' })}
              onBackupClick={() => setOverlay({ kind: 'backup' })}
              currentDate={currentDate}
              dayCounts={counts}
              lifetimeCounts={lifetimeCounts}
              itemsById={itemsById}
            />
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {overlay?.kind === 'manual' && (
          <motion.div
            key="manual-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${overlayShell} z-[100]`}
            role="dialog"
            aria-modal="true"
          >
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-card border border-border w-full max-w-md rounded-3xl overflow-hidden shadow-2xl my-8"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gold-ink flex items-center gap-2">
                      {editingItemId ? <Edit2 size={20} /> : <Plus size={20} />}
                      {editingItemId ? t('Edit Dhikr') : t('Add Custom Dhikr')}
                    </h2>
                    <button
                      onClick={closeOverlay}
                      className="text-text-muted hover:text-text-main"
                      aria-label={t('Close')}
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={labelClass} htmlFor="manual-title">{t('Title *')}</label>
                      <input
                        id="manual-title"
                        type="text"
                        value={manualDraft.title}
                        onChange={(e) => setManualDraft((prev) => ({ ...prev, title: e.target.value }))}
                        className={inputClass}
                        placeholder={t('e.g., Morning Dua')}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="manual-arabic">{t('Arabic Text')}</label>
                      <textarea
                        id="manual-arabic"
                        value={manualDraft.arabic}
                        onChange={(e) => setManualDraft((prev) => ({ ...prev, arabic: e.target.value }))}
                        lang="ar"
                        dir="rtl"
                        className={`${inputClass} text-lg min-h-[80px] arabic-text`}
                        placeholder={t('Arabic text here...')}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="manual-trn">{t('Transliteration')}</label>
                      <input
                        id="manual-trn"
                        type="text"
                        value={manualDraft.trn}
                        onChange={(e) => setManualDraft((prev) => ({ ...prev, trn: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="manual-meaning">{t('Meaning')}</label>
                      <textarea
                        id="manual-meaning"
                        value={manualDraft.meaning}
                        onChange={(e) => setManualDraft((prev) => ({ ...prev, meaning: e.target.value }))}
                        className={`${inputClass} min-h-[60px]`}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="manual-source">{t('Hadith Book / Source')}</label>
                      <input
                        id="manual-source"
                        type="text"
                        value={manualDraft.source}
                        onChange={(e) => setManualDraft((prev) => ({ ...prev, source: e.target.value }))}
                        className={inputClass}
                        placeholder={t('e.g., Sahih Bukhari')}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="manual-ref">{t('Reference')}</label>
                      <input
                        id="manual-ref"
                        type="text"
                        value={manualDraft.ref}
                        onChange={(e) => setManualDraft((prev) => ({ ...prev, ref: e.target.value }))}
                        className={inputClass}
                        placeholder={t('e.g., 6407')}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="manual-target">{t('Default Target (0 for infinite)')}</label>
                      <input
                        id="manual-target"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={manualDraft.target}
                        onChange={(e) =>
                          setManualDraft((prev) => ({ ...prev, target: Math.max(0, parseInt(e.target.value, 10) || 0) }))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="manual-section">{t('Collection')}</label>
                      <select
                        id="manual-section"
                        value={manualDraft.sectionId}
                        onChange={(e) => setManualDraft((prev) => ({ ...prev, sectionId: e.target.value }))}
                        className={`${inputClass} appearance-none`}
                      >
                        {personalSections.map((section) => (
                          <option key={section.id} value={section.id}>
                            {t(section.name)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleManualSave}
                      disabled={!manualDraft.title.trim()}
                      className="w-full py-4 bg-gold text-on-gold font-bold rounded-2xl shadow-lg hover:bg-gold/90 transition-colors disabled:opacity-50 mt-4"
                    >
                      {editingItemId ? t('Update Dhikr') : t('Add to Collection')}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {overlay?.kind === 'confirm' && (
          <motion.div
            key="confirm-dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${overlayShell} z-[110]`}
            role="alertdialog"
            aria-modal="true"
          >
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-card border border-border w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 my-8"
              >
                <h3 className="text-xl font-bold text-gold-ink mb-2">{overlay.title}</h3>
                <p className="text-sm text-text-sub mb-6">{overlay.message}</p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeOverlay}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-text-muted hover:text-text-main transition-colors"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    {t('Confirm')}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Target Modal */}
      <AnimatePresence>
        {overlay?.kind === 'target' && (
          <motion.div
            key="target-dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${overlayShell} z-[110]`}
            role="dialog"
            aria-modal="true"
          >
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-card border border-border w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 my-8"
              >
                <h3 className="text-xl font-bold text-gold-ink mb-2">{t('Set Target')}</h3>
                <p className="text-sm text-text-sub mb-4">
                  {t('Enter a new target count (0 for infinite tracking):')}
                </p>

                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  autoFocus
                  value={targetDraft}
                  onChange={(e) => setTargetDraft(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className={`${inputClass} mb-4`}
                />

                {/* Suggestions stay odd (witr). The previous set mixed in 10,
                    34 and 100, which nudged people away from that. */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {TARGET_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setTargetDraft(preset)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                        targetDraft === preset
                          ? 'border-gold bg-gold/10 text-gold-ink'
                          : 'border-border bg-bg text-text-sub hover:border-gold/40'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeOverlay}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-text-muted hover:text-text-main transition-colors"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    onClick={handleSaveTarget}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-gold text-on-gold hover:bg-gold/90 transition-colors"
                  >
                    {t('Save')}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Surah Selection Modal */}
      <AnimatePresence>
        {overlay?.kind === 'surah' && (
          <motion.div
            key="surah-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${overlayShell} z-[100]`}
            role="dialog"
            aria-modal="true"
          >
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-card border border-border w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gold-ink flex items-center gap-2">
                      <BookOpen size={20} />
                      {t('Add Surah')}
                    </h2>
                    <button
                      onClick={closeOverlay}
                      className="text-text-muted hover:text-text-main"
                      aria-label={t('Close')}
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {surahError && (
                    <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold leading-relaxed text-red-400">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                      <span>{surahError}</span>
                    </div>
                  )}

                  <div className="mb-4">
                    <input
                      type="text"
                      value={surahSearchQuery}
                      onChange={(e) => setSurahSearchQuery(e.target.value)}
                      placeholder={t('Search Surah...')}
                      className={inputClass}
                    />
                  </div>

                  <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {isFetchingSurah ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="w-8 h-8 text-gold-ink animate-spin" />
                        <p className="text-sm text-text-muted font-bold uppercase tracking-widest">
                          {t('Fetching Surah...')}
                        </p>
                      </div>
                    ) : (
                      ALL_SURAHS.filter(
                        (s) =>
                          s.en.toLowerCase().includes(surahSearchQuery.toLowerCase()) ||
                          s.bn.includes(surahSearchQuery)
                      ).map((surah) => (
                        <button
                          key={surah.id}
                          onClick={() => handleAddSurah(surah.id.toString())}
                          className="w-full p-4 bg-bg border border-border rounded-2xl flex items-center justify-between hover:border-gold/50 transition-all group"
                        >
                          <div className="text-start">
                            <p className="text-sm font-bold text-text-main group-hover:text-gold-ink transition-colors">
                              {surah.en}
                            </p>
                            <p className="text-xs text-text-muted">{surah.bn}</p>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold-ink text-xs font-bold">
                            {surah.id}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Modal */}
      <AnimatePresence>
        {overlay?.kind === 'section' && (
          <motion.div
            key="section-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${overlayShell} z-[110]`}
            role="dialog"
            aria-modal="true"
          >
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-card border border-border w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 my-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gold-ink">
                    {isEditingSection
                      ? t('Edit Collection')
                      : t('New Collection')}
                  </h3>
                  <button
                    onClick={closeOverlay}
                    className="text-text-muted hover:text-text-main"
                    aria-label={t('Close')}
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass} htmlFor="section-en">
                      {t('English Name')}
                    </label>
                    <input
                      id="section-en"
                      type="text"
                      value={newSectionName.en}
                      onChange={(e) => setNewSectionName((prev) => ({ ...prev, en: e.target.value }))}
                      className={inputClass}
                      placeholder="e.g., Morning Adhkar"
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="section-bn">
                      {t('Bengali Name')}
                    </label>
                    <input
                      id="section-bn"
                      type="text"
                      value={newSectionName.bn}
                      onChange={(e) => setNewSectionName((prev) => ({ ...prev, bn: e.target.value }))}
                      className={inputClass}
                      placeholder="যেমন: সকালের জিকির"
                    />
                  </div>

                  <button
                    onClick={handleSaveSection}
                    disabled={!newSectionName.en.trim() && !newSectionName.bn.trim()}
                    className="w-full py-4 bg-gold text-on-gold font-bold rounded-2xl shadow-lg hover:bg-gold/90 transition-colors disabled:opacity-50 mt-4"
                  >
                    {isEditingSection ? t('Update') : t('Create')}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backup & Restore */}
      <AnimatePresence>
        {overlay?.kind === 'backup' && (
          <BackupModal getLocalizedText={t} onClose={closeOverlay} overlayClassName={`${overlayShell} z-[110]`} />
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {overlay?.kind === 'rating' && (
          <motion.div
            key="rating-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] overflow-y-auto bg-bg/95 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
          >
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-card border border-border w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl p-8 text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-gold/10 flex items-center justify-center text-gold-ink">
                    <Star size={40} fill={ratingValue > 0 ? 'currentColor' : 'none'} />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-text-main mb-2">
                  {t('Enjoying Dhikr Tracker?')}
                </h3>
                <p className="text-sm text-text-sub mb-8 leading-relaxed">
                  {t('Your feedback helps us grow and reach more people. How would you rate your experience?')}
                </p>

                <div className="flex justify-center gap-2 mb-10">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => {
                        setRatingValue(star);
                        vibrate(10);
                      }}
                      className="p-1 transition-transform active:scale-90"
                      aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
                      aria-pressed={star <= ratingValue}
                    >
                      <Star
                        size={36}
                        className={star <= ratingValue ? 'text-gold-ink' : 'text-border'}
                        fill={star <= ratingValue ? 'currentColor' : 'none'}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {ratingValue > 0 ? (
                    <button
                      onClick={() => {
                        if (ratingValue < 4) {
                          window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                            `Dhikr Tracker Feedback (${ratingValue} stars)`
                          )}`;
                        } else {
                          window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
                        }
                        setRatingValue(0);
                        closeOverlay();
                      }}
                      className="w-full py-4 bg-gold text-on-gold font-bold rounded-2xl shadow-lg hover:bg-gold/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {ratingValue >= 4 && <Star size={18} fill="currentColor" />}
                      {ratingValue < 4
                        ? t('Send Feedback')
                        : t('Rate on Play Store')}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-4 bg-border text-text-muted font-bold rounded-2xl opacity-50 cursor-not-allowed"
                    >
                      {t('Select Stars')}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setRatingValue(0);
                      closeOverlay();
                    }}
                    className="w-full py-3 text-sm font-bold text-text-muted hover:text-text-main transition-colors"
                  >
                    {t('Maybe Later')}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} getLocalizedText={t} />

      <UpdatePrompt getLocalizedText={t} />

      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {overlay?.kind === 'focus' && focusItem && (
          <FocusModeOverlay
            item={focusItem}
            count={currentCounts[focusItem.id] || 0}
            target={getTarget(focusItem)}
            onIncrement={() => handleIncrement(focusItem.id, getTarget(focusItem))}
            onReset={() => handleResetItem(focusItem.id)}
            onClose={closeOverlay}
            onPrev={() => moveFocus(-1)}
            onNext={() => moveFocus(1)}
            hasPrev={overlay.index > 0}
            hasNext={overlay.index < overlay.ids.length - 1}
            position={{ current: overlay.index + 1, total: overlay.ids.length }}
            getLocalizedText={t}
            language={language}
            showTransliteration={showTransliteration}
            showTranslation={showTranslation}
            isFavorite={favorites.includes(focusItem.id)}
            onToggleFavorite={() => toggleFavorite(focusItem.id)}
            isPinned={pinnedIds.includes(focusItem.id)}
            onTogglePin={() => togglePin(focusItem.id)}
            onShare={() => void handleShare(focusItem)}
            shareStatus={shareStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
