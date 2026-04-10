import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  HandHelping, 
  Sparkles,
  Info,
  Plus,
  Loader2,
  Trash2,
  Send,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  Edit2,
  Smartphone,
  Bell,
  MapPin,
  Clock,
  RotateCw,
  Search,
  MoreHorizontal,
  FolderPlus,
  BookOpen,
  Settings2,
  Maximize2,
  MessageSquareQuote,
  Moon,
  Sun,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DhikrItem, LocalizedText, THEMES } from './constants';
import { ADHKAR_DATA, ADHKAR_ROUTINE } from './data/adhkar';
import { DUA_DATA } from './data/duas';
import { ALL_SURAHS } from './data/surahs';
import { HADITH_DATA } from './data/hadiths';
import { CATEGORY_META as CATEGORY_LABELS, DUA_CATEGORIES } from './data/categories';

const DHIKR_DATA: DhikrItem[] = [...ADHKAR_DATA, ...DUA_DATA];
import { renderText } from './utils/renderText';
import { buildJourneyStats } from './utils/stats';

// Components
import BottomNav from './components/BottomNav';
import FocusModeOverlay from './components/FocusModeOverlay';
import DhikrCard from './components/DhikrCard';
import ProgressBar from './components/ProgressBar';

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

const normalizePrayerTime = (time?: string) => {
  if (!time) return '';
  const match = String(time).match(/(\d{1,2}:\d{2})/);
  return match ? match[1].padStart(5, '0') : '';
};

const normalizePrayerTimings = (timings: Record<string, string> = {}) => {
  const keys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Sunset', 'Maghrib', 'Isha', 'Imsak', 'Midnight'];
  return keys.reduce<Record<string, string>>((acc, key) => {
    if (timings[key]) acc[key] = normalizePrayerTime(timings[key]);
    return acc;
  }, {});
};

const getSunsetProhibitedEnd = (times: Record<string, string>) => {
  if (!times.Sunset) return '--:--';
  if (times.Maghrib && times.Maghrib > times.Sunset) return times.Maghrib;
  return addMinutesStatic(times.Sunset, 15);
};

const addMinutesStatic = (time: string, mins: number) => {
  if (!time) return '--:--';
  const cleanTime = normalizePrayerTime(time);
  const [h, m] = cleanTime.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m + mins, 0, 0);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const tokenizePrompt = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);

const scorePromptAgainstText = (tokens: string[], text: string) => {
  const haystack = text.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += token.length > 5 ? 3 : 2;
  }
  return score;
};

