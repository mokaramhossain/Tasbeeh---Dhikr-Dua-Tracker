import React from 'react';
import { HandHelping, Quote, Sparkle } from 'lucide-react';
import { DhikrItem, Language, LocalizedText } from '../constants';
import DhikrCard from '../components/DhikrCard';
import { getHadithOfTheDay } from '../data/hadiths';
import { getReflectionOfTheDay } from '../data/reflections';

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
  showTransliteration?: boolean;
  showTranslation?: boolean;
  /** Takes the user to the Du'a tab, where the pin control actually lives. */
  onBrowseDuas?: () => void;
  /** Today, as a local date key — drives the hadith and the reflection. */
  currentDate: string;
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
        <div className="shrink-0 rounded-full bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gold-ink">
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
  onMoveToCollection,
  showTransliteration,
  showTranslation,
  onBrowseDuas,
  currentDate
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
      showTransliteration={showTransliteration}
      showTranslation={showTranslation}
      sections={sections}
      onMoveToCollection={onMoveToCollection ? (sectionId) => onMoveToCollection(item.id, sectionId) : undefined}
    />
  );

  const hadith = getHadithOfTheDay(currentDate);
  const reflection = getReflectionOfTheDay(currentDate);

  const core = routineItems?.core || [];
  const optional = routineItems?.optional || [];
  const protection = routineItems?.protection || [];

  return (
    <div className="w-full space-y-7 pt-3 pb-8">
      <section>
        <SectionHeader
          title={'Core Adhkar'}
          subtitle={'Your main after-salah routine'}
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
            title={'Optional Adhkar'}
            subtitle={'Extra remembrance when you have time'}
            count={optional.length}
            getLocalizedText={getLocalizedText}
          />
          <div className="space-y-4">{optional.map(renderCard(optional))}</div>
        </section>
      ) : null}

      <section>
        <SectionHeader
          title={'Protection'}
          subtitle={'Dua for Protection: The Power of Ayatul Kursi and the 3 Quls'}
          count={protection.length}
          getLocalizedText={getLocalizedText}
        />
        <div className="space-y-4">{protection.map(renderCard(protection))}</div>
      </section>

      <section>
        <SectionHeader
          title={'Pinned by You'}
          subtitle={'Quick access to selected items'}
          count={pinnedItems.length}
          getLocalizedText={getLocalizedText}
        />
        {pinnedItems.length > 0 ? (
          <div className="space-y-4">{pinnedItems.map(renderCard(pinnedItems))}</div>
        ) : (
          /* Telling someone to pin something, without saying where the pin
             lives or offering a way to get there, is a dead end. */
          <div className="rounded-2xl border border-dashed border-border bg-bg/40 px-4 py-5">
            <p className="text-sm leading-relaxed text-text-sub">
              {getLocalizedText('Pin a dhikr or surah to see it here.')}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-text-muted">
              {getLocalizedText('Open any du\'a and tap the pin to keep it on this screen.')}
            </p>
            {onBrowseDuas ? (
              <button
                onClick={onBrowseDuas}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-bold text-gold-ink transition-all hover:border-gold/40"
              >
                <HandHelping size={15} />
                {getLocalizedText('Browse du\'as')}
              </button>
            ) : null}
          </div>
        )}
      </section>

      <div className="pt-1">
        <button
          onClick={onResetRoutine}
          className="w-full rounded-2xl bg-gold px-5 py-4 text-sm font-bold text-on-gold transition-all hover:opacity-90 active:scale-[0.99]"
        >
          {getLocalizedText('Reset for New Salah')}
        </button>
      </div>

      {/* The day closes here. Both were buried in Settings, where a page nobody
          reads twice made a daily hadith pointless and a single fixed
          reflection went unnoticed. */}
      <section className="space-y-3 pt-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-gold-ink">
            <Quote size={11} />
            {getLocalizedText('Hadith of the day')}
          </p>
          <p className="text-sm italic leading-relaxed text-text-main">{getLocalizedText(hadith.text)}</p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
            {hadith.source}
            {hadith.ref ? ` · ${hadith.ref}` : ''}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-gold-ink">
            <Sparkle size={11} />
            {getLocalizedText('Reflection')}
          </p>
          <p className="text-sm leading-relaxed text-text-main">{getLocalizedText(reflection)}</p>
        </div>
      </section>
    </div>
  );
};

export default AdhkarScreen;
