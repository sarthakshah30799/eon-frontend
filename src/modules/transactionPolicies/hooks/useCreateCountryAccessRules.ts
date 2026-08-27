import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { transactionPoliciesApi } from '@/api/transactionPolicies';

export const useCreateCountryAccessRules = (countryId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (
      rules: Array<{
        branchId: string;
        userId: string;
        fromDate?: string;
        toDate?: string;
      }>
    ) =>
      transactionPoliciesApi.createCountryAccessRules(countryId, {
        rules: rules.map(({ branchId, userId }) => ({ branchId, userId })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['country-access-rules', countryId],
      });
      toast.success('Country access rules updated');
    },
    onError: () => {
      toast.error('Failed to update country access rules');
    },
  });

  return {
    ...mutation,
    submitCountryAccessRules: mutation.mutateAsync,
  };
};
