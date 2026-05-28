import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { companyProfileApi } from '@/api/companyProfile';

export const useDeleteCompanyProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await companyProfileApi.deleteCompanyProfile(id);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profiles'] });
      toast.success('Company profile deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete company profile');
    },
  });

  return {
    deleteCompany: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};
