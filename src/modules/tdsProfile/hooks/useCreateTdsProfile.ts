import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { tdsProfileApi } from '@/api/tdsProfile';
import { TDS_PROFILE_TEXTS } from '../constants';
import type { ICreateTdsProfile } from '../types';

export const useCreateTdsProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateTdsProfile) => tdsProfileApi.createTdsProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tds-profiles'] });
      toast.success(TDS_PROFILE_TEXTS.CREATE_SUCCESS);
    },
    onError: () => {
      toast.error(TDS_PROFILE_TEXTS.CREATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitTdsProfile: mutation.mutateAsync,
  };
};
