import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardSettlementApi, type CardStockSettlementFilters } from '@/api/cardSettlement';

const key = ['card-stock', 'settlements'] as const;

export const useCardSettlements = (filters: CardStockSettlementFilters) => useQuery({ queryKey: [...key, filters], queryFn: () => cardSettlementApi.list(filters) });
export const useCardSettlement = (id: string) => useQuery({ queryKey: [...key, id], queryFn: () => cardSettlementApi.get(id), enabled: Boolean(id) });
export const useBulkSettleCards = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: cardSettlementApi.bulkSettle, onSuccess: () => client.invalidateQueries({ queryKey: key }) });
};
export const useSubmitBranchSettlements = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: cardSettlementApi.submitBranch, onSuccess: () => client.invalidateQueries({ queryKey: key }) });
};
export const useAcceptBranchSettlements = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: cardSettlementApi.acceptBranch, onSuccess: () => client.invalidateQueries({ queryKey: key }) });
};
export const useRejectBranchSettlements = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ ids, reason }: { ids: string[]; reason: string }) => cardSettlementApi.rejectBranch(ids, reason), onSuccess: () => client.invalidateQueries({ queryKey: key }) });
};
export const useCancelCardSettlement = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: cardSettlementApi.cancel, onSuccess: () => client.invalidateQueries({ queryKey: key }) });
};
