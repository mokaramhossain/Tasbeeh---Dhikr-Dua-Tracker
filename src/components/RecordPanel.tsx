import React, { useMemo } from 'react';
import { BookOpen, CalendarDays } from 'lucide-react';
import { DhikrItem, Language, LocalizedText } from '../constants';
import { buildRecordStats } from '../utils/stats';
import { parseLocalDate } from '../utils/date';
import { formatNumber } from '../i18n';
import { languageInfo } from '../locales';

interface RecordPanelProps {
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
  language: Language;
  dayCounts: Record<string, Record<string, number>>;
  lifetimeCounts: Record<string, number>;
  itemsById: Map<string, DhikrItem>;
}

/** Five weeks reads as a calendar without needing month navigation. */
const CALENDAR_DAYS = 35;

/**
 * A quiet record: totals, which days had dhikr, and what was recited most.
 *
 * Deliberately no streak. A streak counter turns worship into a number to
 * defend and punishes a day missed through illness or travel — the opposite of
 * what this app is for.
 */
const RecordPanel: React.FC<RecordPanelProps> = ({
  getLocalizedText,
  language,
  dayCounts,
  lifetimeCounts,
  itemsById
}) => {
  const stats = useMemo(() => {
    const itemMap: Record<string, { id: string }> = {};
    itemsById.forEach((_, id) => {
      itemMap[id] = { id };
    });
    return buildRecordStats(dayCounts, itemMap, lifetimeCounts, CALENDAR_DAYS);
  }, [dayCounts, lifetimeCounts, itemsById]);

  const locale = languageInfo(language).code;
  const busiest = Math.max(1, ...stats.recentDays.map((d) => d.total));
  const hasHistory = stats.totalCount > 0;

  const tiles = [
    { label: 'Today', value: stats.todayCount },
    { label: 'All time', value: stats.totalCount },
    { label: 'Days with dhikr', value: stats.activeDays }
  ];

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-xl">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center text-gold-ink">
          <CalendarDays size={20} />
        </div>
        <h2 className="text-lg font-bold text-text-main">{getLocalizedText('Your Record')}</h2>
      </div>

      <div className="p-6 space-y-6">
        {!hasHistory ? (
          <p className="rounded-2xl border border-dashed border-border bg-bg/50 p-5 text-sm leading-relaxed text-text-sub">
            {getLocalizedText('Count a dhikr and your record will start building here.')}
          </p>
        ) : null}

        <div className="grid grid-cols-3 gap-3">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-2xl border border-border bg-bg/60 p-4">
              <div className="text-2xl font-bold text-text-main tabular-nums">
                {formatNumber(tile.value, language)}
              </div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted leading-tight">
                {getLocalizedText(tile.label)}
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="text-[10px] font-bold text-text-sub uppercase tracking-[0.22em] mb-3">
            {getLocalizedText('Last 5 weeks')}
          </p>
          {/* Fixed cell sizing rather than percentage heights — the previous
              panel's bars collapsed because percentages do not resolve against
              a flex-basis parent. */}
          <div className="grid grid-cols-7 gap-1.5">
            {stats.recentDays.map((day) => {
              const intensity = day.total === 0 ? 0 : Math.min(1, day.total / busiest);
              const parsed = parseLocalDate(day.date);
              return (
                <div
                  key={day.date}
                  title={`${parsed.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} — ${day.total}`}
                  className={`aspect-square rounded-md border ${
                    day.total > 0 ? 'border-gold/30' : 'border-border bg-bg/40'
                  }`}
                  style={day.total > 0 ? { backgroundColor: `color-mix(in srgb, var(--gold) ${20 + intensity * 70}%, transparent)` } : undefined}
                />
              );
            })}
          </div>
          <p className="mt-2 text-[10px] text-text-muted">
            {getLocalizedText('Each square is a day. Filled means you counted.')}
          </p>
        </div>

        {stats.topItems.length > 0 ? (
          <div>
            <p className="text-[10px] font-bold text-text-sub uppercase tracking-[0.22em] mb-3">
              {getLocalizedText('Most recited')}
            </p>
            <div className="space-y-2">
              {stats.topItems.map((entry) => {
                const item = itemsById.get(entry.id);
                if (!item) return null;
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-bg/60 px-4 py-3"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-text-main">
                      {getLocalizedText(item.title)}
                    </span>
                    <span className="shrink-0 text-sm font-bold text-gold-ink tabular-nums">
                      {formatNumber(entry.count, language)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {stats.bestDay ? (
          <p className="flex items-center gap-1.5 text-xs text-text-sub">
            <BookOpen size={12} className="text-gold-ink" />
            {getLocalizedText('Most in one day')}:{' '}
            <span className="font-bold text-text-main">
              {parseLocalDate(stats.bestDay.date).toLocaleDateString(locale, {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
            <span className="font-bold text-gold-ink">{formatNumber(stats.bestDay.total, language)}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default RecordPanel;
