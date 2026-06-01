import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { productProfileApi } from '@/api/productProfile';
import { PRODUCT_PROFILE_TEXTS } from '../constants';
import type { ProductProfileFormValues } from '../types';

export const useUpdateProductProfile = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ProductProfileFormValues) =>
      productProfileApi.updateProductProfile(id, data),
    onSuccess: updatedProduct => {
      if (updatedProduct) {
        queryClient.invalidateQueries({ queryKey: ['product-profiles'] });
        queryClient.invalidateQueries({ queryKey: ['product-profile', id] });
        toast.success(PRODUCT_PROFILE_TEXTS.UPDATE_SUCCESS);
      }
    },
    onError: () => {
      toast.error(PRODUCT_PROFILE_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitProductProfile: mutation.mutateAsync,
  };
};
