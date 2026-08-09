import React, { useMemo } from 'react';
import { Flame, Trophy, Activity, BarChart3, Clock3 } from 'lucide-react';
import { DhikrItem, Language, LocalizedText } from '../constants';
import { buildJourneyStats } from '../utils/stats';
import { formatNumber } from '../i18n';
import { parseLocalDate } from '../utils/date';

interface JourneyPanelProps {
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
  language: Language;
  dayCounts: Record<string, Record<string, number>>;
  lifetimeCounts: Record<string, number>;
  itemsById: Map<string, DhikrItem>;
}

/**
 * `buildJourneyStats` and the lifetime-count tracking already existed, but
 * nothing rendered them — every streak and total the app recorded was invisible
 * to the user. This surfaces them.
 */
const JourneyPanel: React.FC<JourneyPanelProps> = ({
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
    return buildJourneyStats(dayCounts, itemMap, lifetimeCounts);
  }, [dayCounts, lifetimeCounts, itemsById]);

  const weekMax = Math.max(1, ...stats.last7Days.map((day) => day.total));
  const locale = language === 'bn' ? 'bn-BD' : 'en-US';

  const tiles = [
    {
      icon: Flame,
      label: { en: 'Current streak', bn: 'বর্তমান স্ট্রিক' },
      value: stats.currentStreak,
      suffix: { en: stats.currentStreak === 1 ? 'day' : 'days', bn: 'দিন' }
    },
    {
      icon: Trophy,
      label: { en: 'Longest streak', bn: 'দীর্ঘতম স্ট্রিক' },
      value: stats.longestStreak,
      suffix: { en: stats.longestStreak === 1 ? 'day' : 'days', bn: 'দিন' }
    },
    {
      icon: Activity,
      label: { en: 'Today', bn: 'আজ' },
      value: stats.todayCount,
      suffix: { en: 'counts', bn: 'বার' }
    },
    {
      icon: Clock3,
      label: { en: 'Active days', bn: 'সক্রিয় দিন' },
      value: stats.activeDays,
      suffix: { en: stats.activeDays === 1 ? 'day' : 'days', bn: 'দিন' }
    }
  ];

  const hasHistory = stats.totalCount > 0;

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-xl">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
          <BarChart3 size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-text-main">{getLocalizedText({ en: 'Your Journey', bn: 'আপনার যাত্রা' })}</h2>
          <p className="text-xs text-text-sub">
            {getLocalizedText({ en: 'Lifetime remembrance', bn: 'সর্বমোট জিকির' })}:{' '}
            <span className="font-bold text-gold">{formatNumber(stats.totalCount, language)}</span>
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {!hasHistory ? (
          <p className="rounded-2xl border border-dashed border-border bg-bg/50 p-5 text-sm leading-relaxed text-text-sub">
            {getLocalizedText({
              en: 'Start counting a dhikr and your streaks and totals will appear here.',
              bn: 'জিকির গণনা শুরু করলে এখানে আপনার স্ট্রিক ও মোট হিসাব দেখা যাবে।'
            })}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div key={tile.label.en} className="rounded-2xl border border-border bg-bg/60 p-4">
                <Icon size={16} className="text-gold mb-2" />
                <div className="text-2xl font-bold text-text-main tabular-nums">{formatNumber(tile.value, language)}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                  {getLocalizedText(tile.label)}
                </div>
                <div className="text-[10px] text-text-muted/80">{getLocalizedText(tile.suffix)}</div>
              </div>
            );
          })}
        </div>

        <div>
          <p className="text-[10px] font-bold text-text-main/45 uppercase tracking-[0.22em] mb-3">
            {getLocalizedText({ en: 'Last 7 days', bn: 'গত ৭ দিন' })}
          </p>
          {/* The bar row needs a definite height of its own: percentage heights
              do not resolve against a flex-basis parent, so the bars collapsed
              to nothing when the labels shared the same column. */}
          <div className="flex h-24 items-end justify-between gap-2">
            {stats.last7Days.map((day) => {
              const heightPct = day.total > 0 ? Math.max(Math.round((day.total / weekMax) * 100), 10) : 3;
              return (
                <div
                  key={day.date}
                  className={`flex-1 rounded-t-lg transition-all ${day.total > 0 ? 'bg-gold' : 'bg-border'}`}
                  style={{ height: `${heightPct}%` }}
                  title={`${day.date}: ${day.total}`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex justify-between gap-2">
            {stats.last7Days.map((day) => (
              <span key={day.date} className="flex-1 text-center text-[10px] font-bold text-text-muted">
                {parseLocalDate(day.date).toLocaleDateString(locale, { weekday: 'narrow' })}
              </span>
            ))}
          </div>
        </div>

        {stats.topItemsAllTime.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-text-main/45 uppercase tracking-[0.22em] mb-3">
              {getLocalizedText({ en: 'Most recited', bn: 'সবচেয়ে বেশি পড়া' })}
            </p>
            <div className="space-y-2">
              {stats.topItemsAllTime.map((entry, index) => {
                const item = itemsById.get(entry.id);
                if (!item) return null;
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-bg/60 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-[10px] font-bold text-gold">
                        {formatNumber(index + 1, language)}
                      </span>
                      <span className="truncate text-sm font-bold text-text-main">{getLocalizedText(item.title)}</span>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-gold tabular-nums">
                      {formatNumber(entry.count, language)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {stats.bestDay && (
          <p className="text-xs text-text-sub">
            {getLocalizedText({ en: 'Best day', bn: 'সেরা দিন' })}:{' '}
            <span className="font-bold text-text-main">
              {parseLocalDate(stats.bestDay.date).toLocaleDateString(locale, {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>{' '}
            — <span className="font-bold text-gold">{formatNumber(stats.bestDay.total, language)}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default JourneyPanel;
