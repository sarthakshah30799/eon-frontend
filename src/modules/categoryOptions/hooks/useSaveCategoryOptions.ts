import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { categoryOptionsApi } from '@/api/categoryOptions';
import { CATEGORY_OPTIONS_TEXTS } from '../constants';
import type { ICreateCategoryOption } from '@/types/categoryOptionTypes';

interface SaveCategoryOptionsPayload {
  updates: Array<{
    id: string;
    data: ICreateCategoryOption;
  }>;
  creates: ICreateCategoryOption[];
}

export const useSaveCategoryOptions = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ updates, creates }: SaveCategoryOptionsPayload) => {
      const updatedOptions = await Promise.all(
        updates.map(item =>
          categoryOptionsApi.updateCategoryOption(item.id, item.data)
        )
      );
      const createdOptions =
        creates.length > 0
          ? await categoryOptionsApi.bulkUpsertCategoryOptions(creates)
          : [];

      return [...updatedOptions, ...createdOptions];
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['category-options'] });
      toast.success(CATEGORY_OPTIONS_TEXTS.UPDATE_SUCCESS);
    },
    onError: () => {
      toast.error(CATEGORY_OPTIONS_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitCategoryOptions: mutation.mutateAsync,
  };
};
