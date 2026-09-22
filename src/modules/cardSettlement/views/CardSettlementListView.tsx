import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import {
  Button,
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
  CardStockSettlementDocumentStatus,
  type CardStockSettlementDocument,
} from '@/api/cardSettlement';
import { cardSettlementApi } from '@/api/cardSettlement';
import {
  CARD_SETTLEMENT_STATUS_OPTIONS,
  CARD_SETTLEMENT_TEXT,
} from '../constants/cardSettlementConstants';

const label = (
  snapshot: CardStockSettlementDocument['currencySnapshot'],
  fallback: string
) =>
  snapshot?.label ??
  snapshot?.currencyCode ??
  snapshot?.name ??
  snapshot?.code ??
  fallback;

const readStatusValues = (searchParams: URLSearchParams) => {
  const allowed = new Set(
    CARD_SETTLEMENT_STATUS_OPTIONS.map(option => option.value)
  );
  return [
    ...new Set(
      searchParams
        .getAll('status')
        .flatMap(value => value.split(','))
        .map(value => value.trim())
        .filter((value): value is CardStockSettlementDocumentStatus =>
          allowed.has(value as CardStockSettlementDocumentStatus)
        )
    ),
  ];
};

export const CardSettlementListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const selectedStatuses = useMemo(
    () => readStatusValues(searchParams),
    [searchParams]
  );
  const statusOptions = useMemo<AsyncSelectOption[]>(
    () =>
      CARD_SETTLEMENT_STATUS_OPTIONS.map(option => ({
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
    queryKey: ['card-stock', 'settlement-documents'],
    queryFn: params => cardSettlementApi.list(params),
    filters,
  });

  const columns = useMemo<TableColumnDef<CardStockSettlementDocument>[]>(
    () => [
      {
        accessorKey: 'transactionNumber',
        header: CARD_SETTLEMENT_TEXT.transactionNumber,
      },
      {
        accessorKey: 'kind',
        header: CARD_SETTLEMENT_TEXT.type,
        cell: ({ row }) =>
          row.original.kind === 'HO_ISSUER'
            ? CARD_SETTLEMENT_TEXT.kindIssuer
            : CARD_SETTLEMENT_TEXT.kindBranch,
      },
      {
        accessorKey: 'transactionDate',
        header: CARD_SETTLEMENT_TEXT.transactionDate,
        cell: ({ row }) =>
          formatDateTime(row.original.transactionDate, 'DD/MM/YYYY'),
      },
      {
        id: 'issuer',
        header: CARD_SETTLEMENT_TEXT.issuer,
        cell: ({ row }) =>
          label(
            row.original.issuerPartyProfileSnapshot,
            row.original.issuerPartyProfileId
          ),
      },
      {
        id: 'currency',
        header: CARD_SETTLEMENT_TEXT.currency,
        cell: ({ row }) =>
          label(row.original.currencySnapshot, row.original.currencyId),
      },
      {
        id: 'branch',
        header: CARD_SETTLEMENT_TEXT.sellingBranch,
        cell: ({ row }) =>
          label(row.original.branchSnapshot, row.original.branchId),
      },
      { accessorKey: 'itemCount', header: CARD_SETTLEMENT_TEXT.itemsCount },
      {
        accessorKey: 'status',
        header: CARD_SETTLEMENT_TEXT.status,
        cell: ({ row }) =>
          CARD_SETTLEMENT_STATUS_OPTIONS.find(
            option => option.value === row.original.status
          )?.label ?? row.original.status,
      },
      {
        id: 'actions',
        header: CARD_SETTLEMENT_TEXT.actions,
        cell: ({ row }) => {
          const canEdit =
            row.original.status ===
            CardStockSettlementDocumentStatus.PENDING_HO_ACCEPTANCE;

          return (
            <div className={TABLE_ACTIONS_CELL_CLASSNAME}>
              <Button
                type="button"
                aria-label={
                  canEdit
                    ? CARD_SETTLEMENT_TEXT.editSettlement
                    : CARD_SETTLEMENT_TEXT.viewSettlement
                }
                variant="ghost"
                size="icon"
                className={TABLE_ACTION_BUTTON_CLASSNAME}
                onClick={event => {
                  event.stopPropagation();
                  navigate(`/card-settlement/edit/${row.original.id}`);
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
        label: CARD_SETTLEMENT_TEXT.search,
        placeholder: CARD_SETTLEMENT_TEXT.searchPlaceholder,
      }),
      buildStaticAsyncSelectToolbarFilter({
        id: 'status',
        label: CARD_SETTLEMENT_TEXT.status,
        options: statusOptions,
        value: selectedStatusOptions,
        isMulti: true,
        placeholder: CARD_SETTLEMENT_TEXT.statusPlaceholder,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {CARD_SETTLEMENT_TEXT.title}
          </h1>
          <p className="text-sm text-text-secondary">
            {CARD_SETTLEMENT_TEXT.description}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => navigate('/card-settlement/create')}
        >
          {CARD_SETTLEMENT_TEXT.newSettlement}
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
              : CARD_SETTLEMENT_TEXT.empty
          }
        />
      </section>
    </div>
  );
};

export default CardSettlementListView;
