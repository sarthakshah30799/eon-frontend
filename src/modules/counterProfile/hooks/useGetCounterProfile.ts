import { useQuery } from '@tanstack/react-query';
import { counterProfileApi } from '@/api/counterProfile';

export const useGetCounterProfile = (id: string) => {
  return useQuery({
    queryKey: ['counter-profile', id],
    queryFn: () => counterProfileApi.getCounterProfileById(id),
    enabled: Boolean(id),
  });
};
