import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { productProfileApi } from '@/api/productProfile';
import { PRODUCT_PROFILE_TEXTS } from '../constants';
import type { ICreateProductProfile } from '../types';

export const useCreateProductProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateProductProfile) =>
      productProfileApi.createProductProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-profiles'] });
      toast.success(PRODUCT_PROFILE_TEXTS.CREATE_SUCCESS);
    },
    onError: () => {
      toast.error(PRODUCT_PROFILE_TEXTS.CREATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitProductProfile: mutation.mutateAsync,
  };
};
