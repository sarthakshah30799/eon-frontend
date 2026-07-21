import { useMemo } from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table/Table';
import type { RecentTransaction } from '@/api/dashboard/dashboard.api';
import { formatCurrency } from '@/utils';

interface RecentTransactionsTableProps {
  transactions: RecentTransaction[];
  loading?: boolean;
  onRowClick: (txn: RecentTransaction) => void;
}

const statusLabel: Record<string, string> = {
  APPROVED: 'Completed',
  PENDING: 'Under Review',
  DRAFT: 'DRAFT',
  REJECTED: 'REJECTED',
};

const RecentTransactionsTable = ({ transactions, loading = false, onRowClick }: RecentTransactionsTableProps) => {
  const navigate = useNavigate();

  const columns: TableColumnDef<RecentTransaction>[] = useMemo(() => [
    {
      accessorKey: 'number',
      header: 'Txn ID',
      cell: (info) => <span className="font-mono text-primary">{info.getValue() as string || '\u2014'}</span>,
    },
    {
      accessorKey: 'partyName',
      header: 'Customer',
      cell: (info) => info.getValue() as string || '\u2014',
    },
    {
      id: 'pair',
      header: 'Pair',
      accessorFn: (row) => `${row.currencyCode}/${row.productCode}`,
      cell: (info) => <span className="font-mono font-medium">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'transactionType',
      header: 'Type',
      cell: (info) => {
        const val = info.getValue() as string;
        const color = val === 'SALE' ? 'text-emerald-600' : 'text-red-600';
        return <span className={`font-medium ${color}`}>{val === 'SALE' ? 'Buy' : 'Sell'}</span>;
      },
    },
    {
      accessorKey: 'fcyAmount',
      header: 'FCY Amt',
      cell: (info) => <span className="font-mono">{formatCurrency(info.getValue() as string)}</span>,
    },
    {
      accessorKey: 'lcyAmount',
      header: 'LCY Amt',
      cell: (info) => <span className="font-mono">MYR {formatCurrency(info.getValue() as string)}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => {
        const val = info.getValue() as string;
        const colors: Record<string, string> = {
          APPROVED: 'bg-success-50 text-success-700 border-success-200',
          PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
          DRAFT: 'bg-blue-50 text-blue-700 border-blue-200',
          REJECTED: 'bg-error-50 text-error-700 border-error-200',
        };
        return (
          <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${colors[val] || colors.DRAFT}`}>
            {statusLabel[val] || val}
          </span>
        );
      },
    },
  ], []);

  return (
    <section className="rounded-lg border border-border-primary bg-surface-primary shadow-sm">
      <div className="flex items-center justify-between border-b border-border-primary px-4 pb-3 pt-4">
        <h2 className="text-sm font-semibold text-text-primary">Recent Transactions</h2>
        {transactions.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/purchase')}
          >
            <EyeIcon className="w-3 h-3" />
            View All
          </Button>
        )}
      </div>
      <Table<RecentTransaction>
        columns={columns}
        data={transactions}
        enableSorting={false}
        enableFiltering={false}
        enablePagination={false}
        loading={loading}
        onRowClick={onRowClick}
        emptyMessage="No transactions yet"
        className="text-xs"
      />
    </section>
  );
};

export default RecentTransactionsTable;
