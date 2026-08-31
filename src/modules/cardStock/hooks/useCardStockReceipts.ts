import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardStockApi } from '@/api/cardStock';

export const useListCardStockReceipts = (
  params?: Omit<Parameters<typeof cardStockApi.list>[0], 'limit' | 'offset'>
) =>
  useQuery({
    queryKey: ['card-stock', 'receipts', 'all', params],
    queryFn: () => cardStockApi.listAll(),
  });

export const useGetCardStockReceipt = (id: string) =>
  useQuery({
    queryKey: ['card-stock', 'receipts', id],
    queryFn: () => cardStockApi.get(id),
    enabled: Boolean(id),
  });

export const usePreviewCardStockUpload = () => {
  const mutation = useMutation({
    mutationFn: ({
      file,
      issuerPartyProfileId,
    }: {
      file: File;
      issuerPartyProfileId?: string;
    }) => cardStockApi.previewUpload(file, issuerPartyProfileId),
  });
  return { previewUpload: mutation.mutateAsync, isPending: mutation.isPending };
};

export const useDownloadCardStockTemplate = () => {
  const mutation = useMutation({
    mutationFn: async () => {
      const blob = await cardStockApi.downloadTemplate();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'card-stock-upload-template.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    },
  });
  return {
    downloadTemplate: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};

export const useCreateCardStockReceipt = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: cardStockApi.create,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['card-stock', 'receipts'] }),
  });
  return { createReceipt: mutation.mutateAsync, isPending: mutation.isPending };
};
