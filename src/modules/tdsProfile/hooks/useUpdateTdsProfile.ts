import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { tdsProfileApi } from '@/api/tdsProfile';
import { TDS_PROFILE_TEXTS } from '../constants';
import type { ICreateTdsProfile } from '../types';

export const useUpdateTdsProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: { id: string; data: ICreateTdsProfile }) =>
      tdsProfileApi.updateTdsProfile(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tds-profiles'] });
      toast.success(TDS_PROFILE_TEXTS.UPDATE_SUCCESS);
    },
    onError: () => {
      toast.error(TDS_PROFILE_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    updateTdsProfile: mutation.mutateAsync,
  };
};
