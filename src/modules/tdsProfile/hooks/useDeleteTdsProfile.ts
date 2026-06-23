import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { tdsProfileApi } from '@/api/tdsProfile';
import { TDS_PROFILE_TEXTS } from '../constants';

export const useDeleteTdsProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => tdsProfileApi.deleteTdsProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tds-profiles'] });
      toast.success('TDS profile deleted successfully!');
    },
    onError: () => {
      toast.error(TDS_PROFILE_TEXTS.DELETE_ERROR);
    },
  });

  return {
    ...mutation,
    deleteTdsProfile: mutation.mutateAsync,
  };
};
