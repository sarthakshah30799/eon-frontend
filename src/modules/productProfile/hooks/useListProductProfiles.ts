import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productProfileApi } from '@/api/productProfile';
import { useCallback } from 'react';
import type { AsyncSelectResponse } from '@/components/ui';

export const useListProductProfiles = (
  filter?: boolean | { bulkBuying?: boolean; bulkSelling?: boolean; search?: string; activeOnly?: boolean }
) => {
  const queryFilter = typeof filter === 'boolean'
    ? { activeOnly: filter }
    : filter;
  const activeOnly = queryFilter?.activeOnly !== false;
  return useQuery({
    queryKey: ['product-profiles', { ...queryFilter, activeOnly }],
    queryFn: () => productProfileApi.getProductProfiles({ ...queryFilter, activeOnly }),
  });
};

export const useLoadProductOptions = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const products = await queryClient.fetchQuery({
        queryKey: ['product-profiles', { search: inputValue || undefined, activeOnly: true }],
        queryFn: () => productProfileApi.getProductProfiles({ search: inputValue || undefined, activeOnly: true }),
      });
      return {
        options: products.map(product => ({
          value: product.productCode,
          label: `${product.productCode}${product.productDescription ? ` - ${product.productDescription}` : ''}`,
        })),
      };
    },
    [queryClient]
  );
};
