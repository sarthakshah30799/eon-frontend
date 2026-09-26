import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  productSettlementApi,
  type CreateProductSettlementDocumentPayload,
  type ProductSettlementDocumentFilters,
  type ProductSettlementDocumentKind,
} from '@/api/productSettlement';

const key = ['product-settlements'] as const;

export const useProductSettlements = (
  filters: Omit<ProductSettlementDocumentFilters, 'limit' | 'offset'>
) =>
  useQuery({
    queryKey: [...key, 'all', filters],
    queryFn: () => productSettlementApi.listAll(filters),
  });

export const useProductSettlement = (id: string) =>
  useQuery({
    queryKey: [...key, id],
    queryFn: () => productSettlementApi.get(id),
    enabled: Boolean(id),
  });

export const useUnsettledProductSettlements = (
  filters: {
    kind: ProductSettlementDocumentKind;
    issuerPartyProfileId: string;
    currencyId: string;
    branchId?: string;
    hoBranchId?: string;
  },
  enabled: boolean
) =>
  useQuery({
    queryKey: [...key, 'unsettled', filters],
    queryFn: () => productSettlementApi.listUnsettled(filters),
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

export const useCreateProductSettlement = () =>
  useSettlementMutation((payload: CreateProductSettlementDocumentPayload) =>
    productSettlementApi.create(payload)
  );

export const useAcceptProductSettlement = () =>
  useSettlementMutation((id: string) => productSettlementApi.accept(id));

export const useRejectProductSettlement = () =>
  useSettlementMutation(({ id, reason }: { id: string; reason: string }) =>
    productSettlementApi.reject(id, reason)
  );

export const useCancelProductSettlement = () =>
  useSettlementMutation(({ id, reason }: { id: string; reason: string }) =>
    productSettlementApi.cancel(id, reason)
  );
