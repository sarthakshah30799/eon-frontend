import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { financialCodesApi } from '@/api/financialCodes/financialCodes.api';
import type { IFinancialCodeListQuery } from '@/modules/financialCodes/types/financialCodeTypes';

export const useListFinancialCodes = (
  params?: IFinancialCodeListQuery
) => {
  return useQuery({
    queryKey: ['financial-codes', params],
    queryFn: () => financialCodesApi.getFinancialCodes(params),
    placeholderData: keepPreviousData,
  });
};
