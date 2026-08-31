import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { companyProfileApi } from '@/api/companyProfile';
import type { ICompanyProfileListQuery } from '../types';

export const useListCompanyProfiles = (
  params?: ICompanyProfileListQuery,
  enabled = true
) => {
  return useQuery({
    queryKey: ['company-profiles', params],
    queryFn: () => companyProfileApi.getCompanyProfiles(params),
    placeholderData: keepPreviousData,
    enabled,
  });
};
