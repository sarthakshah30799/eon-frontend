import { useQuery } from '@tanstack/react-query';
import { productProfileApi } from '@/api/productProfile';

export const useListProductProfiles = () => {
  return useQuery({
    queryKey: ['product-profiles'],
    queryFn: productProfileApi.getProductProfiles,
  });
};
