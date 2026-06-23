import { useQuery } from '@tanstack/react-query';
import { tdsProfileApi } from '@/api/tdsProfile';

export const useListTdsProfiles = () => {
  return useQuery({
    queryKey: ['tds-profiles'],
    queryFn: tdsProfileApi.getTdsProfiles,
  });
};
