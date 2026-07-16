import { useQuery } from '@tanstack/react-query';
import { productProfileApi } from '@/api/productProfile';

export const useListProductProfiles = (activeOnly = true) => {
  return useQuery({
    queryKey: ['product-profiles', activeOnly],
    queryFn: () => productProfileApi.getProductProfiles(),
    select: products =>
      activeOnly
        ? products.filter(product => product.isActiveProduct !== false)
        : products,
  });
};
