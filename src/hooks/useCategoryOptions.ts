import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryOptionsApi } from '@/api/categoryOptions';
import type { AsyncSelectOption, AsyncSelectResponse } from '@/components/ui';
import type {
  ICategoryOption,
  CategoryOptionCode,
} from '@/types/categoryOptionTypes';

const CATEGORY_OPTIONS_STALE_TIME = 5 * 60 * 1000;

const toAsyncSelectOption = (option: ICategoryOption): AsyncSelectOption => ({
  value: option.id,
  label: option.label,
});

const filterOptions = (
  options: ICategoryOption[],
  inputValue: string
): ICategoryOption[] => {
  const normalizedValue = inputValue.trim().toLowerCase();

  if (!normalizedValue) {
    return options;
  }

  return options.filter(option => {
    const label = option.label.trim().toLowerCase();
    const value = option.value.trim().toLowerCase();

    return label.includes(normalizedValue) || value.includes(normalizedValue);
  });
};

const createQueryKey = (code: CategoryOptionCode) => [
  'category-options',
  code.trim().toLowerCase(),
];

export const useCategoryOptions = (code: CategoryOptionCode) => {
  const normalizedCode = code.trim() as CategoryOptionCode;
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => createQueryKey(normalizedCode), [normalizedCode]);

  const query = useQuery({
    queryKey,
    queryFn: () => categoryOptionsApi.getCategoryOptionsByCode(normalizedCode),
    enabled: Boolean(normalizedCode),
    staleTime: CATEGORY_OPTIONS_STALE_TIME,
  });

  const loadOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      if (!normalizedCode) {
        return { options: [] };
      }

      const options = await queryClient.fetchQuery({
        queryKey,
        queryFn: () => categoryOptionsApi.getCategoryOptionsByCode(normalizedCode),
        staleTime: CATEGORY_OPTIONS_STALE_TIME,
      });

      return {
        options: filterOptions(options, inputValue).map(toAsyncSelectOption),
      };
    },
    [normalizedCode, queryClient, queryKey]
  );

  const createOption = useCallback(
    async (inputValue: string, label?: string): Promise<AsyncSelectOption> => {
      const trimmedValue = inputValue.trim();
      const trimmedLabel = (label ?? inputValue).trim();

      if (!trimmedValue) {
        throw new Error('Option value is required');
      }

      const created = await categoryOptionsApi.createCategoryOption({
        code: normalizedCode,
        value: trimmedValue,
        label: trimmedLabel,
        sortOrder: 0,
        isActive: true,
      });

      queryClient.setQueryData<ICategoryOption[]>(queryKey, previous => {
        const nextOptions = [
          ...(previous ?? []).filter(option => option.id !== created.id),
          created,
        ];

        return nextOptions.sort((left, right) => {
          if (left.sortOrder !== right.sortOrder) {
            return left.sortOrder - right.sortOrder;
          }

          return left.label.localeCompare(right.label);
        });
      });

      return toAsyncSelectOption(created);
    },
    [normalizedCode, queryClient, queryKey]
  );

  return {
    defaultOptions: useMemo(
      () => (query.data ?? []).map(toAsyncSelectOption),
      [query.data]
    ),
    loadOptions,
    createOption,
    isLoading: query.isLoading,
  };
};
