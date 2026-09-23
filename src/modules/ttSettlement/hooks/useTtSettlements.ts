import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ttSettlementApi,
  type CreateTtSettlementDocumentPayload,
  type TtSettlementDocumentFilters,
  type TtSettlementDocumentKind,
} from '@/api/ttSettlement';

const key = ['tt-deal', 'settlement-documents'] as const;

export const useTtSettlements = (
  filters: Omit<TtSettlementDocumentFilters, 'limit' | 'offset'>
) =>
  useQuery({
    queryKey: [...key, 'all', filters],
    queryFn: () => ttSettlementApi.listAll(filters),
  });

export const useTtSettlement = (id: string) =>
  useQuery({
    queryKey: [...key, id],
    queryFn: () => ttSettlementApi.get(id),
    enabled: Boolean(id),
  });

export const useUnsettledTtSettlements = (
  filters: {
    kind: TtSettlementDocumentKind;
    issuerPartyProfileId: string;
    currencyId: string;
    branchId?: string;
    hoBranchId?: string;
  },
  enabled: boolean
) =>
  useQuery({
    queryKey: [...key, 'unsettled', filters],
    queryFn: () => ttSettlementApi.listUnsettled(filters),
    enabled,
  });

const useSettlementMutation = <T>(
  mutationFn: (value: T) => Promise<unknown>
) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: key });
    },
  });
};

export const useCreateTtSettlement = () =>
  useSettlementMutation((payload: CreateTtSettlementDocumentPayload) =>
    ttSettlementApi.create(payload)
  );

export const useAcceptTtSettlement = () =>
  useSettlementMutation((id: string) => ttSettlementApi.accept(id));

export const useRejectTtSettlement = () =>
  useSettlementMutation(({ id, reason }: { id: string; reason: string }) =>
    ttSettlementApi.reject(id, reason)
  );

export const useCancelTtSettlement = () =>
  useSettlementMutation(({ id, reason }: { id: string; reason: string }) =>
    ttSettlementApi.cancel(id, reason)
  );
