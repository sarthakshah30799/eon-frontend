import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { productProfileApi } from '@/api/productProfile';
import { PRODUCT_PROFILE_TEXTS } from '../constants';

interface UpdateProductProfileStatusPayload {
  id: string;
  isActiveProduct: boolean;
}

export const useUpdateProductProfileStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, isActiveProduct }: UpdateProductProfileStatusPayload) =>
      productProfileApi.updateProductProfileStatus(id, isActiveProduct),
    onSuccess: updatedProduct => {
      if (updatedProduct) {
        queryClient.invalidateQueries({ queryKey: ['product-profiles'] });
        queryClient.invalidateQueries({
          queryKey: ['product-profile', updatedProduct.id],
        });
        toast.success(PRODUCT_PROFILE_TEXTS.UPDATE_SUCCESS);
      }
    },
    onError: () => {
      toast.error(PRODUCT_PROFILE_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    updateProductProfileStatus: mutation.mutateAsync,
  };
};
