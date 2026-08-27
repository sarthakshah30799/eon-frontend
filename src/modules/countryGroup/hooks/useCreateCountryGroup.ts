import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { countryGroupApi } from '@/api/countryGroup';
import { COUNTRY_GROUP_TEXTS } from '../constants';
import type { ICreateCountryGroup } from '../types';

export const useCreateCountryGroup = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateCountryGroup) =>
      countryGroupApi.createCountryGroup(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['country-groups'] });
      toast.success(COUNTRY_GROUP_TEXTS.CREATE_SUCCESS);
    },
    onError: () => {
      toast.error(COUNTRY_GROUP_TEXTS.CREATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitCountryGroup: mutation.mutateAsync,
  };
};
