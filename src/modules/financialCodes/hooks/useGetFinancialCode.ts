import { useQuery } from '@tanstack/react-query';
import { financialCodesApi } from '@/api/financialCodes/financialCodes.api';

export const useGetFinancialCode = (id?: string) => {
  return useQuery({
    queryKey: ['financial-code', id],
    queryFn: () => {
      if (!id) return undefined;
      return financialCodesApi.getFinancialCodeById(id);
    },
    enabled: !!id,
  });
};
