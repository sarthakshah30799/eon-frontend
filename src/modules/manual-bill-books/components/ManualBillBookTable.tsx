import { useMemo } from 'react';
import { Table, type TableColumnDef } from '@/components/ui';
import type { IManualBook } from '@/api';

const resolveAssignedToLabel = (assignedTo: IManualBook['assignedTo']) => {
  if (assignedTo && typeof assignedTo === 'object') {
    return assignedTo.name || assignedTo.id;
  }

  return assignedTo || 'N/A';
};

interface ManualBillBookTableProps {
  books: IManualBook[];
  loading?: boolean;
  onRowClick?: (book: IManualBook) => void;
}

export const ManualBillBookTable = ({
  books,
  loading = false,
  onRowClick,
}: ManualBillBookTableProps) => {
  const tableColumns = useMemo<TableColumnDef<IManualBook>[]>(
    () => [
      {
        accessorKey: 'dispatchDate',
        header: 'Date',
        cell: ({ row }) => (
          <span className="whitespace-nowrap">{row.original.dispatchDate}</span>
        ),
      },
      {
        accessorKey: 'no',
        header: 'NO',
        cell: ({ row }) => (
          <span className="font-semibold text-text-primary">
            {row.original.no}
          </span>
        ),
      },
      {
        accessorKey: 'branchCode',
        header: 'Branch',
        cell: ({ row }) => (
          <span className="font-medium text-text-secondary">
            {row.original.branchCode || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'transactionType',
        header: 'Txn Type',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-text-secondary">
            {row.original.transactionTypeLabel || row.original.transactionType}
          </span>
        ),
      },
      {
        accessorKey: 'bookNoFrom',
        header: 'Books From-To',
        cell: ({ row }) => (
          <span className="text-center font-semibold text-primary-700">
            {row.original.bookNoFrom} - {row.original.bookNoTo}
          </span>
        ),
      },
      {
        accessorKey: 'vouchersPerBook',
        header: 'Vouchers/Book',
        cell: ({ row }) => (
          <span className="text-center">{row.original.vouchersPerBook}</span>
        ),
      },
      {
        accessorKey: 'mvNoFrom',
        header: 'MV From-To',
        cell: ({ row }) => (
          <span className="text-center font-medium text-emerald-700">
            {row.original.mvNoFrom} - {row.original.mvNoTo}
          </span>
        ),
      },
      {
        accessorKey: 'assignedTo',
        header: 'Assigned To',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-text-secondary">
            {resolveAssignedToLabel(row.original.assignedTo)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={[
              'inline-flex rounded px-2 py-0.5 text-[10px] font-semibold',
              row.original.status === 'Approved'
                ? 'bg-emerald-100 text-emerald-800'
                : row.original.status === 'Rejected'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800',
            ].join(' ')}
          >
            {row.original.status}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <Table
      columns={tableColumns}
      data={books}
      enableSorting={false}
      enableFiltering={false}
      enablePagination={false}
      enableRowSelection={false}
      enableColumnVisibility={false}
      loading={loading}
      className="min-w-full text-xs"
      onRowClick={onRowClick}
      emptyMessage="No Records found. Create your first Manual Bill Book."
    />
  );
};
