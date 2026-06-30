import { useQuery } from '@tanstack/react-query';
import { categoryOptionsApi } from '@/api/categoryOptions';
import type { ICategoryOption } from '@/types/categoryOptionTypes';

export const useListMiscellaneousProfiles = (search?: string) => {
  return useQuery({
    queryKey: ['category-options', search?.trim() || ''],
    queryFn: async (): Promise<ICategoryOption[]> => {
      return categoryOptionsApi.getCategoryOptions(search);
    },
  });
};
