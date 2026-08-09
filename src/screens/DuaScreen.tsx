import React, { useState } from 'react';
import { ArrowLeft, Clock3, Heart, LayoutGrid, Search, Sparkles } from 'lucide-react';
import { DhikrItem, LocalizedText } from '../constants';
import { CATEGORY_META } from '../data/categories';
import SearchBar from '../components/SearchBar';
import CategoryGrid from '../components/CategoryGrid';
import DuaRow from '../components/DuaRow';

interface DuaScreenProps {
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  categories: string[];
  categoryCounts: Record<string, number>;
  filteredItems: DhikrItem[];
  totalCount: number;
  favoriteItems: DhikrItem[];
  recentItems: DhikrItem[];
  isFavorite: (id: string) => boolean;
  isPinned: (id: string) => boolean;
  onOpen: (item: DhikrItem, list: DhikrItem[]) => void;
}

const QuickSection: React.FC<{
  icon: React.ReactNode;
  title: LocalizedText;
  items: DhikrItem[];
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
  isFavorite: (id: string) => boolean;
  isPinned: (id: string) => boolean;
  onOpen: (item: DhikrItem, list: DhikrItem[]) => void;
}> = ({ icon, title, items, getLocalizedText, isFavorite, isPinned, onOpen }) => (
  <section className="space-y-2">
    <p className="flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-ink">
      {icon}
      {getLocalizedText(title)}
    </p>
    <div className="space-y-2">
      {items.map((item) => (
        <DuaRow
          key={item.id}
          item={item}
          getLocalizedText={getLocalizedText}
          onOpen={() => onOpen(item, items)}
          isFavorite={isFavorite(item.id)}
          isPinned={isPinned(item.id)}
        />
      ))}
    </div>
  </section>
);

/**
 * Browse first, then read.
 *
 * This screen used to render all 71 duas as fully expanded cards: a 53,000px
 * page — about 59 screens — with only 3 of 21 categories reachable without
 * scrolling a strip sideways. Finding a dua and reading one are different jobs,
 * so the list is compact and the reading happens in the full-screen reader.
 */
const DuaScreen: React.FC<DuaScreenProps> = ({
  getLocalizedText,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  categories,
  categoryCounts,
  filteredItems,
  totalCount,
  favoriteItems,
  recentItems,
  isFavorite,
  isPinned,
  onOpen
}) => {
  const [showAll, setShowAll] = useState(false);

  const hasSearch = searchQuery.trim().length > 0;
  const hasCategory = selectedCategory !== 'All';
  const isListView = hasSearch || hasCategory || showAll;

  const backToBrowse = () => {
    onSearchChange('');
    onCategorySelect('All');
    setShowAll(false);
  };

  const activeMeta = hasCategory ? CATEGORY_META[selectedCategory] : null;
  const listTitle = hasSearch
    ? getLocalizedText('Search results')
    : activeMeta
      ? getLocalizedText(activeMeta)
      : getLocalizedText('All supplications');

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-4 pb-8">
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={getLocalizedText('Search Duas...')}
      />

      {isListView ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-1">
            <button
              onClick={backToBrowse}
              aria-label={getLocalizedText('Back to categories')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-text-muted transition-all hover:border-gold/40 hover:text-gold-ink"
            >
              <ArrowLeft size={16} />
            </button>
            <h2 className="min-w-0 flex-1 truncate text-lg font-bold text-text-main">
              {activeMeta ? `${activeMeta.icon} ${listTitle}` : listTitle}
            </h2>
            <span className="shrink-0 rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gold-ink">
              {filteredItems.length}
            </span>
          </div>

          {filteredItems.length > 0 ? (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <DuaRow
                  key={item.id}
                  item={item}
                  getLocalizedText={getLocalizedText}
                  onOpen={() => onOpen(item, filteredItems)}
                  isFavorite={isFavorite(item.id)}
                  isPinned={isPinned(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-text-muted">
              <Sparkles size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-bold uppercase tracking-widest">
                {getLocalizedText('No results found')}
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {favoriteItems.length > 0 ? (
            <QuickSection
              icon={<Heart size={11} fill="currentColor" />}
              title={'Favourites'}
              items={favoriteItems.slice(0, 4)}
              getLocalizedText={getLocalizedText}
              isFavorite={isFavorite}
              isPinned={isPinned}
              onOpen={onOpen}
            />
          ) : null}

          {recentItems.length > 0 ? (
            <QuickSection
              icon={<Clock3 size={11} />}
              title={'Recently read'}
              items={recentItems.slice(0, 4)}
              getLocalizedText={getLocalizedText}
              isFavorite={isFavorite}
              isPinned={isPinned}
              onOpen={onOpen}
            />
          ) : null}

          <section className="space-y-3">
            <p className="flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-ink">
              <LayoutGrid size={11} />
              {getLocalizedText('Browse by category')}
            </p>
            <CategoryGrid
              categories={categories}
              counts={categoryCounts}
              onSelect={onCategorySelect}
              getLocalizedText={getLocalizedText}
            />
          </section>

          <button
            onClick={() => setShowAll(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 px-4 py-3.5 text-sm font-bold text-text-sub transition-all hover:border-gold/40 hover:text-gold-ink"
          >
            <Search size={15} />
            {getLocalizedText('See all')} ({totalCount})
          </button>
        </>
      )}
    </div>
  );
};

export default DuaScreen;
