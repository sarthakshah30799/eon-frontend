import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { transactionPoliciesApi } from '@/api/transactionPolicies';

export const useCreateBackdateWindows = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (
      rules: Array<{ branchId: string; userId: string; fromDate?: string; toDate?: string }>
    ) =>
      transactionPoliciesApi.createBackdateWindows({
        rules: rules.map(rule => ({
          branchId: rule.branchId,
          userId: rule.userId,
          fromDate: rule.fromDate ?? '',
          toDate: rule.toDate ?? '',
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-lock-windows'] });
      toast.success('Monthwise lock updated');
    },
    onError: () => {
      toast.error('Failed to update monthwise locking');
    },
  });

  return {
    ...mutation,
    submitBackdateWindows: mutation.mutateAsync,
  };
};
