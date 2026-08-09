import React from 'react';
import { BookOpen, Plus, Search, Trash2, FolderPlus, Edit2 } from 'lucide-react';
import { DhikrItem, Language, LocalizedText } from '../constants';
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
  /** Ids of items the user created — only these can be edited or deleted. */
  ownedIds: Set<string>;
  onEditItem: (item: DhikrItem) => void;
  onDeleteItem: (id: string) => void;
  onManualAdd: () => void;
  onAddSurah: () => void;
  isFavorite: (id: string) => boolean;
  onFavorite: (id: string) => void;
  onFocus: (item: DhikrItem, list: DhikrItem[]) => void;
  language: Language;
  isPinned: (id: string) => boolean;
  onTogglePin: (id: string) => void;
  sections: { id: string; name: LocalizedText }[];
  selectedSectionId: string;
  onSelectSection: (id: string) => void;
  onAddSection: () => void;
  onEditSection: (section: { id: string; name: LocalizedText }) => void;
  onDeleteSection: (id: string) => void;
  onMoveToCollection: (itemId: string, sectionId: string) => void;
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
  ownedIds,
  onEditItem,
  onDeleteItem,
  onManualAdd,
  onAddSurah,
  isFavorite,
  onFavorite,
  onFocus,
  language,
  isPinned,
  onTogglePin,
  sections,
  selectedSectionId,
  onSelectSection,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onMoveToCollection
}) => {
  const favoriteCount = filteredItems.filter((item) => isFavorite(item.id)).length;
  const pinnedCount = filteredItems.filter((item) => isPinned(item.id)).length;
  const surahCount = filteredItems.filter(
    (item) => String(item.id).startsWith('surah_') || String(item.badge).toLowerCase() === 'surah'
  ).length;

  const currentSection = sections.find((s) => s.id === selectedSectionId) || sections[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 pb-10 pt-6">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
            {getLocalizedText({ en: 'Collection', bn: 'সংগ্রহ' })}
          </p>
          {selectedSectionId !== 'all' && (
            <div className="flex gap-2">
              <button
                onClick={() => onEditSection(currentSection)}
                className="p-1.5 text-text-muted hover:text-gold transition-colors"
                aria-label={getLocalizedText({ en: 'Edit collection', bn: 'কালেকশন এডিট করুন' })}
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => onDeleteSection(selectedSectionId)}
                className="p-1.5 text-text-muted hover:text-red-400 transition-colors"
                aria-label={getLocalizedText({ en: 'Delete collection', bn: 'কালেকশন মুছুন' })}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-text-main">{getLocalizedText(currentSection.name)}</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-sub">
          {getLocalizedText({
            en: 'Organize your spiritual journey with custom collections.',
            bn: 'আপনার ইবাদতের রুটিন কালেকশন দিয়ে সাজিয়ে নিন।'
          })}
        </p>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              aria-pressed={selectedSectionId === section.id}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                selectedSectionId === section.id
                  ? 'bg-gold border-gold text-bg'
                  : 'bg-bg/40 border-border text-text-sub hover:border-gold/40'
              }`}
            >
              {getLocalizedText(section.name)}
            </button>
          ))}
          <button
            onClick={onAddSection}
            className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold bg-bg/40 border border-dashed border-border text-gold hover:border-gold/40 flex items-center gap-1.5"
          >
            <FolderPlus size={14} />
            {getLocalizedText({ en: 'New', bn: 'নতুন' })}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-bg/60 p-4">
            <div className="text-2xl font-bold text-text-main">{filteredItems.length}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              {getLocalizedText({ en: 'Items', bn: 'আইটেম' })}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-bg/60 p-4">
            <div className="text-2xl font-bold text-text-main">{favoriteCount}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              {getLocalizedText({ en: 'Favorites', bn: 'ফেভারিট' })}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-bg/60 p-4">
            <div className="text-2xl font-bold text-text-main">{pinnedCount}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              {getLocalizedText({ en: 'Pinned', bn: 'পিন' })}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-bg/60 p-4">
            <div className="text-2xl font-bold text-text-main">{surahCount}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              {getLocalizedText({ en: 'Surahs', bn: 'সূরা' })}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <button onClick={onAddSurah} className="rounded-3xl border border-border bg-card p-5 text-left shadow-sm hover:border-gold/40">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/10 text-gold">
            <BookOpen size={18} />
          </div>
          <div className="font-bold text-text-main">{getLocalizedText({ en: 'Add Surah', bn: 'সূরা যোগ করুন' })}</div>
        </button>
        <button onClick={onManualAdd} className="rounded-3xl border border-border bg-card p-5 text-left shadow-sm hover:border-gold/40">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/10 text-gold">
            <Plus size={18} />
          </div>
          <div className="font-bold text-text-main">
            {getLocalizedText({ en: 'Add Personal Dua', bn: 'ব্যক্তিগত দুআ যোগ করুন' })}
          </div>
        </button>
      </section>

      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={getLocalizedText({
          en: 'Search favorites, surahs, and personal duas...',
          bn: 'ফেভারিট, সূরা ও ব্যক্তিগত দুআ খুঁজুন...'
        })}
      />

      <SectionBlock title={currentSection.name} count={filteredItems.length} getLocalizedText={getLocalizedText}>
        {filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              // Editing a favourited built-in dua used to open the form and
              // then silently drop the changes, because the save path only
              // wrote back to the user's own items.
              const isOwned = ownedIds.has(item.id);
              return (
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
                  onFocus={() => onFocus(item, filteredItems)}
                  isPinned={isPinned(item.id)}
                  onTogglePin={() => onTogglePin(item.id)}
                  language={language}
                  onEdit={isOwned ? () => onEditItem(item) : undefined}
                  onDelete={isOwned ? () => onDeleteItem(item.id) : undefined}
                  sections={sections}
                  onMoveToCollection={(sectionId) => onMoveToCollection(item.id, sectionId)}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-bg/50 p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold">
              <Search size={28} />
            </div>
            <h3 className="text-xl font-bold text-text-main">
              {getLocalizedText({ en: 'Nothing saved yet', bn: 'এখনও কিছু সংরক্ষিত নেই' })}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-sub">
              {getLocalizedText({
                en: 'Favourite a dua, add a surah, or write your own to build this collection.',
                bn: 'কোনো দুআ ফেভারিট করুন, সূরা যোগ করুন, অথবা নিজের দুআ লিখে এই সংগ্রহ গড়ে তুলুন।'
              })}
            </p>
          </div>
        )}
      </SectionBlock>
    </div>
  );
};

export default PersonalScreen;
