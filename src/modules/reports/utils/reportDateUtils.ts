import { formatDateInput } from '@/utils';
import {
  ReportDatePresetEnum,
  type IReportDateRange,
  type ReportDatePreset,
} from '../types';

const cloneDate = (date: Date) => new Date(date.getTime());

const startOfDay = (date: Date) => {
  const next = cloneDate(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date: Date) => {
  const next = cloneDate(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const startOfWeek = (date: Date) => {
  const next = startOfDay(date);
  const day = next.getDay();
  const offset = day === 0 ? 6 : day - 1;
  next.setDate(next.getDate() - offset);
  return next;
};

const endOfWeek = (date: Date) => {
  const next = startOfWeek(date);
  next.setDate(next.getDate() + 6);
  return endOfDay(next);
};

const startOfMonth = (date: Date) => {
  const next = startOfDay(date);
  next.setDate(1);
  return next;
};

const endOfMonth = (date: Date) => {
  const next = startOfMonth(date);
  next.setMonth(next.getMonth() + 1);
  next.setDate(0);
  return endOfDay(next);
};

const shiftDays = (date: Date, amount: number) => {
  const next = startOfDay(date);
  next.setDate(next.getDate() + amount);
  return next;
};

export const buildReportDateRange = (
  preset: ReportDatePreset,
  referenceDate = new Date(),
): IReportDateRange => {
  const current = cloneDate(referenceDate);

  switch (preset) {
    case ReportDatePresetEnum.YESTERDAY: {
      const day = shiftDays(current, -1);
      return {
        preset,
        startDate: formatDateInput(day),
        endDate: formatDateInput(day),
      };
    }
    case ReportDatePresetEnum.CURRENT_WEEK:
      return {
        preset,
        startDate: formatDateInput(startOfWeek(current)),
        endDate: formatDateInput(endOfWeek(current)),
      };
    case ReportDatePresetEnum.LAST_WEEK: {
      const lastWeekAnchor = shiftDays(startOfWeek(current), -7);
      return {
        preset,
        startDate: formatDateInput(lastWeekAnchor),
        endDate: formatDateInput(endOfDay(shiftDays(lastWeekAnchor, 6))),
      };
    }
    case ReportDatePresetEnum.CURRENT_MONTH:
      return {
        preset,
        startDate: formatDateInput(startOfMonth(current)),
        endDate: formatDateInput(endOfMonth(current)),
      };
    case ReportDatePresetEnum.LAST_MONTH: {
      const lastMonth = new Date(current.getFullYear(), current.getMonth() - 1, 1);
      return {
        preset,
        startDate: formatDateInput(startOfMonth(lastMonth)),
        endDate: formatDateInput(endOfMonth(lastMonth)),
      };
    }
    case ReportDatePresetEnum.CUSTOM:
      return {
        preset,
        startDate: formatDateInput(startOfDay(current)),
        endDate: formatDateInput(endOfDay(current)),
      };
    case ReportDatePresetEnum.TODAY:
    default: {
      const day = startOfDay(current);
      return {
        preset: ReportDatePresetEnum.TODAY,
        startDate: formatDateInput(day),
        endDate: formatDateInput(day),
      };
    }
  }
};

export const formatReportDateRangeLabel = (range: IReportDateRange) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-GB');
  };

  return `${formatDate(range.startDate)} to ${formatDate(range.endDate)}`;
};

