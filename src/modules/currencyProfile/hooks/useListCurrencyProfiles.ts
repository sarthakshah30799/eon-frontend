import { useQuery, useQueryClient } from '@tanstack/react-query';
import { currencyProfileApi } from '@/api/currencyProfile';
import { useCallback } from 'react';
import { normalizeCodeValue } from '@/utils';

export const useListCurrencyProfiles = (
  options?: string | { search?: string; activeOnly?: boolean; country?: string; group?: string; pricingGroup?: string; pricingGroupId?: string; status?: string; onlyStocking?: string; stocking?: string },
  activeOnlyParam?: boolean
) => {
  let queryParams: Record<string, unknown>;
  if (typeof options === 'string') {
    queryParams = { search: options || undefined };
    if (activeOnlyParam !== undefined) queryParams.activeOnly = activeOnlyParam;
  } else {
    queryParams = { ...(options as Record<string, unknown>) };
    if (queryParams.activeOnly === undefined && activeOnlyParam !== undefined) {
      queryParams.activeOnly = activeOnlyParam;
    }
    if (queryParams.activeOnly === undefined) {
      delete queryParams.activeOnly;
    }
  }

  return useQuery({
    queryKey: ['currency-profiles', queryParams],
    queryFn: () => currencyProfileApi.getCurrencyProfiles(queryParams),
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

      const currencies = await queryClient.fetchQuery({
        queryKey: ['currency-profiles', { activeOnly: true }],
        queryFn: () => currencyProfileApi.getCurrencyProfiles({ activeOnly: true }),
      });
      return currencies.some(
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
    async (inputValue: string) => {
      const currencies = await queryClient.fetchQuery({
        queryKey: ['currency-profiles', { search: inputValue || undefined, activeOnly: true }],
        queryFn: () => currencyProfileApi.getCurrencyProfiles({ search: inputValue || undefined, activeOnly: true }),
      });
      return {
        options: currencies.map(currency => ({
          value: currency.currencyCode,
          label: `${currency.currencyCode}${currency.currencyName ? ` - ${currency.currencyName}` : ''}`,
        })),
      };
    },
    [queryClient]
  );
};
