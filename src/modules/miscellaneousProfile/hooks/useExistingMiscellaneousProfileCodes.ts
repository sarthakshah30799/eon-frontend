import { useQuery } from '@tanstack/react-query';
import { categoryOptionsApi } from '@/api/categoryOptions';

export const useExistingMiscellaneousProfileCodes = () => {
  return useQuery({
    queryKey: ['category-options', 'codes'],
    queryFn: () => categoryOptionsApi.getCategoryOptionCodes(),
  });
};
