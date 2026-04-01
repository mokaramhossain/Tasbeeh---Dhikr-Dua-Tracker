import React from 'react';
import { Sparkles } from 'lucide-react';
import { DhikrItem, LocalizedText } from '../constants';
import DhikrCard from '../components/DhikrCard';
import SearchBar from '../components/SearchBar';
import CategoryChips from '../components/CategoryChips';
import SectionBlock from '../components/SectionBlock';

interface DuaScreenProps {
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
  counts: Record<string, number>;
  onCountChange: (id: string, target: number) => void;
  onResetItem: (id: string) => void;
  customTargets: Record<string, number>;
  onSetTarget: (item: DhikrItem) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  categories: string[];
  filteredItems: DhikrItem[];
  todaysDua: DhikrItem | null;
  onFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  onFocus: (item: DhikrItem) => void;
  language: 'en' | 'bn';
  isPinned: (id: string) => boolean;
  onTogglePin: (id: string) => void;
}

const DuaScreen: React.FC<DuaScreenProps> = ({
  getLocalizedText,
  counts,
  onCountChange,
  customTargets,
  onSetTarget,
  onResetItem,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  categories,
  filteredItems,
  todaysDua,
  onFavorite,
  isFavorite,
  onFocus,
  language,
  isPinned,
  onTogglePin
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4 pb-8">
      {/* Search and Filter */}
      <div className="space-y-4">
        <SearchBar 
          value={searchQuery} 
          onChange={onSearchChange} 
          placeholder={getLocalizedText({ en: 'Search Duas...', bn: 'দুআ খুঁজুন...' })} 
        />
        <CategoryChips 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onSelect={onCategorySelect} 
          getLocalizedText={getLocalizedText} 
        />
      </div>

      {/* Results */}
      <SectionBlock 
        title={{ en: 'All Supplications', bn: 'সকল দুআ' }} 
        count={filteredItems.length}
        getLocalizedText={getLocalizedText}
      >
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <DhikrCard 
              key={item.id}
              item={item}
              count={counts[item.id] || 0}
              targetOverride={customTargets[item.id] ?? item.target}
              onIncrement={() => onCountChange(item.id, customTargets[item.id] ?? item.target)}
              onReset={() => onResetItem(item.id)}
              onEditTarget={() => onSetTarget(item)}
              getLocalizedText={getLocalizedText}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={() => onFavorite(item.id)}
              isPinned={isPinned(item.id)}
              onTogglePin={() => onTogglePin(item.id)}
              onFocus={() => onFocus(item)}
              language={language}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-[#E0E7E4]/20">
            <Sparkles size={48} className="mb-4 opacity-10" />
            <p className="text-sm font-bold uppercase tracking-widest">
              {getLocalizedText({ en: 'No results found', bn: 'কিছু পাওয়া যায়নি' })}
            </p>
          </div>
        )}
      </SectionBlock>
    </div>
  );
};

export default DuaScreen;
