import { getLocalDateString, shiftDays } from './date';

export type CountsMap = Record<string, number>;
export type DayCounts = Record<string, CountsMap>;

export const sumCounts = (counts: CountsMap): number =>
  Object.values(counts || {}).reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);

/**
 * Folds the day buckets into the all-time totals, keeping whichever source is
 * higher for each item.
 *
 * The two disagree in both directions and neither alone is trustworthy. Day
 * buckets are pruned at 400 days, so for a long-time user the stored lifetime
 * figure is the larger one. But lifetime writes were paused during v1.0.2:
 * anyone who installed then has no lifetime key at all, and anyone from before
 * it is missing everything counted during that window. Taking the per-item
 * maximum repairs both without ever inventing a count.
 *
 * Without this, preferring a non-empty lifetime map meant the first tap after
 * upgrading replaced a real history with `1`.
 */
export const reconcileLifetime = (lifetime: CountsMap, dayCounts: DayCounts): CountsMap => {
  // The window total and the stored total overlap — the same recitations appear
  // in both — so this is a maximum, never a sum. Adding them would roughly
  // double a long-time user's history.
  const windowTotals: CountsMap = {};
  Object.values(dayCounts || {}).forEach((day) => {
    Object.entries(day || {}).forEach(([id, count]) => {
      if (Number.isFinite(count)) windowTotals[id] = (windowTotals[id] || 0) + count;
    });
  });

  const merged: CountsMap = {};
  new Set([...Object.keys(lifetime || {}), ...Object.keys(windowTotals)]).forEach((id) => {
    const stored = Number.isFinite(lifetime?.[id]) ? lifetime[id] : 0;
    merged[id] = Math.max(stored, windowTotals[id] || 0);
  });
  return merged;
};

/**
 * Day buckets are kept forever otherwise, so a few years of daily use would
 * grow localStorage without bound and eventually hit the quota. 400 days keeps
 * more than a full year of history available.
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
