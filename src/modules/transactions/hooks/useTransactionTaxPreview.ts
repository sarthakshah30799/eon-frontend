import { transactionsApi } from '@/api/transactions';
import type {
  ITransactionTaxPreviewRequest,
  ITransactionTaxPreviewResponse,
} from '../types';
import { useDebouncedPreviewQuery } from './useDebouncedPreviewQuery';

export const useTransactionTaxPreview = (
  request: ITransactionTaxPreviewRequest | null,
  enabled = true
) =>
  useDebouncedPreviewQuery<
    ITransactionTaxPreviewRequest,
    ITransactionTaxPreviewResponse
  >(
    'transactions-tax-preview',
    request,
    enabled,
    (payload, signal) => transactionsApi.previewTax(payload, signal)
  );

export default useTransactionTaxPreview;
