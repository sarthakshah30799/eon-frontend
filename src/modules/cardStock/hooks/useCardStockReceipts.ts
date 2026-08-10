import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardStockApi } from '@/api/cardStock';

export const useListCardStockReceipts = () => useQuery({ queryKey: ['card-stock', 'receipts'], queryFn: cardStockApi.list });

export const useGetCardStockReceipt = (id: string) => useQuery({ queryKey: ['card-stock', 'receipts', id], queryFn: () => cardStockApi.get(id), enabled: Boolean(id) });

export const useCreateCardStockReceipt = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: cardStockApi.create, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['card-stock', 'receipts'] }) });
  return { createReceipt: mutation.mutateAsync, isPending: mutation.isPending };
};
