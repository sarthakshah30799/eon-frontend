import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { productProfileApi } from '@/api/productProfile';
import { PRODUCT_PROFILE_TEXTS } from '../constants';
import type { IProductProfile } from '../types';
import { syncProductProfileCache } from '../utils';

interface UpdateProductProfileStatusPayload {
  id: string;
  isActiveProduct: boolean;
}

export const useUpdateProductProfileStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, isActiveProduct }: UpdateProductProfileStatusPayload) =>
      productProfileApi.updateProductProfileStatus(id, isActiveProduct),
    onMutate: async ({ id, isActiveProduct }) => {
      await queryClient.cancelQueries({ queryKey: ['product-profiles'] });
      await queryClient.cancelQueries({ queryKey: ['product-profile', id] });

      const previousProducts = queryClient.getQueriesData<IProductProfile[]>({
        queryKey: ['product-profiles'],
      });
      const previousProduct = queryClient.getQueryData<IProductProfile>([
        'product-profile',
        id,
      ]);

      queryClient.setQueriesData<IProductProfile[]>(
        { queryKey: ['product-profiles'] },
        currentProducts =>
          currentProducts?.map(product =>
            product.id === id ? { ...product, isActiveProduct } : product
          ) ?? currentProducts
      );

      queryClient.setQueryData<IProductProfile | undefined>(
        ['product-profile', id],
        currentProduct =>
          currentProduct ? { ...currentProduct, isActiveProduct } : currentProduct
      );

      return { previousProducts, previousProduct };
    },
    onError: (_error, variables, context) => {
      context?.previousProducts.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });

      if (context?.previousProduct) {
        queryClient.setQueryData(['product-profile', variables.id], context.previousProduct);
      }

      toast.error(PRODUCT_PROFILE_TEXTS.UPDATE_ERROR);
    },
    onSuccess: updatedProduct => {
      if (updatedProduct) {
        syncProductProfileCache(queryClient, updatedProduct);
        toast.success(PRODUCT_PROFILE_TEXTS.UPDATE_SUCCESS);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['product-profiles'] });
    },
  });

  return {
    ...mutation,
    updateProductProfileStatus: mutation.mutateAsync,
  };
};
