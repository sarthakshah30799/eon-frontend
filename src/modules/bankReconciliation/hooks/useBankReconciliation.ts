import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bankReconciliationApi } from '@/api/bankReconciliation/bankReconciliation.api';
import { BANK_RECONCILIATION_QUERY_KEYS, BANK_RECONCILIATION_TEXT } from '../constants';
import type {
  IBankReconciliationClearPayload,
  IBankReconciliationQuery,
} from '../types';

export const useBankReconciliationQuery = (
  params: (IBankReconciliationQuery & { processNonce?: number }) | null,
  enabled: boolean
) =>
  useQuery({
    queryKey: BANK_RECONCILIATION_QUERY_KEYS.list(params),
    queryFn: () => {
      if (!params) {
        throw new Error('Missing bank reconciliation query');
      }
      const query: IBankReconciliationQuery = {
        startDate: params.startDate,
        endDate: params.endDate,
        bankAccountId: params.bankAccountId,
        branchId: params.branchId,
        passengerName: params.passengerName,
        transactionType: params.transactionType,
        unclearedOnly: params.unclearedOnly,
      };
      return bankReconciliationApi.query(query);
    },
    enabled: Boolean(enabled && params?.startDate && params.endDate),
  });

export const useClearBankReconciliation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IBankReconciliationClearPayload) =>
      bankReconciliationApi.clear(payload),
    onSuccess: result => {
      toast.success(
        `${BANK_RECONCILIATION_TEXT.SUCCESS_SAVED} (${result.updated})`
      );
      void queryClient.invalidateQueries({
        queryKey: BANK_RECONCILIATION_QUERY_KEYS.all,
      });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error
          ? error.message
          : BANK_RECONCILIATION_TEXT.SAVE_FAILED
      );
    },
  });
};
