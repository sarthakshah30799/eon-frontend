import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { transactionPoliciesApi } from '@/api/transactionPolicies';

export const useRevokeBackdateWindow = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (windowId: string) =>
      transactionPoliciesApi.revokeBackdateWindow(windowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-lock-windows'] });
      toast.success('Monthwise lock revoked');
    },
    onError: () => {
      toast.error('Failed to revoke monthwise lock');
    },
  });

  return {
    ...mutation,
    revokeBackdateWindow: mutation.mutateAsync,
  };
};
