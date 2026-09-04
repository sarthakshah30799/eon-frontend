import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import {
  Table,
  type TableColumnDef,
  buildSearchToolbarFilter,
} from '@/components/ui/table';
import { useDebounce, useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { cardTransferApi } from '@/api/cardTransfer';
import { formatDateTime } from '@/utils';
import { CARD_TRANSFER_STATUS_OPTIONS, CARD_TRANSFER_COPY } from '../constants';
import type { CardTransferRequest } from '../types';

export const CardTransferListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState('ALL');
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);

  const filters = useMemo(
    () => ({
      status: status === 'ALL' ? undefined : status,
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch, status]
  );

  const {
    rows: data,
    isLoading,
    isFetching,
    error,
    page,
    limit,
    total,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  } = useOffsetPaginatedList({
    queryKey: ['card-transfer-requests'],
    queryFn: params => cardTransferApi.list(params),
    filters,
  });

  const resetOffset = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
      if (!next.has('limit')) {
        next.set('limit', String(PAGINATION_DEFAULTS.LIMIT));
      }
      return next;
    });
  }, [setSearchParams]);

  const handleSearch = (value: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value.trim()) {
        next.set('search', value.trim());
      } else {
        next.delete('search');
      }
      next.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
      if (!next.has('limit')) {
        next.set('limit', String(PAGINATION_DEFAULTS.LIMIT));
      }
      return next;
    });
  };

  const columns = useMemo<TableColumnDef<CardTransferRequest>[]>(
    () => [
      { accessorKey: 'transactionNumber', header: 'Transaction Number' },
      { id: 'type', header: 'Type', cell: () => 'CARD Transfer Sell' },
      {
        accessorKey: 'transactionDate',
        header: 'Transaction Date',
        cell: ({ row }) =>
          formatDateTime(
            `${row.original.transactionDate}T00:00:00`,
            'DD/MM/YYYY'
          ),
      },
      {
        accessorKey: 'sourceBranchId',
        header: 'Source Branch',
        cell: ({ row }) =>
          row.original.sourceBranch?.name ?? row.original.sourceBranchId,
      },
      {
        accessorKey: 'destinationBranchId',
        header: 'Destination Branch',
        cell: ({ row }) =>
          row.original.destinationBranch?.name ??
          row.original.destinationBranchId,
      },
      { accessorKey: 'status', header: 'Status' },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => navigate(`/card-transfer/edit/${row.original.id}`)}
          >
            {row.original.status === 'HELD' ? 'Edit / Review' : 'View'}
          </Button>
        ),
      },
    ],
    [navigate]
  );

  const toolbarFilters = useMemo(
    () => [
      buildSearchToolbarFilter({
        value: search,
        onChange: handleSearch,
        label: 'Search CARD transfers',
        placeholder: 'Search transaction or branch',
      }),
      {
        id: 'status',
        type: 'custom' as const,
        className: 'w-full shrink-0',
        render: () => (
          <div className="flex flex-wrap gap-2">
            {CARD_TRANSFER_STATUS_OPTIONS.map(option => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={status === option.value ? 'default' : 'outline'}
                onClick={() => {
                  setStatus(option.value);
                  resetOffset();
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        ),
      },
    ],
    [handleSearch, resetOffset, search, status]
  );

  if (error instanceof Error) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {CARD_TRANSFER_COPY.listTitle}
          </h1>
          <p className="text-sm text-text-secondary">
            {CARD_TRANSFER_COPY.listDescription}
          </p>
        </div>
        <Button type="button" onClick={() => navigate('/card-transfer/create')}>
          New CARD Transfer Sell
        </Button>
      </div>
      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <Table
          columns={columns}
          data={data}
          loading={isLoading}
          isFetching={isFetching}
          enableSorting={false}
          enableFiltering={false}
          enablePagination
          manualPagination
          page={page}
          pageSize={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          toolbarFilters={toolbarFilters}
          emptyMessage="No CARD transfer requests found."
        />
      </section>
    </div>
  );
};

export default CardTransferListView;
