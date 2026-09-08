import { CardSection } from '@/components/ui';
import type { ICreditPreviewResponse } from '@/modules/transactions';
import { PURCHASE_CREDIT_TEXT } from '../constants/purchaseConstants';

interface PurchaseCreditPreviewSectionProps {
  preview: ICreditPreviewResponse;
}

export const PurchaseCreditPreviewSection = ({
  preview,
}: PurchaseCreditPreviewSectionProps) => {
  const blockingReasons =
    preview.blockingReasons?.length > 0
      ? preview.blockingReasons
      : preview.blockingReason
        ? [preview.blockingReason]
        : [];
  const statusClassName = preview.allowed
    ? preview.ruleType === 'CREDIT_NOT_CONFIGURED'
      ? 'border-amber-200 bg-amber-50'
      : 'border-emerald-200 bg-emerald-50'
    : 'border-error-200 bg-error-50';
  const statusMessage = preview.allowed
    ? preview.ruleType === 'CREDIT_NOT_CONFIGURED'
      ? PURCHASE_CREDIT_TEXT.notConfigured
      : PURCHASE_CREDIT_TEXT.passed
    : blockingReasons[0] || PURCHASE_CREDIT_TEXT.failedFallback;

  return (
    <CardSection heading={PURCHASE_CREDIT_TEXT.heading} className="space-y-4">
      <div
        className={`rounded-xl border px-4 py-4 shadow-sm ${statusClassName}`}
      >
        {preview.allowed ? (
          <div className="text-sm font-semibold text-text-primary">
            {statusMessage}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-text-primary">
              {PURCHASE_CREDIT_TEXT.fixBeforeSave}
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-text-primary">
              {blockingReasons.map(reason => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-2 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
          <div>
            <span className="font-medium text-text-primary">
              {PURCHASE_CREDIT_TEXT.payableAmount}
            </span>{' '}
            {preview.payableAmount}
          </div>
          <div>
            <span className="font-medium text-text-primary">
              {PURCHASE_CREDIT_TEXT.totalPaid}
            </span>{' '}
            {preview.totalPaid}
          </div>
          <div>
            <span className="font-medium text-text-primary">
              {PURCHASE_CREDIT_TEXT.currentOutstanding}
            </span>{' '}
            {preview.currentOutstanding}
          </div>
          <div>
            <span className="font-medium text-text-primary">
              {PURCHASE_CREDIT_TEXT.existingOutstanding}
            </span>{' '}
            {preview.existingOutstanding}
          </div>
          <div>
            <span className="font-medium text-text-primary">
              {PURCHASE_CREDIT_TEXT.totalExposure}
            </span>{' '}
            {preview.totalExposure}
          </div>
          <div>
            <span className="font-medium text-text-primary">
              {PURCHASE_CREDIT_TEXT.availableCredit}
            </span>{' '}
            {preview.availableCredit}
          </div>
          {preview.creditConfigured ? (
            <>
              <div>
                <span className="font-medium text-text-primary">
                  {PURCHASE_CREDIT_TEXT.applicableLimit}
                </span>{' '}
                {preview.applicableCreditLimit}
              </div>
              <div>
                <span className="font-medium text-text-primary">
                  {PURCHASE_CREDIT_TEXT.applicableDays}
                </span>{' '}
                {preview.applicableCreditDays ?? '-'}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </CardSection>
  );
};
