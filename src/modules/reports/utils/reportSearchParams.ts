import { buildReportDateRange } from './reportDateUtils';
import {
  ReportDatePresetEnum,
  type IReportDateRange,
  type ReportDatePreset,
} from '../types';

export const parseSearchParamList = (value: string | null): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

export const readSearchParamList = (
  searchParams: URLSearchParams,
  key: string
): string[] => {
  const repeatedValues = searchParams.getAll(key);
  if (repeatedValues.length === 0) {
    return parseSearchParamList(searchParams.get(key));
  }

  return repeatedValues
    .flatMap(value => parseSearchParamList(value))
    .filter(Boolean);
};

export const readSearchParamValue = (
  searchParams: URLSearchParams,
  key: string
): string => {
  return searchParams.get(key)?.trim() ?? '';
};

export const readSearchParamBoolean = (
  searchParams: URLSearchParams,
  key: string
): boolean => {
  const value = readSearchParamValue(searchParams, key).toLowerCase();
  return value === '1' || value === 'true' || value === 'yes';
};

export const setSearchParamList = (
  searchParams: URLSearchParams,
  key: string,
  values: string[]
) => {
  searchParams.delete(key);
  values.forEach(value => {
    const normalized = String(value ?? '').trim();
    if (normalized) {
      searchParams.append(key, normalized);
    }
  });
};

export const setSearchParamValue = (
  searchParams: URLSearchParams,
  key: string,
  value?: string | null
) => {
  searchParams.delete(key);
  const normalized = String(value ?? '').trim();
  if (normalized) {
    searchParams.set(key, normalized);
  }
};

export const setSearchParamBoolean = (
  searchParams: URLSearchParams,
  key: string,
  value: boolean
) => {
  searchParams.delete(key);
  if (value) {
    searchParams.set(key, '1');
  }
};

export const buildSearchParams = (
  base?: URLSearchParams,
  updater?: (next: URLSearchParams) => void
) => {
  const next = new URLSearchParams(base);
  updater?.(next);
  return next;
};

export const readDateRangeSearchParams = (
  searchParams: URLSearchParams,
  defaultPreset: ReportDatePreset = ReportDatePresetEnum.TODAY
): IReportDateRange => {
  const presetRaw = readSearchParamValue(
    searchParams,
    'datePreset'
  ).toUpperCase();
  const preset = Object.values(ReportDatePresetEnum).includes(
    presetRaw as ReportDatePreset
  )
    ? (presetRaw as ReportDatePreset)
    : defaultPreset;

  const startDate = readSearchParamValue(searchParams, 'startDate');
  const endDate = readSearchParamValue(searchParams, 'endDate');

  if (preset === ReportDatePresetEnum.CUSTOM) {
    const fallback = buildReportDateRange(ReportDatePresetEnum.CUSTOM);
    return {
      preset,
      startDate: startDate || fallback.startDate,
      endDate: endDate || fallback.endDate,
    };
  }

  return buildReportDateRange(preset);
};
