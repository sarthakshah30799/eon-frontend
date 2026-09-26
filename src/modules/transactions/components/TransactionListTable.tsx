import { useMemo, type ReactNode } from 'react';
import {
  Table,
  type TableColumnDef,
  type TableToolbarFilter,
  TABLE_ACTIONS_CELL_CLASSNAME,
  TABLE_ACTION_BUTTON_CLASSNAME,
  TABLE_ACTION_ICON_CLASSNAME,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button1';
import { EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import type { PaginationControlsProps } from '@/components/ui';
import { TransactionStatusEnum } from '../types';

export interface TransactionListRow {
  id: string;
  number: string;
  branch: string;
  partyProfile: string;
  productCodes: string;
  transactionType: string;
  tradeMode: string;
  status: string;
  createdAt: string;
}

interface TransactionListTableProps extends Partial<PaginationControlsProps> {
  rows: TransactionListRow[];
  loading?: boolean;
  isFetching?: boolean;
  search?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  toolbarFilters?: TableToolbarFilter[];
  onRowClick?: (row: TransactionListRow) => void;
  onActionClick?: (row: TransactionListRow) => void;
  actionLabel?: string;
  actionMode?: 'edit' | 'view' | 'custom';
  actionIcon?: ReactNode;
  isActionDisabled?: (row: TransactionListRow) => boolean;
  isActionLoading?: (row: TransactionListRow) => boolean;
  emptyMessage?: string;
  manualPagination?: boolean;
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
  isFetching = false,
  search,
  onSearch,
  searchPlaceholder = 'Search transaction number',
  toolbarFilters,
  onRowClick,
  onActionClick,
  actionLabel = 'Edit transaction',
  actionMode = 'edit',
  actionIcon,
  isActionDisabled,
  isActionLoading,
  emptyMessage = 'No transactions found.',
  manualPagination = false,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
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
      { accessorKey: 'productCodes', header: 'Product Type' },
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
        cell: ({ row }) => (
          <div className={TABLE_ACTIONS_CELL_CLASSNAME}>
            {onActionClick ? (
              <Button
                type="button"
                aria-label={actionLabel}
                variant="ghost"
                size="icon"
                className={TABLE_ACTION_BUTTON_CLASSNAME}
                disabled={isActionDisabled?.(row.original)}
                loading={isActionLoading?.(row.original)}
                onClick={event => {
                  event.stopPropagation();
                  onActionClick(row.original);
                }}
              >
                {actionIcon ??
                  (actionMode === 'view' ? (
                    <EyeIcon className={TABLE_ACTION_ICON_CLASSNAME} />
                  ) : (
                    <PencilSquareIcon className={TABLE_ACTION_ICON_CLASSNAME} />
                  ))}
              </Button>
            ) : null}
          </div>
        ),
        enableSorting: false,
      },
    ],
    [actionIcon, actionLabel, actionMode, isActionDisabled, isActionLoading, onActionClick]
  );

  const useLegacySearch = Boolean(onSearch) && !toolbarFilters?.length;

  return (
    <Table
      columns={columns}
      data={rows}
      loading={loading}
      isFetching={isFetching}
      enableFiltering={false}
      enablePagination={manualPagination}
      manualPagination={manualPagination}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      enableColumnVisibility={false}
      enableRowSelection={false}
      enableSorting={false}
      onSearch={useLegacySearch ? onSearch : undefined}
      searchValue={useLegacySearch ? search : undefined}
      searchPlaceholder={searchPlaceholder}
      toolbarFilters={toolbarFilters}
      onRowClick={onRowClick}
      emptyMessage={emptyMessage}
    />
  );
};

export default TransactionListTable;
