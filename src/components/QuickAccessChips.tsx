import React from 'react';
import { LocalizedText } from '../constants';

interface QuickAccessChipsProps {
  options: { id: string, label: LocalizedText }[];
  selectedId: string;
  onSelect: (id: string) => void;
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
}

const QuickAccessChips: React.FC<QuickAccessChipsProps> = ({ 
  options, 
  selectedId, 
  onSelect, 
  getLocalizedText 
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
      {options.map(opt => (
        <button 
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border
            ${selectedId === opt.id 
              ? 'bg-gold text-bg border-gold' 
              : 'bg-card text-text-sub border-border hover:border-gold/50'}`}
        >
          {getLocalizedText(opt.label)}
        </button>
      ))}
    </div>
  );
};

export default QuickAccessChips;
