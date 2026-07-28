import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { transactionPoliciesApi } from '@/api/transactionPolicies';

export const useRevokeCountryAccessRule = (countryId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (ruleId: string) => transactionPoliciesApi.revokeCountryAccessRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['country-access-rules', countryId] });
      toast.success('Country access rule revoked');
    },
    onError: () => {
      toast.error('Failed to revoke country access rule');
    },
  });

  return {
    ...mutation,
    revokeCountryAccessRule: mutation.mutateAsync,
  };
};
