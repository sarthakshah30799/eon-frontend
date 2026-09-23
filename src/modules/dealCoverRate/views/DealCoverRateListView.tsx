import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Table, type TableColumnDef } from '@/components/ui';
import { useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { formatDateTime } from '@/utils';
import {
  DealCoverStatus,
  dealCoverRateApi,
  type DealCoverRateListFilters,
  type IDealCoverRate,
} from '@/api/dealCoverRate';
import {
  DEAL_COVER_RATE_TEXT,
  DEAL_COVER_STATUS_OPTIONS,
} from '../constants';
import { snapshotLabel } from '../utils';

export const DealCoverRateListView = () => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<
    Omit<DealCoverRateListFilters, 'limit' | 'offset'>
  >({ status: DealCoverStatus.PENDING });

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

  const {
    rows,
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
    queryKey: ['tt-deal', 'covers'],
    queryFn: params => dealCoverRateApi.list(params),
    filters,
  });

  const columns = useMemo<TableColumnDef<IDealCoverRate>[]>(
    () => [
      {
        accessorKey: 'transactionDate',
        header: DEAL_COVER_RATE_TEXT.transactionDate,
        cell: ({ row }) =>
          formatDateTime(row.original.transactionDate, 'DD/MM/YYYY'),
      },
      {
        id: 'branch',
        header: DEAL_COVER_RATE_TEXT.branch,
        cell: ({ row }) =>
          snapshotLabel(row.original.branchSnapshot, row.original.branchId),
      },
      {
        id: 'currency',
        header: DEAL_COVER_RATE_TEXT.currency,
        cell: ({ row }) =>
          snapshotLabel(row.original.currencySnapshot, row.original.currencyId),
      },
      {
        id: 'issuer',
        header: DEAL_COVER_RATE_TEXT.issuer,
        cell: ({ row }) =>
          snapshotLabel(
            row.original.issuerPartyProfileSnapshot,
            row.original.issuerPartyProfileId
          ),
      },
      { accessorKey: 'feAmount', header: DEAL_COVER_RATE_TEXT.feAmount },
      { accessorKey: 'dealRate', header: DEAL_COVER_RATE_TEXT.dealRate },
      { accessorKey: 'inrAmount', header: DEAL_COVER_RATE_TEXT.inrAmount },
      {
        accessorKey: 'status',
        header: DEAL_COVER_RATE_TEXT.status,
        cell: ({ row }) =>
          DEAL_COVER_STATUS_OPTIONS.find(
            option => option.value === row.original.status
          )?.label ?? row.original.status,
      },
      {
        id: 'actions',
        header: DEAL_COVER_RATE_TEXT.actions,
        cell: ({ row }) => {
          const isPending = row.original.status === DealCoverStatus.PENDING;
          return (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                navigate(
                  isPending
                    ? `/deal-cover-rate/edit/${row.original.id}`
                    : `/deal-cover-rate/view/${row.original.id}`
                )
              }
            >
              {isPending ? DEAL_COVER_RATE_TEXT.edit : DEAL_COVER_RATE_TEXT.view}
            </Button>
          );
        },
      },
    ],
    [navigate]
  );

  const toolbarFilters = useMemo(
    () => [
      {
        id: 'status',
        type: 'custom' as const,
        className: 'w-full shrink-0',
        render: () => (
          <div className="flex flex-wrap gap-2">
            {DEAL_COVER_STATUS_OPTIONS.map(option => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={
                  (filters.status ?? 'ALL') === option.value
                    ? 'default'
                    : 'outline'
                }
                onClick={() => {
                  setFilters(current => ({
                    ...current,
                    status:
                      option.value === 'ALL'
                        ? undefined
                        : (option.value as typeof DealCoverStatus.PENDING),
                  }));
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
    [filters.status, resetOffset]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {DEAL_COVER_RATE_TEXT.title}
          </h1>
          <p className="text-sm text-text-secondary">
            {DEAL_COVER_RATE_TEXT.description}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => navigate('/deal-cover-rate/create')}
        >
          {DEAL_COVER_RATE_TEXT.newDeal}
        </Button>
      </div>
      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <Table
          columns={columns}
          data={rows}
          loading={isLoading}
          isFetching={isFetching}
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
          emptyMessage={
            error instanceof Error
              ? error.message
              : DEAL_COVER_RATE_TEXT.empty
          }
        />
      </section>
    </div>
  );
};

export default DealCoverRateListView;
