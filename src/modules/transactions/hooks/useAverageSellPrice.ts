import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/api/transactions';

export const useAverageSellPrice = ({
  productId,
  currencyId,
  enabled = true,
}: {
  productId: string;
  currencyId: string;
  enabled?: boolean;
}) => useQuery({
  queryKey: ['average-sell-price', productId, currencyId],
  queryFn: () => transactionsApi.getAverageSellPrice({ productId, currencyId }),
  enabled: enabled && Boolean(productId && currencyId),
});

export default useAverageSellPrice;
