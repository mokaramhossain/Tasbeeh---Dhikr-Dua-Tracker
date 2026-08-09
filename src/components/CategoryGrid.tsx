import React from 'react';
import { LocalizedText } from '../constants';
import { CATEGORY_META } from '../data/categories';

interface CategoryGridProps {
  categories: string[];
  counts: Record<string, number>;
  onSelect: (category: string) => void;
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
}

/**
 * All categories at once, with how many duas each holds.
 *
 * The previous chip strip scrolled sideways and showed 3 of 21 at a time, so
 * most of the library was effectively undiscoverable — you had to already know
 * what you were looking for.
 */
const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, counts, onSelect, getLocalizedText }) => (
  <div className="grid grid-cols-2 gap-3">
    {categories.map((cat) => {
      const meta = CATEGORY_META[cat] || { en: cat, bn: cat, icon: '✨' };
      const count = counts[cat] || 0;
      return (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 text-start transition-all hover:border-gold/45 active:scale-[0.98]"
        >
          <span aria-hidden="true" className="text-xl leading-none">
            {meta.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold leading-tight text-text-main">
              {getLocalizedText(meta)}
            </span>
            <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
              {count} {getLocalizedText(count === 1 ? 'dua' : 'duas')}
            </span>
          </span>
        </button>
      );
    })}
  </div>
);

export default CategoryGrid;
