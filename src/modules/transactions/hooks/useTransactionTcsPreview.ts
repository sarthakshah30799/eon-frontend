import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/api/transactions';
import type {
  ITransactionTcsPreviewRequest,
  ITransactionTcsPreviewResponse,
} from '../types';

export const useTransactionTcsPreview = (
  request: ITransactionTcsPreviewRequest | null,
  enabled = true
) =>
  useQuery<ITransactionTcsPreviewResponse, Error>({
    queryKey: ['transactions', 'tcs-preview', request],
    queryFn: () => {
      if (!request) {
        throw new Error('TCS preview request is missing');
      }

      return transactionsApi.previewTcs(request);
    },
    enabled: Boolean(enabled && request),
  });

export default useTransactionTcsPreview;
