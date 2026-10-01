import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { transactionsApi } from '@/api/transactions';

export interface TransferHoldCostStatus {
  isLoading: boolean;
  hasUnavailableHoldCost: boolean;
  unavailableCurrencyIds: string[];
}

export const useTransferItemsHoldCostStatus = ({
  branchId,
  counterId,
  currencyIds,
  enabled = true,
}: {
  branchId: string;
  counterId: string;
  currencyIds: string[];
  enabled?: boolean;
}): TransferHoldCostStatus => {
  const uniqueCurrencyIds = useMemo(
    () =>
      Array.from(
        new Set(
          currencyIds
            .map(currencyId => String(currencyId ?? '').trim())
            .filter(Boolean)
        )
      ),
    [currencyIds]
  );

  const queriesEnabled = enabled && Boolean(branchId && counterId);
  const queries = useQueries({
    queries: uniqueCurrencyIds.map(currencyId => ({
      queryKey: ['counter-hold-cost', branchId, counterId, currencyId],
      queryFn: () =>
        transactionsApi.getCounterHoldCost({
          branchId,
          counterId,
          currencyId,
        }),
      enabled: queriesEnabled && Boolean(currencyId),
    })),
  });

  const isLoading =
    queriesEnabled &&
    uniqueCurrencyIds.length > 0 &&
    queries.some(
      query => query.isLoading || query.isFetching || query.isPending
    );

  const unavailableCurrencyIds =
    !queriesEnabled || uniqueCurrencyIds.length === 0
      ? []
      : uniqueCurrencyIds.filter((_, index) => {
          const query = queries[index];
          if (!query?.isSuccess || !query.data) {
            return false;
          }

          const holdCostRate = Number(query.data.holdCostRate ?? 0);
          return !Number.isFinite(holdCostRate) || holdCostRate <= 0;
        });

  return {
    isLoading,
    hasUnavailableHoldCost: unavailableCurrencyIds.length > 0,
    unavailableCurrencyIds,
  };
};

export default useTransferItemsHoldCostStatus;
