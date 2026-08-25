import { useQuery } from '@tanstack/react-query';
import { purposeGroupApi } from '@/api/purpose-group';

export const useGetPurposeGroup = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['purpose-groups', id],
    queryFn: () => purposeGroupApi.getPurposeGroupById(id),
    enabled: enabled && Boolean(id),
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
