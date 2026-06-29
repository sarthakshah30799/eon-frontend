import { useQuery } from '@tanstack/react-query';
import { companyProfileApi } from '@/api/companyProfile';
import type { ICompanyProfileListQuery } from '../types';

export const useListCompanyProfiles = (params?: ICompanyProfileListQuery) => {
  return useQuery({
    queryKey: ['company-profiles', params],
    queryFn: async () => {
      const res = await companyProfileApi.getCompanyProfiles(params);
      if (res.error) throw new Error(res.error);
      return res.data || [];
    },
  });
};
