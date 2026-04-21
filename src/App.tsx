import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  Plus,
  Trash2,
  X,
  Volume2,
  VolumeX,
  Edit2,
  Smartphone,
  BookOpen,
  Search,
  Loader2,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DhikrItem, LocalizedText, THEMES } from './constants';
import { ADHKAR_DATA, ADHKAR_ROUTINE } from './data/adhkar';
import { DUA_DATA } from './data/duas';
import { ALL_SURAHS } from './data/surahs';
import { CATEGORY_META as CATEGORY_LABELS, DUA_CATEGORIES } from './data/categories';

const DHIKR_DATA: DhikrItem[] = [...ADHKAR_DATA, ...DUA_DATA];
const SUPPORT_EMAIL = "support@moizit.com";

// Components
import BottomNav from './components/BottomNav';
import FocusModeOverlay from './components/FocusModeOverlay';

// Screens
import AdhkarScreen from './screens/AdhkarScreen';
import DuaScreen from './screens/DuaScreen';
import PersonalScreen from './screens/PersonalScreen';
import MoreScreen from './screens/MoreScreen';

// --- Types ---
type Counts = Record<string, number>;

const getLocalDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState(0); // 0: Adhkar, 1: Du'a, 2: Personal
  const [duaSearchQuery, setDuaSearchQuery] = useState("");
  const [duaSelectedCategory, setDuaSelectedCategory] = useState("All");
  const [personalSearchQuery, setPersonalSearchQuery] = useState("");
  const [currentDate, setCurrentDate] = useState(() => getLocalDateString());
  const [counts, setCounts] = useState<Record<string, Counts>>(() => {
    const saved = localStorage.getItem('dhikr-tracker-v2');
    if (saved) return JSON.parse(saved);
    return {};
  });
  const [lifetimeCounts, setLifetimeCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('dhikr-lifetime-counts-v1');
    if (saved) return JSON.parse(saved);
    return {};
  });

  const [customItems, setCustomItems] = useState<DhikrItem[]>(() => {
    const saved = localStorage.getItem('dhikr-custom-v1');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [personalSections, setPersonalSections] = useState<{ id: string, name: LocalizedText }[]>(() => {
    const saved = localStorage.getItem('dhikr-personal-sections-v1');
    if (saved) return JSON.parse(saved);
    return [{ id: 'all', name: { en: 'All Items', bn: 'সব আইটেম' } }];
  });

  const [selectedPersonalSectionId, setSelectedPersonalSectionId] = useState("all");

  useEffect(() => {
    localStorage.setItem('dhikr-personal-sections-v1', JSON.stringify(personalSections));
  }, [personalSections]);

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [manualDhikr, setManualDhikr] = useState<Partial<DhikrItem & { sectionId?: string }>>({
    title: "",
    arabic: "",
    trn: "",
    meaning: "",
    benefit: "",
    source: "",
    ref: "",
    target: 0,
    sectionId: 'all'
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionType: 'reset' | 'delete' | null;
    actionId?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    actionType: null
  });

  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dhikr-pinned-v1');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('dhikr-pinned-v1', JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  const togglePin = (id: string) => {
    setPinnedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const [isSurahModalOpen, setIsSurahModalOpen] = useState(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState("");
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState({ en: "", bn: "" });
  const [isFetchingSurah, setIsFetchingSurah] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState("all");

  const [customTargets, setCustomTargets] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('dhikr-targets-v1');
    return saved ? JSON.parse(saved) : {};
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('dhikr-favorites-v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    return localStorage.getItem('dhikr-theme-v1') || 'emerald';
  });

  const [language, setLanguage] = useState<'en' | 'bn'>(() => {
    return (localStorage.getItem('dhikr-language-v1') as 'en' | 'bn') || 'en';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('dhikr-dark-mode-v1');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isHapticEnabled, setIsHapticEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('dhikr-haptic-v1');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('dhikr-sound-v1');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('dhikr-arabic-font-size-v1');
    return saved ? JSON.parse(saved) : 28;
  });
  const [englishFontSize, setEnglishFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('dhikr-english-font-size-v1');
    return saved ? JSON.parse(saved) : 16;
  });
  const [focusItem, setFocusItem] = useState<DhikrItem | null>(null);

  const [targetModal, setTargetModal] = useState<{
    isOpen: boolean;
    itemId: string | null;
    currentTarget: number;
  }>({
    isOpen: false,
    itemId: null,
    currentTarget: 0
  });

  // Back button handling for mobile
  const lastPushedState = useRef<string | null>(null);

  useEffect(() => {
    // Initialize history state
    window.history.replaceState({ key: 'tab-0' }, '');
    lastPushedState.current = 'tab-0';

    const handlePopState = (e: PopStateEvent) => {
      if (focusItem) {
        setFocusItem(null);
      } else if (isManualModalOpen) {
        setIsManualModalOpen(false);
        setEditingItemId(null);
      } else if (isSurahModalOpen) {
        setIsSurahModalOpen(false);
      } else if (isSectionModalOpen) {
        setIsSectionModalOpen(false);
        setIsEditingSection(false);
      } else if (isRatingModalOpen) {
        setIsRatingModalOpen(false);
        setRatingValue(0);
      } else if (targetModal.isOpen) {
        setTargetModal(prev => ({ ...prev, isOpen: false }));
      } else if (confirmDialog.isOpen) {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      } else if (activeTab !== 0) {
        setActiveTab(0);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    focusItem, 
    isManualModalOpen, 
    isSurahModalOpen, 
    isSectionModalOpen, 
    isRatingModalOpen,
    targetModal.isOpen, 
    confirmDialog.isOpen,
    activeTab
  ]);

  useEffect(() => {
    const isAnyOverlayOpen = !!(focusItem || isManualModalOpen || isSurahModalOpen || isSectionModalOpen || isRatingModalOpen || targetModal.isOpen || confirmDialog.isOpen);
    const currentStateKey = isAnyOverlayOpen ? 'overlay' : `tab-${activeTab}`;
    
    if (lastPushedState.current !== currentStateKey) {
      if (isAnyOverlayOpen) {
        window.history.pushState({ key: 'overlay' }, '');
      } else if (activeTab !== 0) {
        if (lastPushedState.current && lastPushedState.current.startsWith('tab-')) {
          window.history.replaceState({ key: currentStateKey }, '');
        } else {
          window.history.pushState({ key: currentStateKey }, '');
        }
      }
      lastPushedState.current = currentStateKey;
    }
  }, [
    focusItem, 
    isManualModalOpen, 
    isSurahModalOpen, 
    isSectionModalOpen, 
    isRatingModalOpen,
    targetModal.isOpen, 
    confirmDialog.isOpen,
    activeTab
  ]);

  useEffect(() => {
    if (focusItem || isManualModalOpen || isSurahModalOpen || isSectionModalOpen || isRatingModalOpen || targetModal.isOpen || confirmDialog.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [focusItem, isManualModalOpen, isSurahModalOpen, isSectionModalOpen, isRatingModalOpen, targetModal.isOpen, confirmDialog.isOpen]);

  useEffect(() => {
    localStorage.setItem('dhikr-tracker-v2', JSON.stringify(counts));
  }, [counts]);

  useEffect(() => {
    localStorage.setItem('dhikr-lifetime-counts-v1', JSON.stringify(lifetimeCounts));
  }, [lifetimeCounts]);

  useEffect(() => {
    localStorage.setItem('dhikr-custom-v1', JSON.stringify(customItems));
  }, [customItems]);

  useEffect(() => {
    localStorage.setItem('dhikr-favorites-v1', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('dhikr-targets-v1', JSON.stringify(customTargets));
  }, [customTargets]);

  useEffect(() => {
    localStorage.setItem('dhikr-haptic-v1', JSON.stringify(isHapticEnabled));
  }, [isHapticEnabled]);

  useEffect(() => {
    localStorage.setItem('dhikr-sound-v1', JSON.stringify(isSoundEnabled));
  }, [isSoundEnabled]);

  useEffect(() => {
    localStorage.setItem('dhikr-arabic-font-size-v1', JSON.stringify(arabicFontSize));
  }, [arabicFontSize]);

  useEffect(() => {
    localStorage.setItem('dhikr-english-font-size-v1', JSON.stringify(englishFontSize));
  }, [englishFontSize]);

  useEffect(() => {
    localStorage.setItem('dhikr-dark-mode-v1', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('dhikr-language-v1', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('dhikr-theme-v1', currentTheme);
    
    const root = document.documentElement;
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let resolvedTheme = currentTheme;
    if (currentTheme === 'system') {
      resolvedTheme = isSystemDark ? 'dark' : 'light';
    }

    const theme = THEMES.find(t => t.id === resolvedTheme) || THEMES[0];
    const isActuallyDark = resolvedTheme !== 'light';

    const darkPresets: Record<string, any> = {
      dark: { bg: '#121212', card: '#1E1E1E', cardLight: '#252525', border: '#333333', text: '#FFFFFF', textSub: '#A0A0A0', textMuted: '#666666', textArabic: '#F8F2E0', greenPrimary: '#388E3C', greenLight: '#4CAF50' },
      emerald: { bg: '#0B1410', card: '#141F19', cardLight: '#1A2822', border: '#243328', text: '#E8F0EA', textSub: '#A7B5AE', textMuted: '#7B8D85', textArabic: '#F8F2E0', greenPrimary: '#356F2D', greenLight: '#58A55C' },
      midnight: { bg: '#0D1117', card: '#161B22', cardLight: '#1D2430', border: '#2A2F36', text: '#E6EDF3', textSub: '#A8B3C1', textMuted: '#7F8B99', textArabic: '#F6F8FB', greenPrimary: '#2F7A66', greenLight: '#66BFA6' },
      royal: { bg: '#101320', card: '#1A2033', cardLight: '#242C45', border: '#2B3552', text: '#EEF2FF', textSub: '#B5BED6', textMuted: '#8892AB', textArabic: '#F8F9FF', greenPrimary: '#3F5DAA', greenLight: '#7FA1FF' },
      maroon: { bg: '#160F12', card: '#24171C', cardLight: '#2F1E24', border: '#3A252D', text: '#F7EDEE', textSub: '#CDB6BA', textMuted: '#A0868C', textArabic: '#FFF5F5', greenPrimary: '#8A3D4A', greenLight: '#D47A88' },
      sand: { bg: '#18140F', card: '#241E17', cardLight: '#30271F', border: '#3A3126', text: '#F6F1E8', textSub: '#D0C2AE', textMuted: '#A99679', textArabic: '#FFF8ED', greenPrimary: '#7A6541', greenLight: '#C9A96B' },
    };
    const lightPreset = { bg: '#F8F9FA', card: '#FFFFFF', cardLight: '#F1F3F5', border: '#E9ECEF', text: '#212529', textSub: '#495057', textMuted: '#ADB5BD', textArabic: '#182018', greenPrimary: '#2F855A', greenLight: '#48BB78' };
    
    const palette = darkPresets[resolvedTheme] || lightPreset;

    root.style.setProperty('--bg', palette.bg);
    root.style.setProperty('--card', palette.card);
    root.style.setProperty('--card-light', palette.cardLight);
    root.style.setProperty('--gold', theme.gold);
    root.style.setProperty('--gold-dim', isActuallyDark ? `${theme.gold}55` : `${theme.gold}33`);
    root.style.setProperty('--border', palette.border);
    root.style.setProperty('--text-main', palette.text);
    root.style.setProperty('--text-sub', palette.textSub);
    root.style.setProperty('--text-muted', palette.textMuted);
    root.style.setProperty('--text-arabic', palette.textArabic);
    root.style.setProperty('--green-primary', palette.greenPrimary);
    root.style.setProperty('--green-light', palette.greenLight);
    root.style.setProperty('--arabic-size', `${arabicFontSize}px`);
    root.style.setProperty('--english-size', `${englishFontSize}px`);

    // Sync isDarkMode state for components that rely on it
    setIsDarkMode(isActuallyDark);
  }, [currentTheme, arabicFontSize, englishFontSize]);

  // System theme listener
  useEffect(() => {
    if (currentTheme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Re-trigger the theme effect
      const root = document.documentElement;
      const isSystemDark = mediaQuery.matches;
      const resolvedTheme = isSystemDark ? 'dark' : 'light';
      const theme = THEMES.find(t => t.id === resolvedTheme) || THEMES[0];
      const isActuallyDark = resolvedTheme !== 'light';
      const darkPresets: Record<string, any> = {
        dark: { bg: '#121212', card: '#1E1E1E', cardLight: '#252525', border: '#333333', text: '#FFFFFF', textSub: '#A0A0A0', textMuted: '#666666', textArabic: '#F8F2E0', greenPrimary: '#388E3C', greenLight: '#4CAF50' },
      };
      const lightPreset = { bg: '#F8F9FA', card: '#FFFFFF', cardLight: '#F1F3F5', border: '#E9ECEF', text: '#212529', textSub: '#495057', textMuted: '#ADB5BD', textArabic: '#182018', greenPrimary: '#2F855A', greenLight: '#48BB78' };
      const palette = isSystemDark ? darkPresets.dark : lightPreset;
      root.style.setProperty('--bg', palette.bg);
      root.style.setProperty('--card', palette.card);
      root.style.setProperty('--card-light', palette.cardLight);
      root.style.setProperty('--gold', theme.gold);
      root.style.setProperty('--gold-dim', isActuallyDark ? `${theme.gold}55` : `${theme.gold}33`);
      root.style.setProperty('--border', palette.border);
      root.style.setProperty('--text-main', palette.text);
      root.style.setProperty('--text-sub', palette.textSub);
      root.style.setProperty('--text-muted', palette.textMuted);
      root.style.setProperty('--text-arabic', palette.textArabic);
      root.style.setProperty('--green-primary', palette.greenPrimary);
      root.style.setProperty('--green-light', palette.greenLight);
      setIsDarkMode(isActuallyDark);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [currentTheme]);

  const getLocalizedText = (item: any) => {
    if (!item) return '';
    if (typeof item === 'string') {
      const uiStrings: Record<string, any> = {
        "Dhikr Tracker": { en: "Dhikr Tracker", bn: "জিকির ট্র্যাকার" },
        "Assalamu Alaikum": { en: "Assalamu Alaikum", bn: "আসসালামু আলাইকুম" },
        "Today": { en: "Today", bn: "আজ" },
        "Reset All": { en: "Reset All", bn: "সব রিসেট করুন" },
        "Reset All Progress?": { en: "Reset All Progress?", bn: "সব অগ্রগতি রিসেট করবেন?" },
        "This will clear all your counts for today. This action cannot be undone.": { en: "This will clear all your counts for today. This action cannot be undone.", bn: "এটি আজকের সব হিসাব মুছে ফেলবে। এই কাজটি আর ফিরিয়ে আনা যাবে না।" },
        "Reset Routine?": { en: "Reset Routine?", bn: "রুটিন রিসেট করবেন?" },
        "This will reset counts for all items in your current routine.": { en: "This will reset counts for all items in your current routine.", bn: "এটি আপনার বর্তমান রুটিনের সব আইটেমের হিসাব রিসেট করবে।" },
        "Delete Item?": { en: "Delete Item?", bn: "আইটেমটি ডিলিট করবেন?" },
        "Are you sure you want to remove this item from your collection?": { en: "Are you sure you want to remove this item from your collection?", bn: "আপনি কি নিশ্চিত যে আপনি এটি আপনার সংগ্রহ থেকে মুছে ফেলতে চান?" },
        "Title *": { en: "Title *", bn: "শিরোনাম *" },
        "Arabic Text": { en: "Arabic Text", bn: "আরবি টেক্সট" },
        "Transliteration": { en: "Transliteration", bn: "উচ্চারণ" },
        "Meaning": { en: "Meaning", bn: "অর্থ" },
        "Benefit / Source": { en: "Benefit / Source", bn: "উপকারিতা / উৎস" },
        "Default Target (0 for infinite)": { en: "Default Target (0 for infinite)", bn: "ডিফল্ট টার্গেট (০ মানে অসীম)" },
        "Add to Collection": { en: "Add to Collection", bn: "সংগ্রহে যোগ করুন" },
        "e.g., Morning Dua": { en: "e.g., Morning Dua", bn: "যেমন: সকালের দু'আ" },
        "Arabic text here...": { en: "Arabic text here...", bn: "এখানে আরবি টেক্সট লিখুন..." },
        "Add Custom Dhikr": { en: "Add Custom Dhikr", bn: "কাস্টম জিকির যোগ করুন" }
      };
      return uiStrings[item]?.[language] || uiStrings[item]?.en || item;
    }
    return item[language] || item['en'] || item || '';
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = async () => {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const playClickSound = async () => {
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
  };

  const playSuccessSound = async () => {
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
  };

  const handleSaveSection = () => {
    if (!newSectionName.en && !newSectionName.bn) return;
    
    if (isEditingSection && editingSectionId) {
      setPersonalSections(prev => prev.map(s => s.id === editingSectionId ? { ...s, name: newSectionName } : s));
    } else {
      const newSection = {
        id: `section_${Date.now()}`,
        name: newSectionName
      };
      setPersonalSections(prev => [...prev, newSection]);
    }
    setIsSectionModalOpen(false);
    setIsEditingSection(false);
    setEditingSectionId(null);
    setNewSectionName({ en: "", bn: "" });
  };

  const handleIncrement = (id: string, target: number) => {
    const dayCounts = counts[currentDate] || {};
    const current = dayCounts[id] || 0;
    const next = current + 1;

    if (target > 0 && next === target) {
      playSuccessSound();
      if (isHapticEnabled && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200]); // Enhanced long vibration for completion
      }
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [THEMES.find(t => t.id === currentTheme)?.gold || '#D4AF37', '#ffffff']
      });
    } else {
      playClickSound();
      if (isHapticEnabled && 'vibrate' in navigator) {
        navigator.vibrate(15); // Slight vibration for every click
      }
    }

    setCounts(prev => {
      const prevDayCounts = prev[currentDate] || {};
      return { ...prev, [currentDate]: { ...prevDayCounts, [id]: (prevDayCounts[id] || 0) + 1 } };
    });
    setLifetimeCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleReset = () => {
    setConfirmDialog({
      isOpen: true,
      title: getLocalizedText('Reset All Progress?'),
      message: getLocalizedText('This will clear all your counts for today. This action cannot be undone.'),
      actionType: 'reset'
    });
  };

  const handleResetRoutine = () => {
    setConfirmDialog({
      isOpen: true,
      title: getLocalizedText('Reset Routine?'),
      message: getLocalizedText('This will reset counts for all items in your current routine.'),
      actionType: 'reset'
    });
  };

  const handleResetItem = (id: string) => {
    setCounts(prev => {
      const dayCounts = { ...(prev[currentDate] || {}) };
      delete dayCounts[id];
      return { ...prev, [currentDate]: dayCounts };
    });
  };

  const handleDeletePersonalItem = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: getLocalizedText('Delete Item?'),
      message: getLocalizedText('Are you sure you want to remove this item from your collection?'),
      actionType: 'delete',
      actionId: id
    });
  };

  const handleMoveToCollection = (itemId: string, sectionId: string) => {
    setCustomItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, sectionId } : item
    ));
    // Also handle favorites if they are in customItems
    // Actually favorites are just IDs, the item itself is in DHIKR_DATA or customItems.
    // If it's in DHIKR_DATA, we might need a way to store its collection too.
    // Let's assume for now only customItems/saved items have collections.
    // If a DHIKR_DATA item is favorited, it shows up in Personal. 
    // We should probably allow assigning collections to favorited DHIKR_DATA items too.
    
    setFavoritesMetadata(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), sectionId }
    }));
  };

  const [favoritesMetadata, setFavoritesMetadata] = useState<Record<string, { sectionId?: string }>>(() => {
    const saved = localStorage.getItem('dhikr-favorites-metadata-v1');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('dhikr-favorites-metadata-v1', JSON.stringify(favoritesMetadata));
  }, [favoritesMetadata]);

  const handleDeleteSection = (sectionId: string) => {
    if (sectionId === 'all') return;
    setConfirmDialog({
      isOpen: true,
      title: getLocalizedText({ en: 'Delete Collection?', bn: 'কালেকশনটি ডিলিট করবেন?' }),
      message: getLocalizedText({ en: 'This will remove the collection. Items inside will be moved to "All Items".', bn: 'এটি কালেকশনটি মুছে ফেলবে। এর ভেতরের আইটেমগুলো "সব আইটেম"-এ চলে যাবে।' }),
      actionType: 'delete_section',
      actionId: sectionId
    });
  };

  const handleConfirm = () => {
    if (confirmDialog.actionType === 'reset') {
      setCounts(prev => ({ ...prev, [currentDate]: {} }));
    } else if (confirmDialog.actionType === 'delete' && confirmDialog.actionId) {
      setCustomItems(prev => prev.filter(item => item.id !== confirmDialog.actionId));
      setFavorites(prev => prev.filter(id => id !== confirmDialog.actionId));
      setPinnedIds(prev => prev.filter(id => id !== confirmDialog.actionId));
    } else if (confirmDialog.actionType === 'delete_section' && confirmDialog.actionId) {
      const sectionId = confirmDialog.actionId;
      setPersonalSections(prev => prev.filter(s => s.id !== sectionId));
      setCustomItems(prev => prev.map(item => item.sectionId === sectionId ? { ...item, sectionId: 'all' } : item));
      setFavoritesMetadata(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          if (next[id].sectionId === sectionId) {
            next[id] = { ...next[id], sectionId: 'all' };
          }
        });
        return next;
      });
      if (selectedPersonalSectionId === sectionId) {
        setSelectedPersonalSectionId('all');
      }
    }
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleEditCustom = (item: DhikrItem) => {
    setEditingItemId(item.id);
    setManualDhikr({
      title: getLocalizedText(item.title),
      arabic: item.arabic,
      trn: getLocalizedText(item.trn),
      meaning: getLocalizedText(item.meaning),
      benefit: getLocalizedText(item.benefit),
      source: item.source || "",
      ref: item.ref || "",
      target: item.target,
      sectionId: item.sectionId || 'all'
    });
    setIsManualModalOpen(true);
  };

  const handleAddSurah = async (surahId: string) => {
    setIsFetchingSurah(true);
    try {
      // Use quran-simple edition to get full text reliably
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/quran-simple`);
      const data = await res.json();
      if (data.code === 200) {
        const surah = data.data;
        const fullArabic = surah.ayahs.map((a: any) => a.text).join(' ');
        const newItem: DhikrItem = {
          step: 4,
          id: `surah_${surahId}_${Date.now()}`,
          title: { en: surah.englishName, bn: surah.name },
          arabic: fullArabic,
          trn: { en: surah.englishNameTranslation, bn: surah.englishNameTranslation },
          meaning: { en: `Surah ${surah.englishName}`, bn: `সূরা ${surah.englishName}` },
          source: "Quran",
          ref: `${surah.number}`,
          target: 1,
          badge: "Surah",
          sectionId: selectedPersonalSectionId
        };
        setCustomItems(prev => [newItem, ...prev]);
      }
    } catch (err) {
      console.error("Failed to fetch surah", err);
    } finally {
      setIsFetchingSurah(false);
      setIsSurahModalOpen(false);
    }
  };

  const handleManualAdd = () => {
    if (!manualDhikr.title) return;
    const newItem: DhikrItem = {
      step: 4,
      id: editingItemId || `manual_${Date.now()}`,
      title: { en: manualDhikr.title, bn: manualDhikr.title },
      arabic: manualDhikr.arabic || "",
      trn: { en: manualDhikr.trn || "", bn: manualDhikr.trn || "" },
      meaning: { en: manualDhikr.meaning || "", bn: manualDhikr.meaning || "" },
      benefit: { en: manualDhikr.benefit || "Personal collection", bn: manualDhikr.benefit || "Personal collection" },
      source: manualDhikr.source || "",
      ref: manualDhikr.ref || "",
      target: manualDhikr.target || 0,
      badge: "Custom",
      sectionId: manualDhikr.sectionId || selectedPersonalSectionId
    };
    
    if (editingItemId) {
      setCustomItems(prev => prev.map(item => item.id === editingItemId ? newItem : item));
    } else {
      setCustomItems(prev => [newItem, ...prev]);
    }
    
    setIsManualModalOpen(false);
    setManualDhikr({ title: "", arabic: "", trn: "", meaning: "", benefit: "", target: 0, sectionId: 'all' });
    setEditingItemId(null);
  };

  const handleSaveTarget = () => {
    if (targetModal.itemId) {
      setCustomTargets(prev => ({
        ...prev,
        [targetModal.itemId!]: targetModal.currentTarget
      }));
    }
    setTargetModal(prev => ({ ...prev, isOpen: false }));
  };

  const categories = useMemo(() => DUA_CATEGORIES, []);
  const getLocalizedCategory = (cat: string) => CATEGORY_LABELS[cat]?.[language] || cat;

  const filteredDuaItems = useMemo(() => {
    return DUA_DATA.filter(item => {
      const q = duaSearchQuery.toLowerCase();
      const haystack = [
        getLocalizedText(item.title),
        getLocalizedText(item.meaning),
        ...((item.cat || []).map(getLocalizedCategory))
      ].join(' ').toLowerCase();
      const matchesSearch = q === '' || haystack.includes(q);
      const matchesCategory = duaSelectedCategory === "All" || item.cat?.includes(duaSelectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [duaSearchQuery, duaSelectedCategory, language]);

  const filteredPersonalItems = useMemo(() => {
    const favoriteBase = DHIKR_DATA.filter(item => favorites.includes(item.id));
    const byId = new Map<string, DhikrItem>();
    [...favoriteBase, ...customItems].forEach(item => {
      const sectionId = item.sectionId || favoritesMetadata[item.id]?.sectionId || 'all';
      byId.set(item.id, { ...item, sectionId });
    });
    return Array.from(byId.values()).filter(item => {
      const matchesSearch = personalSearchQuery === '' ||
        getLocalizedText(item.title).toLowerCase().includes(personalSearchQuery.toLowerCase()) ||
        getLocalizedText(item.meaning).toLowerCase().includes(personalSearchQuery.toLowerCase());
      const matchesSection = selectedPersonalSectionId === 'all' || item.sectionId === selectedPersonalSectionId;
      return matchesSearch && matchesSection;
    });
  }, [personalSearchQuery, customItems, favorites, favoritesMetadata, selectedPersonalSectionId, language]);

  const routineItems = useMemo(() => {
    const core = ADHKAR_ROUTINE.afterSalahCore.map(id => DHIKR_DATA.find(i => i.id === id)).filter(Boolean) as DhikrItem[];
    const optional = ADHKAR_ROUTINE.afterSalahOptional.map(id => DHIKR_DATA.find(i => i.id === id)).filter(Boolean) as DhikrItem[];
    const protection = ADHKAR_ROUTINE.protection.map(id => DHIKR_DATA.find(i => i.id === id)).filter(Boolean) as DhikrItem[];
    return { core, optional, protection };
  }, []);

  const currentCounts = counts[currentDate] || {};

  return (
    <div className="min-h-screen bg-bg text-text-main font-serif pb-24 transition-colors duration-500">
      {/* Header */}
      <header className="relative bg-card border-b border-border px-4 py-6 shadow-sm">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-transparent flex items-center justify-center">
                  <img src="/icon.svg" alt="Dhikr Tracker logo" className="w-full h-full object-contain" />
                </div>
                {getLocalizedText('Dhikr Tracker')}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-text-sub font-bold uppercase tracking-widest opacity-90">
                  {getLocalizedText('Assalamu Alaikum')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-center min-w-[100px] mr-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{getLocalizedText('Today')}</span>
              <span className="text-xs font-bold text-gold">{new Date(currentDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
            <button 
              onClick={handleReset}
              className="px-3 py-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors text-white flex items-center gap-2"
              title="Reset All"
            >
              <RotateCcw size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">{getLocalizedText('Reset All')}</span>
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
              onSetTarget={(item) => setTargetModal({ isOpen: true, itemId: item.id, currentTarget: customTargets[item.id] ?? item.target })}
              getLocalizedText={getLocalizedText}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              language={language}
              onFocus={setFocusItem}
              pinnedIds={pinnedIds}
              onTogglePin={togglePin}
              allDhikrItems={[...DHIKR_DATA, ...customItems]}
              sections={personalSections}
              onMoveToCollection={handleMoveToCollection}
            />
          )}

          {activeTab === 1 && (
            <DuaScreen
              searchQuery={duaSearchQuery}
              onSearchChange={setDuaSearchQuery}
              selectedCategory={duaSelectedCategory}
              onCategorySelect={setDuaSelectedCategory}
              categories={categories}
              filteredItems={filteredDuaItems}
              todaysDua={DHIKR_DATA[0]} // Placeholder
              counts={currentCounts}
              onCountChange={handleIncrement}
              onResetItem={handleResetItem}
              customTargets={customTargets}
              onSetTarget={(item) => setTargetModal({ isOpen: true, itemId: item.id, currentTarget: customTargets[item.id] ?? item.target })}
              getLocalizedText={getLocalizedText}
              isFavorite={(id) => favorites.includes(id)}
              onFavorite={toggleFavorite}
              onFocus={setFocusItem}
              language={language}
              isPinned={(id) => pinnedIds.includes(id)}
              onTogglePin={togglePin}
              sections={personalSections}
              onMoveToCollection={handleMoveToCollection}
            />
          )}

          {activeTab === 2 && (
            <PersonalScreen
              getLocalizedText={getLocalizedText}
              counts={currentCounts}
              onCountChange={handleIncrement}
              onResetItem={handleResetItem}
              customTargets={customTargets}
              onSetTarget={(item) => setTargetModal({ isOpen: true, itemId: item.id, currentTarget: customTargets[item.id] ?? item.target })}
              searchQuery={personalSearchQuery}
              onSearchChange={setPersonalSearchQuery}
              filteredItems={filteredPersonalItems}
              onEditItem={handleEditCustom}
              onDeleteItem={handleDeletePersonalItem}
              onManualAdd={() => { setEditingItemId(null); setManualDhikr({ title: '', arabic: '', trn: '', meaning: '', benefit: '', target: 33, sectionId: selectedPersonalSectionId === 'all' ? 'all' : selectedPersonalSectionId }); setIsManualModalOpen(true); }}
              onAddSurah={() => setIsSurahModalOpen(true)}
              isFavorite={(id) => favorites.includes(id)}
              onFavorite={toggleFavorite}
              onFocus={setFocusItem}
              language={language}
              isPinned={(id) => pinnedIds.includes(id)}
              onTogglePin={togglePin}
              sections={personalSections}
              selectedSectionId={selectedPersonalSectionId}
              onSelectSection={setSelectedPersonalSectionId}
              onAddSection={() => { setIsEditingSection(false); setEditingSectionId(null); setNewSectionName({ en: "", bn: "" }); setIsSectionModalOpen(true); }}
              onEditSection={(section) => { setIsEditingSection(true); setEditingSectionId(section.id); setNewSectionName(section.name); setIsSectionModalOpen(true); }}
              onDeleteSection={handleDeleteSection}
              onMoveToCollection={handleMoveToCollection}
            />
          )}

          {activeTab === 3 && (
            <MoreScreen
              getLocalizedText={getLocalizedText}
              theme={currentTheme}
              onThemeChange={setCurrentTheme}
              language={language}
              onLanguageChange={setLanguage}
              isSoundOn={isSoundEnabled}
              setIsSoundOn={setIsSoundEnabled}
              isHapticOn={isHapticEnabled}
              setIsHapticOn={setIsHapticEnabled}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              supportEmail={SUPPORT_EMAIL}
              arabicFontSize={arabicFontSize}
              setArabicFontSize={setArabicFontSize}
              englishFontSize={englishFontSize}
              setEnglishFontSize={setEnglishFontSize}
              onRateClick={() => setIsRatingModalOpen(true)}
            />
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isManualModalOpen && (
          <motion.div 
            key="manual-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-y-auto bg-bg/90 backdrop-blur-sm"
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
                  <h2 className="text-xl font-bold text-gold flex items-center gap-2">
                    {editingItemId ? <Edit2 size={20} /> : <Plus size={20} />}
                    {editingItemId 
                      ? getLocalizedText({ en: 'Edit Dhikr', bn: 'জিকির এডিট করুন' }) 
                      : getLocalizedText('Add Custom Dhikr')}
                  </h2>
                  <button 
                    onClick={() => window.history.back()}
                    className="text-text-muted hover:text-text-main"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-sub uppercase mb-1">{getLocalizedText('Title *')}</label>
                    <input 
                      type="text"
                      value={manualDhikr.title}
                      onChange={(e) => setManualDhikr(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text-main outline-none focus:border-gold"
                      placeholder={getLocalizedText('e.g., Morning Dua')}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-sub uppercase mb-1">{getLocalizedText('Arabic Text')}</label>
                    <textarea 
                      value={manualDhikr.arabic}
                      onChange={(e) => setManualDhikr(prev => ({ ...prev, arabic: e.target.value }))}
                      className="w-full bg-bg border border-border rounded-xl p-3 text-lg text-text-main outline-none focus:border-gold min-h-[80px] arabic-text"
                      placeholder={getLocalizedText('Arabic text here...')}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-sub uppercase mb-1">{getLocalizedText('Transliteration')}</label>
                    <input 
                      type="text"
                      value={manualDhikr.trn}
                      onChange={(e) => setManualDhikr(prev => ({ ...prev, trn: e.target.value }))}
                      className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text-main outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-sub uppercase mb-1">{getLocalizedText('Meaning')}</label>
                    <textarea 
                      value={manualDhikr.meaning}
                      onChange={(e) => setManualDhikr(prev => ({ ...prev, meaning: e.target.value }))}
                      className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text-main outline-none focus:border-gold min-h-[60px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-sub uppercase mb-1">{getLocalizedText('Hadith Book / Source')}</label>
                    <input 
                      type="text"
                      value={manualDhikr.source}
                      onChange={(e) => setManualDhikr(prev => ({ ...prev, source: e.target.value }))}
                      className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text-main outline-none focus:border-gold"
                      placeholder={getLocalizedText('e.g., Sahih Bukhari')}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-sub uppercase mb-1">{getLocalizedText('Reference')}</label>
                    <input 
                      type="text"
                      value={manualDhikr.ref}
                      onChange={(e) => setManualDhikr(prev => ({ ...prev, ref: e.target.value }))}
                      className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text-main outline-none focus:border-gold"
                      placeholder={getLocalizedText('e.g., 6407')}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-sub uppercase mb-1">{getLocalizedText('Default Target (0 for infinite)')}</label>
                    <input 
                      type="number"
                      value={manualDhikr.target}
                      onChange={(e) => setManualDhikr(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text-main outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-sub uppercase mb-1">{getLocalizedText('Collection')}</label>
                    <select
                      value={manualDhikr.sectionId}
                      onChange={(e) => setManualDhikr(prev => ({ ...prev, sectionId: e.target.value }))}
                      className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text-main outline-none focus:border-gold appearance-none"
                    >
                      {personalSections.map(s => (
                        <option key={s.id} value={s.id}>{getLocalizedText(s.name)}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={() => {
                      handleManualAdd();
                      window.history.back();
                    }}
                    disabled={!manualDhikr.title}
                    className="w-full py-4 bg-gold text-bg font-bold rounded-2xl shadow-lg hover:bg-gold/90 transition-colors disabled:opacity-50 mt-4"
                  >
                    {editingItemId 
                      ? getLocalizedText({ en: 'Update Dhikr', bn: 'জিকির আপডেট করুন' }) 
                      : getLocalizedText('Add to Collection')}
                  </button>
                </div>
              </div>
            </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog Modal */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <motion.div 
            key="confirm-dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] overflow-y-auto bg-bg/90 backdrop-blur-sm"
          >
            <div className="min-h-full flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card border border-border w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 my-8"
            >
              <h3 className="text-xl font-bold text-gold mb-2">{confirmDialog.title}</h3>
              <p className="text-sm text-text-sub mb-6">{confirmDialog.message}</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => window.history.back()}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-text-muted hover:text-text-main transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleConfirm();
                    window.history.back();
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Target Modal */}
      <AnimatePresence>
        {targetModal.isOpen && (
          <motion.div 
            key="target-dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] overflow-y-auto bg-bg/90 backdrop-blur-sm"
          >
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-card border border-border w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 my-8"
              >
              <h3 className="text-xl font-bold text-gold mb-2">Set Target</h3>
              <p className="text-sm text-text-sub mb-4">Enter a new target count (0 for infinite tracking):</p>
              
              <input 
                type="number" 
                min="0"
                value={targetModal.currentTarget}
                onChange={(e) => setTargetModal(prev => ({ ...prev, currentTarget: parseInt(e.target.value) || 0 }))}
                className="w-full bg-bg border border-border rounded-xl p-3 text-text-main focus:border-gold outline-none mb-6"
              />

                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => window.history.back()}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-text-muted hover:text-text-main transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      handleSaveTarget();
                      window.history.back();
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-gold text-bg hover:bg-gold/90 transition-colors"
                  >
                    Save
                  </button>
                </div>
            </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Surah Selection Modal */}
      <AnimatePresence>
        {isSurahModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-y-auto bg-bg/90 backdrop-blur-sm"
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
                    <h2 className="text-xl font-bold text-gold flex items-center gap-2">
                      <BookOpen size={20} />
                      {getLocalizedText({ en: 'Add Surah', bn: 'সূরা যোগ করুন' })}
                    </h2>
                    <button 
                      onClick={() => window.history.back()}
                      className="text-text-muted hover:text-text-main"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="mb-4">
                    <input 
                      type="text"
                      value={surahSearchQuery}
                      onChange={(e) => setSurahSearchQuery(e.target.value)}
                      placeholder={getLocalizedText({ en: 'Search Surah...', bn: 'সূরা খুঁজুন...' })}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text-main outline-none focus:border-gold"
                    />
                  </div>

                  <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {isFetchingSurah ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="w-8 h-8 text-gold animate-spin" />
                        <p className="text-sm text-text-muted font-bold uppercase tracking-widest">
                          {getLocalizedText({ en: 'Fetching Surah...', bn: 'সূরা লোড হচ্ছে...' })}
                        </p>
                      </div>
                    ) : (
                      ALL_SURAHS.filter(s => 
                        s.en.toLowerCase().includes(surahSearchQuery.toLowerCase()) || 
                        s.bn.includes(surahSearchQuery)
                      ).map(surah => (
                        <button 
                          key={surah.id}
                          onClick={() => {
                            handleAddSurah(surah.id.toString());
                            window.history.back();
                          }}
                          className="w-full p-4 bg-bg border border-border rounded-2xl flex items-center justify-between hover:border-gold/50 transition-all group"
                        >
                          <div className="text-left">
                            <p className="text-sm font-bold text-text-main group-hover:text-gold transition-colors">{surah.en}</p>
                            <p className="text-xs text-text-muted">{surah.bn}</p>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold text-xs font-bold">
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
        {isSectionModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] overflow-y-auto bg-bg/90 backdrop-blur-sm"
          >
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-card border border-border w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 my-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gold">
                    {isEditingSection ? getLocalizedText({ en: 'Edit Collection', bn: 'কালেকশন এডিট করুন' }) : getLocalizedText({ en: 'New Collection', bn: 'নতুন কালেকশন' })}
                  </h3>
                  <button onClick={() => window.history.back()} className="text-text-muted hover:text-text-main">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-sub uppercase mb-1">English Name</label>
                    <input 
                      type="text"
                      value={newSectionName.en}
                      onChange={(e) => setNewSectionName(prev => ({ ...prev, en: e.target.value }))}
                      className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text-main outline-none focus:border-gold"
                      placeholder="e.g., Morning Adhkar"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-sub uppercase mb-1">Bengali Name</label>
                    <input 
                      type="text"
                      value={newSectionName.bn}
                      onChange={(e) => setNewSectionName(prev => ({ ...prev, bn: e.target.value }))}
                      className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text-main outline-none focus:border-gold"
                      placeholder="যেমন: সকালের জিকির"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      handleSaveSection();
                      window.history.back();
                    }}
                    disabled={!newSectionName.en && !newSectionName.bn}
                    className="w-full py-4 bg-gold text-bg font-bold rounded-2xl shadow-lg hover:bg-gold/90 transition-colors disabled:opacity-50 mt-4"
                  >
                    {isEditingSection ? getLocalizedText({ en: 'Update', bn: 'আপডেট' }) : getLocalizedText({ en: 'Create', bn: 'তৈরি করুন' })}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {isRatingModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] overflow-y-auto bg-bg/95 backdrop-blur-md"
          >
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-card border border-border w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl p-8 text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-gold/10 flex items-center justify-center text-gold">
                    <Star size={40} fill={ratingValue > 0 ? "currentColor" : "none"} />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-text-main mb-2">
                  {getLocalizedText({ en: 'Enjoying Dhikr Tracker?', bn: 'জিকির ট্র্যাকার কেমন লাগছে?' })}
                </h3>
                <p className="text-sm text-text-sub mb-8 leading-relaxed">
                  {getLocalizedText({ 
                    en: 'Your feedback helps us grow and reach more people. How would you rate your experience?', 
                    bn: 'আপনার মতামত আমাদের আরও মানুষের কাছে পৌঁছাতে সাহায্য করবে। আপনার অভিজ্ঞতা কেমন?' 
                  })}
                </p>

                <div className="flex justify-center gap-2 mb-10">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => {
                        setRatingValue(star);
                        if (isHapticEnabled && 'vibrate' in navigator) navigator.vibrate(10);
                      }}
                      className="p-1 transition-transform active:scale-90"
                    >
                      <Star 
                        size={36} 
                        className={star <= ratingValue ? "text-gold" : "text-border"} 
                        fill={star <= ratingValue ? "currentColor" : "none"}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {ratingValue === 5 ? (
                    <button 
                      onClick={() => {
                        window.open('https://play.google.com/store/apps/details?id=com.moizit.dhikrtracker', '_blank');
                        setIsRatingModalOpen(false);
                        setRatingValue(0);
                      }}
                      className="w-full py-4 bg-gold text-bg font-bold rounded-2xl shadow-lg hover:bg-gold/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Star size={18} fill="currentColor" />
                      {getLocalizedText({ en: 'Rate on Play Store', bn: 'প্লে স্টোরে রেট দিন' })}
                    </button>
                  ) : ratingValue > 0 ? (
                    <button 
                      onClick={() => {
                        if (ratingValue < 4) {
                          window.location.href = `mailto:${SUPPORT_EMAIL}?subject=Dhikr Tracker Feedback (${ratingValue} stars)`;
                        } else {
                          window.open('https://play.google.com/store/apps/details?id=com.moizit.dhikrtracker', '_blank');
                        }
                        setIsRatingModalOpen(false);
                        setRatingValue(0);
                      }}
                      className="w-full py-4 bg-gold text-bg font-bold rounded-2xl shadow-lg hover:bg-gold/90 transition-all active:scale-[0.98]"
                    >
                      {ratingValue < 4 
                        ? getLocalizedText({ en: 'Send Feedback', bn: 'মতামত পাঠান' }) 
                        : getLocalizedText({ en: 'Rate on Play Store', bn: 'প্লে স্টোরে রেট দিন' })}
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="w-full py-4 bg-border text-text-muted font-bold rounded-2xl opacity-50 cursor-not-allowed"
                    >
                      {getLocalizedText({ en: 'Select Stars', bn: 'স্টার সিলেক্ট করুন' })}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => {
                      setIsRatingModalOpen(false);
                      setRatingValue(0);
                    }}
                    className="w-full py-3 text-sm font-bold text-text-muted hover:text-text-main transition-colors"
                  >
                    {getLocalizedText({ en: 'Maybe Later', bn: 'পরে করব' })}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        getLocalizedText={getLocalizedText} 
      />

      {/* Focus Mode Overlay */}
      {focusItem && (
        <FocusModeOverlay
          item={focusItem}
          count={currentCounts[focusItem.id] || 0}
          target={customTargets[focusItem.id] ?? focusItem.target}
          onIncrement={() => handleIncrement(focusItem.id, customTargets[focusItem.id] ?? focusItem.target)}
          onReset={() => handleResetItem(focusItem.id)}
          onClose={() => window.history.back()}
          getLocalizedText={getLocalizedText}
          language={language}
        />
      )}
    </div>
  );
}
