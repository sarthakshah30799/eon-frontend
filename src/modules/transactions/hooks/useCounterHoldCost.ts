import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/api/transactions';

export const useCounterHoldCost = ({
  branchId,
  counterId,
  currencyId,
  enabled = true,
}: {
  branchId: string;
  counterId: string;
  currencyId: string;
  enabled?: boolean;
}) => useQuery({
  queryKey: ['counter-hold-cost', branchId, counterId, currencyId],
  queryFn: () => transactionsApi.getCounterHoldCost({ branchId, counterId, currencyId }),
  enabled: enabled && Boolean(branchId && counterId && currencyId),
});

export default useCounterHoldCost;
