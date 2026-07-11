import { useMemo } from 'react';
import { Table, type TableColumnDef } from '@/components/ui';
import type { IChequeBook } from '@/api';
import { ChequeBookStatusEnum } from '../types';

const resolveAssignedToLabel = (assignedTo: IChequeBook['assignedTo']) => {
  if (assignedTo && typeof assignedTo === 'object') {
    return assignedTo.name || assignedTo.id;
  }

  return assignedTo || 'N/A';
};

interface ChequeBookTableProps {
  books: IChequeBook[];
  loading?: boolean;
  onRowClick?: (book: IChequeBook) => void;
}

export const ChequeBookTable = ({
  books,
  loading = false,
  onRowClick,
}: ChequeBookTableProps) => {
  const tableColumns = useMemo<TableColumnDef<IChequeBook>[]>(
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
        accessorKey: 'bankAccountCode',
        header: 'Bank Account Code',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-text-secondary">
            {row.original.bankAccountCodeName || row.original.bankAccountCode}
          </span>
        ),
      },
      {
        accessorKey: 'bookNoFrom',
        header: 'Check Books From-To',
        cell: ({ row }) => (
          <span className="text-center font-semibold text-primary-700">
            {row.original.bookNoFrom} - {row.original.bookNoTo}
          </span>
        ),
      },
      {
        accessorKey: 'vouchersPerBook',
        header: 'Leaves/Book',
        cell: ({ row }) => (
          <span className="text-center">{row.original.vouchersPerBook}</span>
        ),
      },
      {
        accessorKey: 'mvNoFrom',
        header: 'Cheque From-To',
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
              row.original.status === ChequeBookStatusEnum.APPROVE
                ? 'bg-emerald-100 text-emerald-800'
                : row.original.status === ChequeBookStatusEnum.REJECT
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
      emptyMessage="No Records found. Create your first Cheque Book."
    />
  );
};
