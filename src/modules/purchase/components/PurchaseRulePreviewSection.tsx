import { CardSection } from '@/components/ui';
import type { IPurchaseRulePreviewResponse } from '@/modules/transactions';

interface PurchaseRulePreviewSectionProps {
  preview: IPurchaseRulePreviewResponse;
}

export const PurchaseRulePreviewSection = ({
  preview,
}: PurchaseRulePreviewSectionProps) => (
  <CardSection heading="Purchase Rule" className="space-y-4">
    <div
      className={`rounded-xl border px-4 py-4 shadow-sm ${
        preview.allowed ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
      }`}
    >
      <div className="text-sm font-semibold text-text-primary">
        {preview.allowed ? 'Purchase rule check passed' : preview.blockingReason || 'Purchase rule check failed'}
      </div>
      <div className="mt-2 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
        <div>
          <span className="font-medium text-text-primary">Converted amount:</span>{' '}
          {preview.transactionAmountInReferenceCurrency}{' '}
          {preview.referenceCurrencyCode}
        </div>
        <div>
          <span className="font-medium text-text-primary">Cash total:</span>{' '}
          {preview.cashTotalAmount}
        </div>
        <div>
          <span className="font-medium text-text-primary">Cheque total:</span>{' '}
          {preview.chequeTotalAmount}
        </div>
        <div>
          <span className="font-medium text-text-primary">Cash limit:</span>{' '}
          {preview.cashLimitAmount} {preview.referenceCurrencyCode}
        </div>
        <div>
          <span className="font-medium text-text-primary">CDF threshold:</span>{' '}
          {preview.cdfThresholdAmount} {preview.referenceCurrencyCode}
        </div>
        <div>
          <span className="font-medium text-text-primary">History amount:</span>{' '}
          {preview.cumulativeAmountInReferenceCurrency}{' '}
          {preview.referenceCurrencyCode}
        </div>
      </div>
    </div>
  </CardSection>
);
