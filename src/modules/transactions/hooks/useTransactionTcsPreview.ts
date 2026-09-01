import { transactionsApi } from '@/api/transactions';
import type {
  ITransactionTcsPreviewRequest,
  ITransactionTcsPreviewResponse,
} from '../types';
import { useDebouncedPreviewQuery } from './useDebouncedPreviewQuery';

export const useTransactionTcsPreview = (
  request: ITransactionTcsPreviewRequest | null,
  enabled = true
) =>
  useDebouncedPreviewQuery<
    ITransactionTcsPreviewRequest,
    ITransactionTcsPreviewResponse
  >(
    'transactions-tcs-preview',
    request,
    enabled,
    (payload, signal) => transactionsApi.previewTcs(payload, signal)
  );

export default useTransactionTcsPreview;
