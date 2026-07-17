import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/api/transactions';
import type { ITransactionQuantityAvailability } from '@/modules/transactions';

interface UsePurchaseQuantityAvailabilityParams {
  branchId?: string;
  currencyId?: string;
  productId?: string;
  excludeTransactionId?: string;
  enabled?: boolean;
}

export const usePurchaseQuantityAvailability = ({
  branchId,
  currencyId,
  productId,
  excludeTransactionId,
  enabled = true,
}: UsePurchaseQuantityAvailabilityParams) => {
  return useQuery<ITransactionQuantityAvailability>({
    queryKey: [
      'purchase-quantity-availability',
      branchId,
      currencyId,
      productId,
      excludeTransactionId ?? '',
    ],
    queryFn: () =>
      transactionsApi.getQuantityAvailability({
        branchId: branchId ?? '',
        currencyId: currencyId ?? '',
        productId: productId ?? '',
        excludeTransactionId,
      }),
    enabled: Boolean(enabled && branchId && currencyId && productId),
  });
};

export default usePurchaseQuantityAvailability;
