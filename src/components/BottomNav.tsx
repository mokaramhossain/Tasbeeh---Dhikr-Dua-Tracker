import React from 'react';
import { CircleDot, HandHelping, BookMarked, MoreHorizontal } from 'lucide-react';
import { LocalizedText } from '../constants';

interface BottomNavProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
}

/*
 * Personal used to use a Plus, which reads as "add" rather than "my saved
 * collection" — the screen already has explicit Add Surah / Add Personal Dua
 * buttons for that. Adhkar's Sparkles was decorative rather than meaningful;
 * CircleDot reads as a single tasbih bead.
 */
const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, getLocalizedText }) => {
  const tabs = [
    { id: 0, icon: CircleDot, label: 'Adhkar' },
    { id: 1, icon: HandHelping, label: "Du'a" },
    { id: 2, icon: BookMarked, label: 'Personal' },
    { id: 3, icon: MoreHorizontal, label: 'More' }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur-md pb-safe">
      <div className="mx-auto flex h-[72px] max-w-3xl justify-around items-stretch px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl transition-all ${
                isActive ? 'text-gold-ink' : 'text-text-muted'
              }`}
            >
              {/* The active tab was signalled by colour alone; it now also
                  carries a filled pill and a heavier stroke. */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all ${
                  isActive ? 'bg-gold/15 ring-1 ring-gold/30' : 'bg-transparent'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.75} />
              </div>
              <span
                className={`text-[10px] uppercase tracking-[0.18em] ${isActive ? 'font-bold' : 'font-semibold opacity-80'}`}
              >
                {getLocalizedText(tab.label)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
