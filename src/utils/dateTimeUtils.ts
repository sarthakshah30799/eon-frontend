type ReferenceLike = {
  code?: string | null;
  name?: string | null;
  label?: string | null;
};

const pad = (n: number) => String(n).padStart(2, '0');

const applyFormatTokens = (
  format: string,
  tokens: Record<string, string>
): string =>
  format.replace(/DD|MM|YYYY|HH|mm|ss/g, match => tokens[match] ?? match);

/**
 * Calendar date-only values must not go through Date parsing.
 * ECMAScript treats "yyyy-MM-dd" as UTC midnight, which can shift the day
 * when formatted with local getDate() in timezones west of UTC.
 */
const extractCalendarDateParts = (
  value: string
): { year: string; month: string; day: string } | null => {
  const trimmed = value.trim();
  const exact = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (exact) {
    const [, year, month, day] = exact;
    return { year, month, day };
  }

  // Date with zeroed local/unspecified time and no timezone designator.
  const midnight = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T]00:00:00(?:\.0+)?$/
  );
  if (midnight) {
    const [, year, month, day] = midnight;
    return { year, month, day };
  }

  return null;
};

/**
 * Single display formatter for FE dates.
 *
 * - Date-only (`yyyy-MM-dd`): calendar parts, no timezone conversion
 * - Timestamps / Date: browser local timezone
 * - Empty: `-`
 *
 * Prefer this (or `toDisplayDate`) everywhere dates are shown. Do not add
 * local `new Date(dateOnly).toLocaleDateString()` / split-reverse helpers.
 */
export const formatDateTime = (
  value?: string | Date | null,
  format = 'DD/MM/YYYY'
): string => {
  if (!value) {
    return '-';
  }

  if (typeof value === 'string') {
    const calendar = extractCalendarDateParts(value);
    if (calendar) {
      return applyFormatTokens(format, {
        DD: calendar.day,
        MM: calendar.month,
        YYYY: calendar.year,
        HH: '00',
        mm: '00',
        ss: '00',
      });
    }
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  // Full timestamps (including ISO with Z) use the browser local timezone.
  return applyFormatTokens(format, {
    DD: pad(date.getDate()),
    MM: pad(date.getMonth() + 1),
    YYYY: String(date.getFullYear()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  });
};

/**
 * Same calendar/timestamp rules as `formatDateTime`, but empty values return
 * `''` (for form labels / inputs) instead of `-`.
 */
export const toDisplayDate = (
  value?: string | number | Date | readonly string[] | null,
  format = 'DD/MM/YYYY'
): string => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  if (Array.isArray(value)) {
    const first = value[0];
    if (first === undefined || first === null || first === '') {
      return '';
    }
    return toDisplayDate(first, format);
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const formatted = formatDateTime(date, format);
    return formatted === '-' ? '' : formatted;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return '';
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalized)) {
    return normalized;
  }

  const formatted = formatDateTime(
    value instanceof Date ? value : normalized,
    format
  );
  return formatted === '-' ? '' : formatted;
};

export const formatReferenceLabel = (value?: ReferenceLike | null): string => {
  if (!value) {
    return '-';
  }

  if (value.label) {
    return value.label;
  }

  if (value.code && value.name) {
    return `${value.code} - ${value.name}`;
  }

  return value.name || value.code || '-';
};
