import { useQuery } from '@tanstack/react-query';
import { companyProfileApi } from '@/api/companyProfile';

export const useListCompanyProfiles = () => {
  return useQuery({
    queryKey: ['company-profiles'],
    queryFn: async () => {
      const res = await companyProfileApi.getCompanyProfiles();
      if (res.error) throw new Error(res.error);
      return res.data || [];
    },
  });
};
