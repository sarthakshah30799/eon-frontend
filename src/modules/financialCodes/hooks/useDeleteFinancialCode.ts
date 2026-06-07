import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { financialCodesApi } from '@/api/financialCodes/financialCodes.api';

export const useDeleteFinancialCode = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => financialCodesApi.deleteFinancialCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-codes'] });
      toast.success('Financial code deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete financial code');
    },
  });

  return {
    ...mutation,
    submitFinancialCodeDelete: mutation.mutateAsync,
  };
};
