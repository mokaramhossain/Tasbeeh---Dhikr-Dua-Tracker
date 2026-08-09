import { getLocalDateString, shiftDays } from './date';

export type CountsMap = Record<string, number>;
export type DayCounts = Record<string, CountsMap>;

export const sumCounts = (counts: CountsMap): number =>
  Object.values(counts || {}).reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);

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
