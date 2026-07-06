import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryOptionsApi } from '@/api/categoryOptions';
import type { AsyncSelectOption, AsyncSelectResponse } from '@/components/ui';
import type { CategoryOptionCode } from '@/types/categoryOptionTypes';
import type { IStaticCategoryOption } from '@/api/categoryOptions/categoryOptions.api';
import { STATIC_CATEGORY_OPTION_CODES } from '../constants';

const STATIC_CATEGORY_CODES = new Set<CategoryOptionCode>(
  STATIC_CATEGORY_OPTION_CODES
);

const isStaticCategoryCode = (code?: CategoryOptionCode | string | null) => {
  if (!code) {
    return false;
  }

  return STATIC_CATEGORY_CODES.has(code.trim() as CategoryOptionCode);
};

const toAsyncSelectOption = (option: IStaticCategoryOption): AsyncSelectOption => ({
  value: option.value,
  label: option.label,
});

const filterOptions = (
  options: IStaticCategoryOption[],
  inputValue: string
): IStaticCategoryOption[] => {
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

export const useStaticMiscellaneousProfileOptions = (
  code?: CategoryOptionCode | string | null
) => {
  const normalizedCode = code?.trim() ?? '';
  const queryClient = useQueryClient();
  const enabled = isStaticCategoryCode(normalizedCode);
  const queryKey = useMemo(
    () => ['static-category-options', normalizedCode.toLowerCase()],
    [normalizedCode]
  );

  const query = useQuery({
    queryKey,
    queryFn: () =>
      categoryOptionsApi.getStaticCategoryOptions(
        normalizedCode as CategoryOptionCode
      ),
    enabled,
    staleTime: Infinity,
  });

  const loadOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      if (!enabled) {
        return { options: [] };
      }

      const options = await queryClient.fetchQuery({
        queryKey,
        queryFn: () =>
          categoryOptionsApi.getStaticCategoryOptions(
            normalizedCode as CategoryOptionCode
          ),
        staleTime: Infinity,
      });

      return {
        options: filterOptions(options, inputValue).map(toAsyncSelectOption),
      };
    },
    [enabled, normalizedCode, queryClient, queryKey]
  );

  return {
    defaultOptions: useMemo(
      () => (query.data ?? []).map(toAsyncSelectOption),
      [query.data]
    ),
    loadOptions,
    isLoading: query.isLoading,
    isStaticCategoryCode: enabled,
  };
};
