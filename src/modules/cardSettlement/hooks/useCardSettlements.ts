import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardSettlementApi, type CardStockSettlementFilters } from '@/api/cardSettlement';

const key = ['card-stock', 'settlements'] as const;

export const useCardSettlements = (filters: CardStockSettlementFilters) => useQuery({ queryKey: [...key, filters], queryFn: () => cardSettlementApi.list(filters) });
export const useCardSettlement = (id: string) => useQuery({ queryKey: [...key, id], queryFn: () => cardSettlementApi.get(id), enabled: Boolean(id) });
export const useBulkSettleCards = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: cardSettlementApi.bulkSettle, onSuccess: () => client.invalidateQueries({ queryKey: key }) });
};
export const useCancelCardSettlement = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: cardSettlementApi.cancel, onSuccess: () => client.invalidateQueries({ queryKey: key }) });
};
