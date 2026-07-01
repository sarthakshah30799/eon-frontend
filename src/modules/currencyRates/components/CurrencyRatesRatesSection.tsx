import type { ICurrencyRate } from '../types/currencyRatesTypes';
import {
  getStoredBaseRateLabel,
  getSideBaseRate,
} from '../utils/currencyRatesUtils';
import { CardSection } from '@/components/ui';
import { Table, type TableColumnDef } from '@/components/ui/table';

interface CurrencyRatesRatesSectionProps {
  rates: ICurrencyRate[];
  loading?: boolean;
  refreshing?: boolean;
  onOpenRate: (rate: ICurrencyRate) => void;
}

export const CurrencyRatesRatesSection = ({
  rates,
  loading = false,
  refreshing = false,
  onOpenRate,
}: CurrencyRatesRatesSectionProps) => {
  const columns: TableColumnDef<ICurrencyRate>[] = [
    {
      id: 'currency',
      header: 'Currency',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-semibold text-text-primary">
            {row.original.currency?.currencyCode || row.original.currencyId}
          </div>
          <div className="text-xs text-text-tertiary">
            {row.original.currency?.currencyName || 'Unknown currency'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'provider',
      header: 'Provider',
    },
    {
      id: 'buyRate',
      header: 'Buy',
      cell: ({ row }) => (
        <div className="text-text-primary">
          {getSideBaseRate(row.original, 'buy') || getStoredBaseRateLabel(row.original)}
        </div>
      ),
    },
    {
      id: 'saleRate',
      header: 'Sale',
      cell: ({ row }) => (
        <div className="text-text-primary">
          {getSideBaseRate(row.original, 'sale') || getStoredBaseRateLabel(row.original)}
        </div>
      ),
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
    <CardSection heading="Current Rates" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          TICKER, FOREX, and MANUAL entries are stored here. Click a row to inspect the details.
        </p>
        {refreshing ? (
          <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Refreshing...
          </span>
        ) : null}
      </div>

      <Table
        columns={columns}
        data={rates}
        loading={loading}
        emptyMessage="No rates recorded yet."
        enableFiltering={false}
        enablePagination={false}
        enableSorting={false}
        onRowClick={onOpenRate}
      />
    </CardSection>
  );
};
