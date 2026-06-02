import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { stateProfileApi } from '@/api/stateProfile';
import type { IStateProfileListQuery } from '@/modules/stateProfile/types';

export const useListStateProfiles = (params?: IStateProfileListQuery) => {
  return useQuery({
    queryKey: ['state-profiles', params],
    queryFn: () => stateProfileApi.getStateProfiles(params),
    placeholderData: keepPreviousData,
  });
};
