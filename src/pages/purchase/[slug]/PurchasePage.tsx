import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { Button, type AsyncSelectOption } from '@/components/ui';
import {
  buildBranchToolbarFilter,
  buildSearchToolbarFilter,
} from '@/components/ui/table';
import { NotFoundState } from '@/components/ui/not-found-state';
import { PURCHASE_PAGE_STATUS_TEXT } from '@/modules/purchase/constants/purchaseConstants';
import { useAuth } from '@/lib/AuthContext';
import { useDebounce, useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { transactionsApi } from '@/api/transactions';
import { AD1ListView } from '@/modules/purchase';
import { useLoadBranchOptions } from '@/modules/branchProfile/hooks';
import {
  TransactionListTable,
  type TransactionListRow,
} from '@/modules/transactions';
import { formatDateTime, formatReferenceLabel } from '@/utils';
import {
  getPurchasePageBasePath,
  getPurchasePageTitle,
  getPurchasePageTypeFromPath,
  getPurchasePageSlugFromType,
  type PurchasePageType,
} from './purchasePage.enum';

interface PurchasePageViewProps {
  purchasePageType: PurchasePageType | null;
}

const PurchasePageView = ({ purchasePageType }: PurchasePageViewProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const { user } = useAuth();
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const [branchFilter, setBranchFilter] = useState('');
  const canSeeBranchFilter = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );

  const loadBranchOptions = useLoadBranchOptions({ activeOnly: true });
  const [selectedBranchOption, setSelectedBranchOption] =
    useState<AsyncSelectOption | null>(null);

  const selectedSlug = useMemo(
    () => getPurchasePageSlugFromType(purchasePageType) ?? routeSlug ?? '',
    [purchasePageType, routeSlug]
  );
  const basePath = useMemo(
    () => getPurchasePageBasePath(purchasePageType),
    [purchasePageType]
  );

  const canCreate = Boolean(user);

  const filters = useMemo(
    () => ({
      slug: purchasePageType ?? undefined,
      search: debouncedSearch.trim() || undefined,
      branchId: branchFilter || undefined,
    }),
    [branchFilter, debouncedSearch, purchasePageType]
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
    queryKey: ['transactions', purchasePageType, selectedSlug],
    queryFn: params => transactionsApi.getTransactions(params),
    filters,
    enabled: Boolean(purchasePageType),
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

  const rows = useMemo<TransactionListRow[]>(
    () =>
      transactions.map(transaction => ({
        id: transaction.id,
        number: transaction.number ?? '-',
        branch: formatReferenceLabel(transaction.branchSnapshot),
        partyProfile: formatReferenceLabel(transaction.partyProfileSnapshot),
        transactionType: transaction.transactionType,
        tradeMode: transaction.tradeMode,
        status: transaction.status,
        createdAt: formatDateTime(transaction.createdAt),
      })),
    [transactions]
  );

  const toolbarFilters = useMemo(
    () => [
      buildSearchToolbarFilter({
        value: search,
        onChange: handleSearch,
        placeholder: 'Search transaction number',
      }),
      buildBranchToolbarFilter({
        visible: canSeeBranchFilter,
        value: selectedBranchOption,
        loadOptions: loadBranchOptions,
        onChange: option => {
          setSelectedBranchOption(option);
          setBranchFilter(option?.value ? String(option.value) : '');
          resetOffset();
        },
      }),
    ],
    [
      canSeeBranchFilter,
      handleSearch,
      loadBranchOptions,
      resetOffset,
      search,
      selectedBranchOption,
    ]
  );

  useEffect(() => {
    const resolvedType = getPurchasePageTypeFromPath(
      location.pathname,
      routeSlug
    );
    if (!resolvedType || resolvedType === purchasePageType) {
      return;
    }

    navigate(`/${getPurchasePageBasePath(resolvedType)}/${routeSlug}`, {
      replace: true,
    });
  }, [location.pathname, navigate, purchasePageType, routeSlug]);

  useEffect(() => {
    if (!routeSlug && selectedSlug) {
      navigate(`/${basePath}/${selectedSlug}`, { replace: true });
    }
  }, [basePath, navigate, routeSlug, selectedSlug]);

  if (!purchasePageType) {
    return (
      <NotFoundState
        message={PURCHASE_PAGE_STATUS_TEXT.transactionPageNotFound}
      />
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-error-600">
        Failed to load transactions. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-text-primary">
            {getPurchasePageTitle(purchasePageType)}
          </h1>
          <p className="text-sm text-text-secondary">
            Browse transactions for the selected slug, then create or edit
            records from here.
          </p>
        </div>

        {canCreate ? (
          <Button
            type="button"
            className="rounded-sm"
            onClick={() => navigate(`/${basePath}/${routeSlug}/create`)}
          >
            Create Transaction
          </Button>
        ) : null}
      </div>

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
          onRowClick={row =>
            navigate({
              pathname: `/${basePath}/${routeSlug}/edit/${row.id}`,
            })
          }
          onActionClick={row =>
            navigate({
              pathname: `/${basePath}/${routeSlug}/edit/${row.id}`,
            })
          }
          actionLabel={canCreate ? 'Edit transaction' : 'View transaction'}
          actionMode={canCreate ? 'edit' : 'view'}
          emptyMessage="No transactions found."
        />
      </section>
    </div>
  );
};

const PurchasePage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const purchasePageType = getPurchasePageTypeFromPath(location.pathname, slug);

  if (slug === 'ad1') {
    return <AD1ListView />;
  }

  if (!purchasePageType) {
    return <NotFoundState message={PURCHASE_PAGE_STATUS_TEXT.pageNotFound} />;
  }

  return <PurchasePageView purchasePageType={purchasePageType} />;
};

export default PurchasePage;
