import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { countryGroupApi } from '@/api/countryGroup';
import { COUNTRY_GROUP_TEXTS } from '../constants';

export const useDeleteCountryGroup = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => countryGroupApi.deleteCountryGroup(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['country-groups'] });
      toast.success(COUNTRY_GROUP_TEXTS.DELETE_SUCCESS);
    },
    onError: () => {
      toast.error(COUNTRY_GROUP_TEXTS.DELETE_ERROR);
    },
  });

  return {
    ...mutation,
    deleteCountryGroup: mutation.mutateAsync,
  };
};
