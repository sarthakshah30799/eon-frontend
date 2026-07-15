import { useMemo, type ReactNode } from 'react';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { Button } from '@/components/ui/button1';
import { EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { TransactionStatusEnum } from '../types';

export interface TransactionListRow {
  id: string;
  number: string;
  branch: string;
  partyProfile: string;
  transactionType: string;
  tradeMode: string;
  status: string;
  createdAt: string;
}

interface TransactionListTableProps {
  rows: TransactionListRow[];
  loading?: boolean;
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  onRowClick?: (row: TransactionListRow) => void;
  onActionClick?: (row: TransactionListRow) => void;
  actionLabel?: string;
  actionMode?: 'edit' | 'view' | 'custom';
  actionIcon?: ReactNode;
  isActionDisabled?: (row: TransactionListRow) => boolean;
  isActionLoading?: (row: TransactionListRow) => boolean;
  emptyMessage?: string;
}

const statusClassName = (status: string) =>
  [
    'inline-flex rounded px-2 py-0.5 text-[10px] font-semibold',
    status === TransactionStatusEnum.APPROVED
      ? 'bg-emerald-100 text-emerald-800'
      : status === TransactionStatusEnum.REJECTED
        ? 'bg-rose-100 text-rose-800'
        : status === TransactionStatusEnum.PENDING
          ? 'bg-amber-100 text-amber-800'
          : 'bg-slate-100 text-slate-700',
  ].join(' ');

export const TransactionListTable = ({
  rows,
  loading = false,
  search,
  onSearch,
  searchPlaceholder = 'Search transaction number',
  onRowClick,
  onActionClick,
  actionLabel = 'Edit transaction',
  actionMode = 'edit',
  actionIcon,
  isActionDisabled,
  isActionLoading,
  emptyMessage = 'No transactions found.',
}: TransactionListTableProps) => {
  const columns: TableColumnDef<TransactionListRow>[] = useMemo(
    () => [
      {
        accessorKey: 'number',
        header: 'Number',
        cell: ({ row }) => (
          <span className="font-semibold text-text-primary">
            {row.original.number}
          </span>
        ),
      },
      { accessorKey: 'branch', header: 'Branch' },
      { accessorKey: 'partyProfile', header: 'Party Profile' },
      { accessorKey: 'transactionType', header: 'Type' },
      { accessorKey: 'tradeMode', header: 'Trade Mode' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span className={statusClassName(row.original.status)}>
            {row.original.status}
          </span>
        ),
      },
      { accessorKey: 'createdAt', header: 'Created At' },
      {
        id: 'actions',
        header: 'Actions',
        meta: {
          headerClassName:
            'sticky right-0 z-20 border-l border-border-primary bg-surface-secondary',
          cellClassName:
            'sticky right-0 z-10 border-l border-border-primary bg-surface-primary',
        },
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {onActionClick ? (
              <Button
                type="button"
                aria-label={actionLabel}
                variant="ghost"
                size="icon"
                className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
                disabled={isActionDisabled?.(row.original)}
                loading={isActionLoading?.(row.original)}
                onClick={event => {
                  event.stopPropagation();
                  onActionClick(row.original);
                }}
              >
                {actionIcon ?? (actionMode === 'view' ? (
                  <EyeIcon className="h-5 w-5" />
                ) : (
                  <PencilSquareIcon className="h-5 w-5" />
                ))}
              </Button>
            ) : null}
          </div>
        ),
        enableSorting: false,
      },
    ],
    [actionLabel, actionMode, onActionClick]
  );

  return (
    <Table
      columns={columns}
      data={rows}
      loading={loading}
      enableFiltering={false}
      enablePagination={false}
      enableColumnVisibility={false}
      enableRowSelection={false}
      enableSorting={false}
      onSearch={onSearch}
      searchValue={search}
      searchPlaceholder={searchPlaceholder}
      onRowClick={onRowClick}
      emptyMessage={emptyMessage}
    />
  );
};

export default TransactionListTable;
