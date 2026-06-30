import type { ICurrencyRate, IProductCurrencyRate } from '../types/currencyRatesTypes';
import {
  buildCurrencyRateComparisonPreview,
  formatMarginValue,
  getCurrencyPricingGroup,
  getLatestRateForCurrency,
  getStoredBaseRateLabel,
} from '../utils/currencyRatesUtils';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import { CardSection } from '@/components/ui';
import { Table, type TableColumnDef } from '@/components/ui/table';

interface CurrencyRateOverridesSectionProps {
  currencies: ICurrencyProfile[];
  rates: ICurrencyRate[];
  rules: IProductCurrencyRate[];
  loading?: boolean;
  refreshing?: boolean;
  onOpenRule: (rule: IProductCurrencyRate) => void;
}

const MarginPreview = ({
  title,
  value,
  result,
  applied,
  appliedSource,
}: {
  title: string;
  value: string;
  result: string | null;
  applied: string | null;
  appliedSource: 'group' | 'override' | 'none';
}) => {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
        {title}
      </div>
      <div className="text-text-primary">{value}</div>
      <div className="text-xs text-text-tertiary">Calculated: {result || '-'}</div>
      <div className="text-xs text-text-tertiary">
        Applied: {applied || '-'} {appliedSource !== 'none' ? `(${appliedSource})` : ''}
      </div>
    </div>
  );
};

export const CurrencyRateOverridesSection = ({
  currencies,
  rates,
  rules,
  loading = false,
  refreshing = false,
  onOpenRule,
}: CurrencyRateOverridesSectionProps) => {
  const columns: TableColumnDef<IProductCurrencyRate>[] = [
    {
      id: 'product',
      header: 'Product',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-semibold text-text-primary">
            {row.original.product?.productCode || row.original.productId}
          </div>
          <div className="text-xs text-text-tertiary">
            {row.original.product?.productDescription || 'Product override'}
          </div>
        </div>
      ),
    },
    {
      id: 'currency',
      header: 'Currency',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-semibold text-text-primary">
            {row.original.currency?.currencyCode || row.original.currencyId}
          </div>
          <div className="text-xs text-text-tertiary">
            {row.original.currency?.currencyName || 'Currency pricing'}
          </div>
        </div>
      ),
    },
    {
      id: 'baseRate',
      header: 'Base Price',
      cell: ({ row }) => {
        const latestRate = getLatestRateForCurrency(
          rates,
          row.original.currencyId,
        );

        return (
          <div className="text-text-primary">
            {getStoredBaseRateLabel(latestRate)}
          </div>
        );
      },
    },
    {
      id: 'buy',
      header: 'Buy',
      cell: ({ row }) => {
        const latestRate = getLatestRateForCurrency(
          rates,
          row.original.currencyId,
        );
        const pricingGroup = getCurrencyPricingGroup(
          currencies,
          row.original.currencyId,
        );
        const preview = buildCurrencyRateComparisonPreview({
          latestRate,
          pricingGroup,
          overrideBuy: row.original.buy,
          overrideSale: row.original.sale,
        });

        return (
          <div className="space-y-1">
            <div className="text-xs text-text-tertiary">
              Group: {pricingGroup?.buyMarginType || 'EMPTY'}{' '}
              {formatMarginValue(
                pricingGroup?.buyMarginType,
                pricingGroup?.buyMarginValue,
              )}
            </div>
            <div className="text-xs text-text-tertiary">
              Group Result: {preview?.buy.groupFinalRate || '-'}
            </div>
            <MarginPreview
              title="Override"
              value={`${row.original.buy.marginType || 'EMPTY'} ${formatMarginValue(
                row.original.buy.marginType,
                row.original.buy.marginValue,
              )}`.trim()}
              result={preview?.buy.overrideFinalRate ?? null}
              applied={preview?.buy.appliedFinalRate ?? null}
              appliedSource={preview?.buy.appliedSource ?? 'none'}
            />
          </div>
        );
      },
    },
    {
      id: 'sale',
      header: 'Sale',
      cell: ({ row }) => {
        const latestRate = getLatestRateForCurrency(
          rates,
          row.original.currencyId,
        );
        const pricingGroup = getCurrencyPricingGroup(
          currencies,
          row.original.currencyId,
        );
        const preview = buildCurrencyRateComparisonPreview({
          latestRate,
          pricingGroup,
          overrideBuy: row.original.buy,
          overrideSale: row.original.sale,
        });

        return (
          <div className="space-y-1">
            <div className="text-xs text-text-tertiary">
              Group: {pricingGroup?.saleMarginType || 'EMPTY'}{' '}
              {formatMarginValue(
                pricingGroup?.saleMarginType,
                pricingGroup?.saleMarginValue,
              )}
            </div>
            <div className="text-xs text-text-tertiary">
              Group Result: {preview?.sale.groupFinalRate || '-'}
            </div>
            <MarginPreview
              title="Override"
              value={`${row.original.sale.marginType || 'EMPTY'} ${formatMarginValue(
                row.original.sale.marginType,
                row.original.sale.marginValue,
              )}`.trim()}
              result={preview?.sale.overrideFinalRate ?? null}
              applied={preview?.sale.appliedFinalRate ?? null}
              appliedSource={preview?.sale.appliedSource ?? 'none'}
            />
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={
            row.original.isActive ? 'text-success-600' : 'text-error-600'
          }
        >
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <CardSection heading="Product Currency Overrides" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          Each product-currency row can replace the group margin rules and still show you the group comparison for review.
        </p>
        {refreshing ? (
          <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Refreshing...
          </span>
        ) : null}
      </div>

      <Table
        columns={columns}
        data={rules}
        loading={loading}
        emptyMessage="No product-currency overrides yet."
        enableFiltering={false}
        enablePagination={false}
        enableSorting={false}
        onRowClick={onOpenRule}
      />
    </CardSection>
  );
};
