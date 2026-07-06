import { useMemo } from 'react';
import { Table, type TableColumnDef } from '@/components/ui';
import type { IChequeBook } from '@/api';

export interface ChequeBookAcknowledgementRowEdit {
  status?: 'Approved' | 'Rejected';
  remarks: string;
}

interface ChequeBookAcknowledgementChecklistTableProps {
  books: IChequeBook[];
  rowEdits: Record<string, ChequeBookAcknowledgementRowEdit>;
  loading?: boolean;
  onCheckboxChange: (id: string, status: 'Approved' | 'Rejected') => void;
  onRemarksChange: (id: string, remarks: string) => void;
}

export const ChequeBookAcknowledgementChecklistTable = ({
  books,
  rowEdits,
  loading = false,
  onCheckboxChange,
  onRemarksChange,
}: ChequeBookAcknowledgementChecklistTableProps) => {
  const columns = useMemo<TableColumnDef<IChequeBook>[]>(
    () => [
      {
        accessorKey: 'no',
        header: 'Request No',
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-text-primary">
            {row.original.no}
          </span>
        ),
      },
      {
        accessorKey: 'dispatchDate',
        header: 'Request Date',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-text-secondary">
            {new Date(row.original.dispatchDate).toLocaleDateString()} 00:00:00
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
        header: 'Check Book No. From',
      },
      {
        accessorKey: 'bookNoTo',
        header: 'Check Book No. To',
      },
      {
        accessorKey: 'vouchersPerBook',
        header: 'No Of Leaf',
      },
      {
        accessorKey: 'mvNoFrom',
        header: 'Cheque No. From',
      },
      {
        accessorKey: 'mvNoTo',
        header: 'Cheque No. To',
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        cell: ({ row }) => (
          <span className="block max-w-30 truncate" title={row.original.remarks}>
            {row.original.remarks || '-'}
          </span>
        ),
      },
      {
        id: 'approve',
        header: 'APPROVE',
        cell: ({ row }) => {
          const edit = rowEdits[row.original.id] || { remarks: '' };
          const isApproved =
            edit.status === 'Approved' ||
            (row.original.status === 'Approved' && edit.status === undefined);
          const isReadOnly = row.original.status !== 'Pending';

          return (
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={isApproved}
                disabled={isReadOnly}
                onChange={() => onCheckboxChange(row.original.id, 'Approved')}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          );
        },
      },
      {
        id: 'reject',
        header: 'REJECT',
        cell: ({ row }) => {
          const edit = rowEdits[row.original.id] || { remarks: '' };
          const isRejected =
            edit.status === 'Rejected' ||
            (row.original.status === 'Rejected' && edit.status === undefined);
          const isReadOnly = row.original.status !== 'Pending';

          return (
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={isRejected}
                disabled={isReadOnly}
                onChange={() => onCheckboxChange(row.original.id, 'Rejected')}
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          );
        },
      },
      {
        id: 'review-remarks',
        header: 'REMARKS',
        cell: ({ row }) => {
          const edit = rowEdits[row.original.id] || { remarks: '' };
          const displayRemarks =
            edit.remarks !== undefined && edit.status !== undefined
              ? edit.remarks
              : row.original.approvalRemarks || '';
          const isReadOnly = row.original.status !== 'Pending';

          return (
            <input
              type="text"
              value={displayRemarks}
              disabled={isReadOnly}
              onChange={e => onRemarksChange(row.original.id, e.target.value)}
              placeholder="Approval details..."
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-500"
            />
          );
        },
      },
    ],
    [onCheckboxChange, onRemarksChange, rowEdits]
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
    />
  );
};
