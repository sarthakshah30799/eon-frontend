import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { advanceAdjustmentApi } from '@/api/advanceAdjustment/advanceAdjustment.api';
import {
  ADVANCE_ADJUSTMENT_QUERY_KEYS,
  ADVANCE_ADJUSTMENT_TEXT,
} from './constants';
import type {
  AdvanceAdjustmentListQuery,
  CreateAdvanceAdjustmentPayload,
  OutstandingSalesParams,
} from './types';

export const useAdvanceAdjustmentList = (
  params: AdvanceAdjustmentListQuery = {}
) =>
  useQuery({
    queryKey: ADVANCE_ADJUSTMENT_QUERY_KEYS.list(params),
    queryFn: () => advanceAdjustmentApi.list(params),
  });

export const useAdvanceAdjustment = (id: string) =>
  useQuery({
    queryKey: ADVANCE_ADJUSTMENT_QUERY_KEYS.detail(id),
    queryFn: () => advanceAdjustmentApi.get(id),
    enabled: Boolean(id),
  });

export const useOutstandingSales = (
  params: Partial<OutstandingSalesParams> & { enabled?: boolean }
) =>
  useQuery({
    queryKey: ADVANCE_ADJUSTMENT_QUERY_KEYS.outstandingSales(params),
    queryFn: () =>
      advanceAdjustmentApi.getOutstandingSales({
        branchId: params.branchId!,
        counterId: params.counterId!,
        partyProfileId: params.partyProfileId!,
        asOnDate: params.asOnDate!,
        search: params.search,
        limit: params.limit ?? 100,
        offset: params.offset ?? 0,
      }),
    enabled:
      params.enabled ??
      Boolean(
        params.branchId &&
          params.counterId &&
          params.partyProfileId &&
          params.asOnDate
      ),
  });

export const useCreateAdvanceAdjustment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdvanceAdjustmentPayload) =>
      advanceAdjustmentApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADVANCE_ADJUSTMENT_QUERY_KEYS.all,
      });
      toast.success(ADVANCE_ADJUSTMENT_TEXT.SUCCESS_CREATED);
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create advance adjustment'
      );
    },
  });
};
