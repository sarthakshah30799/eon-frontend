import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { financialCodesApi } from '@/api/financialCodes/financialCodes.api';
import { FINANCIAL_CODE_TEXTS } from '../constants/financialCodeConstants';
import type { ICreateFinancialCode } from '../types/financialCodeTypes';

export const useCreateFinancialCode = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateFinancialCode) =>
      financialCodesApi.createFinancialCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-codes'] });
      toast.success(FINANCIAL_CODE_TEXTS.CREATE_SUCCESS);
    },
    onError: () => {
      toast.error(FINANCIAL_CODE_TEXTS.CREATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitFinancialCode: mutation.mutateAsync,
  };
};
