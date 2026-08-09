import { getLocalDateString, daysBetween, shiftDays } from './date';

type CountsMap = Record<string, number>;
type DayCounts = Record<string, CountsMap>;
type ItemMeta = { id: string; title?: unknown };
type ItemMap = Record<string, ItemMeta>;

export type TopItemStat = {
  id: string;
  count: number;
};

export type JourneyStats = {
  totalCount: number;
  todayCount: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
  bestDay: { date: string; total: number } | null;
  topItemsAllTime: TopItemStat[];
  topItemsLast30Days: TopItemStat[];
  last7Days: { date: string; total: number }[];
};

const getLastNDaysKeys = (n: number) => {
  const days: string[] = [];
  const today = getLocalDateString();
  for (let i = 0; i < n; i++) days.push(shiftDays(today, -i));
  return days;
};

const sumCounts = (counts: CountsMap): number =>
  Object.values(counts || {}).reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);

const buildAggregate = (dayCounts: DayCounts, dates: string[]): CountsMap => {
  const aggregate: CountsMap = {};
  dates.forEach((date) => {
    const day = dayCounts[date] || {};
    Object.entries(day).forEach(([id, count]) => {
      aggregate[id] = (aggregate[id] || 0) + count;
    });
  });
  return aggregate;
};

const toTopItems = (aggregate: CountsMap, itemMap?: ItemMap, limit = 5): TopItemStat[] =>
  Object.entries(aggregate)
    .filter(([id, count]) => (!itemMap || Boolean(itemMap[id])) && count > 0)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

const activeDateKeys = (dayCounts: DayCounts): string[] =>
  Object.keys(dayCounts || {})
    .filter((date) => sumCounts(dayCounts[date] || {}) > 0)
    .sort();

const calculateLongestStreak = (activeDates: string[]) => {
  if (activeDates.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < activeDates.length; i++) {
    if (daysBetween(activeDates[i - 1], activeDates[i]) === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
};

/**
 * A streak is only broken once a whole day has passed with no dhikr. Counting
 * strictly back from today would show "0" every morning before the user's first
 * dhikr, which reads as if the streak had already been lost — so when today is
 * still empty, the count starts from yesterday.
 */
const calculateCurrentStreak = (dayCounts: DayCounts) => {
  const today = getLocalDateString();
  const activeToday = sumCounts(dayCounts[today] || {}) > 0;

  let cursor = activeToday ? today : shiftDays(today, -1);
  let streak = 0;
  // Bounded so a corrupted store can never spin forever.
  for (let i = 0; i < 3650; i++) {
    if (sumCounts(dayCounts[cursor] || {}) > 0) {
      streak += 1;
      cursor = shiftDays(cursor, -1);
    } else {
      break;
    }
  }
  return streak;
};

export const buildJourneyStats = (
  dayCounts: DayCounts,
  itemMap?: ItemMap,
  lifetimeCounts?: CountsMap
): JourneyStats => {
  const safeDayCounts = dayCounts || {};
  const allDates = Object.keys(safeDayCounts).sort();
  const activeDates = activeDateKeys(safeDayCounts);
  const todayKey = getLocalDateString();
  const todayCount = sumCounts(safeDayCounts[todayKey] || {});
  const currentStreak = calculateCurrentStreak(safeDayCounts);
  const longestStreak = calculateLongestStreak(activeDates);

  const aggregateAllTime = lifetimeCounts || buildAggregate(safeDayCounts, allDates);
  const totalCount = sumCounts(aggregateAllTime);
  const topItemsAllTime = toTopItems(aggregateAllTime, itemMap);

  const aggregate30 = buildAggregate(safeDayCounts, getLastNDaysKeys(30));
  const topItemsLast30Days = toTopItems(aggregate30, itemMap);

  const last7Days = getLastNDaysKeys(7)
    .reverse()
    .map((date) => ({ date, total: sumCounts(safeDayCounts[date] || {}) }));

  const bestDay = activeDates.reduce<{ date: string; total: number } | null>((best, date) => {
    const total = sumCounts(safeDayCounts[date] || {});
    return !best || total > best.total ? { date, total } : best;
  }, null);

  return {
    totalCount,
    todayCount,
    activeDays: activeDates.length,
    currentStreak,
    longestStreak,
    bestDay,
    topItemsAllTime,
    topItemsLast30Days,
    last7Days
  };
};

/**
 * Day counts are kept forever otherwise; a few years of daily use would bloat
 * localStorage and slow every stats pass. Lifetime totals are tracked
 * separately, so trimming old day buckets loses no all-time numbers.
 */
export const pruneDayCounts = (dayCounts: DayCounts, keepDays = 400): DayCounts => {
  const cutoff = shiftDays(getLocalDateString(), -keepDays);
  const keys = Object.keys(dayCounts || {});
  const stale = keys.filter((key) => key < cutoff);
  if (stale.length === 0) return dayCounts;
  const next: DayCounts = {};
  keys.forEach((key) => {
    if (key >= cutoff) next[key] = dayCounts[key];
  });
  return next;
};
