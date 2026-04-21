import React from 'react';
import { CATEGORY_META } from '../data/categories';
import { LocalizedText } from '../constants';

interface CategoryChipsProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
}

const CategoryChips: React.FC<CategoryChipsProps> = ({ 
  categories, 
  selectedCategory, 
  onSelect, 
  getLocalizedText 
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-3 px-3 sm:-mx-4 sm:px-4">
      <button 
        onClick={() => onSelect('All')}
        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border
          ${selectedCategory === 'All' 
            ? 'bg-gold text-bg border-gold' 
            : 'bg-card text-text-sub border-border hover:border-gold/50'}`}
      >
        {getLocalizedText({ en: 'All', bn: 'সব' })}
      </button>
      {categories.map(cat => {
        const meta = CATEGORY_META[cat] || { en: cat, bn: cat, icon: '✨' };
        return (
          <button 
            key={cat}
            onClick={() => onSelect(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border flex items-center gap-2
              ${selectedCategory === cat 
                ? 'bg-gold text-bg border-gold' 
                : 'bg-card text-text-sub border-border hover:border-gold/50'}`}
          >
            <span>{meta.icon}</span>
            <span>{getLocalizedText(meta)}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChips;
