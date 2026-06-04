import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { additionalSettingsApi } from '@/api/additionalSettings';
import type { IAdditionalSettingCategoryFormValues } from '../types';
import { ADDITIONAL_SETTINGS_TEXTS } from '../constants';

export const useCreateAdditionalSetting = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: IAdditionalSettingCategoryFormValues) =>
      additionalSettingsApi.createAdditionalSetting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['additional-settings'] });
      toast.success(ADDITIONAL_SETTINGS_TEXTS.CREATE_SUCCESS);
    },
    onError: () => {
      toast.error(ADDITIONAL_SETTINGS_TEXTS.CREATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitAdditionalSetting: mutation.mutateAsync,
  };
};
