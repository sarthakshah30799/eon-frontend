import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { categoryOptionsApi } from '@/api/categoryOptions';
import { CATEGORY_OPTIONS_TEXTS } from '../constants';
import type { ICreateCategoryOption } from '@/types/categoryOptionTypes';

export const useUpdateCategoryOption = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ICreateCategoryOption;
    }) => categoryOptionsApi.updateCategoryOption(id, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['category-options'] });
      await queryClient.invalidateQueries({ queryKey: ['category-option', variables.id] });
      toast.success(CATEGORY_OPTIONS_TEXTS.UPDATE_SUCCESS);
    },
    onError: () => {
      toast.error(CATEGORY_OPTIONS_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitCategoryOption: mutation.mutateAsync,
  };
};
