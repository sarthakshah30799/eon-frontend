import { useCallback, useMemo } from 'react';
import {
  AsyncSelect,
  Checkbox,
  Table,
  type AsyncSelectOption,
  type AsyncSelectResponse,
  type TableColumnDef,
} from '@/components/ui';
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
  const cashierOptions = useMemo<AsyncSelectOption[]>(
    () =>
      cashiers.map(cashier => ({
        value: cashier.id,
        label: cashier.name,
      })),
    [cashiers]
  );

  const loadCashierOptions = useCallback(
    async (): Promise<AsyncSelectResponse> => ({
      options: cashierOptions,
      hasMore: false,
    }),
    [cashierOptions]
  );

  const columns = useMemo<TableColumnDef<IAllocationRow>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <div className="flex justify-center">
            <Checkbox
              checked={allChecked}
              onChange={checked => onHeaderCheckboxChange(checked)}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Checkbox
              checked={row.original.isCheck}
              onChange={() => onRowCheckboxChange(row.original.id)}
            />
          </div>
        ),
      },
      {
        accessorKey: 'allocatedCashierId',
        header: 'Allocate User',
        cell: ({ row }) => (
          <AsyncSelect
            value={
              cashierOptions.find(
                option => option.value === row.original.allocatedCashierId
              ) ?? null
            }
            onChange={option => {
              const nextOption = Array.isArray(option) ? option[0] : option;
              onRowCashierChange(
                row.original.id,
                nextOption ? String(nextOption.value) : ''
              );
            }}
            loadOptions={loadCashierOptions}
            placeholder="Select User"
            isSearchable={false}
            isClearable
            className="w-32"
          />
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
      cashierOptions,
      loadCashierOptions,
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
