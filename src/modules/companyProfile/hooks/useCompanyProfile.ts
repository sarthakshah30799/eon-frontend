import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { companyProfileApi } from '@/api/companyProfile';
import type { CompanyProfileFormValues } from '../types';
import { mapCompanyProfileToFormValues } from '../utils';

export const useCompanyProfile = (id: string | undefined) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['company-profile', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Company profile id is required');
      }

      const response = await companyProfileApi.getCompanyProfileById(id);

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data ? mapCompanyProfileToFormValues(response.data) : undefined;
    },
    enabled: Boolean(id),
  });

  const mutation = useMutation({
    mutationFn: async (values: CompanyProfileFormValues) => {
      if (!id) {
        throw new Error('Company profile id is required');
      }

      const response = await companyProfileApi.updateCompanyProfile(id, values);

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data ? mapCompanyProfileToFormValues(response.data) : undefined;
    },
    onSuccess: updatedProfile => {
      if (!id) {
        return;
      }

      queryClient.setQueryData(['company-profile', id], updatedProfile);
      toast.success('Company profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update company profile');
    },
  });

  const handleSubmit = (values: CompanyProfileFormValues) => {
    mutation.mutate(values);
  };

  return {
    data,
    error,
    isLoading,
    isSaving: mutation.isPending,
    handleSubmit,
  };
};
