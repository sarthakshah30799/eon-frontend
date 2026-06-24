import type { AsyncSelectOption } from '@/components/ui';

export const buildCategoryOptionLabelMap = (options: AsyncSelectOption[]) => {
  return new Map(
    options.map(option => [String(option.value), option.label] as const)
  );
};

export const resolveCategoryOptionLabel = (
  labelMap: Map<string, string>,
  value?: string | null,
  fallback = '-'
) => {
  if (!value) {
    return fallback;
  }

  return labelMap.get(value) ?? value;
};
