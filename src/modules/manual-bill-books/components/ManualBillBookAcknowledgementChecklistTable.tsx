import { useMemo } from 'react';
import { Checkbox, Input, Table, type TableColumnDef } from '@/components/ui';
import type { IManualBook } from '@/api';
import { ManualBillBookStatusEnum, type ManualBillBookReviewStatus } from '../types';

export interface ManualBillBookAcknowledgementRowEdit {
  status?: ManualBillBookReviewStatus;
  remarks: string;
}

interface ManualBillBookAcknowledgementChecklistTableProps {
  books: IManualBook[];
  rowEdits: Record<string, ManualBillBookAcknowledgementRowEdit>;
  onCheckboxChange: (id: string, status: ManualBillBookReviewStatus) => void;
  onRemarksChange: (id: string, remarks: string) => void;
}

export const ManualBillBookAcknowledgementChecklistTable = ({
  books,
  rowEdits,
  onCheckboxChange,
  onRemarksChange,
}: ManualBillBookAcknowledgementChecklistTableProps) => {
  const columns = useMemo<TableColumnDef<IManualBook>[]>(
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
        accessorKey: 'transactionType',
        header: 'Transaction Type',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {row.original.transactionType}
          </span>
        ),
      },
      {
        accessorKey: 'bookNoFrom',
        header: 'Book No From',
        cell: ({ row }) => <span>{row.original.bookNoFrom}</span>,
      },
      {
        accessorKey: 'bookNoTo',
        header: 'Book No To',
        cell: ({ row }) => <span>{row.original.bookNoTo}</span>,
      },
      {
        accessorKey: 'vouchersPerBook',
        header: 'No Of Voucher',
        cell: ({ row }) => <span>{row.original.vouchersPerBook}</span>,
      },
      {
        accessorKey: 'mvNoFrom',
        header: 'MV No.From',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.mvNoFrom}</span>
        ),
      },
      {
        accessorKey: 'mvNoTo',
        header: 'MV No.To',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.mvNoTo}</span>
        ),
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        cell: ({ row }) => (
          <span
            className="block max-w-30 truncate"
            title={row.original.remarks}
          >
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
            edit.status === ManualBillBookStatusEnum.APPROVE ||
            (row.original.status === ManualBillBookStatusEnum.APPROVE && edit.status === undefined);
          const isReadOnly = row.original.status !== ManualBillBookStatusEnum.PENDING;

          return (
            <div className="flex justify-center">
              <Checkbox
                checked={isApproved}
                disabled={isReadOnly}
                onChange={() => onCheckboxChange(row.original.id, ManualBillBookStatusEnum.APPROVE)}
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
            edit.status === ManualBillBookStatusEnum.REJECT ||
            (row.original.status === ManualBillBookStatusEnum.REJECT && edit.status === undefined);
          const isReadOnly = row.original.status !== ManualBillBookStatusEnum.PENDING;

          return (
            <div className="flex justify-center">
              <Checkbox
                checked={isRejected}
                disabled={isReadOnly}
                onChange={() => onCheckboxChange(row.original.id, ManualBillBookStatusEnum.REJECT)}
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
          const isReadOnly = row.original.status !== ManualBillBookStatusEnum.PENDING;

          return (
            <Input
              value={displayRemarks}
              disabled={isReadOnly}
              onChange={e => onRemarksChange(row.original.id, e.target.value)}
              placeholder="Approval details..."
              className="max-w-none"
              valueTransform="none"
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
      className="min-w-full text-sm"
      emptyMessage="No Records found."
    />
  );
};
