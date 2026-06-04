import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { additionalSettingsApi } from '@/api/additionalSettings';
import { ADDITIONAL_SETTINGS_TEXTS } from '../constants';

export const useUpdateAdditionalSetting = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: { categoryId: string; title: string }) =>
      additionalSettingsApi.updateCategoryTitle(payload.categoryId, payload.title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['additional-settings'] });
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
