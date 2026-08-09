/**
 * Safe localStorage helpers.
 *
 * Every value the app persists is user worship data, so a single corrupt or
 * truncated entry must never be allowed to take the whole app down. Reads fall
 * back to the supplied default (and drop the bad key), writes swallow quota and
 * private-mode errors.
 */

export const readJSON = <T,>(key: string, fallback: T, validate?: (value: unknown) => boolean): T => {
  if (typeof localStorage === 'undefined') return fallback;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return fallback;
  }
  if (raw === null) return fallback;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === null || parsed === undefined) return fallback;
    if (validate && !validate(parsed)) throw new Error('failed validation');
    return parsed as T;
  } catch {
    // Corrupt entry: drop it so the app recovers on the next load instead of
    // throwing forever.
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    return fallback;
  }
};

export const writeJSON = (key: string, value: unknown): boolean => {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Quota exceeded or storage disabled (Safari private browsing).
    return false;
  }
};

export const readString = <T extends string>(key: string, fallback: T, allowed?: readonly T[]): T => {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    if (allowed && !allowed.includes(raw as T)) return fallback;
    return raw as T;
  } catch {
    return fallback;
  }
};

export const writeString = (key: string, value: string): boolean => {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string');

export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
