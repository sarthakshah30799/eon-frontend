import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import {
  Table,
  type TableColumnDef,
  buildSearchToolbarFilter,
} from '@/components/ui/table';
import { useAuth } from '@/lib/AuthContext';
import { useDebounce, useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { transfersApi } from '@/api/transfers/transfers.api';
import { getTransferStatusLabel, TRANSFER_STATUS_OPTIONS } from '../utils';
import type { ICurrencyTransfer } from '../types';
import type { TransferType } from '../types';

const titleMap: Record<TransferType, string> = {
  COUNTER: 'Counter Transfers',
  BRANCH: 'Branch Transfers',
};

export const TransferListView = ({
  transferType,
}: {
  transferType: TransferType;
}) => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const isAdminOrHo = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const [status, setStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const filters = useMemo(
    () => ({
      transferType,
      status:
        status === 'ALL'
          ? undefined
          : (status as 'HELD' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'),
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch, status, transferType]
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
    queryKey: ['transfers', transferType],
    queryFn: params => transfersApi.listTransfers(params),
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

  const columns = useMemo<TableColumnDef<ICurrencyTransfer>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'Number',
        cell: ({ row }) => row.original.number ?? '—',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getTransferStatusLabel(row.original.status),
      },
      {
        accessorKey: 'billReference',
        header: 'Bill Ref',
        cell: ({ row }) => row.original.billReference ?? '—',
      },
      {
        accessorKey: 'sourceBranchId',
        header: 'Source',
        cell: ({ row }) => (
          <div>
            <div>{row.original.sourceBranch?.name ?? '—'}</div>
            <div className="text-xs text-text-secondary">
              {row.original.sourceCounter?.name ?? '—'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'destinationBranchId',
        header: 'Destination',
        cell: ({ row }) => (
          <div>
            <div>{row.original.destinationBranch?.name ?? '—'}</div>
            <div className="text-xs text-text-secondary">
              {row.original.destinationCounter?.name ?? '—'}
            </div>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            type="button"
            aria-label="View transfer"
            variant="ghost"
            size="icon"
            className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
            onClick={event => {
              event.stopPropagation();
              navigate(
                `/transfer/${transferType.toLowerCase()}/edit/${row.original.id}`
              );
            }}
          >
            <PencilSquareIcon className="h-5 w-5" />
          </Button>
        ),
      },
    ],
    [navigate, transferType]
  );

  const toolbarFilters = useMemo(
    () => [
      buildSearchToolbarFilter({
        value: search,
        onChange: value => {
          setSearch(value);
          resetOffset();
        },
        placeholder: 'Search transfer number',
      }),
      ...(isAdminOrHo
        ? [
            {
              id: 'status',
              type: 'custom' as const,
              className: 'w-full shrink-0',
              render: () => (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border-primary bg-surface-secondary p-1">
                  {TRANSFER_STATUS_OPTIONS.map(option => (
                    <Button
                      key={option.value}
                      type="button"
                      size="sm"
                      variant={
                        status === option.value ? 'default' : 'outline'
                      }
                      onClick={() => {
                        setStatus(option.value);
                        resetOffset();
                      }}
                    >
                      {option.value === 'ALL'
                        ? 'All'
                        : getTransferStatusLabel(option.value)}
                    </Button>
                  ))}
                </div>
              ),
            },
          ]
        : []),
    ],
    [isAdminOrHo, resetOffset, search, status]
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
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-text-primary">
            {titleMap[transferType]}
          </h1>
          <p className="text-sm text-text-secondary">
            Browse held transfers and accept them when ready.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            className="rounded-sm"
            onClick={() =>
              navigate(`/transfer/${transferType.toLowerCase()}/create`)
            }
          >
            New Transfer
          </Button>
        </div>
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
          emptyMessage="No transfers found."
        />
      </section>
    </div>
  );
};
