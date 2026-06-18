import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { additionalSettingsApi } from '@/api/additionalSettings';
import { ADDITIONAL_SETTINGS_TEXTS } from '../constants';

export const useUpdateAdditionalSettingSubcategory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: {
      categoryId: string;
      subcategoryId: string;
      description: string;
      value: string;
    }) =>
      additionalSettingsApi.updateSubcategory(payload.categoryId, payload.subcategoryId, {
        description: payload.description,
        value: payload.value,
      }),
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
    submitAdditionalSetting: mutation.mutateAsync,
  };
};
