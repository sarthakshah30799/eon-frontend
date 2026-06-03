import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { currencyProfileApi } from '@/api/currencyProfile';
import { CURRENCY_PROFILE_TEXTS } from '../constants';
import type { ICreateCurrencyProfile } from '../types';

export const useCreateCurrencyProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateCurrencyProfile) =>
      currencyProfileApi.createCurrencyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currency-profiles'] });
      toast.success(CURRENCY_PROFILE_TEXTS.CREATE_SUCCESS);
    },
    onError: () => {
      toast.error(CURRENCY_PROFILE_TEXTS.CREATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitCurrencyProfile: mutation.mutateAsync,
  };
};
