import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Table, type TableColumnDef } from '@/components/ui';
import { useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { formatDateTime } from '@/utils';
import {
  TtSettlementDocumentStatus,
  type TtSettlementDocument,
  type TtSettlementDocumentFilters,
} from '@/api/ttSettlement';
import { ttSettlementApi } from '@/api/ttSettlement';
import {
  TT_SETTLEMENT_STATUS_OPTIONS,
  TT_SETTLEMENT_TEXT,
} from '../constants/ttSettlementConstants';

const label = (
  snapshot: TtSettlementDocument['currencySnapshot'],
  fallback: string
) =>
  snapshot?.label ??
  snapshot?.currencyCode ??
  snapshot?.name ??
  snapshot?.code ??
  fallback;

export const TtSettlementListView = () => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<
    Omit<TtSettlementDocumentFilters, 'limit' | 'offset'>
  >({});

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
    queryKey: ['tt-deal', 'settlement-documents'],
    queryFn: params => ttSettlementApi.list(params),
    filters,
  });

  const columns = useMemo<TableColumnDef<TtSettlementDocument>[]>(
    () => [
      {
        accessorKey: 'transactionNumber',
        header: TT_SETTLEMENT_TEXT.transactionNumber,
      },
      {
        accessorKey: 'kind',
        header: TT_SETTLEMENT_TEXT.type,
        cell: ({ row }) =>
          row.original.kind === 'HO_ISSUER'
            ? TT_SETTLEMENT_TEXT.kindIssuer
            : TT_SETTLEMENT_TEXT.kindBranch,
      },
      {
        accessorKey: 'transactionDate',
        header: TT_SETTLEMENT_TEXT.transactionDate,
        cell: ({ row }) =>
          formatDateTime(row.original.transactionDate, 'DD/MM/YYYY'),
      },
      {
        id: 'issuer',
        header: TT_SETTLEMENT_TEXT.issuer,
        cell: ({ row }) =>
          label(
            row.original.issuerPartyProfileSnapshot,
            row.original.issuerPartyProfileId
          ),
      },
      {
        id: 'currency',
        header: TT_SETTLEMENT_TEXT.currency,
        cell: ({ row }) =>
          label(row.original.currencySnapshot, row.original.currencyId),
      },
      {
        id: 'branch',
        header: TT_SETTLEMENT_TEXT.sellingBranch,
        cell: ({ row }) =>
          label(row.original.branchSnapshot, row.original.branchId),
      },
      { accessorKey: 'itemCount', header: TT_SETTLEMENT_TEXT.itemsCount },
      {
        accessorKey: 'status',
        header: TT_SETTLEMENT_TEXT.status,
        cell: ({ row }) =>
          TT_SETTLEMENT_STATUS_OPTIONS.find(
            option => option.value === row.original.status
          )?.label ?? row.original.status,
      },
      {
        id: 'actions',
        header: TT_SETTLEMENT_TEXT.actions,
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => navigate(`/tt-settlement/edit/${row.original.id}`)}
          >
            {row.original.status ===
            TtSettlementDocumentStatus.PENDING_HO_ACCEPTANCE
              ? TT_SETTLEMENT_TEXT.editReview
              : TT_SETTLEMENT_TEXT.view}
          </Button>
        ),
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
            {TT_SETTLEMENT_STATUS_OPTIONS.map(option => (
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
                        : (option.value as TtSettlementDocumentStatus),
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
            {TT_SETTLEMENT_TEXT.title}
          </h1>
          <p className="text-sm text-text-secondary">
            {TT_SETTLEMENT_TEXT.description}
          </p>
        </div>
        <Button type="button" onClick={() => navigate('/tt-settlement/create')}>
          {TT_SETTLEMENT_TEXT.newSettlement}
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
            error instanceof Error ? error.message : TT_SETTLEMENT_TEXT.empty
          }
        />
      </section>
    </div>
  );
};

export default TtSettlementListView;
