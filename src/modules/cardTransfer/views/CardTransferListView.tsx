import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button1';
import type { AsyncSelectOption } from '@/components/ui';
import {
  Table,
  type TableColumnDef,
  buildSearchToolbarFilter,
  buildStaticAsyncSelectToolbarFilter,
  TABLE_ACTIONS_CELL_CLASSNAME,
  TABLE_ACTION_BUTTON_CLASSNAME,
  TABLE_ACTION_DELETE_BUTTON_CLASSNAME,
  TABLE_ACTION_ICON_CLASSNAME,
} from '@/components/ui/table';
import { useDebounce, useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { useAuth } from '@/lib/AuthContext';
import { cardTransferApi } from '@/api/cardTransfer';
import { formatDateTime } from '@/utils';
import { CARD_TRANSFER_STATUS_OPTIONS, CARD_TRANSFER_COPY } from '../constants';
import { useDeleteCardTransfer } from '../hooks';
import type { CardTransferRequest } from '../types';

import { SurfacePanel } from '@/components/ui';
const readStatusValues = (searchParams: URLSearchParams) => {
  const allowed = new Set(
    CARD_TRANSFER_STATUS_OPTIONS.map(option => option.value)
  );
  return [
    ...new Set(
      searchParams
        .getAll('status')
        .flatMap(value => value.split(','))
        .map(value => value.trim())
        .filter(
          (
            value
          ): value is (typeof CARD_TRANSFER_STATUS_OPTIONS)[number]['value'] =>
            allowed.has(
              value as (typeof CARD_TRANSFER_STATUS_OPTIONS)[number]['value']
            )
        )
    ),
  ];
};

export const CardTransferListView = () => {
  const navigate = useNavigate();
  const { user, activeBranchId } = useAuth();
  const deleteMutation = useDeleteCardTransfer();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const hasHoAccess = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const selectedStatuses = useMemo(
    () => readStatusValues(searchParams),
    [searchParams]
  );
  const statusOptions = useMemo<AsyncSelectOption[]>(
    () =>
      CARD_TRANSFER_STATUS_OPTIONS.map(option => ({
        value: option.value,
        label: option.label,
      })),
    []
  );
  const selectedStatusOptions = useMemo(
    () =>
      statusOptions.filter(option =>
        selectedStatuses.some(status => status === String(option.value))
      ),
    [selectedStatuses, statusOptions]
  );

  const filters = useMemo(
    () => ({
      status: selectedStatuses.length ? selectedStatuses : undefined,
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch, selectedStatuses]
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

  const resetOffsetParams = useCallback((next: URLSearchParams) => {
    next.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
    if (!next.has('limit')) {
      next.set('limit', String(PAGINATION_DEFAULTS.LIMIT));
    }
    return next;
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (value.trim()) {
          next.set('search', value.trim());
        } else {
          next.delete('search');
        }
        return resetOffsetParams(next);
      });
    },
    [resetOffsetParams, setSearchParams]
  );

  const handleStatusChange = useCallback(
    (options: AsyncSelectOption[]) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.delete('status');
        options.forEach(option => {
          const value = String(option.value ?? '').trim();
          if (value) next.append('status', value);
        });
        return resetOffsetParams(next);
      });
    },
    [resetOffsetParams, setSearchParams]
  );

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
        cell: ({ row }) => {
          const isHeld = row.original.status === 'HELD';
          const canManageHeldRequest =
            isHeld &&
            (hasHoAccess || activeBranchId === row.original.sourceBranchId);

          return (
            <div className={TABLE_ACTIONS_CELL_CLASSNAME}>
              <Button
                type="button"
                aria-label={
                  canManageHeldRequest
                    ? CARD_TRANSFER_COPY.editTransfer
                    : CARD_TRANSFER_COPY.viewTransfer
                }
                variant="ghost"
                size="icon"
                className={TABLE_ACTION_BUTTON_CLASSNAME}
                onClick={event => {
                  event.stopPropagation();
                  navigate(`/card-transfer/edit/${row.original.id}`);
                }}
              >
                {canManageHeldRequest ? (
                  <PencilSquareIcon className={TABLE_ACTION_ICON_CLASSNAME} />
                ) : (
                  <EyeIcon className={TABLE_ACTION_ICON_CLASSNAME} />
                )}
              </Button>
              {canManageHeldRequest ? (
                <Button
                  type="button"
                  aria-label={CARD_TRANSFER_COPY.deleteTransfer}
                  variant="ghost"
                  size="icon"
                  className={TABLE_ACTION_DELETE_BUTTON_CLASSNAME}
                  disabled={deleteMutation.isPending}
                  onClick={async event => {
                    event.stopPropagation();
                    if (!window.confirm(CARD_TRANSFER_COPY.deleteConfirm)) {
                      return;
                    }
                    await deleteMutation.mutateAsync(row.original.id);
                    toast.success(CARD_TRANSFER_COPY.deleted);
                  }}
                >
                  <TrashIcon className={TABLE_ACTION_ICON_CLASSNAME} />
                </Button>
              ) : null}
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [
      activeBranchId,
      deleteMutation,
      hasHoAccess,
      navigate,
    ]
  );

  const toolbarFilters = useMemo(
    () => [
      buildSearchToolbarFilter({
        value: search,
        onChange: handleSearch,
        label: 'Search CARD transfers',
        placeholder: 'Search transaction or branch',
      }),
      buildStaticAsyncSelectToolbarFilter({
        id: 'status',
        label: CARD_TRANSFER_COPY.status,
        options: statusOptions,
        value: selectedStatusOptions,
        isMulti: true,
        placeholder: CARD_TRANSFER_COPY.statusPlaceholder,
        className: 'min-w-56 shrink-0',
        onChange: handleStatusChange,
      }),
    ],
    [
      handleSearch,
      handleStatusChange,
      search,
      selectedStatusOptions,
      statusOptions,
    ]
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
          emptyMessage="No CARD transfer requests found."
        />
      </SurfacePanel>
    </div>
  );
};

export default CardTransferListView;
