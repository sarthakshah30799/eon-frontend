import { useQuery } from '@tanstack/react-query';
import { companyProfileApi } from '@/api/companyProfile';

export const useGetCompanyProfile = (id: string | undefined) => {
  return useQuery({
    queryKey: ['company-profile', id],
    queryFn: async () => {
      if (!id) throw new Error('Company ID is required');
      const res = await companyProfileApi.getCompanyProfileById(id);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    enabled: Boolean(id),
  });
};
