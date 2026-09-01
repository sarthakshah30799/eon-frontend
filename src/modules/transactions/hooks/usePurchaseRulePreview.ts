import { transactionsApi } from '@/api/transactions';
import type {
  IPurchaseRulePreviewRequest,
  IPurchaseRulePreviewResponse,
} from '../types';
import { useDebouncedPreviewQuery } from './useDebouncedPreviewQuery';

export const usePurchaseRulePreview = (
  request: IPurchaseRulePreviewRequest | null,
  enabled = true
) =>
  useDebouncedPreviewQuery<
    IPurchaseRulePreviewRequest,
    IPurchaseRulePreviewResponse
  >(
    'transactions-purchase-rule-preview',
    request,
    enabled,
    (payload, signal) => transactionsApi.previewPurchaseRule(payload, signal)
  );

export default usePurchaseRulePreview;
