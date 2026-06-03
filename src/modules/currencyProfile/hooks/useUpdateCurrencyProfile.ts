import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { currencyProfileApi } from '@/api/currencyProfile';
import { CURRENCY_PROFILE_TEXTS } from '../constants';
import type { ICreateCurrencyProfile } from '../types';

export const useUpdateCurrencyProfile = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateCurrencyProfile) =>
      currencyProfileApi.updateCurrencyProfile(id, data),
    onSuccess: updatedCurrency => {
      if (updatedCurrency) {
        queryClient.invalidateQueries({ queryKey: ['currency-profiles'] });
        queryClient.invalidateQueries({ queryKey: ['currency-profile', id] });
        toast.success(CURRENCY_PROFILE_TEXTS.UPDATE_SUCCESS);
      }
    },
    onError: () => {
      toast.error(CURRENCY_PROFILE_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitCurrencyProfile: mutation.mutateAsync,
  };
};
