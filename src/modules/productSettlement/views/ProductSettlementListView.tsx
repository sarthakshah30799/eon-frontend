import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import {
  Button,
  SurfacePanel,
  Table,
  type AsyncSelectOption,
  type TableColumnDef,
} from '@/components/ui';
import {
  buildSearchToolbarFilter,
  buildStaticAsyncSelectToolbarFilter,
  TABLE_ACTIONS_CELL_CLASSNAME,
  TABLE_ACTION_BUTTON_CLASSNAME,
  TABLE_ACTION_ICON_CLASSNAME,
} from '@/components/ui/table';
import { useDebounce, useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { formatDateTime } from '@/utils';
import {
  ProductSettlementDocumentStatus,
  productSettlementApi,
  type ProductSettlementDocument,
} from '@/api/productSettlement';
import { useLoadProductOptions } from '@/modules/productProfile/hooks';
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

const readStatusValues = (searchParams: URLSearchParams) => {
  const allowed = new Set(
    PRODUCT_SETTLEMENT_STATUS_OPTIONS.map(option => option.value)
  );
  return [
    ...new Set(
      searchParams
        .getAll('status')
        .flatMap(value => value.split(','))
        .map(value => value.trim())
        .filter((value): value is ProductSettlementDocumentStatus =>
          allowed.has(value as ProductSettlementDocumentStatus)
        )
    ),
  ];
};

export const ProductSettlementListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const productCodeFilter = searchParams.get('productCode') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const loadProductOptions = useLoadProductOptions();
  const selectedProductOption = useMemo<AsyncSelectOption | null>(() => {
    const code = productCodeFilter.trim();
    if (!code) return null;
    return { value: code, label: code };
  }, [productCodeFilter]);
  const selectedStatuses = useMemo(
    () => readStatusValues(searchParams),
    [searchParams]
  );
  const statusOptions = useMemo<AsyncSelectOption[]>(
    () =>
      PRODUCT_SETTLEMENT_STATUS_OPTIONS.map(option => ({
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
      productCode: productCodeFilter.trim() || undefined,
    }),
    [debouncedSearch, productCodeFilter, selectedStatuses]
  );

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

  const handleProductCodeChange = useCallback(
    (option: AsyncSelectOption | null) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        const code = option?.value ? String(option.value).trim() : '';
        if (code) {
          next.set('productCode', code);
        } else {
          next.delete('productCode');
        }
        return resetOffsetParams(next);
      });
    },
    [resetOffsetParams, setSearchParams]
  );

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
        id: 'productCodes',
        header: PRODUCT_SETTLEMENT_TEXT.productCode,
        cell: ({ row }) =>
          String(row.original.productCodes ?? '').trim() || '-',
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
        cell: ({ row }) => {
          const canEdit =
            row.original.status ===
            ProductSettlementDocumentStatus.PENDING_HO_ACCEPTANCE;

          return (
            <div className={TABLE_ACTIONS_CELL_CLASSNAME}>
              <Button
                type="button"
                aria-label={
                  canEdit
                    ? PRODUCT_SETTLEMENT_TEXT.editSettlement
                    : PRODUCT_SETTLEMENT_TEXT.viewSettlement
                }
                variant="ghost"
                size="icon"
                className={TABLE_ACTION_BUTTON_CLASSNAME}
                onClick={event => {
                  event.stopPropagation();
                  navigate(`/product-settlement/edit/${row.original.id}`);
                }}
              >
                {canEdit ? (
                  <PencilSquareIcon className={TABLE_ACTION_ICON_CLASSNAME} />
                ) : (
                  <EyeIcon className={TABLE_ACTION_ICON_CLASSNAME} />
                )}
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [navigate]
  );

  const toolbarFilters = useMemo(
    () => [
      buildSearchToolbarFilter({
        value: search,
        onChange: handleSearch,
        label: PRODUCT_SETTLEMENT_TEXT.search,
        placeholder: PRODUCT_SETTLEMENT_TEXT.searchPlaceholder,
      }),
      {
        id: 'productCode',
        type: 'asyncSelect' as const,
        label: PRODUCT_SETTLEMENT_TEXT.productCode,
        value: selectedProductOption,
        loadOptions: loadProductOptions,
        onChange: handleProductCodeChange,
        placeholder: PRODUCT_SETTLEMENT_TEXT.productCodeFilterPlaceholder,
        defaultOptions: true,
        pagination: true,
        isSearchable: true,
        isClearable: true,
        className: 'w-52 shrink-0',
      },
      buildStaticAsyncSelectToolbarFilter({
        id: 'status',
        label: PRODUCT_SETTLEMENT_TEXT.status,
        options: statusOptions,
        value: selectedStatusOptions,
        isMulti: true,
        placeholder: PRODUCT_SETTLEMENT_TEXT.statusPlaceholder,
        className: 'min-w-56 shrink-0',
        onChange: handleStatusChange,
      }),
    ],
    [
      handleProductCodeChange,
      handleSearch,
      handleStatusChange,
      loadProductOptions,
      search,
      selectedProductOption,
      selectedStatusOptions,
      statusOptions,
    ]
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
      <SurfacePanel>
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
      </SurfacePanel>
    </div>
  );
};

export default ProductSettlementListView;
