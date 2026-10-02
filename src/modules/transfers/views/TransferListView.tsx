import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import type { AsyncSelectOption } from '@/components/ui';
import {
  Table,
  type TableColumnDef,
  buildSearchToolbarFilter,
  buildStaticAsyncSelectToolbarFilter,
  TABLE_ACTIONS_CELL_CLASSNAME,
  TABLE_ACTION_BUTTON_CLASSNAME,
  TABLE_ACTION_ICON_CLASSNAME,
} from '@/components/ui/table';
import { useAuth } from '@/lib/AuthContext';
import { useDebounce, useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { transfersApi } from '@/api/transfers/transfers.api';
import { TRANSFER_LIST_TEXT } from '../constants/transferConstants';
import { getTransferStatusLabel, TRANSFER_STATUS_OPTIONS } from '../utils';
import type { ICurrencyTransfer, TransferStatus, TransferType } from '../types';

import { SurfacePanel } from '@/components/ui';
const titleMap: Record<TransferType, string> = {
  COUNTER: 'Counter Transfers',
  BRANCH: 'Branch Transfers',
};

const TRANSFER_STATUS_FILTER_OPTIONS = TRANSFER_STATUS_OPTIONS.filter(
  option => option.value !== 'ALL'
);

export const TransferListView = ({
  transferType,
}: {
  transferType: TransferType;
}) => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { activeBranchId, activeCounterId } = useAuth();
  const [status, setStatus] = useState<TransferStatus | ''>('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const statusOptions = useMemo<AsyncSelectOption[]>(
    () =>
      TRANSFER_STATUS_FILTER_OPTIONS.map(option => ({
        value: option.value,
        label: option.label,
      })),
    []
  );

  const selectedStatusOption = useMemo(
    () => statusOptions.find(option => option.value === status) ?? null,
    [status, statusOptions]
  );

  const filters = useMemo(
    () => ({
      transferType,
      status: status || undefined,
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
    queryKey: ['transfers', transferType, activeBranchId, activeCounterId],
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
          <div className={TABLE_ACTIONS_CELL_CLASSNAME}>
            <Button
              type="button"
              aria-label="View transfer"
              variant="ghost"
              size="icon"
              className={TABLE_ACTION_BUTTON_CLASSNAME}
              onClick={event => {
                event.stopPropagation();
                navigate(
                  `/transfer/${transferType.toLowerCase()}/edit/${row.original.id}`
                );
              }}
            >
              <PencilSquareIcon className={TABLE_ACTION_ICON_CLASSNAME} />
            </Button>
          </div>
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
        label: TRANSFER_LIST_TEXT.search,
        placeholder: TRANSFER_LIST_TEXT.searchPlaceholder,
      }),
      buildStaticAsyncSelectToolbarFilter({
        id: 'status',
        label: TRANSFER_LIST_TEXT.status,
        options: statusOptions,
        value: selectedStatusOption,
        placeholder: TRANSFER_LIST_TEXT.statusPlaceholder,
        className: 'w-48 shrink-0',
        onChange: option => {
          setStatus(
            option?.value ? (String(option.value) as TransferStatus) : ''
          );
          resetOffset();
        },
      }),
    ],
    [resetOffset, search, selectedStatusOption, statusOptions]
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

      <SurfacePanel>
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
          emptyMessage={TRANSFER_LIST_TEXT.emptyMessage}
        />
      </SurfacePanel>
    </div>
  );
};
