import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { productProfileApi } from '@/api/productProfile';
import { useCallback } from 'react';
import type { AsyncSelectResponse } from '@/components/ui';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { pageToOffset, toAsyncSelectPage } from '@/utils/paginatedList';
import type { IProductProfileListQuery } from '../types';

export const useListProductProfiles = (
  filter?:
    | boolean
    | IProductProfileListQuery,
  enabled = true
) => {
  const queryFilter: IProductProfileListQuery =
    typeof filter === 'boolean' ? { activeOnly: filter } : (filter ?? {});
  const activeOnly = queryFilter.activeOnly !== false;
  return useQuery({
    queryKey: ['product-profiles', { ...queryFilter, activeOnly }],
    queryFn: () =>
      productProfileApi.getProductProfiles({ ...queryFilter, activeOnly }),
    placeholderData: keepPreviousData,
    enabled,
  });
};

export const useLoadProductOptions = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (inputValue: string, page = 1): Promise<AsyncSelectResponse> => {
      const limit = PAGINATION_DEFAULTS.LIMIT;
      const response = await queryClient.fetchQuery({
        queryKey: [
          'product-profiles',
          {
            search: inputValue.trim() || undefined,
            activeOnly: true,
            limit,
            offset: pageToOffset(page, limit),
          },
        ],
        queryFn: () =>
          productProfileApi.getProductProfiles({
            search: inputValue.trim() || undefined,
            activeOnly: true,
            limit,
            offset: pageToOffset(page, limit),
          }),
      });
      return toAsyncSelectPage(response, product => ({
        value: product.productCode,
        label: `${product.productCode}${product.productDescription ? ` - ${product.productDescription}` : ''}`,
      }));
    },
    [queryClient]
  );
};
