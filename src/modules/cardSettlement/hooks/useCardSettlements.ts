import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cardSettlementApi,
  type CardStockSettlementDocumentFilters,
  type CardStockSettlementDocumentKind,
  type CreateCardStockSettlementDocumentPayload,
} from '@/api/cardSettlement';

const key = ['card-stock', 'settlement-documents'] as const;

export const useCardSettlements = (filters: CardStockSettlementDocumentFilters) =>
  useQuery({ queryKey: [...key, filters], queryFn: () => cardSettlementApi.list(filters) });

export const useCardSettlement = (id: string) =>
  useQuery({ queryKey: [...key, id], queryFn: () => cardSettlementApi.get(id), enabled: Boolean(id) });

export const useUnsettledCardSettlements = (
  filters: {
    kind: CardStockSettlementDocumentKind;
    issuerPartyProfileId: string;
    currencyId: string;
    branchId?: string;
    hoBranchId?: string;
  },
  enabled: boolean
) =>
  useQuery({
    queryKey: [...key, 'unsettled', filters],
    queryFn: () => cardSettlementApi.listUnsettled(filters),
    enabled,
  });

const useSettlementMutation = <T>(mutationFn: (value: T) => Promise<unknown>) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: key });
    },
  });
};

export const useCreateCardSettlement = () =>
  useSettlementMutation((payload: CreateCardStockSettlementDocumentPayload) =>
    cardSettlementApi.create(payload)
  );

export const useAcceptCardSettlement = () =>
  useSettlementMutation((id: string) => cardSettlementApi.accept(id));

export const useRejectCardSettlement = () =>
  useSettlementMutation(({ id, reason }: { id: string; reason: string }) =>
    cardSettlementApi.reject(id, reason)
  );

export const useCancelCardSettlement = () =>
  useSettlementMutation(({ id, reason }: { id: string; reason: string }) =>
    cardSettlementApi.cancel(id, reason)
  );
