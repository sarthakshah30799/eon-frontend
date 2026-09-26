import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  dealCoverRateApi,
  type ApproveDealCoverPayload,
  type DealCoverRateListFilters,
  type DealCoverRatePayload,
  type RejectDealCoverPayload,
} from '@/api/dealCoverRate';

const key = ['tt-deal', 'covers'] as const;

export const useDealCoverRates = (
  filters: Omit<DealCoverRateListFilters, 'limit' | 'offset'> = {}
) =>
  useQuery({
    queryKey: [...key, 'all', filters],
    queryFn: () => dealCoverRateApi.listAll(filters),
  });

export const useDealCoverRate = (id: string) =>
  useQuery({
    queryKey: [...key, id],
    queryFn: () => dealCoverRateApi.get(id),
    enabled: Boolean(id),
  });

export const useDealCoverAckList = (
  filters: Omit<DealCoverRateListFilters, 'limit' | 'offset'> = {},
  enabled = true
) =>
  useQuery({
    queryKey: [...key, 'acknowledgement', filters],
    queryFn: () => dealCoverRateApi.listForAck({ ...filters, limit: 100 }),
    enabled,
  });

const useDealMutation = <TArgs, TResult>(
  mutationFn: (value: TArgs) => Promise<TResult>
) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: key });
    },
  });
};

export const useCreateDealCoverRate = () =>
  useDealMutation((payload: DealCoverRatePayload) =>
    dealCoverRateApi.create(payload)
  );

export const useUpdateDealCoverRate = () =>
  useDealMutation(
    ({ id, payload }: { id: string; payload: Partial<DealCoverRatePayload> }) =>
      dealCoverRateApi.update(id, payload)
  );

export const useCancelDealCoverRate = () =>
  useDealMutation((id: string) => dealCoverRateApi.cancel(id));

export const useApproveDealCoverRate = () =>
  useDealMutation(
    ({ id, payload }: { id: string; payload: ApproveDealCoverPayload }) =>
      dealCoverRateApi.approve(id, payload)
  );

export const useRejectDealCoverRate = () =>
  useDealMutation(
    ({ id, payload }: { id: string; payload: RejectDealCoverPayload }) =>
      dealCoverRateApi.reject(id, payload)
  );
