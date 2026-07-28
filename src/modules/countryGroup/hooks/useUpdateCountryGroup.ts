import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { countryGroupApi } from '@/api/countryGroup';
import { COUNTRY_GROUP_TEXTS } from '../constants';
import type { ICreateCountryGroup } from '../types';

export const useUpdateCountryGroup = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateCountryGroup) => countryGroupApi.updateCountryGroup(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['country-groups'] });
      await queryClient.invalidateQueries({ queryKey: ['country-groups', id] });
      toast.success(COUNTRY_GROUP_TEXTS.UPDATE_SUCCESS);
    },
    onError: () => {
      toast.error(COUNTRY_GROUP_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitCountryGroup: mutation.mutateAsync,
  };
};
