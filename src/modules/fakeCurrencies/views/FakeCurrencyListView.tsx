import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, type AsyncSelectOption } from '@/components/ui';
import {
  buildBranchToolbarFilter,
  buildSearchToolbarFilter,
} from '@/components/ui/table';
import { useAuth } from '@/lib/AuthContext';
import { useDebounce, useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { transactionsApi } from '@/api/transactions';
import { useLoadBranchOptions } from '@/modules/branchProfile/hooks';
import {
  TransactionListTable,
  type TransactionListRow,
} from '@/modules/transactions';
import { formatDateTime, formatReferenceLabel } from '@/utils';

export const FakeCurrencyListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, activeBranchId } = useAuth();
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const [branchId, setBranchId] = useState('');
  const canChooseBranch = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );
  const effectiveBranchId = canChooseBranch ? branchId : (activeBranchId ?? '');
  const loadBranchOptions = useLoadBranchOptions({ activeOnly: true });
  const [selectedBranch, setSelectedBranch] =
    useState<AsyncSelectOption | null>(null);

  const filters = useMemo(
    () => ({
      slug: 'FAKE_CURRENCY' as const,
      search: debouncedSearch.trim() || undefined,
      branchId: effectiveBranchId || undefined,
    }),
    [debouncedSearch, effectiveBranchId]
  );

  const {
    rows: transactions,
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
    queryKey: ['fake-currencies'],
    queryFn: params => transactionsApi.getTransactions(params),
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

  const handleSearch = useCallback(
    (value: string) => {
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
    },
    [setSearchParams]
  );

  const toolbarFilters = useMemo(
    () => [
      buildSearchToolbarFilter({
        value: search,
        onChange: handleSearch,
        placeholder: 'Search transaction number',
      }),
      buildBranchToolbarFilter({
        visible: canChooseBranch,
        value: selectedBranch,
        loadOptions: loadBranchOptions,
        onChange: option => {
          setSelectedBranch(option);
          setBranchId(option?.value ? String(option.value) : '');
          resetOffset();
        },
      }),
    ],
    [
      canChooseBranch,
      handleSearch,
      loadBranchOptions,
      resetOffset,
      search,
      selectedBranch,
    ]
  );

  const rows = useMemo<TransactionListRow[]>(
    () =>
      transactions.map(transaction => ({
        id: transaction.id,
        number: transaction.number ?? '-',
        branch: formatReferenceLabel(transaction.branchSnapshot),
        partyProfile:
          formatReferenceLabel(transaction.reasonSnapshot) || 'Fake Currency',
        transactionType: transaction.transactionType,
        tradeMode: transaction.tradeMode,
        status: transaction.status,
        createdAt: formatDateTime(transaction.createdAt),
      })),
    [transactions]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Fake Currencies
          </h1>
          <p className="text-sm text-text-secondary">
            View fake-currency stock removal transactions.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => navigate('/fake-currencies/create')}
        >
          Create Fake Currency
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-error-600">
          Failed to load fake-currency transactions.
        </p>
      ) : null}
      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <TransactionListTable
          rows={rows}
          loading={isLoading}
          isFetching={isFetching}
          toolbarFilters={toolbarFilters}
          manualPagination
          page={page}
          pageSize={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onRowClick={row => navigate(`/fake-currencies/edit/${row.id}`)}
          onActionClick={row => navigate(`/fake-currencies/edit/${row.id}`)}
          actionLabel="View fake currency transaction"
          actionMode="view"
          emptyMessage="No fake-currency transactions found."
        />
      </section>
    </div>
  );
};

export default FakeCurrencyListView;
