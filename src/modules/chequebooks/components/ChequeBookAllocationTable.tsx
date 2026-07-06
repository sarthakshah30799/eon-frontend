import { useMemo } from 'react';
import { Table, type TableColumnDef } from '@/components/ui';
import type { IChequeBookCashier } from '@/modules/chequebooks/hooks';

export interface IAllocationRow {
  id: string;
  bookId: string;
  requestNo: string;
  requestDate: string;
  bankAccountCode: string;
  bankAccountCodeName?: string;
  bankAccountCodeLabel?: string;
  bookNo: number;
  mvNoFrom: number;
  mvNoTo: number;
  qty: number;
  hoRemarks: string;
  allocatedCashierId: string;
  remarks: string;
  isCheck: boolean;
}

interface ChequeBookAllocationTableProps {
  rows: IAllocationRow[];
  cashiers: IChequeBookCashier[];
  loading?: boolean;
  allChecked: boolean;
  onHeaderCheckboxChange: (checked: boolean) => void;
  onRowCheckboxChange: (rowId: string) => void;
  onRowCashierChange: (rowId: string, cashierId: string) => void;
  onRowRemarksChange: (rowId: string, remarks: string) => void;
}

export const ChequeBookAllocationTable = ({
  rows,
  cashiers,
  loading = false,
  allChecked,
  onHeaderCheckboxChange,
  onRowCheckboxChange,
  onRowCashierChange,
  onRowRemarksChange,
}: ChequeBookAllocationTableProps) => {
  const columns = useMemo<TableColumnDef<IAllocationRow>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={e => onHeaderCheckboxChange(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={row.original.isCheck}
              onChange={() => onRowCheckboxChange(row.original.id)}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
          </div>
        ),
      },
      {
        accessorKey: 'allocatedCashierId',
        header: 'Allocate User',
        cell: ({ row }) => (
          <select
            value={row.original.allocatedCashierId}
            onChange={e => onRowCashierChange(row.original.id, e.target.value)}
            className="w-32 rounded border border-slate-300 bg-white px-2 py-1 text-xs focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">Select User</option>
            {cashiers.map(cashier => (
              <option key={cashier.id} value={cashier.id}>
                {cashier.name}
              </option>
            ))}
          </select>
        ),
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        cell: ({ row }) => (
          <textarea
            rows={1}
            value={row.original.remarks}
            onChange={e => onRowRemarksChange(row.original.id, e.target.value)}
            placeholder="Note..."
            className="w-full min-w-[120px] resize-none rounded border border-slate-300 px-2 py-1 text-xs focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        ),
      },
      {
        accessorKey: 'requestNo',
        header: 'Request No',
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-slate-900">
            {row.original.requestNo}
          </span>
        ),
      },
      {
        accessorKey: 'requestDate',
        header: 'Request Date',
      },
      {
        accessorKey: 'bankAccountCode',
        header: 'Bank Account Code',
        cell: ({ row }) => row.original.bankAccountCodeName || row.original.bankAccountCode,
      },
      {
        accessorKey: 'bookNo',
        header: 'Check Book No.',
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800">
            {row.original.bookNo}
          </span>
        ),
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
        accessorKey: 'qty',
        header: 'Leaf Qty',
      },
      {
        accessorKey: 'hoRemarks',
        header: 'HO Remarks',
        cell: ({ row }) => (
          <span className="block max-w-[120px] truncate" title={row.original.hoRemarks}>
            {row.original.hoRemarks}
          </span>
        ),
      },
    ],
    [
      allChecked,
      cashiers,
      onHeaderCheckboxChange,
      onRowCashierChange,
      onRowCheckboxChange,
      onRowRemarksChange,
    ]
  );

  return (
    <Table
      columns={columns}
      data={rows}
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
