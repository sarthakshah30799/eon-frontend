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

export const parseDateInput = (value: string): Date | null => {
  if (!value) {
    return null;
  }

  const isoParsed = new Date(`${value}T00:00:00`);
  if (!Number.isNaN(isoParsed.getTime())) {
    return isoParsed;
  }

  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
