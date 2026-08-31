import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardTransferApi, type ICardTransferListQuery } from '@/api/cardTransfer';
import type { CardTransferFormValues } from '../types';

export const cardTransferQueryKeys = {
  all: ['card-transfer-requests'] as const,
  detail: (id: string) => ['card-transfer-request', id] as const,
  cards: (sourceBranchId: string) =>
    ['card-transfer-source-cards', sourceBranchId] as const,
};

export const useListCardTransfers = (
  params?: Omit<ICardTransferListQuery, 'limit' | 'offset'>
) =>
  useQuery({
    queryKey: [...cardTransferQueryKeys.all, 'all', params],
    queryFn: () => cardTransferApi.listAll(params),
  });
export const useGetCardTransfer = (id: string) =>
  useQuery({
    queryKey: cardTransferQueryKeys.detail(id),
    queryFn: () => cardTransferApi.get(id),
    enabled: Boolean(id),
  });
export const useListTransferCards = (sourceBranchId: string, enabled = true) =>
  useQuery({
    queryKey: cardTransferQueryKeys.cards(sourceBranchId),
    queryFn: () => cardTransferApi.listAvailableCards(sourceBranchId),
    enabled: enabled && Boolean(sourceBranchId),
  });

const useCardTransferMutation = <T>(
  mutationFn: (value: T) => Promise<unknown>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: cardTransferQueryKeys.all,
      });
      void queryClient.invalidateQueries({
        queryKey: ['card-transfer-request'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['card-transfer-source-cards'],
      });
    },
  });
};

export const useCreateCardTransfer = () =>
  useCardTransferMutation((values: CardTransferFormValues) =>
    cardTransferApi.create(values)
  );
export const useUpdateCardTransfer = () =>
  useCardTransferMutation(
    ({ id, values }: { id: string; values: CardTransferFormValues }) =>
      cardTransferApi.update(id, values)
  );
export const useAcceptCardTransfer = () =>
  useCardTransferMutation((id: string) => cardTransferApi.accept(id));
export const useRejectCardTransfer = () =>
  useCardTransferMutation(({ id, remarks }: { id: string; remarks: string }) =>
    cardTransferApi.reject(id, remarks)
  );
export const useCancelCardTransfer = () =>
  useCardTransferMutation(({ id, remarks }: { id: string; remarks: string }) =>
    cardTransferApi.cancel(id, remarks)
  );
export const useDeleteCardTransfer = () =>
  useCardTransferMutation((id: string) => cardTransferApi.remove(id));
