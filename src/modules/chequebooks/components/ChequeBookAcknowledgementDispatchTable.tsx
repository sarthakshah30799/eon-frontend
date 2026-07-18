import { useMemo } from 'react';
import { Table, type TableColumnDef } from '@/components/ui';
import type { IChequeBook } from '@/api';
import { ChequeBookStatusEnum } from '../types';

const resolveAssignedToLabel = (assignedTo: IChequeBook['assignedTo']) => {
  if (assignedTo && typeof assignedTo === 'object') {
    return assignedTo.name || assignedTo.id;
  }

  return assignedTo || 'Unknown';
};

interface ChequeBookAcknowledgementDispatchTableProps {
  books: IChequeBook[];
  loading?: boolean;
  onRowClick?: (book: IChequeBook) => void;
}

export const ChequeBookAcknowledgementDispatchTable = ({
  books,
  loading = false,
  onRowClick,
}: ChequeBookAcknowledgementDispatchTableProps) => {
  const columns = useMemo<TableColumnDef<IChequeBook>[]>(
    () => [
      {
        accessorKey: 'dispatchDate',
        header: 'Date',
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {new Date(row.original.dispatchDate).toLocaleDateString('en-GB')}
          </span>
        ),
      },
      {
        accessorKey: 'no',
        header: 'No',
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-text-primary">
            {row.original.no}
          </span>
        ),
      },
      {
        accessorKey: 'branchCode',
        header: 'Branch',
        cell: ({ row }) => (
          <span className="font-semibold text-xs text-text-secondary">
            {row.original.branchCode || 'Unknown'}
          </span>
        ),
      },
      {
        accessorKey: 'bankAccountCode',
        header: 'Bank Account Code',
        cell: ({ row }) => row.original.bankAccountCodeName || row.original.bankAccountCode,
      },
      {
        accessorKey: 'bookNoFrom',
        header: 'Check Books From-To',
        cell: ({ row }) => (
          <span>
            {row.original.bookNoFrom} - {row.original.bookNoTo}
          </span>
        ),
      },
      {
        accessorKey: 'vouchersPerBook',
        header: 'Leaves/Book',
      },
      {
        accessorKey: 'mvNoFrom',
        header: 'Cheque From-To',
        cell: ({ row }) => (
          <span className="font-semibold text-sky-800">
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
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${
              row.original.status === ChequeBookStatusEnum.APPROVE
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : row.original.status === ChequeBookStatusEnum.REJECT
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
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
      columns={columns}
      data={books}
      enableSorting={false}
      enableFiltering={false}
      enablePagination={false}
      enableRowSelection={false}
      enableColumnVisibility={false}
      loading={loading}
      className="min-w-full text-sm"
      onRowClick={onRowClick}
    />
  );
};
