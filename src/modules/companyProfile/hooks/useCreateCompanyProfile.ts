import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { companyProfileApi } from '@/api/companyProfile';
import type { CompanyProfileFormValues } from '../types';

export const useCreateCompanyProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: CompanyProfileFormValues) => {
      const res = await companyProfileApi.createCompanyProfile(values);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profiles'] });
      toast.success('Company profile created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create company profile');
    },
  });

  return {
    createCompanyProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};
