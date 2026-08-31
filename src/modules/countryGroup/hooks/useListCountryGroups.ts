import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { countryGroupApi } from '@/api/countryGroup';
import { useCallback } from 'react';
import type { AsyncSelectResponse } from '@/components/ui';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { pageToOffset, toAsyncSelectPage } from '@/utils/paginatedList';
import type { ICountryGroupListQuery } from '../types';

export const useListCountryGroups = (
  search?: ICountryGroupListQuery | string,
  enabled = true
) => {
  const params: ICountryGroupListQuery | undefined =
    typeof search === 'string' ? { search: search.trim() || undefined } : search;

  return useQuery({
    queryKey: ['country-groups', params],
    queryFn: () => countryGroupApi.getCountryGroups(params),
    placeholderData: keepPreviousData,
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled,
  });
};

export const useLoadCountryGroupOptions = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (inputValue: string, page = 1): Promise<AsyncSelectResponse> => {
      const limit = PAGINATION_DEFAULTS.LIMIT;
      const response = await queryClient.fetchQuery({
        queryKey: [
          'country-groups',
          {
            search: inputValue.trim() || undefined,
            limit,
            offset: pageToOffset(page, limit),
          },
        ],
        queryFn: () =>
          countryGroupApi.getCountryGroups({
            search: inputValue.trim() || undefined,
            limit,
            offset: pageToOffset(page, limit),
          }),
      });
      return toAsyncSelectPage(response, group => ({
        value: group.id,
        label: group.name,
      }));
    },
    [queryClient]
  );
};
