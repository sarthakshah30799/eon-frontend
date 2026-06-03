import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { stateProfileApi } from '@/api/stateProfile';
import type { IStateProfileListQuery } from '@/modules/stateProfile/types';

interface UseListStateProfilesParams extends IStateProfileListQuery {
  enabled?: boolean;
}

export const useListStateProfiles = (params?: UseListStateProfilesParams) => {
  const { enabled = true, ...queryParams } = params ?? {};

  return useQuery({
    queryKey: ['state-profiles', queryParams],
    queryFn: () => stateProfileApi.getStateProfiles(queryParams),
    placeholderData: keepPreviousData,
    enabled,
  });
};
