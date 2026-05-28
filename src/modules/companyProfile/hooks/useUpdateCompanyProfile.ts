import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { companyProfileApi } from '@/api/companyProfile';
import type { CompanyProfileFormValues } from '../types';

export const useUpdateCompanyProfile = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: CompanyProfileFormValues) => {
      const res = await companyProfileApi.updateCompanyProfile(id, values);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ['company-profiles'] });
      queryClient.setQueryData(['company-profile', id], updatedData);
      toast.success('Company profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update company profile');
    },
  });

  return {
    updateCompanyProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};
