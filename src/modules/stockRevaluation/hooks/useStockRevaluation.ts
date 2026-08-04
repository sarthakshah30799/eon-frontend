import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stockRevaluationApi, type StockRevaluationFrequency, type StockRevaluationTarget } from '@/api/stockRevaluation';

export const useStockRevaluation = (targets: StockRevaluationTarget[], frequency: StockRevaluationFrequency) => {
  const queryClient = useQueryClient();
  const listQuery = useQuery({
    queryKey: ['stock-revaluations', targets, frequency],
    queryFn: () => stockRevaluationApi.current(targets, frequency),
    enabled: targets.length > 0,
  });
  const processMutation = useMutation({
    mutationFn: (payload: { targets: StockRevaluationTarget[]; frequency: StockRevaluationFrequency; file: File }) =>
      stockRevaluationApi.process(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stock-revaluations'] }),
  });
  const templateMutation = useMutation({ mutationFn: stockRevaluationApi.getTemplate });
  const deleteMutation = useMutation({
    mutationFn: stockRevaluationApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stock-revaluations'] }),
  });

  return {
    reports: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    process: processMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    isProcessing: processMutation.isPending,
    downloadTemplate: templateMutation.mutateAsync,
    isDownloadingTemplate: templateMutation.isPending,
  };
};
