import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { countryProfileApi } from '@/api/countryProfile';
import { COUNTRY_PROFILE_TEXTS } from '../constants';
import type { ICreateCountryProfile } from '../types';

export const useUpdateCountryProfile = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateCountryProfile) =>
      countryProfileApi.updateCountryProfile(id, data),
    onSuccess: updatedCountry => {
      if (updatedCountry) {
        queryClient.invalidateQueries({ queryKey: ['country-profiles'] });
        queryClient.invalidateQueries({ queryKey: ['country-profile', id] });
        toast.success(COUNTRY_PROFILE_TEXTS.UPDATE_SUCCESS);
      }
    },
    onError: () => {
      toast.error(COUNTRY_PROFILE_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitCountryProfile: mutation.mutateAsync,
  };
};

