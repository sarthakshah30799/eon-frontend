import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { currencyProfileApi } from '@/api/currencyProfile';
import { useCallback } from 'react';
import type { AsyncSelectResponse } from '@/components/ui';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { normalizeCodeValue } from '@/utils';
import { pageToOffset, toAsyncSelectPage } from '@/utils/paginatedList';
import type { ICurrencyProfileListQuery } from '../types';

export const useListCurrencyProfiles = (
  options?: ICurrencyProfileListQuery | string,
  activeOnlyParam = true,
  enabled = true
) => {
  const queryParams: ICurrencyProfileListQuery | undefined =
    typeof options === 'string'
      ? { search: options || undefined, activeOnly: activeOnlyParam }
      : { ...options, activeOnly: options?.activeOnly ?? activeOnlyParam };

  return useQuery({
    queryKey: ['currency-profiles', queryParams],
    queryFn: () => currencyProfileApi.getCurrencyProfiles(queryParams),
    placeholderData: keepPreviousData,
    enabled,
  });
};

export const useValidateCurrencyCode = (currentId?: string) => {
  const queryClient = useQueryClient();
  return useCallback(
    async (value: string) => {
      const normalizedCode = normalizeCodeValue(value);
      if (!normalizedCode) {
        return false;
      }

      const res = await queryClient.fetchQuery({
        queryKey: [
          'currency-profiles',
          {
            activeOnly: true,
            includeOnlyStocking: true,
            limit: PAGINATION_DEFAULTS.LIMIT,
            offset: PAGINATION_DEFAULTS.OFFSET,
            search: normalizedCode,
          },
        ],
        queryFn: () =>
          currencyProfileApi.getCurrencyProfiles({
            activeOnly: true,
            includeOnlyStocking: true,
            limit: PAGINATION_DEFAULTS.LIMIT,
            offset: PAGINATION_DEFAULTS.OFFSET,
            search: normalizedCode,
          }),
      });
      return (res.data ?? []).some(
        currency =>
          normalizeCodeValue(currency.currencyCode) === normalizedCode &&
          currency.id !== currentId
      );
    },
    [queryClient, currentId]
  );
};

export const useLoadCurrencyOptions = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (inputValue: string, page = 1): Promise<AsyncSelectResponse> => {
      const limit = PAGINATION_DEFAULTS.LIMIT;
      const response = await queryClient.fetchQuery({
        queryKey: [
          'currency-profiles',
          {
            search: inputValue.trim() || undefined,
            activeOnly: true,
            limit,
            offset: pageToOffset(page, limit),
          },
        ],
        queryFn: () =>
          currencyProfileApi.getCurrencyProfiles({
            search: inputValue.trim() || undefined,
            activeOnly: true,
            limit,
            offset: pageToOffset(page, limit),
          }),
      });

      return toAsyncSelectPage(response, currency => ({
        value: currency.currencyCode,
        label: `${currency.currencyCode}${currency.currencyName ? ` - ${currency.currencyName}` : ''}`,
      }));
    },
    [queryClient]
  );
};
