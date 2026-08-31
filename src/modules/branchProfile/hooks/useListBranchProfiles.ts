import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { branchProfileApi } from '@/api/branchProfile';
import type { AsyncSelectResponse } from '@/components/ui';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { pageToOffset, toAsyncSelectPage } from '@/utils/paginatedList';
import { normalizeCodeValue } from '@/utils';
import type { IBranchProfileListQuery } from '../types';

export const useListBranchProfiles = (
  options?: IBranchProfileListQuery,
  enabled = true
) => {
  return useQuery({
    queryKey: ['branch-profiles', options],
    queryFn: () => branchProfileApi.getBranchProfiles(options),
    placeholderData: keepPreviousData,
    enabled,
  });
};

export const useLoadBranchOptions = (filters?: { activeOnly?: boolean }) => {
  return useCallback(
    async (inputValue: string, page = 1): Promise<AsyncSelectResponse> => {
      const limit = PAGINATION_DEFAULTS.LIMIT;
      const response = await branchProfileApi.getBranchProfiles({
        activeOnly: filters?.activeOnly ?? true,
        search: inputValue.trim() || undefined,
        limit,
        offset: pageToOffset(page, limit),
      });

      return toAsyncSelectPage(response, branch => ({
        value: branch.id,
        label: `${branch.code} - ${branch.name}`,
      }));
    },
    [filters?.activeOnly]
  );
};

export const useValidateBranchCode = (currentId?: string) => {
  const queryClient = useQueryClient();
  return useCallback(
    async (value: string) => {
      const normalizedCode = normalizeCodeValue(value);
      if (!normalizedCode) {
        return false;
      }

      const branches = await queryClient.fetchQuery({
        queryKey: ['branch-profiles-all', { activeOnly: true }],
        queryFn: () =>
          branchProfileApi.getAllBranchProfiles({ activeOnly: true }),
      });
      return branches.some(
        branch =>
          branch.code.trim().toUpperCase() === normalizedCode &&
          branch.id !== currentId
      );
    },
    [queryClient, currentId]
  );
};
