import { useQuery } from '@tanstack/react-query';
import { categoryOptionsApi } from '@/api/categoryOptions';

export const useGetMiscellaneousProfile = (id: string) => {
  return useQuery({
    queryKey: ['category-option', id],
    queryFn: () => categoryOptionsApi.getCategoryOptionById(id),
    enabled: Boolean(id),
  });
};
