import { useQuery } from '@tanstack/react-query';
import { tdsProfileApi } from '@/api/tdsProfile';

export const useListTdsProfiles = (search?: string) => {
  return useQuery({
    queryKey: ['tds-profiles', search?.trim() || ''],
    queryFn: () => tdsProfileApi.getTdsProfiles(search),
  });
};
