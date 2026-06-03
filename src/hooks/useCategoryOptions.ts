import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryOptionsApi } from '@/api/categoryOptions';
import type { AsyncSelectOption, AsyncSelectResponse } from '@/components/ui';
import type {
  ICategoryOption,
  CategoryOptionCode,
  ICreateCategoryOption,
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

const sortCategoryOptions = (options: ICategoryOption[]) =>
  [...options].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.label.localeCompare(right.label);
  });

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

  const createOptions = useCallback(
    async (
      options: Array<
        Pick<ICreateCategoryOption, 'value' | 'label' | 'sortOrder' | 'isActive'>
      >
    ): Promise<AsyncSelectOption[]> => {
      const payload = options
        .map(option => ({
          code: normalizedCode,
          value: option.value.trim(),
          label: option.label.trim(),
          sortOrder: option.sortOrder ?? 0,
          isActive: option.isActive ?? true,
        }))
        .filter(option => Boolean(option.value));

      if (payload.length === 0) {
        throw new Error('Option value is required');
      }

      const created = await categoryOptionsApi.bulkUpsertCategoryOptions(
        payload
      );

      queryClient.setQueryData<ICategoryOption[]>(queryKey, previous => {
        const nextOptionsMap = new Map<string, ICategoryOption>();

        (previous ?? []).forEach(option => {
          nextOptionsMap.set(option.id, option);
        });

        created.forEach(option => {
          nextOptionsMap.set(option.id, option);
        });

        return sortCategoryOptions(Array.from(nextOptionsMap.values()));
      });

      return created.map(toAsyncSelectOption);
    },
    [normalizedCode, queryClient, queryKey]
  );

  const createOption = useCallback(
    async (inputValue: string, label?: string): Promise<AsyncSelectOption> => {
      const [createdOption] = await createOptions([
        {
          value: inputValue,
          label: label ?? inputValue,
        },
      ]);

      if (!createdOption) {
        throw new Error('Failed to create category option');
      }

      return createdOption;
    },
    [createOptions]
  );

  return {
    defaultOptions: useMemo(
      () => (query.data ?? []).map(toAsyncSelectOption),
      [query.data]
    ),
    loadOptions,
    createOption,
    createOptions,
    isLoading: query.isLoading,
  };
};
