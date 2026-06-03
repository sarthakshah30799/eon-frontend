import { useQuery } from '@tanstack/react-query';
import { categoryOptionsApi } from '@/api/categoryOptions';
import type { CategoryOptionCode } from '@/types/categoryOptionTypes';

export const useGetCategoryOptionsByCode = (code: CategoryOptionCode) => {
  return useQuery({
    queryKey: ['category-options', code],
    queryFn: () => categoryOptionsApi.getCategoryOptionsByCode(code),
    enabled: Boolean(code),
  });
};
