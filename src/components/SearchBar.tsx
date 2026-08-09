import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  autoFocus = false
}) => {
  const hasValue = value.trim().length > 0;

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-text-muted">
        <Search size={18} />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-2xl border border-border bg-card py-3.5 pl-11 pr-11 text-sm text-text-main outline-none transition-all placeholder:text-text-muted focus:border-gold focus:ring-2 focus:ring-gold/10"
      />

      {hasValue ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 end-0 flex items-center pe-3 text-text-muted transition-colors hover:text-text-main"
          aria-label="Clear search"
          title="Clear search"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-bg">
            <X size={16} />
          </div>
        </button>
      ) : null}
    </div>
  );
};

export default SearchBar;