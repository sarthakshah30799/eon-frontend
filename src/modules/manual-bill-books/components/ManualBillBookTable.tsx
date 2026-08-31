import { useMemo } from 'react';
import {
  Table,
  type PaginationControlsProps,
  type TableColumnDef,
  type TableToolbarFilter,
} from '@/components/ui';
import type { IManualBook } from '@/api';
import { PAGINATION_PAGE_SIZE_OPTIONS } from '@/constants/paginationConstants';
import { ManualBillBookStatusEnum } from '../types';

const resolveAssignedToLabel = (assignedTo: IManualBook['assignedTo']) => {
  if (assignedTo && typeof assignedTo === 'object') {
    return assignedTo.name || assignedTo.id;
  }

  return assignedTo || 'N/A';
};

const getStatusBadgeClass = (status: string) => {
  if (status === ManualBillBookStatusEnum.APPROVE)
    return 'bg-emerald-100 text-emerald-800';
  if (status === ManualBillBookStatusEnum.REJECT)
    return 'bg-rose-100 text-rose-800';
  return 'bg-amber-100 text-amber-800';
};

interface ManualBillBookTableProps extends PaginationControlsProps {
  books: IManualBook[];
  loading?: boolean;
  isFetching?: boolean;
  onRowClick?: (book: IManualBook) => void;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  toolbarFilters?: TableToolbarFilter[];
  emptyMessage?: string;
}

export const ManualBillBookTable = ({
  books,
  loading = false,
  isFetching = false,
  onRowClick,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [...PAGINATION_PAGE_SIZE_OPTIONS],
  itemLabel = 'dispatches',
  onSearch,
  searchValue,
  searchPlaceholder = 'Search dispatch no, remarks, book or MV number',
  toolbarFilters,
  emptyMessage = 'No Records found. Create your first Manual Bill Book.',
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
            className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(row.original.status)}`}
          >
            {row.original.status}
          </span>
        ),
      },
    ],
    []
  );

  const useLegacySearch = Boolean(onSearch) && !toolbarFilters?.length;

  return (
    <Table
      columns={tableColumns}
      data={books}
      enableSorting={false}
      enableFiltering={false}
      enablePagination
      manualPagination
      enableRowSelection={false}
      enableColumnVisibility={false}
      page={page}
      pageSize={pageSize}
      pageSizeOptions={pageSizeOptions}
      total={total}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      paginationItemLabel={itemLabel}
      loading={loading}
      isFetching={isFetching}
      className="min-w-full text-xs"
      onRowClick={onRowClick}
      onSearch={useLegacySearch ? onSearch : undefined}
      searchValue={useLegacySearch ? searchValue : undefined}
      searchPlaceholder={searchPlaceholder}
      toolbarFilters={toolbarFilters}
      emptyMessage={emptyMessage}
    />
  );
};
