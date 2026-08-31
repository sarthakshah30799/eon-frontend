import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { counterProfileApi } from '@/api/counterProfile';
import type { AsyncSelectResponse } from '@/components/ui';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { pageToOffset, toAsyncSelectPage } from '@/utils/paginatedList';
import type { ICounterProfileListQuery } from '../types';

export const useListCounterProfiles = (
  options?: ICounterProfileListQuery,
  enabled = true
) => {
  return useQuery({
    queryKey: ['counter-profiles', options],
    queryFn: () => counterProfileApi.getCounterProfiles(options),
    placeholderData: keepPreviousData,
    enabled,
  });
};

export const useLoadCounterOptions = (filters?: {
  activeOnly?: boolean;
  branchId?: string;
}) => {
  const queryClient = useQueryClient();
  return useCallback(
    async (inputValue: string, page = 1): Promise<AsyncSelectResponse> => {
      const limit = PAGINATION_DEFAULTS.LIMIT;
      const response = await queryClient.fetchQuery({
        queryKey: [
          'counter-profiles',
          {
            search: inputValue.trim() || undefined,
            activeOnly: filters?.activeOnly ?? true,
            branchId: filters?.branchId,
            limit,
            offset: pageToOffset(page, limit),
          },
        ],
        queryFn: () =>
          counterProfileApi.getCounterProfiles({
            search: inputValue.trim() || undefined,
            activeOnly: filters?.activeOnly ?? true,
            branchId: filters?.branchId,
            limit,
            offset: pageToOffset(page, limit),
          }),
      });

      return toAsyncSelectPage(response, counter => ({
        value: counter.id,
        label: `${counter.counterNo} - ${counter.name}`,
      }));
    },
    [filters?.activeOnly, filters?.branchId, queryClient]
  );
};
