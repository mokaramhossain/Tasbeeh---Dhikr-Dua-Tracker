import { getLocalDateString, shiftDays } from './date';
import { sumCounts, type CountsMap, type DayCounts } from './counts';

type ItemMap = Record<string, { id: string }>;

export type TopItemStat = { id: string; count: number };

export type RecordStats = {
  totalCount: number;
  todayCount: number;
  activeDays: number;
  bestDay: { date: string; total: number } | null;
  topItems: TopItemStat[];
  /** Newest last, so it reads left-to-right like a calendar. */
  recentDays: { date: string; total: number }[];
};

const lastNDays = (n: number) => {
  const today = getLocalDateString();
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) days.push(shiftDays(today, -i));
  return days;
};

const aggregate = (dayCounts: DayCounts, dates: string[]): CountsMap => {
  const totals: CountsMap = {};
  dates.forEach((date) => {
    Object.entries(dayCounts[date] || {}).forEach(([id, count]) => {
      totals[id] = (totals[id] || 0) + count;
    });
  });
  return totals;
};

const topItems = (totals: CountsMap, itemMap?: ItemMap, limit = 5): TopItemStat[] =>
  Object.entries(totals)
    .filter(([id, count]) => count > 0 && (!itemMap || Boolean(itemMap[id])))
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

/**
 * A record of what has been recited, deliberately without streaks.
 *
 * A streak turns worship into a number to protect, and tells someone who missed
 * a day while ill or travelling that they have lost something. Totals and a
 * calendar let you look back without the app pushing.
 */
export const buildRecordStats = (
  dayCounts: DayCounts,
  itemMap?: ItemMap,
  lifetimeCounts?: CountsMap,
  calendarDays = 35
): RecordStats => {
  const safe = dayCounts || {};
  const allDates = Object.keys(safe).sort();
  const activeDates = allDates.filter((date) => sumCounts(safe[date] || {}) > 0);

  // Lifetime counts survive the 400-day pruning of day buckets, so they are the
  // better source for an all-time total when present.
  const allTime = lifetimeCounts && Object.keys(lifetimeCounts).length > 0
    ? lifetimeCounts
    : aggregate(safe, allDates);

  const bestDay = activeDates.reduce<{ date: string; total: number } | null>((best, date) => {
    const total = sumCounts(safe[date] || {});
    return !best || total > best.total ? { date, total } : best;
  }, null);

  return {
    totalCount: sumCounts(allTime),
    todayCount: sumCounts(safe[getLocalDateString()] || {}),
    activeDays: activeDates.length,
    bestDay,
    topItems: topItems(allTime, itemMap),
    recentDays: lastNDays(calendarDays).map((date) => ({ date, total: sumCounts(safe[date] || {}) }))
  };
};
