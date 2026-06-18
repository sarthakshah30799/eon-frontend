import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { additionalSettingsApi } from '@/api/additionalSettings';
import type { IAdditionalSettingCategoryFormValues } from '../types';
import { ADDITIONAL_SETTINGS_TEXTS } from '../constants';

export const useUpdateAdditionalSettingCategory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      categoryId,
      values,
    }: {
      categoryId: string;
      values: IAdditionalSettingCategoryFormValues;
    }) => additionalSettingsApi.updateAdditionalSetting(categoryId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['additional-settings'] });
      queryClient.invalidateQueries({ queryKey: ['password-policy'] });
      toast.success(ADDITIONAL_SETTINGS_TEXTS.UPDATE_SUCCESS);
    },
    onError: () => {
      toast.error(ADDITIONAL_SETTINGS_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitAdditionalSettingCategory: mutation.mutateAsync,
  };
};