export default function App() {
  const [activeTab, setActiveTab] = useState(0); // 0: Adhkar, 1: Du'a, 2: Personal
  const [duaSearchQuery, setDuaSearchQuery] = useState("");
  const [duaSelectedCategory, setDuaSelectedCategory] = useState("All");
  const [personalSearchQuery, setPersonalSearchQuery] = useState("");
  const [personalSelectedSection, setPersonalSelectedSection] = useState("All");
  const [currentDate, setCurrentDate] = useState(() => getLocalDateString());
  const [counts, setCounts] = useState<Record<string, Counts>>(() => {
    const saved = localStorage.getItem('dhikr-tracker-v2');
    if (saved) return JSON.parse(saved);
    // Migration from v1 if exists
    const oldSaved = localStorage.getItem('dhikr-tracker-v1');
    if (oldSaved) {
      const today = getLocalDateString();
      return { [today]: JSON.parse(oldSaved) };
    }
    return {};
  });
  const [lifetimeCounts, setLifetimeCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('dhikr-lifetime-counts-v1');
    if (saved) return JSON.parse(saved);
    const dailySaved = localStorage.getItem('dhikr-tracker-v2');
    if (dailySaved) {
      const parsed = JSON.parse(dailySaved) as Record<string, Record<string, number>>;
      const aggregate: Record<string, number> = {};
      Object.values(parsed).forEach(day => {
        Object.entries(day || {}).forEach(([id, count]) => {
          aggregate[id] = (aggregate[id] || 0) + (count || 0);
        });
      });
      return aggregate;
    }
    return {};
  });
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('dhikr-prayer-times-v1');
    return saved ? normalizePrayerTimings(JSON.parse(saved)) : {};
  });

  useEffect(() => {
    if (Object.keys(prayerTimes).length === 0) return;
    const normalized = normalizePrayerTimings(prayerTimes);
    const changed = JSON.stringify(normalized) !== JSON.stringify(prayerTimes);
    if (changed) setPrayerTimes(normalized);
  }, []);

  const [customItems, setCustomItems] = useState<DhikrItem[]>(() => {
    const saved = localStorage.getItem('dhikr-custom-v1');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.map((item: any) => ({ ...item, sectionId: 'all' })) : [];
    } catch {
      return [];
    }
  });

  const [personalSections, setPersonalSections] = useState<{ id: string, name: LocalizedText }[]>(() => ([{ id: 'all', name: { en: 'All Section', bn: 'সব আইটেম' } }]));

  useEffect(() => {
    localStorage.setItem('dhikr-personal-sections-v1', JSON.stringify(personalSections));
  }, [personalSections]);

  // AI State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<Partial<DhikrItem> | null>(null);

  // Manual Add State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [manualDhikr, setManualDhikr] = useState<Partial<DhikrItem & { sectionId?: string }>>({
    title: "",
    arabic: "",
    trn: "",
    meaning: "",
    benefit: "",
    target: 0,
    sectionId: 'all'
  });

  // Confirm Dialog State
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
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState({ en: "", bn: "" });
  const [selectedSurahToAdd, setSelectedSurahToAdd] = useState("");
  const [isFetchingSurah, setIsFetchingSurah] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState("all");

  // Custom Targets State
  const [customTargets, setCustomTargets] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('dhikr-targets-v1');
    return saved ? normalizePrayerTimings(JSON.parse(saved)) : {};
  });

  const [isPrayerLoading, setIsPrayerLoading] = useState(false);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('dhikr-favorites-v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentTimeStr, setCurrentTimeStr] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    return localStorage.getItem('dhikr-theme-v1') || 'emerald';
  });

  const [language, setLanguage] = useState<'en' | 'bn'>(() => {
    return (localStorage.getItem('dhikr-language-v1') as 'en' | 'bn') || 'en';
  });

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('dhikr-user-name-v1') || '';
  });

  // Onboarding State
  const [isOnboarding, setIsOnboarding] = useState(() => {
    return !localStorage.getItem('dhikr-user-name-v1');
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('dhikr-dark-mode-v1');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isHapticEnabled, setIsHapticEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('dhikr-haptic-v1');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('dhikr-sound-v1');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [isAmPm, setIsAmPm] = useState<boolean>(() => {
    const saved = localStorage.getItem('dhikr-ampm-v1');
    return saved !== null ? JSON.parse(saved) : true;
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
    const handlePopState = () => {
      if (focusItem) {
        setFocusItem(null);
      } else if (isManualModalOpen) {
        setIsManualModalOpen(false);
        setEditingItemId(null);
      } else if (isAiModalOpen) {
        setIsAiModalOpen(false);
      } else if (isSurahModalOpen) {
        setIsSurahModalOpen(false);
      } else if (isSectionModalOpen) {
        setIsSectionModalOpen(false);
        setIsEditingSection(false);
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
    isAiModalOpen, 
    isSurahModalOpen, 
    isSectionModalOpen, 
    targetModal.isOpen, 
    confirmDialog.isOpen,
    activeTab
  ]);

  useEffect(() => {
    const isAnyOverlayOpen = !!(focusItem || isManualModalOpen || isAiModalOpen || isSurahModalOpen || isSectionModalOpen || targetModal.isOpen || confirmDialog.isOpen);
    const currentStateKey = isAnyOverlayOpen ? 'overlay' : `tab-${activeTab}`;
    
    if (lastPushedState.current !== currentStateKey) {
      if (isAnyOverlayOpen) {
        window.history.pushState({ key: 'overlay' }, '');
      } else if (activeTab !== 0) {
        // If we are already in a "tab" state, replace it to avoid history bloat
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
    isAiModalOpen, 
    isSurahModalOpen, 
    isSectionModalOpen, 
    targetModal.isOpen, 
    confirmDialog.isOpen,
    activeTab
  ]);


  useEffect(() => {
    if (Object.keys(prayerTimes).length === 0) {
      fetchPrayerTimes();
    }
  }, []);

  useEffect(() => {
    if (isOnboarding || focusItem || isAiModalOpen || isManualModalOpen || isSurahModalOpen || isSectionModalOpen || targetModal.isOpen || confirmDialog.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOnboarding, focusItem, isAiModalOpen, isManualModalOpen, isSurahModalOpen, isSectionModalOpen, targetModal.isOpen, confirmDialog.isOpen]);

  useEffect(() => {
    localStorage.setItem('dhikr-tracker-v2', JSON.stringify(counts));
  }, [counts]);

  useEffect(() => {
    localStorage.setItem('dhikr-lifetime-counts-v1', JSON.stringify(lifetimeCounts));
  }, [lifetimeCounts]);

  useEffect(() => {
    localStorage.setItem('dhikr-prayer-times-v1', JSON.stringify(prayerTimes));
  }, [prayerTimes]);


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
    localStorage.setItem('dhikr-user-name-v1', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('dhikr-haptic-v1', JSON.stringify(isHapticEnabled));
  }, [isHapticEnabled]);

  useEffect(() => {
    localStorage.setItem('dhikr-sound-v1', JSON.stringify(isSoundEnabled));
  }, [isSoundEnabled]);




  useEffect(() => {
    localStorage.setItem('dhikr-ampm-v1', JSON.stringify(isAmPm));
  }, [isAmPm]);

  useEffect(() => {
    localStorage.setItem('dhikr-dark-mode-v1', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('dhikr-language-v1', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('dhikr-theme-v1', currentTheme);
    const theme = THEMES.find(t => t.id === currentTheme) || THEMES[0];
    const root = document.documentElement;

    const darkPresets: Record<string, { bg: string; card: string; cardLight: string; border: string; text: string; textSub: string; textMuted: string; textArabic: string; greenPrimary: string; greenLight: string; }> = {
      emerald: { bg: '#0B1410', card: '#141F19', cardLight: '#1A2822', border: '#243328', text: '#E8F0EA', textSub: '#A7B5AE', textMuted: '#7B8D85', textArabic: '#F8F2E0', greenPrimary: '#356F2D', greenLight: '#58A55C' },
      midnight: { bg: '#0D1117', card: '#161B22', cardLight: '#1D2430', border: '#2A2F36', text: '#E6EDF3', textSub: '#A8B3C1', textMuted: '#7F8B99', textArabic: '#F6F8FB', greenPrimary: '#2F7A66', greenLight: '#66BFA6' },
      royal: { bg: '#101320', card: '#1A2033', cardLight: '#242C45', border: '#2B3552', text: '#EEF2FF', textSub: '#B5BED6', textMuted: '#8892AB', textArabic: '#F8F9FF', greenPrimary: '#3F5DAA', greenLight: '#7FA1FF' },
      maroon: { bg: '#160F12', card: '#24171C', cardLight: '#2F1E24', border: '#3A252D', text: '#F7EDEE', textSub: '#CDB6BA', textMuted: '#A0868C', textArabic: '#FFF5F5', greenPrimary: '#8A3D4A', greenLight: '#D47A88' },
      sand: { bg: '#18140F', card: '#241E17', cardLight: '#30271F', border: '#3A3126', text: '#F6F1E8', textSub: '#D0C2AE', textMuted: '#A99679', textArabic: '#FFF8ED', greenPrimary: '#7A6541', greenLight: '#C9A96B' },
    };
    const lightPreset = { bg: '#F7F5F0', card: '#FFFFFF', cardLight: '#FFFDF9', border: '#E6DED0', text: '#1D2A22', textSub: '#5E6C64', textMuted: '#8C988F', textArabic: '#182018', greenPrimary: '#4B8B55', greenLight: '#5AA768' };
    const palette = isDarkMode ? (darkPresets[currentTheme] || darkPresets.emerald) : lightPreset;

    root.style.setProperty('--bg', palette.bg);
    root.style.setProperty('--card', palette.card);
    root.style.setProperty('--card-light', palette.cardLight);
    root.style.setProperty('--gold', theme.gold);
    root.style.setProperty('--gold-dim', isDarkMode ? `${theme.gold}55` : `${theme.gold}33`);
    root.style.setProperty('--border', palette.border);
    root.style.setProperty('--text-main', palette.text);
    root.style.setProperty('--text-sub', palette.textSub);
    root.style.setProperty('--text-muted', palette.textMuted);
    root.style.setProperty('--text-arabic', palette.textArabic);
    root.style.setProperty('--green-primary', palette.greenPrimary);
    root.style.setProperty('--green-light', palette.greenLight);
  }, [currentTheme, isDarkMode]);


  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr || timeStr === '--:--') return '';
    if (!isAmPm) return timeStr;
    
    try {
      const parts = timeStr.split(':');
      if (parts.length < 2) return timeStr;
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      const period = hours >= 12 ? 'PM' : 'AM';
      const h = hours % 12 || 12;
      return `${h}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (e) {
      return timeStr;
    }
  };

  const getLocalizedText = (item: any, field: string = '') => {
    if (!item) return '';
    
    // Handle special UI strings
    if (typeof item === 'string') {
      const uiStrings: Record<string, any> = {
        "Today's Du'a": { en: "Today's Du'a", bn: "আজকের দু'আ", hi: "आज की दुआ" },
        "TEST": { en: "TEST", bn: "টেস্ট", hi: "टेस्ट" },
        "Current Prayer": { en: "Current Prayer", bn: "বর্তমান সালাত", hi: "वर्तमान प्रार्थना" },
        "Adhkar": { en: "Adhkar", bn: "আযকার", hi: "अज़कार" },
        "Completed": { en: "Completed", bn: "সম্পন্ন", hi: "पूরা हुआ" },
        "Next": { en: "Next", bn: "পরবর্তী", hi: "अगला" },
        "at": { en: "at", bn: "সময়", hi: "बजे" },
        "Section 1 — After Salah": { en: "Section 1 — After Salah", bn: "সেকশন ১ — নামাজের পর", hi: "धारा 1 - नमाज़ के बाद" },
        "Section 2 — Protection": { en: "Section 2 — Protection", bn: "সেকশন ২ — সুরক্ষা", hi: "धारा 2 - সুরক্ষা" },
        "Section 3 — Pinned by You": { en: "Section 3 — Pinned by You", bn: "সেকশন ৩ — আপনার পিন করা", hi: "धारा 3 - आपके द्वारा पिन किया गया" },
        "Reset for New Salah": { en: "Reset for New Salah", bn: "নতুন নামাজের জন্য রিসেট", hi: "नई नमाज़ के लिए रीसेट करें" },
        "Current Routine": { en: "Current Routine", bn: "বর্তমান রুটিন", hi: "वर्तमान दिनचर्या" },
        "Du'a": { en: "Du'a", bn: "দুআ", hi: "দुआ" },
        "Maghrib": { en: "Maghrib", bn: "মাগরিব", hi: "मग़रिब" },
        "Assalamu Alaikum": { en: "Assalamu Alaikum", bn: "আসসালামু আলাইকুম", hi: "अस्सलाम अलैকুম" },
        "Must Do Dhikr": { en: "Must Do Dhikr", bn: "অবশ্যই করণীয় জিকির", hi: "अनिवार्य ज़िक्र" },
        "Morning Dhikr": { en: "Morning Dhikr", bn: "সকালের জিকির", hi: "सुबह का ज़िक्र" },
        "Evening Dhikr": { en: "Evening Dhikr", bn: "সন্ধ্যার জিকির", hi: "शाम का ज़िक्र" },
        "Prohibited Time": { en: "Prohibited Time", bn: "নিষিদ্ধ সময়", hi: "वर्जित समय" },
        "Sunrise": { en: "Sunrise", bn: "সূর্যোদয়", hi: "सूर्योदय" },
        "Noon (Zawal)": { en: "Noon (Zawal)", bn: "জাওয়াল (দুপুর)", hi: "ज़वाल (दोपहर)" },
        "Sunset": { en: "Sunset", bn: "সূর্যাস্ত", hi: "सूर्यास्त" },
        "Waiting for Dhuhr": { en: "Waiting for Dhuhr", bn: "যোহরের অপেক্ষায়", hi: "ज़ुहर की प्रतीक्षा में" },
        "Waiting for Maghrib": { en: "Waiting for Maghrib", bn: "মাগরিবের অপেক্ষায়", hi: "मग़रिब की प्रतीक्षा में" },
        "Fajr": { en: "Fajr", bn: "ফজর", hi: "फ़ज्र" },
        "Dhuhr": { en: "Dhuhr", bn: "যোহর", hi: "धुहर" },
        "Asr": { en: "Asr", bn: "আসর", hi: "असर" },
        "Isha": { en: "Isha", bn: "এশা", hi: "ईशा" },
        "Must Do": { en: "Must Do", bn: "অবশ্যই করণীয়", hi: "अनिवार্য" },
        "Daily Supplications": { en: "Daily Supplications", bn: "দৈনিক দুআ", hi: "दैनिक दुआएं" },
        "Essential Surahs": { en: "Essential Surahs", bn: "প্রয়োজনীয় সূরা", hi: "महत्वपूर्ण सूरह" },
        "Personal": { en: "Personal", bn: "ব্যক্তিগত", hi: "व्यक्तिगत" },
        "Settings": { en: "Settings", bn: "সেটিংস", hi: "सेटिंग्स" },
        "Prayer Times": { en: "Prayer Times", bn: "নামাজের সময়", hi: "प्रार्थना का समय" },
        "Update Location": { en: "Update Location", bn: "লোকেশন আপডেট", hi: "स्थान আপডেট करें" },
        "Appearance": { en: "Appearance", bn: "চেহারা", hi: "दिखावट" },
        "Language": { en: "Language", bn: "ভাষা", hi: "ভাষা" },
        "Color Theme": { en: "Color Theme", bn: "থিম কালার", hi: "রंग थीम" },
        "Your Name": { en: "Your Name", bn: "আপনার নাম", hi: "आपका नाम" },
        "Haptic Feedback": { en: "Haptic Feedback", bn: "হ্যাপটিক ফিডব্যাক", hi: "हैप्टिक फीडबैक" },
        "Time Format": { en: "Time Format", bn: "সময় ফরম্যাট", hi: "समय प्रारूप" },
        "Daily Dhikr Progress": { en: "Daily Dhikr Progress", bn: "দৈনিক জিকির অগ্রগতি", hi: "दैनिक ज़िक्र प्रगति" },
        "Complete!": { en: "Complete!", bn: "সম্পন্ন!", hi: "पूर्ण!" },
        "Remembrance": { en: "Remembrance", bn: "স্মরণ", hi: "স্মরণ" },
        "Goal Reached": { en: "Goal Reached", bn: "লক্ষ্য অর্জিত", hi: "लक्ष्य प्राप्त" },
        "In Progress": { en: "In Progress", bn: "চলমান", hi: "प्रगति में" },
        "No progress recorded yet.": { en: "No progress recorded yet.", bn: "এখনো কোনো অগ্রগতি রেকর্ড করা হয়নি।", hi: "अभी तक कोई प्रगति दर्ज नहीं की गई है।" },
        "Done": { en: "Done", bn: "সম্পন্ন", hi: "हो गया" },
        "Spiritual Assistant": { en: "Spiritual Assistant", bn: "আধ্যাত্মিক সহকারী", hi: "आध्यात्मिक सहायक" },
        "How are you feeling today? What guidance do you seek?": { en: "How are you feeling today? What guidance do you seek?", bn: "আজ আপনি কেমন বোধ করছেন? আপনি কি নির্দেশনা খুঁজছেন?", hi: "आज आप कैसा महसूस कर रहे हैं? आप क्या मार्गदर्शन चाहते हैं?" },
        "e.g., I'm feeling stressed about my work...": { en: "e.g., I'm feeling stressed about my work...", bn: "যেমন: আমি আমার কাজ নিয়ে চিন্তিত...", hi: "जैसे, मैं अपने काम को लेकर तनाव महसूस कर रहा हूँ..." },
        "Ask Assistant": { en: "Ask Assistant", bn: "সহকারীকে জিজ্ঞাসা করুন", hi: "सहायक से पूछें" },
        "Nafl Prayers": { en: "Nafl Prayers", bn: "নফল নামাজ", hi: "नफल नमाज़" },
        "Tahajjud End": { en: "Tahajjud End", bn: "তাহাজ্জুদ শেষ", hi: "तहज्जुद अंत" },
        "Daily Summary": { en: "Daily Summary", bn: "দৈনিক সারাংশ", hi: "दैनिक सारांश" },
        "Chast": { en: "Chast", bn: "চাশত", hi: "चाश्त" },
        "Awwabin": { en: "Awwabin", bn: "আওয়াবিন", hi: "अव्वबीन" },
        "Add Custom Dhikr": { en: "Add Custom Dhikr", bn: "কাস্টম জিকির যোগ করুন", hi: "कस्टम ज़िक्र जोड़ें" },
        "Title *": { en: "Title *", bn: "শিরোনাম *", hi: "शीर्षक *" },
        "Arabic Text *": { en: "Arabic Text *", bn: "আরবি টেক্সট *", hi: "अरबी पाठ *" },
        "Transliteration": { en: "Transliteration", bn: "উচ্চারণ", hi: "लिप्यंतरণ" },
        "Meaning": { en: "Meaning", bn: "অর্থ", hi: "अर्थ" },
        "Benefit / Source": { en: "Benefit / Source", bn: "উপকারিতা / উৎস", hi: "लाभ / स्रोत" },
        "Default Target (0 for infinite)": { en: "Default Target (0 for infinite)", bn: "ডিফল্ট টার্গেট (০ মানে অসীম)", hi: "डिफ़ॉल्ट लक्ष्य (अनंत के लिए 0)" },
        "Add to Collection": { en: "Add to Collection", bn: "সংগ্রহে যোগ করুন", hi: "संग्रह में जोड़ें" },
        "e.g., Morning Dua": { en: "e.g., Morning Dua", bn: "যেমন: সকালের দু'আ", hi: "जैसे, सुबह की दुआ" },
        "Arabic text here...": { en: "Arabic text here...", bn: "এখানে আরবি টেক্সট লিখুন...", hi: "यहाँ अरबी पाठ लिखें..." },
        "Sahri End": { en: "Sahri End", bn: "সাহরির শেষ সময়", hi: "सह़री समाप्त" },
        "Iftar": { en: "Iftar", bn: "ইফতার", hi: "इफ्तार" },
        "Today": { en: "Today", bn: "আজ", hi: "आज" },
        "to": { en: "to", bn: "থেকে", hi: "से" },
        "Target": { en: "Target", bn: "টার্গেট", hi: "लक्ष्य" },
        "Reset All": { en: "Reset All", bn: "সব রিসেট করুন", hi: "सब रीसेट करें" },
        "Get Times": { en: "Get Times", bn: "সময় দেখুন", hi: "समय प्राप्त करें" },
        "Update": { en: "Update", bn: "আপডেট", hi: "अपडेट" },
        "Prayer times not set": { en: "Prayer times not set", bn: "নামাজের সময় সেট করা নেই", hi: "प्रार्थना का समय सेट नहीं है" }
      };
      return uiStrings[item]?.[language] || uiStrings[item]?.en || item;
    }

    if (field && item[language]?.[field]) return item[language][field];
    if (field && item['en']?.[field]) return item['en'][field];
    if (item[language]) return item[language];
    if (item['en']) return item['en'];
    return item[field] || item || '';
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
      try {
        await audioContextRef.current.resume();
      } catch (e) {
        console.error('Audio resume failed', e);
        return null;
      }
    }

    return audioContextRef.current;
  };

  const playClickSound = async () => {
    if (!isSoundEnabled) return;
    try {
      const ctx = await getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
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

  const handleIncrement = (id: string, target: number) => {
    const dayCounts = counts[currentDate] || {};
    const current = dayCounts[id] || 0;
    const next = current + 1;

    if (target > 0 && next === target) {
      playSuccessSound();
      if (isHapticEnabled && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 400]);
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
        navigator.vibrate(30);
      }
    }

    setCounts(prev => {
      const prevDayCounts = prev[currentDate] || {};
      return { ...prev, [currentDate]: { ...prevDayCounts, [id]: (prevDayCounts[id] || 0) + 1 } };
    });
    setLifetimeCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleMoveItem = (id: string, direction: 'up' | 'down') => {
    setCustomItems(prev => {
      const index = prev.findIndex(item => item.id === id);
      if (index === -1) return prev;
      
      const sectionId = prev[index].sectionId || 'default';
      const sectionItems = prev.filter(item => (item.sectionId || 'default') === sectionId);
      const indexInSection = sectionItems.findIndex(item => item.id === id);
      
      if (direction === 'up' && indexInSection === 0) return prev;
      if (direction === 'down' && indexInSection === sectionItems.length - 1) return prev;
      
      const targetIndexInSection = direction === 'up' ? indexInSection - 1 : indexInSection + 1;
      const targetId = sectionItems[targetIndexInSection].id;
      const targetIndexInPrev = prev.findIndex(item => item.id === targetId);
      
      const newItems = [...prev];
      [newItems[index], newItems[targetIndexInPrev]] = [newItems[targetIndexInPrev], newItems[index]];
      return newItems;
    });
  };

  const handleReset = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset Today\'s Progress',
      message: 'Are you sure you want to reset all your dhikr counts for today? This cannot be undone.',
      actionType: 'reset'
    });
  };

  const handleDeleteCustom = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Custom Dhikr',
      message: 'Are you sure you want to remove this item from your personal collection?',
      actionType: 'delete',
      actionId: id
    });
  };

  const handleResetItem = (id: string) => {
    setCounts(prev => ({ ...prev, [currentDate]: { ...(prev[currentDate] || {}), [id]: 0 } }));
  };

  const handleDeletePersonalItem = (id: string) => {
    const isCustom = customItems.some(item => item.id === id);
    if (isCustom) {
      handleDeleteCustom(id);
      return;
    }
    setFavorites(prev => prev.filter(f => f !== id));
    setPinnedIds(prev => prev.filter(p => p !== id));
  };

  const handleConfirm = () => {
    if (confirmDialog.actionType === 'reset') {
      setCounts(prev => ({ ...prev, [currentDate]: {} }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (confirmDialog.actionType === 'delete' && confirmDialog.actionId) {
      setCustomItems(prev => prev.filter(item => item.id !== confirmDialog.actionId));
      setCounts(prev => {
        const newCounts = { ...prev };
        Object.keys(newCounts).forEach(date => {
          if (newCounts[date]) delete newCounts[date][confirmDialog.actionId!];
        });
        return newCounts;
      });
      setLifetimeCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[confirmDialog.actionId!];
        return newCounts;
      });
    }
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const [asrMethod, setAsrMethod] = useState(() => localStorage.getItem('asrMethod') || '1'); // 0: Shafi, 1: Hanafi
  const [calcMethod, setCalcMethod] = useState(() => localStorage.getItem('calcMethod') || '3'); // 3: Muslim World League

  useEffect(() => {
    localStorage.setItem('asrMethod', asrMethod);
  }, [asrMethod]);

  useEffect(() => {
    localStorage.setItem('calcMethod', calcMethod);
  }, [calcMethod]);

  const addMinutes = (time: string, mins: number) => addMinutesStatic(time, mins);

  const naflTimes = useMemo(() => {
    if (Object.keys(prayerTimes).length === 0) return null;
    const cleanFajr = normalizePrayerTime(prayerTimes.Fajr);
    const cleanSunrise = normalizePrayerTime(prayerTimes.Sunrise);
    const cleanDhuhr = normalizePrayerTime(prayerTimes.Dhuhr);
    const cleanMaghrib = normalizePrayerTime(prayerTimes.Maghrib);
    const cleanIsha = normalizePrayerTime(prayerTimes.Isha);

    return {
      tahajjud: `${cleanIsha} - ${cleanFajr}`,
      ishraq: `${addMinutes(cleanSunrise, 15)} - ${addMinutes(cleanSunrise, 45)}`,
      chast: `${addMinutes(cleanSunrise, 45)} - ${addMinutes(cleanDhuhr, -15)}`,
      awwabin: `${cleanMaghrib} - ${cleanIsha}`
    };
  }, [prayerTimes]);

  const prohibitedTimes = useMemo(() => {
    if (Object.keys(prayerTimes).length === 0) return null;
    const sunsetEnd = getSunsetProhibitedEnd(prayerTimes);
    return {
      sunrise: `${prayerTimes.Sunrise} - ${addMinutes(prayerTimes.Sunrise, 15)}`,
      noon: `${addMinutes(prayerTimes.Dhuhr, -10)} - ${prayerTimes.Dhuhr}`,
      sunset: `${prayerTimes.Sunset || prayerTimes.Maghrib} - ${sunsetEnd}`
    };
  }, [prayerTimes]);

  const currentPrayerWindow = useMemo(() => {
    if (Object.keys(prayerTimes).length === 0) return null;
    
    const now = currentTimeStr;
    
    // Check prohibited times first
    const sunsetStart = prayerTimes.Sunset || prayerTimes.Maghrib;
    const sunsetEnd = getSunsetProhibitedEnd(prayerTimes);

    const isSunriseProhibited = now >= prayerTimes.Sunrise && now <= addMinutes(prayerTimes.Sunrise, 15);
    const isNoonProhibited = now >= addMinutes(prayerTimes.Dhuhr, -10) && now <= prayerTimes.Dhuhr;
    const isSunsetProhibited = now >= sunsetStart && now < sunsetEnd;

    if (isSunriseProhibited) {
      return { name: 'Prohibited Time', start: prayerTimes.Sunrise, end: addMinutes(prayerTimes.Sunrise, 15) };
    }
    if (isNoonProhibited) {
      return { name: 'Prohibited Time', start: addMinutes(prayerTimes.Dhuhr, -10), end: prayerTimes.Dhuhr };
    }
    if (isSunsetProhibited) {
      return { name: 'Prohibited Time', start: sunsetStart, end: sunsetEnd };
    }

    const times = [
      { name: 'Fajr', start: prayerTimes.Fajr, end: prayerTimes.Sunrise },
      { name: 'Waiting for Dhuhr', start: addMinutes(prayerTimes.Sunrise, 15), end: addMinutes(prayerTimes.Dhuhr, -10) },
      { name: 'Dhuhr', start: prayerTimes.Dhuhr, end: prayerTimes.Asr },
      { name: 'Asr', start: prayerTimes.Asr, end: sunsetStart },
      { name: 'Waiting for Maghrib', start: sunsetEnd, end: prayerTimes.Maghrib },
      { name: 'Maghrib', start: prayerTimes.Maghrib, end: prayerTimes.Isha },
      { name: 'Isha', start: prayerTimes.Isha, end: prayerTimes.Fajr }
    ];

    if (now >= prayerTimes.Isha || now < prayerTimes.Fajr) {
      return { name: 'Isha', start: prayerTimes.Isha, end: prayerTimes.Fajr };
    }
    
    for (let i = 0; i < times.length - 1; i++) {
      if (now >= times[i].start && now < times[i].end) {
        return times[i];
      }
    }
    
    return null;
  }, [prayerTimes, currentTimeStr]);

  const fetchPrayerTimes = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsPrayerLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const today = getLocalDateString();
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const url = new URL(`https://api.aladhan.com/v1/timings/${today}`);
          url.searchParams.set('latitude', String(latitude));
          url.searchParams.set('longitude', String(longitude));
          url.searchParams.set('method', String(calcMethod));
          url.searchParams.set('school', String(asrMethod));
          if (timezone) url.searchParams.set('timezonestring', timezone);

          const res = await fetch(url.toString());
          const data = await res.json();
          if (data.code === 200 && data?.data?.timings) {
            setPrayerTimes(normalizePrayerTimings(data.data.timings));
          } else {
            alert("Failed to fetch prayer times from API.");
          }
        } catch (err) {
          console.error("Failed to fetch prayer times", err);
          alert("Network error while fetching prayer times.");
        } finally {
          setIsPrayerLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsPrayerLoading(false);
        let msg = "Failed to get your location.";
        if (error.code === 1) msg = "Location permission denied. Please enable it in your browser settings.";
        else if (error.code === 2) msg = "Location unavailable.";
        else if (error.code === 3) msg = "Location request timed out.";
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
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
      target: manualDhikr.target || 0,
      badge: "Custom",
      sectionId: manualDhikr.sectionId || selectedSectionId
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

  const handleEditCustom = (item: DhikrItem) => {
    setManualDhikr({
      title: typeof item.title === 'string' ? item.title : item.title.en,
      arabic: item.arabic,
      trn: typeof item.trn === 'string' ? item.trn : item.trn.en,
      meaning: typeof item.meaning === 'string' ? item.meaning : item.meaning.en,
      benefit: typeof item.benefit === 'string' ? item.benefit : item.benefit.en,
      target: item.target,
      sectionId: item.sectionId || 'default'
    });
    setEditingItemId(item.id);
    setIsManualModalOpen(true);
  };


  const fetchSurahAsDhikrItem = async (surahId: string, sectionId?: string): Promise<DhikrItem | null> => {
    const surahInfo = ALL_SURAHS.find((s) => s.id.toString() === surahId);
    if (!surahInfo) return null;

    const [resAr, resEn, resBn] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${surahInfo.id}`),
      fetch(`https://api.alquran.cloud/v1/surah/${surahInfo.id}/en.sahih`),
      fetch(`https://api.alquran.cloud/v1/surah/${surahInfo.id}/bn.bengali`),
    ]);

    const [dataAr, dataEn, dataBn] = await Promise.all([resAr.json(), resEn.json(), resBn.json()]);

    const arabicText = dataAr?.data?.ayahs?.map((a: any) => a.text).join('\n') || '';
    const englishText = dataEn?.data?.ayahs?.map((a: any) => a.text).join('\n') || '';
    const bengaliText = dataBn?.data?.ayahs?.map((a: any) => a.text).join('\n') || '';

    return {
      step: 4,
      id: `surah_${surahInfo.id}_${Date.now()}`,
      target: 1,
      title: { en: surahInfo.en, bn: surahInfo.bn },
      arabic: arabicText,
      trn: { en: englishText, bn: englishText },
      meaning: { en: englishText, bn: bengaliText },
      benefit: { en: 'Reciting the Quran brings immense rewards.', bn: 'কুরআন তিলাওয়াত করলে অনেক সওয়াব পাওয়া যায়।' },
      badge: 'Surah',
      sectionId: sectionId || selectedSectionId,
    };
  };

  const askAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiSuggestion(null);

    try {
      const prompt = aiPrompt.trim();
      const tokens = tokenizePrompt(prompt);

      const localMatches = DHIKR_DATA
        .filter((item) => item.arabic || item.trn || item.meaning || item.benefit)
        .map((item) => {
          const searchable = [
            typeof item.title === 'string' ? item.title : `${item.title?.en || ''} ${item.title?.bn || ''}`,
            typeof item.trn === 'string' ? item.trn : `${item.trn?.en || ''} ${item.trn?.bn || ''}`,
            typeof item.meaning === 'string' ? item.meaning : `${item.meaning?.en || ''} ${item.meaning?.bn || ''}`,
            typeof item.benefit === 'string' ? item.benefit : `${item.benefit?.en || ''} ${item.benefit?.bn || ''}`,
            Array.isArray(item.cat) ? item.cat.join(' ') : ''
          ].join(' ');

          let score = scorePromptAgainstText(tokens, searchable);
          const promptLower = prompt.toLowerCase();
          if (/stress|anx|sad|hard|pain|worry|depress|fear|tension/.test(promptLower) && /worry|stress|hardship|peace|protection|forgiveness|anxiety|sadness/i.test(searchable)) score += 4;
          if (/learn|study|exam|knowledge|ilm/.test(promptLower) && /knowledge|learn|guidance|quran/i.test(searchable)) score += 4;
          if (/health|sick|heal|shifa|ill/.test(promptLower) && /healing|health|shifa|illness/i.test(searchable)) score += 4;
          if (/rizq|money|job|business|income/.test(promptLower) && /rizq|provision|wealth|barakah/i.test(searchable)) score += 4;
          if (/sleep|night|insomnia/.test(promptLower) && /sleep|night/i.test(searchable)) score += 4;
          return { item, score };
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score);

      const surahMatch = ALL_SURAHS.find((s) => {
        const surahName = s.en.toLowerCase();
        return prompt.toLowerCase().includes(surahName) || prompt.toLowerCase().includes(`surah ${surahName}`);
      });

      if (surahMatch) {
        setAiSuggestion({
          title: `Surah ${surahMatch.en}`,
          arabic: '',
          trn: surahMatch.en,
          meaning: 'Recommended from Quran',
          benefit: 'Matched locally from the Quran list.',
          target: 1
        });
        return;
      }

      const bestMatch = localMatches[0]?.item;
      if (bestMatch) {
        setAiSuggestion({
          title: typeof bestMatch.title === 'string' ? bestMatch.title : (bestMatch.title?.en || ''),
          arabic: bestMatch.arabic || '',
          trn: typeof bestMatch.trn === 'string' ? bestMatch.trn : (bestMatch.trn?.en || ''),
          meaning: typeof bestMatch.meaning === 'string' ? bestMatch.meaning : (bestMatch.meaning?.en || ''),
          benefit: typeof bestMatch.benefit === 'string' ? bestMatch.benefit : (bestMatch.benefit?.en || ''),
          target: bestMatch.target || 0
        });
        return;
      }

      const fallbackSuggestion = {
        title: 'Astaghfirullah',
        arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ',
        trn: 'Astaghfirullah',
        meaning: 'I seek forgiveness from Allah.',
        benefit: 'A simple, authentic dhikr for nearly every state when you need a starting point.',
        target: 33
      };
      setAiSuggestion(fallbackSuggestion);
    } catch (error) {
      console.error("AI Suggestion Error:", error);
      alert("Sorry, I couldn't find a suggestion right now. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const addAiSuggestion = async () => {
    if (!aiSuggestion) return;

    try {
      const titleText = typeof aiSuggestion.title === 'string' ? aiSuggestion.title : (aiSuggestion.title?.en || '');
      const matchedSurah = ALL_SURAHS.find(s =>
        titleText.toLowerCase().includes(s.en.toLowerCase()) ||
        titleText.toLowerCase().includes(`surah ${s.en.toLowerCase()}`) ||
        aiPrompt.toLowerCase().includes(s.en.toLowerCase())
      );

      if (matchedSurah) {
        const surahItem = await fetchSurahAsDhikrItem(String(matchedSurah.id), selectedSectionId);
        if (surahItem) {
          setCustomItems(prev => [surahItem, ...prev]);
          setIsAiModalOpen(false);
          setAiSuggestion(null);
          setAiPrompt('');
          setActiveTab(2);
          return;
        }
      }

      const newItem: DhikrItem = {
        ...(aiSuggestion as DhikrItem),
        step: 4,
        id: `ai_${Date.now()}`,
        target: (aiSuggestion as any).target || 0,
        badge: 'AI Suggestion',
        sectionId: selectedSectionId,
        arabic: (aiSuggestion as any).arabic || '',
      };
      setCustomItems(prev => [newItem, ...prev]);
      setIsAiModalOpen(false);
      setAiSuggestion(null);
      setAiPrompt('');
      setActiveTab(2);
    } catch (error) {
      console.error('Failed to add AI suggestion:', error);
      alert('Could not add that suggestion. Please try again.');
    }
  };

  const handleSaveSection = () => {
    if (!newSectionName.en && !newSectionName.bn) return;
    
    const name = { 
      en: newSectionName.en || newSectionName.bn, 
      bn: newSectionName.bn || newSectionName.en 
    };

    if (isEditingSection && editingSectionId) {
      setPersonalSections(prev => prev.map(s => 
        s.id === editingSectionId ? { ...s, name } : s
      ));
    } else {
      const newSection = {
        id: `section_${Date.now()}`,
        name
      };
      setPersonalSections(prev => [...prev, newSection]);
    }
    setIsSectionModalOpen(false);
    setIsEditingSection(false);
    setEditingSectionId(null);
    setNewSectionName({ en: "", bn: "" });
  };

  const handleEditSection = (section: any) => {
    setNewSectionName(section.name);
    setEditingSectionId(section.id);
    setIsEditingSection(true);
    setIsSectionModalOpen(true);
  };

  const handleAddSurah = async (surahId: string, sectionId?: string) => {
    if (!surahId) return;
    setIsFetchingSurah(true);

    try {
      const newItem = await fetchSurahAsDhikrItem(surahId, sectionId);
      if (newItem) {
        setCustomItems(prev => [newItem, ...prev]);
        setIsSurahModalOpen(false);
        return;
      }

      const surah = DHIKR_DATA.find(d => d.id === surahId);
      if (surah) {
        const copied: DhikrItem = {
          ...surah,
          id: `surah_copy_${Date.now()}`,
          step: 4,
          badge: 'Surah',
          sectionId: sectionId || selectedSectionId
        };
        setCustomItems(prev => [copied, ...prev]);
        setIsSurahModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to fetch surah:', error);
      alert('Could not load surah data. Please try again.');
    } finally {
      setIsFetchingSurah(false);
    }
  };


  const handleDeleteSection = (_sectionId: string) => {};

  const step1Items = useMemo(() => {
    const baseItems = DHIKR_DATA.filter(i => i.step === 1);
    const pinned = pinnedIds.map(id => DHIKR_DATA.find(i => i.id === id) || customItems.find(i => i.id === id)).filter(Boolean) as DhikrItem[];
    const uniqueItems = [...baseItems];
    pinned.forEach(p => {
      if (!uniqueItems.some(i => i.id === p.id)) {
        uniqueItems.push(p);
      }
    });
    return uniqueItems;
  }, [pinnedIds, customItems]);
  const currentCounts = counts[currentDate] || {};

  const nextPrayer = useMemo(() => {
    if (Object.keys(prayerTimes).length === 0) return null;
    const now = currentTimeStr;
    const times = [
      { name: 'Fajr', time: prayerTimes.Fajr },
      { name: 'Dhuhr', time: prayerTimes.Dhuhr },
      { name: 'Asr', time: prayerTimes.Asr },
      { name: 'Maghrib', time: prayerTimes.Maghrib },
      { name: 'Isha', time: prayerTimes.Isha }
    ];
    
    for (const p of times) {
      if (p.time > now) return p;
    }
    return { name: 'Fajr', time: prayerTimes.Fajr, isTomorrow: true };
  }, [prayerTimes, currentTimeStr]);

  const routineItems = useMemo(() => {
    const core = ADHKAR_ROUTINE.afterSalahCore.map(id => DHIKR_DATA.find(i => i.id === id)).filter(Boolean) as DhikrItem[];
    const optional = ADHKAR_ROUTINE.afterSalahOptional.map(id => DHIKR_DATA.find(i => i.id === id)).filter(Boolean) as DhikrItem[];
    const protection = ADHKAR_ROUTINE.protection.map(id => DHIKR_DATA.find(i => i.id === id)).filter(Boolean) as DhikrItem[];
    return { core, optional, protection };
  }, []);

  const routineProgress = useMemo(() => {
    const allIds = [...ADHKAR_ROUTINE.afterSalahCore, ...ADHKAR_ROUTINE.afterSalahOptional, ...ADHKAR_ROUTINE.protection];
    const doneCount = allIds.filter(id => {
      const item = DHIKR_DATA.find(i => i.id === id);
      if (!item) return false;
      const target = customTargets[id] ?? item.target;
      return (currentCounts[id] || 0) >= target;
    }).length;
    return Math.round((doneCount / allIds.length) * 100);
  }, [currentCounts, customTargets]);

  const isRoutineCompleted = useMemo(() => {
    return ADHKAR_ROUTINE.afterSalahCore.every(id => {
      const item = DHIKR_DATA.find(i => i.id === id);
      if (!item) return true;
      const target = customTargets[id] ?? item.target;
      return (currentCounts[id] || 0) >= target;
    });
  }, [currentCounts, customTargets]);

  const handleResetRoutine = () => {
    const allRoutineIds = [...ADHKAR_ROUTINE.afterSalahCore, ...ADHKAR_ROUTINE.afterSalahOptional, ...ADHKAR_ROUTINE.protection];
    setCounts(prev => {
      const newDayCounts = { ...(prev[currentDate] || {}) };
      allRoutineIds.forEach(id => {
        newDayCounts[id] = 0;
      });
      return { ...prev, [currentDate]: newDayCounts };
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const step1DoneCount = useMemo(() => 
    routineItems.core.filter(i => (currentCounts[i.id] || 0) >= (customTargets[i.id] ?? i.target)).length, 
  [currentCounts, routineItems.core, customTargets]);
  const step1Progress = Math.round((step1DoneCount / routineItems.core.length) * 100) || 0;

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getMinutesToNext = () => {
    if (!nextPrayer) return 0;
    const [nextH, nextM] = nextPrayer.time.split(':').map(Number);
    let diff = (nextH * 60 + nextM) - (now.getHours() * 60 + now.getMinutes());
    if (diff < 0) {
      diff += 24 * 60;
    }
    return diff;
  };

  const minsToNext = getMinutesToNext();
  const hoursToNext = Math.floor(minsToNext / 60);
  const minsRemaining = minsToNext % 60;
  const timeStringEn = hoursToNext > 0 ? `${hoursToNext}h ${minsRemaining}m` : `${minsRemaining} min`;
  const timeStringBn = hoursToNext > 0 ? `${hoursToNext} ঘণ্টা ${minsRemaining} মিনিট` : `${minsRemaining} মিনিট`;

  const fallbackCurrentPrayerName = nextPrayer?.name === 'Fajr' ? 'Isha' : (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'][['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].indexOf(nextPrayer?.name || '') - 1] || 'Isha');
  const currentPrayerName = currentPrayerWindow?.name && currentPrayerWindow.name !== 'Prohibited Time'
    ? currentPrayerWindow.name
    : fallbackCurrentPrayerName;

  const isSunriseBlocked = currentPrayerWindow?.name === 'Prohibited Time' && currentPrayerWindow.start === prayerTimes.Sunrise;
  const isNoonBlocked = currentPrayerWindow?.name === 'Prohibited Time' && currentPrayerWindow.end === prayerTimes.Dhuhr;
  const sunsetStartForStatus = prayerTimes.Sunset || prayerTimes.Maghrib;
  const isSunsetBlocked = currentPrayerWindow?.name === 'Prohibited Time' && currentPrayerWindow.start === sunsetStartForStatus;
  const isWaitingForDhuhr = currentPrayerName === 'Waiting for Dhuhr' || isSunriseBlocked;
  const isWaitingForMaghrib = currentPrayerName === 'Waiting for Maghrib' || isSunsetBlocked;

  let displayCurrentPrayerEn = currentPrayerName;
  let displayCurrentPrayerBn = getLocalizedText(currentPrayerName);

  if (isWaitingForDhuhr) {
    displayCurrentPrayerEn = 'Waiting for Dhuhr';
    displayCurrentPrayerBn = getLocalizedText('Waiting for Dhuhr');
  } else if (isNoonBlocked) {
    displayCurrentPrayerEn = 'Dhuhr';
    displayCurrentPrayerBn = getLocalizedText('Dhuhr');
  } else if (isWaitingForMaghrib) {
    displayCurrentPrayerEn = 'Waiting for Maghrib';
    displayCurrentPrayerBn = getLocalizedText('Waiting for Maghrib');
  } else if (currentPrayerName === 'Isha') {
    displayCurrentPrayerEn = 'Isha/Tahajjud';
    displayCurrentPrayerBn = 'এশা/তাহাজ্জুদ';
  }

  const statusEn = (currentPrayerWindow?.name === 'Prohibited Time' || isWaitingForDhuhr || isWaitingForMaghrib)
    ? 'waiting'
    : (isRoutineCompleted ? 'completed' : 'in progress');
  const statusBn = (currentPrayerWindow?.name === 'Prohibited Time' || isWaitingForDhuhr || isWaitingForMaghrib)
    ? 'অপেক্ষায়'
    : (isRoutineCompleted ? 'সম্পন্ন' : 'চলছে');

  const getLocalizedCategory = (cat: string) => {
    const label = CATEGORY_LABELS[cat] || { en: cat, bn: cat };
    return language === 'bn' ? label.bn : label.en;
  };

  const categories = useMemo(() => {
    const step2Items = DUA_DATA.filter(i => i.step === 2);
    const uniqueCats = Array.from(new Set(step2Items.flatMap(i => i.cat || [])));
    
    return uniqueCats.sort((a, b) => {
      const indexA = DUA_CATEGORIES.indexOf(a);
      const indexB = DUA_CATEGORIES.indexOf(b);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
  }, []);

  const filteredDuaItems = useMemo(() => {
    const step2Items = DHIKR_DATA.filter(i => i.step === 2);
    const q = duaSearchQuery.toLowerCase().trim();
    return step2Items.filter(item => {
      const haystack = [
        getLocalizedText(item.title),
        getLocalizedText(item.meaning),
        getLocalizedText(item.trn),
        item.arabic || '',
        item.source || '',
        item.ref || '',
        ...(item.tags || []),
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
      byId.set(item.id, { ...item, sectionId: 'all' });
    });
    return Array.from(byId.values()).filter(item => {
      const matchesSearch = personalSearchQuery === '' ||
        getLocalizedText(item.title).toLowerCase().includes(personalSearchQuery.toLowerCase()) ||
        getLocalizedText(item.meaning).toLowerCase().includes(personalSearchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [personalSearchQuery, customItems, favorites, language]);

  const itemMap = useMemo(() => {
    const map: Record<string, { id: string; title?: unknown }> = {};
    [...ADHKAR_DATA, ...DUA_DATA, ...customItems].forEach((item) => {
      map[item.id] = { id: item.id, title: item.title };
    });
    return map;
  }, [customItems]);

  const journeyStats = useMemo(() => buildJourneyStats(counts, itemMap, lifetimeCounts), [counts, itemMap, lifetimeCounts]);

  const focusSequence = useMemo(() => {
    if (activeTab === 0) {
      const pinned = pinnedIds.map(id => [...DHIKR_DATA, ...customItems].find(i => i.id === id)).filter(Boolean) as DhikrItem[];
      const map = new Map<string, DhikrItem>();
      [...routineItems.core, ...routineItems.protection, ...pinned].forEach(item => map.set(item.id, item));
      return Array.from(map.values());
    }
    if (activeTab === 1) return filteredDuaItems;
    if (activeTab === 2) return filteredPersonalItems;
    return [];
  }, [activeTab, routineItems, pinnedIds, customItems, filteredDuaItems, filteredPersonalItems]);

  const focusIndex = useMemo(() => focusItem ? focusSequence.findIndex(i => i.id === focusItem.id) : -1, [focusItem, focusSequence]);

  const step3Items = useMemo(() => DHIKR_DATA.filter(i => i.step === 3), []);

  const todaysDua = useMemo(() => {
    const today = new Date(currentDate);
    // Use the date to select a consistent random item from step 2 (supplications)
    const step2Items = DHIKR_DATA.filter(i => i.step === 2);
    const index = Math.floor(today.getTime() / 86400000) % step2Items.length;
    return step2Items[index];
  }, [currentDate]);

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
                  {getLocalizedText('Assalamu Alaikum')}{userName ? `, ${userName}` : ''}
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
      {/* Current Prayer Window Bar */}
      {activeTab === 0 ? (
        <div className="bg-card border-b border-border px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-3xl p-6 border border-border shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={80} className="text-gold" />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-text-main mb-1">
                      {getLocalizedText({ 
                        en: `${displayCurrentPrayerEn} ${statusEn}`, 
                        bn: `${displayCurrentPrayerBn} ${statusBn}` 
                      })}
                    </h2>
                    <p className="text-xs text-text-main/40 font-bold uppercase tracking-widest">
                      {getLocalizedText({ 
                        en: `Next: ${nextPrayer?.name || '...'} in ${timeStringEn}`, 
                        bn: `পরবর্তী: ${getLocalizedText(nextPrayer?.name || '...')} ${timeStringBn} পর` 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gold">{step1Progress}%</span>
                  </div>
                </div>
                <ProgressBar progress={step1Progress} height={8} />
                
                {isRoutineCompleted && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-bg">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gold">
                          {getLocalizedText({ en: 'Alhamdulillah!', bn: 'আলহামদুলিল্লাহ!' })}
                        </p>
                        <p className="text-[10px] text-gold/60 uppercase tracking-widest font-bold">
                          {getLocalizedText({ en: 'Routine Completed', bn: 'রুটিন সম্পন্ন হয়েছে' })}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={handleResetRoutine}
                      className="p-2 hover:bg-gold/10 rounded-xl transition-colors text-gold"
                    >
                      <RotateCcw size={20} />
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border-b border-border px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            {currentPrayerWindow ? (
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${currentPrayerWindow.name === 'Prohibited Time' ? 'bg-red-500/10 text-red-500' : 'bg-gold/10 text-gold'}`}>
                  <Clock size={18} />
                </div>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${currentPrayerWindow.name === 'Prohibited Time' ? 'text-red-500' : 'text-text-muted'}`}>
                    {currentPrayerWindow.name === 'Prohibited Time' ? getLocalizedText('Prohibited Time') : getLocalizedText('Current Prayer')}
                  </span>
                  <span className="text-sm font-bold text-text-main">
                    {getLocalizedText(currentPrayerWindow.name)} {currentPrayerWindow.start && `${formatTime(currentPrayerWindow.start)} ${getLocalizedText('to')} ${formatTime(currentPrayerWindow.end)}`}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-text-muted italic">{getLocalizedText('Prayer times not set')}</span>
            )}
            <button 
              onClick={fetchPrayerTimes}
              disabled={isPrayerLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gold/20 transition-colors whitespace-nowrap ml-4 disabled:opacity-50"
            >
              {isPrayerLoading ? <Loader2 className="animate-spin" size={12} /> : <MapPin size={12} />}
              {Object.keys(prayerTimes).length > 0 ? getLocalizedText('Update') : getLocalizedText('Get Times')}
            </button>
          </div>
        </div>
      )}

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
              todaysDua={todaysDua}
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
              onManualAdd={() => { setEditingItemId(null); setManualDhikr({ title: '', arabic: '', trn: '', meaning: '', benefit: '', target: 33, sectionId: 'all' }); setIsManualModalOpen(true); }}
              onAskAi={() => setIsAiModalOpen(true)}
              onAddSurah={() => setIsSurahModalOpen(true)}
              isFavorite={(id) => favorites.includes(id)}
              onFavorite={toggleFavorite}
              onFocus={setFocusItem}
              language={language}
              isPinned={(id) => pinnedIds.includes(id)}
              onTogglePin={togglePin}
            />
          )}

          {activeTab === 3 && (
            <MoreScreen
              getLocalizedText={getLocalizedText}
              prayerTimes={prayerTimes}
              calcMethod={parseInt(calcMethod)}
              setCalcMethod={(m) => setCalcMethod(m.toString())}
              asrMethod={parseInt(asrMethod)}
              setAsrMethod={(m) => setAsrMethod(m.toString())}
              onFetchPrayerTimes={fetchPrayerTimes}
              isPrayerLoading={isPrayerLoading}
              theme={currentTheme}
              onThemeChange={setCurrentTheme}
              language={language}
              onLanguageChange={setLanguage}
              isSoundOn={isSoundEnabled}
              setIsSoundOn={setIsSoundEnabled}
              isHapticOn={isHapticEnabled}
              setIsHapticOn={setIsHapticEnabled}
              timeFormat={isAmPm ? '12h' : '24h'}
              setTimeFormat={(f) => setIsAmPm(f === '12h')}
              formatTime={formatTime}
              naflTimes={naflTimes}
              prohibitedTimes={prohibitedTimes}
              userName={userName}
              setUserName={setUserName}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              journeyStats={journeyStats}
              itemMap={itemMap}
              supportEmail="support@moizit.com"
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
                    onClick={() => {
                      if (isManualModalOpen) window.history.back();
                    }}
                    className="text-text-muted hover:text-text-main"
                  >
                    <Plus size={24} className="rotate-45" />
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
                    <label className="block text-[10px] font-bold text-text-sub uppercase mb-1">{getLocalizedText('Benefit / Source')}</label>
                    <input 
                      type="text"
                      value={manualDhikr.benefit}
                      onChange={(e) => setManualDhikr(prev => ({ ...prev, benefit: e.target.value }))}
                      className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text-main outline-none focus:border-gold"
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
                    <label className="block text-[10px] font-bold text-text-sub uppercase mb-1">{getLocalizedText({ en: 'Section', bn: 'সেকশন' })}</label>
                    <select 
                      value={manualDhikr.sectionId}
                      onChange={(e) => setManualDhikr(prev => ({ ...prev, sectionId: e.target.value }))}
                      className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text-main outline-none focus:border-gold"
                    >
                      {personalSections.map(s => (
                        <option key={s.id} value={s.id}>{getLocalizedText(s.name)}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={() => {
                      handleManualAdd();
                      if (isManualModalOpen) window.history.back();
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

      {/* AI Modal */}
      <AnimatePresence>
        {isAiModalOpen && (
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
              className="bg-card border border-border w-full max-w-md rounded-3xl overflow-hidden shadow-2xl my-8"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gold flex items-center gap-2">
                    <Sparkles size={20} />
                    {getLocalizedText('Spiritual Assistant')}
                  </h2>
                  <button 
                    onClick={() => {
                      if (isAiModalOpen) window.history.back();
                    }}
                    className="text-text-muted hover:text-text-main"
                  >
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-text-sub">{getLocalizedText('How are you feeling today? You can ask for a specific Surah or Dua to be added to your list, or seek general guidance.')}</p>
                  <div className="relative">
                    <textarea 
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder={getLocalizedText("e.g., I'm feeling stressed about my work, or 'Add Surah Al-Mulk'")}
                      className="w-full bg-bg border border-border rounded-2xl p-4 text-sm text-text-main focus:border-gold outline-none min-h-[100px] resize-none"
                    />
                    <button 
                      onClick={askAi}
                      disabled={isAiLoading || !aiPrompt.trim()}
                      className="absolute bottom-3 right-3 p-2 bg-gold text-bg rounded-xl disabled:opacity-50 transition-all"
                      title={getLocalizedText('Ask Assistant')}
                    >
                      {isAiLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                  </div>
                </div>

                {aiSuggestion && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 bg-gold/5 border-2 border-gold/30 rounded-3xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2 bg-gold/10 rounded-bl-2xl">
                      <Sparkles size={16} className="text-gold" />
                    </div>
                    <h4 className="font-bold text-lg text-gold mb-3">{aiSuggestion.title}</h4>
                    <div className="space-y-4">
                      <p className="arabic-text text-2xl text-right leading-relaxed text-text-arabic">{aiSuggestion.arabic}</p>
                      <p className="text-sm text-text-sub italic leading-relaxed">{aiSuggestion.meaning}</p>
                      
                      <div className="pt-4 border-t border-gold/10">
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-text-muted mb-2">
                          {getLocalizedText({ en: 'Add to Section', bn: 'সেকশনে যোগ করুন' })}
                        </label>
                        <select 
                          value={selectedSectionId}
                          onChange={(e) => setSelectedSectionId(e.target.value)}
                          className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-main outline-none focus:border-gold"
                        >
                          {personalSections.map(s => (
                            <option key={s.id} value={s.id}>{getLocalizedText(s.name)}</option>
                          ))}
                        </select>
                      </div>

                      <button 
                        onClick={() => {
                          addAiSuggestion();
                          if (isAiModalOpen) window.history.back();
                        }}
                        className="w-full py-3 bg-gold text-bg font-bold rounded-2xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                      >
                        <Plus size={18} />
                        {getLocalizedText({ en: 'Add to My Collection', bn: 'আমার সংগ্রহে যোগ করুন' })}
                      </button>
                    </div>
                  </motion.div>
                )}
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
                  onClick={() => {
                    if (confirmDialog.isOpen) window.history.back();
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-text-muted hover:text-text-main transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleConfirm();
                    if (confirmDialog.isOpen) window.history.back();
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
                    onClick={() => {
                      if (targetModal.isOpen) window.history.back();
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-text-muted hover:text-text-main transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      handleSaveTarget();
                      if (targetModal.isOpen) window.history.back();
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
                      onClick={() => {
                        if (isSurahModalOpen) window.history.back();
                      }}
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
                            if (isSurahModalOpen) window.history.back();
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

      {/* Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        getLocalizedText={getLocalizedText} 
      />

      <AnimatePresence>
        {isOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] overflow-y-auto bg-bg"
          >
            <div className="min-h-full flex items-center justify-center p-6">
              <div className="max-w-md w-full space-y-8 text-center my-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center">
                  <Sparkles size={40} className="text-gold" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-text-main">Welcome</h2>
                <p className="text-text-sub">Let's personalize your spiritual journey.</p>
              </div>
              
              <div className="space-y-4">
                <div className="text-left">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Your Name</label>
                  <input 
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full bg-card border border-border rounded-2xl py-4 px-6 text-lg text-text-main outline-none focus:border-gold transition-all"
                  />
                </div>

                <div className="text-left">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Language</label>
                  <select 
                    value={language} 
                    onChange={e => setLanguage(e.target.value as 'en' | 'bn')} 
                    className="w-full bg-card border border-border rounded-xl p-3 text-sm text-text-main focus:border-gold outline-none appearance-none"
                  >
                    <option value="en">English</option>
                    <option value="bn">Bangla (বাংলা)</option>
                  </select>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Appearance & App</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'light', label: 'Light Mode', active: !isDarkMode, action: () => { setIsDarkMode(false); setCurrentTheme('emerald'); } },
                      { id: 'dark', label: 'Dark Mode', active: isDarkMode && currentTheme === 'emerald', action: () => { setIsDarkMode(true); setCurrentTheme('emerald'); } },
                      { id: 'midnight', label: 'Midnight', active: isDarkMode && currentTheme === 'midnight', action: () => { setIsDarkMode(true); setCurrentTheme('midnight'); } },
                      { id: 'royal', label: 'Royal', active: isDarkMode && currentTheme === 'royal', action: () => { setIsDarkMode(true); setCurrentTheme('royal'); } },
                      { id: 'maroon', label: 'Maroon', active: isDarkMode && currentTheme === 'maroon', action: () => { setIsDarkMode(true); setCurrentTheme('maroon'); } },
                      { id: 'sand', label: 'Sand', active: isDarkMode && currentTheme === 'sand', action: () => { setIsDarkMode(true); setCurrentTheme('sand'); } },
                    ].map((preset) => (
                      <button key={preset.id} onClick={preset.action} className={`py-3 rounded-xl border font-bold transition-all ${preset.active ? 'border-gold bg-gold/10 text-gold' : 'border-border bg-card text-text-main'}`}>
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-left">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Calculation Method</label>
                  <select 
                    value={calcMethod} 
                    onChange={e => setCalcMethod(e.target.value)} 
                    className="w-full bg-card border border-border rounded-xl p-3 text-sm text-text-main focus:border-gold outline-none appearance-none"
                  >
                    <option value="2">ISNA (North America)</option>
                    <option value="1">Karachi (Islamic Foundation)</option>
                    <option value="3">Muslim World League</option>
                    <option value="4">Umm Al-Qura (Makkah)</option>
                  </select>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Asr Time Method</label>
                  <select 
                    value={asrMethod} 
                    onChange={e => setAsrMethod(e.target.value)} 
                    className="w-full bg-card border border-border rounded-xl p-3 text-sm text-text-main focus:border-gold outline-none appearance-none"
                  >
                    <option value="0">Standard (Shafi, Maliki, Hanbali)</option>
                    <option value="1">Hanafi</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Sound</label>
                    <button
                      onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                      className={`w-full py-3 rounded-xl border ${isSoundEnabled ? 'border-gold bg-gold/10 text-gold' : 'border-border bg-card text-text-main'} font-bold transition-all flex items-center justify-center gap-2`}
                    >
                      {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      {isSoundEnabled ? 'On' : 'Off'}
                    </button>
                  </div>
                  <div className="text-left">
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Haptic</label>
                    <button
                      onClick={() => setIsHapticEnabled(!isHapticEnabled)}
                      className={`w-full py-3 rounded-xl border ${isHapticEnabled ? 'border-gold bg-gold/10 text-gold' : 'border-border bg-card text-text-main'} font-bold transition-all flex items-center justify-center gap-2`}
                    >
                      <Smartphone size={16} />
                      {isHapticEnabled ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Time Format</label>
                  <button
                    onClick={() => setIsAmPm(!isAmPm)}
                    className={`w-full py-3 rounded-xl border border-border bg-card text-text-main font-bold transition-all flex items-center justify-center gap-2`}
                  >
                    <Clock size={16} />
                    {isAmPm ? '12-Hour (AM/PM)' : '24-Hour'}
                  </button>
                </div>
                
                <button 
                  onClick={() => {
                    if (!userName.trim()) return;
                    fetchPrayerTimes();
                    setIsOnboarding(false);
                    if (Notification.permission === "default") {
                      Notification.requestPermission();
                    }
                  }}
                  disabled={!userName.trim()}
                  className="w-full py-4 bg-gold text-bg font-bold rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-50 mt-4"
                >
                  Get Started
                </button>
              </div>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSectionModalOpen && (
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
                      {isEditingSection ? <Edit2 size={20} /> : <Plus size={20} />}
                      {isEditingSection 
                        ? getLocalizedText({ en: 'Edit Section', bn: 'সেকশন সম্পাদনা করুন' }) 
                        : getLocalizedText({ en: 'New Section', bn: 'নতুন সেকশন' })}
                    </h2>
                    <button 
                      onClick={() => {
                        if (isSectionModalOpen) window.history.back();
                      }}
                      className="text-text-muted hover:text-text-main"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">
                        {getLocalizedText({ en: 'Section Name (English)', bn: 'সেকশনের নাম (ইংরেজি)' })}
                      </label>
                      <input 
                        type="text"
                        value={newSectionName.en}
                        onChange={(e) => setNewSectionName(prev => ({ ...prev, en: e.target.value }))}
                        placeholder="e.g., Morning Routine"
                        className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text-main outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">
                        {getLocalizedText({ en: 'Section Name (Bangla)', bn: 'সেকশনের নাম (বাংলা)' })}
                      </label>
                      <input 
                        type="text"
                        value={newSectionName.bn}
                        onChange={(e) => setNewSectionName(prev => ({ ...prev, bn: e.target.value }))}
                        placeholder="উদা: সকালের আমল"
                        className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text-main outline-none focus:border-gold"
                      />
                    </div>

                    <button 
                      onClick={() => {
                        handleSaveSection();
                        if (isSectionModalOpen) window.history.back();
                      }}
                      disabled={!newSectionName.en && !newSectionName.bn}
                      className="w-full py-4 bg-gold text-bg font-bold rounded-2xl shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
                    >
                      {isEditingSection 
                        ? getLocalizedText({ en: 'Save Changes', bn: 'পরিবর্তন সংরক্ষণ করুন' }) 
                        : getLocalizedText({ en: 'Create Section', bn: 'সেকশন তৈরি করুন' })}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {focusItem && (
          <FocusModeOverlay 
            item={focusItem} 
            count={currentCounts[focusItem.id] || 0}
            target={customTargets[focusItem.id] ?? focusItem.target}
            onIncrement={() => handleIncrement(focusItem.id, customTargets[focusItem.id] ?? focusItem.target)}
            onReset={() => handleResetItem(focusItem.id)}
            onPrev={focusIndex > 0 ? () => setFocusItem(focusSequence[focusIndex - 1]) : undefined}
            onNext={focusIndex >= 0 && focusIndex < focusSequence.length - 1 ? () => setFocusItem(focusSequence[focusIndex + 1]) : undefined}
            hasPrev={focusIndex > 0}
            hasNext={focusIndex >= 0 && focusIndex < focusSequence.length - 1}
            onClose={() => {
              if (focusItem) window.history.back();
            }}
            getLocalizedText={getLocalizedText}
          />
        )}
      </AnimatePresence>
    </div>
  );

}
