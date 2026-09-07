import { transactionsApi } from '@/api/transactions';
import type {
  ICreditPreviewRequest,
  ICreditPreviewResponse,
} from '../types';
import { useDebouncedPreviewQuery } from './useDebouncedPreviewQuery';

export const useCreditPreview = (
  request: ICreditPreviewRequest | null,
  enabled = true
) =>
  useDebouncedPreviewQuery<ICreditPreviewRequest, ICreditPreviewResponse>(
    'transactions-credit-preview',
    request,
    enabled,
    (payload, signal) => transactionsApi.previewCredit(payload, signal)
  );

export default useCreditPreview;
