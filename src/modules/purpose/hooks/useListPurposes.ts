import { useQuery } from '@tanstack/react-query';
import { purposeApi } from '@/api/purpose';

export const useListPurposes = (search?: string) => {
  return useQuery({
    queryKey: ['purposes', search?.trim() || ''],
    queryFn: () => purposeApi.getPurposes(search),
  });
};
