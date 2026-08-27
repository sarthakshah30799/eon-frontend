import { useQuery, useQueryClient } from '@tanstack/react-query';
import { branchProfileApi } from '@/api/branchProfile';
import type { IBranchProfileListQuery } from '../types';
import { useCallback } from 'react';
import { normalizeCodeValue } from '@/utils';

export const useListBranchProfiles = (
  options?: IBranchProfileListQuery,
  enabled = true
) => {
  return useQuery({
    queryKey: ['branch-profiles', options],
    queryFn: () => branchProfileApi.getBranchProfiles(options),
    enabled,
  });
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
        queryKey: ['branch-profiles', { activeOnly: true }],
        queryFn: () => branchProfileApi.getBranchProfiles({ activeOnly: true }),
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
