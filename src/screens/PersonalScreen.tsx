import React from "react";
import { Sparkles, BookOpen, Plus, Search, Heart, Pin, Trash2 } from 'lucide-react';
import { DhikrItem, LocalizedText } from '../constants';
import DhikrCard from '../components/DhikrCard';
import SearchBar from '../components/SearchBar';
import SectionBlock from '../components/SectionBlock';

interface PersonalScreenProps {
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
  counts: Record<string, number>;
  onCountChange: (id: string, target: number) => void;
  onResetItem: (id: string) => void;
  customTargets: Record<string, number>;
  onSetTarget: (item: DhikrItem) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredItems: DhikrItem[];
  onEditItem: (item: DhikrItem) => void;
  onDeleteItem: (id: string) => void;
  onManualAdd: () => void;
  onAskAi: () => void;
  onAddSurah: () => void;
  isFavorite: (id: string) => boolean;
  onFavorite: (id: string) => void;
  onFocus: (item: DhikrItem) => void;
  language: 'en' | 'bn';
  isPinned: (id: string) => boolean;
  onTogglePin: (id: string) => void;
}

const PersonalScreen: React.FC<PersonalScreenProps> = ({
  getLocalizedText,
  counts,
  onCountChange,
  onResetItem,
  customTargets,
  onSetTarget,
  searchQuery,
  onSearchChange,
  filteredItems,
  onEditItem,
  onDeleteItem,
  onManualAdd,
  onAskAi,
  onAddSurah,
  isFavorite,
  onFavorite,
  onFocus,
  language,
  isPinned,
  onTogglePin,
}) => {
  const favoriteCount = filteredItems.filter((item) => isFavorite(item.id)).length;
  const pinnedCount = filteredItems.filter((item) => isPinned(item.id)).length;
  const surahCount = filteredItems.filter((item) => String(item.id).startsWith('surah_') || String(item.id).startsWith('surah_copy_') || String(item.badge).toLowerCase() === 'surah').length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 pb-10 pt-6">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gold">{getLocalizedText({ en: 'Collection', bn: 'সংগ্রহ' })}</p>
        <h2 className="text-2xl font-bold text-text-main">{getLocalizedText({ en: 'All Saved Items', bn: 'সব সংরক্ষিত আইটেম' })}</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-sub">{getLocalizedText({ en: 'Favorites and added surahs or personal duas appear here together. No separate collections for now.', bn: 'ফেভারিট, যোগ করা সূরা এবং ব্যক্তিগত দুআ এখানে একসাথে দেখা যাবে। এখন আলাদা সংগ্রহ নেই।' })}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-bg/60 p-4"><div className="text-2xl font-bold text-text-main">{filteredItems.length}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">{getLocalizedText({ en: 'Items', bn: 'আইটেম' })}</div></div>
          <div className="rounded-2xl border border-border bg-bg/60 p-4"><div className="text-2xl font-bold text-text-main">{favoriteCount}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">{getLocalizedText({ en: 'Favorites', bn: 'ফেভারিট' })}</div></div>
          <div className="rounded-2xl border border-border bg-bg/60 p-4"><div className="text-2xl font-bold text-text-main">{pinnedCount}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">{getLocalizedText({ en: 'Pinned', bn: 'পিন' })}</div></div>
          <div className="rounded-2xl border border-border bg-bg/60 p-4"><div className="text-2xl font-bold text-text-main">{surahCount}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">{getLocalizedText({ en: 'Surahs', bn: 'সূরা' })}</div></div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button onClick={onAskAi} className="rounded-3xl border border-border bg-card p-5 text-left shadow-sm hover:border-gold/40"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/10 text-gold"><Sparkles size={18} /></div><div className="font-bold text-text-main">{getLocalizedText({ en: 'AI Suggestions', bn: 'এআই পরামর্শ' })}</div></button>
        <button onClick={onAddSurah} className="rounded-3xl border border-border bg-card p-5 text-left shadow-sm hover:border-gold/40"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/10 text-gold"><BookOpen size={18} /></div><div className="font-bold text-text-main">{getLocalizedText({ en: 'Add Surah', bn: 'সূরা যোগ করুন' })}</div></button>
        <button onClick={onManualAdd} className="rounded-3xl border border-border bg-card p-5 text-left shadow-sm hover:border-gold/40"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/10 text-gold"><Plus size={18} /></div><div className="font-bold text-text-main">{getLocalizedText({ en: 'Add Personal Dua', bn: 'ব্যক্তিগত দুআ যোগ করুন' })}</div></button>
      </section>

      <SearchBar value={searchQuery} onChange={onSearchChange} placeholder={getLocalizedText({ en: 'Search favorites, surahs, and personal duas...', bn: 'ফেভারিট, সূরা ও ব্যক্তিগত দুআ খুঁজুন...' })} />

      <SectionBlock title={{ en: 'All Section', bn: 'সব আইটেম' }} count={filteredItems.length} getLocalizedText={getLocalizedText}>
        {filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <DhikrCard
                key={item.id}
                item={item}
                count={counts[item.id] || 0}
                targetOverride={customTargets[item.id] ?? item.target}
                onIncrement={() => onCountChange(item.id, customTargets[item.id] ?? item.target)}
                onEditTarget={() => onSetTarget(item)}
                onReset={() => onResetItem(item.id)}
                getLocalizedText={getLocalizedText}
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={() => onFavorite(item.id)}
                onFocus={() => onFocus(item)}
                isPinned={isPinned(item.id)}
                onTogglePin={() => onTogglePin(item.id)}
                language={language}
                onEdit={() => onEditItem(item)}
                onDelete={() => onDeleteItem(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-bg/50 p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold"><Search size={28} /></div>
            <h3 className="text-xl font-bold text-text-main">{getLocalizedText({ en: 'Nothing saved yet', bn: 'এখনও কিছু সংরক্ষিত নেই' })}</h3>
          </div>
        )}
      </SectionBlock>
    </div>
  );
};

export default PersonalScreen;
