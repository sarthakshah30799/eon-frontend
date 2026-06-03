import { useQuery } from '@tanstack/react-query';
import { categoryOptionsApi } from '@/api/categoryOptions';

export const useListCategoryOptions = () => {
  return useQuery({
    queryKey: ['category-options'],
    queryFn: () => categoryOptionsApi.getCategoryOptions(),
  });
};
