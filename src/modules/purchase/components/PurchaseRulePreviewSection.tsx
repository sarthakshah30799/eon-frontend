import { CardSection } from '@/components/ui';
import type { IPurchaseRulePreviewResponse } from '@/modules/transactions';
import { PURCHASE_RULE_TEXT } from '../constants/purchaseConstants';

interface PurchaseRulePreviewSectionProps {
  preview: IPurchaseRulePreviewResponse;
}

export const PurchaseRulePreviewSection = ({
  preview,
}: PurchaseRulePreviewSectionProps) => {
  const blockingReasons =
    preview.blockingReasons?.length > 0
      ? preview.blockingReasons
      : preview.blockingReason
        ? [preview.blockingReason]
        : [];
  const statusClassName = preview.allowed
    ? preview.requiresCdf
      ? 'border-amber-200 bg-amber-50'
      : 'border-emerald-200 bg-emerald-50'
    : 'border-error-200 bg-error-50';
  const statusMessage = preview.allowed
    ? preview.requiresCdf
      ? PURCHASE_RULE_TEXT.cdfRequired(
          preview.cdfThresholdAmount,
          preview.referenceCurrencyCode
        )
      : PURCHASE_RULE_TEXT.passed
    : blockingReasons[0] || PURCHASE_RULE_TEXT.failedFallback;

  return (
    <CardSection heading={PURCHASE_RULE_TEXT.heading} className="space-y-4">
      <div className={`rounded-xl border px-4 py-4 shadow-sm ${statusClassName}`}>
        {preview.allowed ? (
          <div className="text-sm font-semibold text-text-primary">{statusMessage}</div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-text-primary">
              {PURCHASE_RULE_TEXT.fixBeforeSave}
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-text-primary">
              {blockingReasons.map(reason => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
        {!preview.allowed && preview.requiresCdf ? (
          <div className="mt-2 text-sm text-text-secondary">
            {PURCHASE_RULE_TEXT.cdfRequired(
              preview.cdfThresholdAmount,
              preview.referenceCurrencyCode
            )}
          </div>
        ) : null}
        <div className="mt-2 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
          <div>
            <span className="font-medium text-text-primary">
              {PURCHASE_RULE_TEXT.convertedAmount}
            </span>{' '}
            {preview.transactionAmountInReferenceCurrency} {preview.referenceCurrencyCode}
          </div>
          <div>
            <span className="font-medium text-text-primary">{PURCHASE_RULE_TEXT.cashTotal}</span>{' '}
            {preview.cashTotalAmount}
          </div>
          <div>
            <span className="font-medium text-text-primary">{PURCHASE_RULE_TEXT.chequeTotal}</span>{' '}
            {preview.chequeTotalAmount}
          </div>
          <div>
            <span className="font-medium text-text-primary">{PURCHASE_RULE_TEXT.cashLimit}</span>{' '}
            {preview.cashLimitAmount} {preview.referenceCurrencyCode}
          </div>
          <div>
            <span className="font-medium text-text-primary">{PURCHASE_RULE_TEXT.cdfThreshold}</span>{' '}
            {preview.cdfThresholdAmount} {preview.referenceCurrencyCode}
          </div>
          <div>
            <span className="font-medium text-text-primary">{PURCHASE_RULE_TEXT.historyAmount}</span>{' '}
            {preview.cumulativeAmountInReferenceCurrency} {preview.referenceCurrencyCode}
          </div>
        </div>
      </div>
    </CardSection>
  );
};
