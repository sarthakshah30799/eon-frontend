import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/api/transactions';
import type { ITransactionQuantityAvailability } from '@/modules/transactions';

interface UseTransactionQuantityAvailabilityParams {
  branchId?: string;
  counterId?: string;
  currencyId?: string;
  productId?: string;
  excludeTransactionId?: string;
  enabled?: boolean;
  queryKeyPrefix: string;
}

export const useTransactionQuantityAvailability = ({
  branchId,
  counterId,
  currencyId,
  productId,
  excludeTransactionId,
  enabled = true,
  queryKeyPrefix,
}: UseTransactionQuantityAvailabilityParams) => {
  return useQuery<ITransactionQuantityAvailability>({
    queryKey: [
      queryKeyPrefix,
      branchId,
      counterId,
      currencyId,
      productId,
      excludeTransactionId ?? '',
    ],
    queryFn: () =>
      transactionsApi.getQuantityAvailability({
        branchId: branchId ?? '',
        counterId: counterId ?? '',
        currencyId: currencyId ?? '',
        productId: productId ?? '',
        excludeTransactionId,
      }),
    enabled: Boolean(enabled && branchId && counterId && currencyId && productId),
  });
};

export default useTransactionQuantityAvailability;
