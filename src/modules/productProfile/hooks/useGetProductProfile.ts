import { useQuery } from '@tanstack/react-query';
import { productProfileApi } from '@/api/productProfile';

export const useGetProductProfile = (id: string) => {
  return useQuery({
    queryKey: ['product-profile', id],
    queryFn: () => productProfileApi.getProductProfileById(id),
    enabled: Boolean(id),
  });
};
