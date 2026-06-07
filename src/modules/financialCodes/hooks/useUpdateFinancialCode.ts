import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { financialCodesApi } from '@/api/financialCodes/financialCodes.api';
import { FINANCIAL_CODE_TEXTS } from '../constants/financialCodeConstants';
import type { ICreateFinancialCode } from '../types/financialCodeTypes';

export const useUpdateFinancialCode = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ICreateFinancialCode }) =>
      financialCodesApi.updateFinancialCode(id, values),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financial-codes'] });
      queryClient.invalidateQueries({ queryKey: ['financial-code', variables.id] });
      toast.success(FINANCIAL_CODE_TEXTS.UPDATE_SUCCESS);
    },
    onError: () => {
      toast.error(FINANCIAL_CODE_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitFinancialCodeUpdate: mutation.mutateAsync,
  };
};
