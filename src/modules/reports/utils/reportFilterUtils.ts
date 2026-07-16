import type { IReportSelectOption } from '../types';

export const toggleId = (currentIds: string[], id: string, checked: boolean) => {
  if (checked) {
    return currentIds.includes(id) ? currentIds : [...currentIds, id];
  }

  return currentIds.filter(item => item !== id);
};

export const uniqueOptions = (options: IReportSelectOption[]) => {
  const seen = new Set<string>();
  return options.filter(option => {
    if (seen.has(option.id)) {
      return false;
    }
    seen.add(option.id);
    return true;
  });
};

export const buildReportOptionLabel = (code?: string | null, name?: string | null) => {
  const normalizedCode = String(code ?? '').trim();
  const normalizedName = String(name ?? '').trim();
  if (normalizedCode && normalizedName) {
    return `${normalizedCode} - ${normalizedName}`;
  }
  return normalizedName || normalizedCode || '-';
};

export const summarizeReportSelection = (
  values: string[],
  labels: Array<{ id: string; label: string }>,
) => labels.filter(option => values.includes(option.id)).map(option => option.label);
