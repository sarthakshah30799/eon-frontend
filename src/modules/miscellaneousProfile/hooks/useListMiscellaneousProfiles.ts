import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { categoryOptionsApi } from '@/api/categoryOptions';
import type { ICategoryOptionListQuery } from '@/api/categoryOptions/categoryOptions.api';

export const useListMiscellaneousProfiles = (
  params?: ICategoryOptionListQuery
) => {
  return useQuery({
    queryKey: ['category-options', params],
    queryFn: () => categoryOptionsApi.getCategoryOptions(params),
    placeholderData: keepPreviousData,
  });
};
