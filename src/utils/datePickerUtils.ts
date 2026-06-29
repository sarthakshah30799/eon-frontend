export const formatDateInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatDateDisplayInput = (date: Date): string => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
};

export const maskDateInput = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (!digits) {
    return '';
  }

  const month = digits.slice(0, 2);
  const day = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  if (digits.length <= 2) {
    return month;
  }

  if (digits.length <= 4) {
    return `${month}/${day}`;
  }

  return `${month}/${day}/${year}`;
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

  const [, month, day, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
