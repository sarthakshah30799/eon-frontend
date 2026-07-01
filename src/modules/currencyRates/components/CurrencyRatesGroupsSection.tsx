import type { ICurrencyRateGroup } from '../types/currencyRatesTypes';
import { formatMarginValue } from '../utils/currencyRatesUtils';
import { Button, CardSection } from '@/components/ui';
import { Table, type TableColumnDef } from '@/components/ui/table';

interface CurrencyRatesGroupsSectionProps {
  groups: ICurrencyRateGroup[];
  loading?: boolean;
  refreshing?: boolean;
  onCreateGroup: () => void;
  onOpenGroup: (group: ICurrencyRateGroup) => void;
}

export const CurrencyRatesGroupsSection = ({
  groups,
  loading = false,
  refreshing = false,
  onCreateGroup,
  onOpenGroup,
}: CurrencyRatesGroupsSectionProps) => {
  const columns: TableColumnDef<ICurrencyRateGroup>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: info => (
        <div className="font-semibold text-text-primary">{info.getValue<string>()}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      id: 'buyMargin',
      header: 'Buy Margin',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-text-primary">
            {row.original.buyMarginType || 'EMPTY'}{' '}
            {formatMarginValue(
              row.original.buyMarginType,
              row.original.buyMarginValue,
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'saleMargin',
      header: 'Sale Margin',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-text-primary">
            {row.original.saleMarginType || 'EMPTY'}{' '}
            {formatMarginValue(
              row.original.saleMarginType,
              row.original.saleMarginValue,
            )}
          </div>
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
    <CardSection
      heading="Currency Rate Groups"
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          Group defaults are used only when a product-currency override is not present.
        </p>
        <div className="flex items-center gap-3">
          {refreshing ? (
            <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Refreshing...
            </span>
          ) : null}
          <Button type="button" onClick={onCreateGroup}>
            New Group
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={groups}
        loading={loading}
        emptyMessage="No groups yet. Create one to start pricing currencies."
        enableFiltering={false}
        enablePagination={false}
        enableSorting={false}
        onRowClick={onOpenGroup}
      />
    </CardSection>
  );
};
