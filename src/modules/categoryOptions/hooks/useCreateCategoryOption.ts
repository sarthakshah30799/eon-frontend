import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { categoryOptionsApi } from '@/api/categoryOptions';
import { CATEGORY_OPTIONS_TEXTS } from '../constants';
import type { ICreateCategoryOption } from '@/types/categoryOptionTypes';

export const useCreateCategoryOption = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateCategoryOption) =>
      categoryOptionsApi.createCategoryOption(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['category-options'] });
      toast.success(CATEGORY_OPTIONS_TEXTS.CREATE_SUCCESS);
    },
    onError: () => {
      toast.error(CATEGORY_OPTIONS_TEXTS.CREATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitCategoryOption: mutation.mutateAsync,
  };
};
