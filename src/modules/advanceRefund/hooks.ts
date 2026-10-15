import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { advanceRefundApi } from '@/api/advanceRefund/advanceRefund.api';
import { ADVANCE_REFUND_QUERY_KEYS, ADVANCE_REFUND_TEXT } from './constants';
import type {
  AdvanceRefundListQuery,
  CreateAdvanceRefundPayload,
  HonourAdvanceRefundPayload,
} from './types';

export const useAdvanceRefundList = (params: AdvanceRefundListQuery = {}) =>
  useQuery({
    queryKey: ADVANCE_REFUND_QUERY_KEYS.list(params),
    queryFn: () => advanceRefundApi.list(params),
  });

export const useAdvanceRefund = (id: string) =>
  useQuery({
    queryKey: ADVANCE_REFUND_QUERY_KEYS.detail(id),
    queryFn: () => advanceRefundApi.get(id),
    enabled: Boolean(id),
  });

export const useAvailableAdvances = (params: {
  partyProfileId?: string;
  branchId?: string;
  asOnDate?: string;
  search?: string;
}) =>
  useQuery({
    queryKey: ADVANCE_REFUND_QUERY_KEYS.availableAdvances(params),
    queryFn: () =>
      advanceRefundApi.getAvailableAdvances({
        partyProfileId: params.partyProfileId!,
        branchId: params.branchId!,
        asOnDate: params.asOnDate!,
        search: params.search,
      }),
    enabled: Boolean(params.partyProfileId && params.branchId && params.asOnDate),
  });

export const useCreateAdvanceRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdvanceRefundPayload) =>
      advanceRefundApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADVANCE_REFUND_QUERY_KEYS.all,
      });
      toast.success(ADVANCE_REFUND_TEXT.SUCCESS_CREATED);
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create advance refund'
      );
    },
  });
};

export const useHonourAdvanceRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: HonourAdvanceRefundPayload;
    }) => advanceRefundApi.honour(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ADVANCE_REFUND_QUERY_KEYS.all,
      });
      void queryClient.invalidateQueries({
        queryKey: ADVANCE_REFUND_QUERY_KEYS.detail(variables.id),
      });
      toast.success(ADVANCE_REFUND_TEXT.SUCCESS_HONOURED);
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to honour advance refund'
      );
    },
  });
};
