import React from 'react';
import { DhikrItem, Language, LocalizedText } from '../constants';
import DhikrCard from '../components/DhikrCard';

interface AdhkarScreenProps {
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
  counts: Record<string, number>;
  onCountChange: (id: string, target: number) => void;
  onResetItem: (id: string) => void;
  customTargets: Record<string, number>;
  onSetTarget: (item: DhikrItem) => void;
  routineItems: { core: DhikrItem[]; optional: DhikrItem[]; protection: DhikrItem[] };
  onResetRoutine: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  language: Language;
  onFocus: (item: DhikrItem, list: DhikrItem[]) => void;
  pinnedIds: string[];
  onTogglePin: (id: string) => void;
  allDhikrItems: DhikrItem[];
  sections?: { id: string; name: LocalizedText }[];
  onMoveToCollection?: (itemId: string, sectionId: string) => void;
}

const SectionHeader = ({
  title,
  subtitle,
  count,
  getLocalizedText
}: {
  title: LocalizedText;
  subtitle?: LocalizedText;
  count?: number;
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
}) => (
  <div className="mb-3 px-1">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-bold text-text-main">{getLocalizedText(title)}</h2>
        {subtitle ? <p className="mt-1 text-sm leading-relaxed text-text-sub">{getLocalizedText(subtitle)}</p> : null}
      </div>
      {typeof count === 'number' ? (
        <div className="shrink-0 rounded-full bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
          {count}
        </div>
      ) : null}
    </div>
  </div>
);

const AdhkarScreen: React.FC<AdhkarScreenProps> = ({
  getLocalizedText,
  counts,
  onCountChange,
  customTargets,
  onSetTarget,
  onResetItem,
  routineItems,
  onResetRoutine,
  favorites,
  toggleFavorite,
  language,
  onFocus,
  pinnedIds,
  onTogglePin,
  allDhikrItems,
  sections,
  onMoveToCollection
}) => {
  const pinnedItems = (allDhikrItems || []).filter((item) => (pinnedIds || []).includes(item.id));

  // The list is threaded through so Focus Mode's next/previous arrows can walk
  // the same section the user opened it from.
  const renderCard = (list: DhikrItem[]) => (item: DhikrItem) => (
    <DhikrCard
      key={item.id}
      item={item}
      count={counts[item.id] || 0}
      onIncrement={() => onCountChange(item.id, customTargets[item.id] ?? item.target)}
      targetOverride={customTargets[item.id] ?? item.target}
      onEditTarget={() => onSetTarget(item)}
      onReset={() => onResetItem(item.id)}
      getLocalizedText={getLocalizedText}
      isFavorite={favorites.includes(item.id)}
      onToggleFavorite={() => toggleFavorite(item.id)}
      onFocus={() => onFocus(item, list)}
      isPinned={pinnedIds.includes(item.id)}
      onTogglePin={() => onTogglePin(item.id)}
      language={language}
      sections={sections}
      onMoveToCollection={onMoveToCollection ? (sectionId) => onMoveToCollection(item.id, sectionId) : undefined}
    />
  );

  const core = routineItems?.core || [];
  const optional = routineItems?.optional || [];
  const protection = routineItems?.protection || [];

  return (
    <div className="w-full space-y-7 pt-3 pb-8">
      <section>
        <SectionHeader
          title={{ en: 'Core Adhkar', bn: 'মূল জিকির' }}
          subtitle={{ en: 'Your main after-salah routine', bn: 'নামাজের পরের প্রধান রুটিন' }}
          count={core.length}
          getLocalizedText={getLocalizedText}
        />
        <div className="space-y-4">{core.map(renderCard(core))}</div>
      </section>

      {/* Was computed in App but never rendered, so any optional adhkar added to
          the routine simply never appeared. */}
      {optional.length > 0 ? (
        <section>
          <SectionHeader
            title={{ en: 'Optional Adhkar', bn: 'ঐচ্ছিক জিকির' }}
            subtitle={{ en: 'Extra remembrance when you have time', bn: 'সময় থাকলে অতিরিক্ত জিকির' }}
            count={optional.length}
            getLocalizedText={getLocalizedText}
          />
          <div className="space-y-4">{optional.map(renderCard(optional))}</div>
        </section>
      ) : null}

      <section>
        <SectionHeader
          title={{ en: 'Protection', bn: 'সুরক্ষা' }}
          subtitle={{
            en: 'Dua for Protection: The Power of Ayatul Kursi and the 3 Quls',
            bn: 'সুরক্ষার দুআ: আয়াতুল কুরসি ও তিন কুলের শক্তি'
          }}
          count={protection.length}
          getLocalizedText={getLocalizedText}
        />
        <div className="space-y-4">{protection.map(renderCard(protection))}</div>
      </section>

      <section>
        <SectionHeader
          title={{ en: 'Pinned by You', bn: 'আপনার পিন করা' }}
          subtitle={{ en: 'Quick access to selected items', bn: 'আপনার বাছাই করা দ্রুত ব্যবহারের আইটেম' }}
          count={pinnedItems.length}
          getLocalizedText={getLocalizedText}
        />
        {pinnedItems.length > 0 ? (
          <div className="space-y-4">{pinnedItems.map(renderCard(pinnedItems))}</div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-bg/40 px-4 py-5 text-sm leading-relaxed text-text-sub">
            {getLocalizedText({
              en: 'Pin a dhikr or surah to see it here.',
              bn: 'এখানে দেখানোর জন্য কোনো জিকির বা সূরা পিন করুন।'
            })}
          </div>
        )}
      </section>

      <div className="pt-1">
        <button
          onClick={onResetRoutine}
          className="w-full rounded-2xl bg-gold px-5 py-4 text-sm font-bold text-bg transition-all hover:opacity-90 active:scale-[0.99]"
        >
          {getLocalizedText({ en: 'Reset for New Salah', bn: 'নতুন নামাজের জন্য রিসেট করুন' })}
        </button>
      </div>
    </div>
  );
};

export default AdhkarScreen;
