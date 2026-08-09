/**
 * All day keys are local-calendar dates ("YYYY-MM-DD"), never UTC.
 *
 * `new Date("2026-08-09")` is parsed as UTC midnight by spec, which renders as
 * the *previous* day in any negative-offset timezone. Anything that turns a day
 * key back into a Date must go through `parseLocalDate`.
 */

export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (key: string): Date => {
  const [year, month, day] = key.split('-').map(Number);
  if (!year || !month || !day) return new Date(NaN);
  return new Date(year, month - 1, day);
};

/** Milliseconds until the next local midnight (plus a one second cushion). */
export const msUntilNextLocalMidnight = (now: Date = new Date()): number => {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1, 0);
  return Math.max(1000, next.getTime() - now.getTime());
};

export const daysBetween = (from: string, to: string): number =>
  Math.round((parseLocalDate(to).getTime() - parseLocalDate(from).getTime()) / 86_400_000);

export const shiftDays = (key: string, delta: number): string => {
  const d = parseLocalDate(key);
  d.setDate(d.getDate() + delta);
  return getLocalDateString(d);
};
