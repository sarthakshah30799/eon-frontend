import { useQuery } from '@tanstack/react-query';
import { tdsProfileApi } from '@/api/tdsProfile';

export const useGetTdsProfile = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['tds-profiles', id],
    queryFn: () => tdsProfileApi.getTdsProfileById(id),
    enabled: enabled && Boolean(id),
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
