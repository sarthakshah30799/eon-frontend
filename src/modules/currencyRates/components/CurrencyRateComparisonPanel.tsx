import type { ICurrencyRateComparisonPreview } from '../types/currencyRatesTypes';
import { formatMarginValue } from '../utils/currencyRatesUtils';

interface CurrencyRateComparisonPanelProps {
  preview: ICurrencyRateComparisonPreview | null;
}

const SidePreview = ({
  label,
  side,
}: {
  label: string;
  side: ICurrencyRateComparisonPreview['buy'];
}) => {
  return (
    <div className="rounded-sm border border-border-primary bg-surface-primary p-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
        {label}
      </div>
      <div className="mt-2 space-y-2 text-sm text-text-primary">
        <div>Base: {side.baseRate || '-'}</div>
        <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-2">
          <div className="text-xs uppercase tracking-wider text-text-tertiary">Group</div>
          <div>
            {side.groupMarginType || 'EMPTY'}{' '}
            {formatMarginValue(side.groupMarginType, side.groupMarginValue)}
          </div>
          <div className="text-xs text-text-tertiary">
            Amount: {side.groupMarginAmount || '-'}
          </div>
          <div className="text-xs text-text-tertiary">
            Result: {side.groupFinalRate || '-'}
          </div>
        </div>
        <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-2">
          <div className="text-xs uppercase tracking-wider text-text-tertiary">Override</div>
          <div>
            {side.overrideMarginType || 'EMPTY'}{' '}
            {formatMarginValue(side.overrideMarginType, side.overrideMarginValue)}
          </div>
          <div className="text-xs text-text-tertiary">
            Amount: {side.overrideMarginAmount || '-'}
          </div>
          <div className="text-xs text-text-tertiary">
            Result: {side.overrideFinalRate || '-'}
          </div>
        </div>
        <div className="text-base font-semibold">
          Applied: {side.appliedFinalRate || '-'}
          {side.appliedSource !== 'none' ? ` (${side.appliedSource})` : ''}
        </div>
      </div>
    </div>
  );
};

export const CurrencyRateComparisonPanel = ({
  preview,
}: CurrencyRateComparisonPanelProps) => {
  if (!preview) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-4 text-sm text-text-secondary">
        Select a product and currency to see the calculated final buy and sale prices.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <SidePreview
        label="Buy"
        side={preview.buy}
      />
      <SidePreview
        label="Sale"
        side={preview.sale}
      />
    </div>
  );
};
