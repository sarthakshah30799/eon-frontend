import { formatDateTime } from './dateTimeUtils';

export const formatDateInput = (date: Date): string => {
  return formatDateTime(date, 'YYYY-MM-DD');
};

export const formatDateDisplayInput = (date: Date): string => {
  return formatDateTime(date);
};

export const maskDateInput = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (!digits) {
    return '';
  }

  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  if (digits.length <= 2) {
    return day;
  }

  if (digits.length <= 4) {
    return `${day}/${month}`;
  }

  return `${day}/${month}/${year}`;
};

/** Parse user/API date strings into a local Date for date pickers only. */
export const parseDateInput = (value: string): Date | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const parsed = new Date(`${normalized}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const match = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const directParsed = new Date(normalized);
  return Number.isNaN(directParsed.getTime()) ? null : directParsed;
};
