import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Table, type TableColumnDef } from '@/components/ui';
import { useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { formatDateTime } from '@/utils';
import {
  ProductSettlementDocumentStatus,
  productSettlementApi,
  type ProductSettlementDocument,
  type ProductSettlementDocumentFilters,
} from '@/api/productSettlement';
import {
  PRODUCT_SETTLEMENT_STATUS_OPTIONS,
  PRODUCT_SETTLEMENT_TEXT,
} from '../constants/productSettlementConstants';

const label = (
  snapshot: ProductSettlementDocument['currencySnapshot'],
  fallback: string
) =>
  snapshot?.label ??
  snapshot?.currencyCode ??
  snapshot?.name ??
  snapshot?.code ??
  fallback;

export const ProductSettlementListView = () => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<
    Omit<ProductSettlementDocumentFilters, 'limit' | 'offset'>
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
    queryKey: ['product-settlements'],
    queryFn: params => productSettlementApi.list(params),
    filters,
  });

  const columns = useMemo<TableColumnDef<ProductSettlementDocument>[]>(
    () => [
      {
        accessorKey: 'transactionNumber',
        header: PRODUCT_SETTLEMENT_TEXT.transactionNumber,
      },
      {
        accessorKey: 'kind',
        header: PRODUCT_SETTLEMENT_TEXT.type,
        cell: ({ row }) =>
          row.original.kind === 'HO_ISSUER'
            ? PRODUCT_SETTLEMENT_TEXT.kindIssuer
            : PRODUCT_SETTLEMENT_TEXT.kindBranch,
      },
      {
        accessorKey: 'transactionDate',
        header: PRODUCT_SETTLEMENT_TEXT.transactionDate,
        cell: ({ row }) =>
          formatDateTime(row.original.transactionDate, 'DD/MM/YYYY'),
      },
      {
        id: 'issuer',
        header: PRODUCT_SETTLEMENT_TEXT.issuer,
        cell: ({ row }) =>
          label(
            row.original.issuerPartyProfileSnapshot,
            row.original.issuerPartyProfileId
          ),
      },
      {
        id: 'currency',
        header: PRODUCT_SETTLEMENT_TEXT.currency,
        cell: ({ row }) =>
          label(row.original.currencySnapshot, row.original.currencyId),
      },
      {
        id: 'branch',
        header: PRODUCT_SETTLEMENT_TEXT.sellingBranch,
        cell: ({ row }) =>
          label(row.original.branchSnapshot, row.original.branchId),
      },
      { accessorKey: 'itemCount', header: PRODUCT_SETTLEMENT_TEXT.itemsCount },
      {
        accessorKey: 'status',
        header: PRODUCT_SETTLEMENT_TEXT.status,
        cell: ({ row }) =>
          PRODUCT_SETTLEMENT_STATUS_OPTIONS.find(
            option => option.value === row.original.status
          )?.label ?? row.original.status,
      },
      {
        id: 'actions',
        header: PRODUCT_SETTLEMENT_TEXT.actions,
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              navigate(`/product-settlement/edit/${row.original.id}`)
            }
          >
            {row.original.status ===
            ProductSettlementDocumentStatus.PENDING_HO_ACCEPTANCE
              ? PRODUCT_SETTLEMENT_TEXT.editReview
              : PRODUCT_SETTLEMENT_TEXT.view}
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
            {PRODUCT_SETTLEMENT_STATUS_OPTIONS.map(option => (
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
                        : (option.value as ProductSettlementDocumentStatus),
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
            {PRODUCT_SETTLEMENT_TEXT.title}
          </h1>
          <p className="text-sm text-text-secondary">
            {PRODUCT_SETTLEMENT_TEXT.description}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => navigate('/product-settlement/create')}
        >
          {PRODUCT_SETTLEMENT_TEXT.newSettlement}
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
              : PRODUCT_SETTLEMENT_TEXT.empty
          }
        />
      </section>
    </div>
  );
};

export default ProductSettlementListView;
