import React from 'react';
import { Sparkles, HandHelping, Plus, MoreHorizontal } from 'lucide-react';
import { LocalizedText } from '../constants';

interface BottomNavProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, getLocalizedText }) => {
  const tabs = [
    { id: 0, icon: Sparkles, label: { en: 'Adhkar', bn: 'জিকির' } },
    { id: 1, icon: HandHelping, label: { en: "Du'a", bn: 'দুআ' } },
    { id: 2, icon: Plus, label: { en: 'Personal', bn: 'ব্যক্তিগত' } },
    { id: 3, icon: MoreHorizontal, label: { en: 'More', bn: 'আরও' } },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md pb-safe">
      <div className="mx-auto flex h-[72px] max-w-3xl justify-around items-stretch px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl transition-all ${
                isActive ? 'text-gold' : 'text-text-muted'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all ${isActive ? 'bg-gold/12' : 'bg-transparent'}`}>
                <Icon size={22} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
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
