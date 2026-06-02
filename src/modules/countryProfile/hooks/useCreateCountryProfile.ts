import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { countryProfileApi } from '@/api/countryProfile';
import { COUNTRY_PROFILE_TEXTS } from '../constants';
import type { CountryProfileFormValues } from '../types';

export const useCreateCountryProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CountryProfileFormValues) =>
      countryProfileApi.createCountryProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['country-profiles'] });
      toast.success(COUNTRY_PROFILE_TEXTS.CREATE_SUCCESS);
    },
    onError: () => {
      toast.error(COUNTRY_PROFILE_TEXTS.CREATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitCountryProfile: mutation.mutateAsync,
  };
};

