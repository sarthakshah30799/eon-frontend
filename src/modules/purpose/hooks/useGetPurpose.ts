import { useQuery } from '@tanstack/react-query';
import { purposeApi } from '@/api/purpose';

export const useGetPurpose = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['purposes', id],
    queryFn: () => purposeApi.getPurposeById(id),
    enabled: enabled && Boolean(id),
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
