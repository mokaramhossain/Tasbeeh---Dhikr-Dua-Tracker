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
  topItemsAllTime: TopItemStat[];
  topItemsLast30Days: TopItemStat[];
  last7Days: { date: string; total: number }[];
};

const getLocalDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLastNDaysKeys = (n: number) => {
  const days: string[] = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(getLocalDateString(d));
  }
  return days;
};

const sumCounts = (counts: CountsMap): number => Object.values(counts || {}).reduce((a, b) => a + b, 0);

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

const calculateLongestStreak = (dayCounts: DayCounts) => {
  const dates = Object.keys(dayCounts).filter((date) => sumCounts(dayCounts[date] || {}) > 0).sort();
  if (dates.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
};

const calculateCurrentStreak = (dayCounts: DayCounts) => {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 3650; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = getLocalDateString(d);
    if (sumCounts(dayCounts[key] || {}) > 0) streak += 1;
    else break;
  }
  return streak;
};

export const buildJourneyStats = (dayCounts: DayCounts, itemMap?: ItemMap, lifetimeCounts?: CountsMap): JourneyStats => {
  const allDates = Object.keys(dayCounts || {}).sort();
  const todayKey = getLocalDateString();
  const todayCount = sumCounts(dayCounts[todayKey] || {});
  const activeDays = allDates.filter((date) => sumCounts(dayCounts[date] || {}) > 0).length;
  const currentStreak = calculateCurrentStreak(dayCounts);
  const longestStreak = calculateLongestStreak(dayCounts);
  const aggregateAllTime = lifetimeCounts || buildAggregate(dayCounts, allDates);
  const totalCount = sumCounts(aggregateAllTime);
  const topItemsAllTime = toTopItems(aggregateAllTime, itemMap);
  const last30Keys = getLastNDaysKeys(30);
  const aggregate30 = buildAggregate(dayCounts, last30Keys);
  const topItemsLast30Days = toTopItems(aggregate30, itemMap);
  const last7Days = getLastNDaysKeys(7).reverse().map((date) => ({ date, total: sumCounts(dayCounts[date] || {}) }));
  return { totalCount, todayCount, activeDays, currentStreak, longestStreak, topItemsAllTime, topItemsLast30Days, last7Days };
};
