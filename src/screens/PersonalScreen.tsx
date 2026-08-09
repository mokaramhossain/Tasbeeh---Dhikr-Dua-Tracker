import React from 'react';
import { BookOpen, Plus, Search, Trash2, FolderPlus, Edit2 } from 'lucide-react';
import { DhikrItem, Language, LocalizedText } from '../constants';
import DhikrCard from '../components/DhikrCard';
import SearchBar from '../components/SearchBar';
import SectionBlock from '../components/SectionBlock';
import CollectionRow, { type Collection } from '../components/CollectionRow';
import { normalizeForSearch } from '../utils/search';

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
  /** Everything saved, ignoring the collection filter. */
  savedTotal: number;
  /** How many saved items sit in each collection. */
  sectionCounts: Record<string, number>;
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
  showTransliteration?: boolean;
  showTranslation?: boolean;
  /** Categories saved whole — parents, shown above their kind of children. */
  savedCollections?: Collection[];
  readingPositions?: Record<string, number>;
  onOpenCollection?: (key: string) => void;
  onRestartCollection?: (key: string) => void;
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
  savedTotal,
  sectionCounts,
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
  onMoveToCollection,
  showTransliteration,
  showTranslation,
  savedCollections = [],
  readingPositions,
  onOpenCollection,
  onRestartCollection
}) => {
  /*
   * A saved parent is a saved thing, and a pinned one is a pinned thing, so
   * every tally counts it — otherwise the chip reads 1 beside a header of 2.
   *
   * A search filters these too. Without it, searching for a word that matches
   * nothing still left every saved category on screen and counted it in the
   * header, which made the search look broken. Matched on the category's own
   * name in both languages: the row shows a name, so that is what it can
   * honestly claim to match.
   */
  const visibleCollections = React.useMemo(() => {
    if (selectedSectionId !== 'all') return [];
    const query = normalizeForSearch(searchQuery);
    if (!query) return savedCollections;
    return savedCollections.filter((collection) =>
      normalizeForSearch(`${collection.meta.en} ${collection.meta.bn}`).includes(query)
    );
  }, [savedCollections, searchQuery, selectedSectionId]);
  const favoriteCount = filteredItems.filter((item) => isFavorite(item.id)).length + visibleCollections.length;
  const pinnedCount =
    filteredItems.filter((item) => isPinned(item.id)).length +
    visibleCollections.filter((collection) => isPinned(`cat:${collection.key}`)).length;
  const surahCount = filteredItems.filter(
    (item) => String(item.id).startsWith('surah_') || String(item.badge).toLowerCase() === 'surah'
  ).length;

  const currentSection = sections.find((s) => s.id === selectedSectionId) || sections[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 pb-10 pt-6">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-ink">
            {getLocalizedText('Collection')}
          </p>
          {selectedSectionId !== 'all' && (
            <div className="flex gap-2">
              <button
                onClick={() => onEditSection(currentSection)}
                className="p-1.5 text-text-muted hover:text-gold-ink transition-colors"
                aria-label={getLocalizedText('Edit collection')}
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => onDeleteSection(selectedSectionId)}
                className="p-1.5 text-text-muted hover:text-red-400 transition-colors"
                aria-label={getLocalizedText('Delete collection')}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-text-main">{getLocalizedText(currentSection.name)}</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-sub">
          {getLocalizedText('Organize your spiritual journey with custom collections.')}
        </p>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              aria-pressed={selectedSectionId === section.id}
              className={`flex min-h-11 shrink-0 items-center px-4 rounded-xl text-xs font-bold transition-all border ${
                selectedSectionId === section.id
                  ? 'bg-gold border-gold text-on-gold'
                  : 'bg-bg/40 border-border text-text-sub hover:border-gold/40'
              }`}
            >
              {getLocalizedText(section.name)}
              {/* Without a count there was no way to see where saved items
                  actually were, which made an empty collection look like data
                  loss. */}
              <span className={`ml-1.5 ${selectedSectionId === section.id ? 'opacity-70' : 'opacity-50'}`}>
                {(sectionCounts[section.id] || 0) + (section.id === 'all' ? savedCollections.length : 0)}
              </span>
            </button>
          ))}
          <button
            onClick={onAddSection}
            className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-border bg-bg/40 px-4 text-xs font-bold text-gold-ink hover:border-gold/40"
          >
            <FolderPlus size={14} />
            {getLocalizedText('New')}
          </button>
        </div>

        {/* Four tall tiles cost most of a phone screen before the first saved
            item. They are read, not tapped, so they do not need the room. */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { label: 'Items', value: filteredItems.length + visibleCollections.length },
            { label: 'Favorites', value: favoriteCount },
            { label: 'Pinned', value: pinnedCount },
            { label: 'Surahs', value: surahCount }
          ].map((tile) => (
            <div key={tile.label} className="rounded-xl border border-border bg-bg/60 px-2 py-2 text-center">
              <div className="text-lg font-bold leading-none text-text-main tabular-nums">{tile.value}</div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-text-muted">
                {getLocalizedText(tile.label)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Side by side rather than stacked: two full-width cards pushed the
          saved items themselves off the first screen. */}
      <section className="grid grid-cols-2 gap-3">
        <button
          onClick={onAddSurah}
          className="flex min-h-14 items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 text-start shadow-sm hover:border-gold/40"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold-ink">
            <BookOpen size={17} />
          </span>
          <span className="min-w-0 text-[13px] font-bold leading-tight text-text-main">{getLocalizedText('Add Surah')}</span>
        </button>
        <button
          onClick={onManualAdd}
          className="flex min-h-14 items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 text-start shadow-sm hover:border-gold/40"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold-ink">
            <Plus size={17} />
          </span>
          <span className="min-w-0 text-[13px] font-bold leading-tight text-text-main">{getLocalizedText('Add Personal Dua')}</span>
        </button>
      </section>

      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={getLocalizedText('Search favorites, surahs, and personal duas...')}
      />

      <SectionBlock
        title={currentSection.name}
        count={filteredItems.length + visibleCollections.length}
        getLocalizedText={getLocalizedText}
      >
        {/* A saved parent shows under All only: it has no collection of its own,
            and listing it inside an unrelated one would be noise. */}
        {visibleCollections.length > 0 ? (
          <div className={`space-y-2 ${filteredItems.length > 0 ? 'mb-4' : ''}`}>
            {visibleCollections.map((collection) => (
              <CollectionRow
                key={collection.key}
                collection={collection}
                position={readingPositions?.[collection.key] ?? 0}
                language={language}
                getLocalizedText={getLocalizedText}
                onOpen={(key) => onOpenCollection?.(key)}
                onRestart={(key) => onRestartCollection?.(key)}
              />
            ))}
          </div>
        ) : null}
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
                defaultExpanded={false}
                showTransliteration={showTransliteration}
                showTranslation={showTranslation}
                  onEdit={isOwned ? () => onEditItem(item) : undefined}
                  onDelete={isOwned ? () => onDeleteItem(item.id) : undefined}
                  sections={sections}
                  onMoveToCollection={(sectionId) => onMoveToCollection(item.id, sectionId)}
                />
              );
            })}
          </div>
        ) : visibleCollections.length > 0 ? null : (
          // The empty state belongs to the screen, not to the item list: a
          // saved category with no saved items used to render its row and then
          // print "Nothing saved yet" directly underneath it.
          <div className="rounded-2xl border border-dashed border-border bg-bg/50 p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold-ink">
              <Search size={28} />
            </div>
            {/* Three different situations, three different messages. Saying
                "nothing saved yet" while items sat in another collection read
                as data loss; offering to leave the collection when a *search*
                found nothing was just as wrong. */}
            {searchQuery.trim() ? (
              <>
                <h3 className="text-xl font-bold text-text-main">
                  {getLocalizedText('No results found')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-sub">
                  {getLocalizedText('Nothing here matches that search. Try a different word.')}
                </p>
              </>
            ) : savedTotal > 0 && selectedSectionId !== 'all' ? (
              <>
                <h3 className="text-xl font-bold text-text-main">
                  {getLocalizedText('This collection is empty')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-sub">
                  {getLocalizedText({
                    en: `You have ${savedTotal} saved item${savedTotal === 1 ? '' : 's'} in other collections.`,
                    bn: `অন্য কালেকশনে আপনার ${savedTotal} টি সংরক্ষিত আইটেম আছে।`
                  })}
                </p>
                <button
                  onClick={() => onSelectSection('all')}
                  className="mt-4 inline-flex items-center justify-center rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-gold-ink transition-all hover:border-gold/40"
                >
                  {getLocalizedText('Show all items')}
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-text-main">
                  {getLocalizedText('Nothing saved yet')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-sub">
                  {getLocalizedText('Favourite a dua, add a surah, or write your own to build this collection.')}
                </p>
              </>
            )}
          </div>
        )}
      </SectionBlock>
    </div>
  );
};

export default PersonalScreen;
