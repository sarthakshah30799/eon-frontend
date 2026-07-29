import { useQuery } from '@tanstack/react-query';
import { transactionPoliciesApi } from '@/api/transactionPolicies';

export const useListCountryAccessRules = (countryId: string) => {
  return useQuery({
    queryKey: ['country-access-rules', countryId],
    queryFn: () => transactionPoliciesApi.listCountryAccessRules(countryId),
    enabled: Boolean(countryId),
  });
};
