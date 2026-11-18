import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { advanceAdjustmentApi } from '@/api/advanceAdjustment/advanceAdjustment.api';
import { ADVANCE_REFUND_QUERY_KEYS } from '@/modules/advanceRefund/constants';
import type { AvailableAdvancesParams } from '@/modules/advanceRefund/types';
import {
  ADVANCE_ADJUSTMENT_QUERY_KEYS,
  ADVANCE_ADJUSTMENT_TEXT,
} from './constants';
import type {
  AdvanceAdjustment,
  AdvanceAdjustmentListQuery,
  CreateAdvanceAdjustmentPayload,
  OutstandingSalesParams,
  RecordAdvanceAdjustmentPrintPayload,
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

export const useAvailableAdvancesForAdjustment = (
  params: Partial<AvailableAdvancesParams> & { enabled?: boolean }
) =>
  useQuery({
    queryKey: ADVANCE_ADJUSTMENT_QUERY_KEYS.availableAdvances(params),
    queryFn: () =>
      advanceAdjustmentApi.getAvailableAdvances({
        panNumber: params.panNumber!,
        branchId: params.branchId!,
        asOnDate: params.asOnDate,
        partyProfileId: params.partyProfileId,
        search: params.search,
      }),
    enabled:
      params.enabled ??
      Boolean(
        params.panNumber &&
          params.panNumber.trim().length === 10 &&
          params.branchId &&
          params.asOnDate
      ),
    staleTime: 0,
    refetchOnMount: 'always',
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
      void queryClient.invalidateQueries({
        queryKey: ADVANCE_REFUND_QUERY_KEYS.all,
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

export const useRecordAdvanceAdjustmentPrint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: RecordAdvanceAdjustmentPrintPayload;
    }) => advanceAdjustmentApi.recordPrint(id, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData<AdvanceAdjustment>(
        ADVANCE_ADJUSTMENT_QUERY_KEYS.detail(variables.id),
        current =>
          current
            ? {
                ...current,
                printCount:
                  data?.printCount ?? (current.printCount ?? 0) + 1,
              }
            : current
      );
      void queryClient.invalidateQueries({
        queryKey: ADVANCE_ADJUSTMENT_QUERY_KEYS.detail(variables.id),
      });
      void queryClient.invalidateQueries({
        queryKey: ADVANCE_ADJUSTMENT_QUERY_KEYS.lists(),
      });
    },
  });
};
