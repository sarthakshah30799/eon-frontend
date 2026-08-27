import { useQuery, useQueryClient } from '@tanstack/react-query';
import { currencyProfileApi } from '@/api/currencyProfile';
import { useCallback } from 'react';
import { normalizeCodeValue } from '@/utils';

export const useListCurrencyProfiles = (
  options?:
    | string
    | {
        search?: string;
        activeOnly?: boolean;
        includeOnlyStocking?: boolean;
        productAllowed?: string;
      },
  activeOnlyParam = true
) => {
  const queryParams =
    typeof options === 'string'
      ? { search: options || undefined, activeOnly: activeOnlyParam }
      : { ...options, activeOnly: options?.activeOnly ?? activeOnlyParam };

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
        queryKey: [
          'currency-profiles',
          { activeOnly: true, includeOnlyStocking: true },
        ],
        queryFn: () =>
          currencyProfileApi.getCurrencyProfiles({
            activeOnly: true,
            includeOnlyStocking: true,
          }),
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
        queryKey: [
          'currency-profiles',
          { search: inputValue || undefined, activeOnly: true },
        ],
        queryFn: () =>
          currencyProfileApi.getCurrencyProfiles({
            search: inputValue || undefined,
            activeOnly: true,
          }),
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
