import { fail, ok, type Result } from './result';

export type TimestampUnit = 'auto' | 's' | 'ms';

export interface TimestampDetails {
  date: Date;
  /** How the input was interpreted, for display. */
  interpretation: string;
  unixSeconds: number;
  unixMilliseconds: number;
  iso: string;
  utc: string;
  local: string;
  relative: string;
}

/** Numbers below this magnitude are treated as seconds in auto mode (1e11 s is the year 5138). */
const SECONDS_THRESHOLD = 1e11;
// ECMAScript dates cover ±8.64e15 ms around the epoch.
const MAX_MS = 8.64e15;

function relativeTime(target: number, now: number, locale?: string): string {
  const diff = target - now;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000_000],
    ['month', 2_592_000_000],
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
    ['second', 1000],
  ];
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (const [unit, size] of units) {
    if (Math.abs(diff) >= size || unit === 'second') {
      return formatter.format(Math.round(diff / size) || 0, unit);
    }
  }
  /* c8 ignore next */
  return '';
}

/**
 * Interprets a Unix timestamp (seconds or milliseconds) or a date string and returns the
 * same instant in several formats. In `auto` mode, numbers with an absolute value below
 * 100 000 000 000 are read as seconds and larger ones as milliseconds.
 */
export function convertTimestamp(
  input: string,
  options: { unit?: TimestampUnit; now?: number; locale?: string; timeZone?: string } = {},
): Result<TimestampDetails> {
  const { unit = 'auto', now = Date.now(), locale, timeZone } = options;
  const text = input.trim();
  if (text === '')
    return fail(
      'Enter a Unix timestamp or a date, for example 1767225600 or 2026-01-01T00:00:00Z.',
    );

  let ms: number;
  let interpretation: string;
  if (/^[+-]?\d+(\.\d+)?$/.test(text)) {
    const value = Number(text);
    const asSeconds = unit === 's' || (unit === 'auto' && Math.abs(value) < SECONDS_THRESHOLD);
    ms = asSeconds ? value * 1000 : value;
    interpretation = asSeconds ? 'Unix time in seconds' : 'Unix time in milliseconds';
  } else {
    ms = Date.parse(text);
    interpretation = 'Date string';
    if (Number.isNaN(ms)) {
      return fail(
        'This is not a number or a date format the browser recognises. Try an ISO 8601 date such as 2026-01-01T12:00:00Z.',
      );
    }
  }

  if (!Number.isFinite(ms) || Math.abs(ms) > MAX_MS) {
    return fail('This value is outside the range JavaScript dates support (about ±275,000 years).');
  }

  const date = new Date(ms);
  const full: Intl.DateTimeFormatOptions = { dateStyle: 'full', timeStyle: 'long' };
  return ok({
    date,
    interpretation,
    unixSeconds: Math.floor(ms / 1000),
    unixMilliseconds: ms,
    iso: date.toISOString(),
    utc: new Intl.DateTimeFormat(locale, { ...full, timeZone: 'UTC' }).format(date),
    local: new Intl.DateTimeFormat(locale, { ...full, timeZone }).format(date),
    relative: relativeTime(ms, now, locale),
  });
}
