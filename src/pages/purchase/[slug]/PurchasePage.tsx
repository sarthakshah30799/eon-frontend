import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, AsyncSelect, type AsyncSelectOption, type AsyncSelectResponse } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { FunnelIcon } from '@/assets/icons';
import { NotFoundState } from '@/components/ui/not-found-state';
import { PURCHASE_PAGE_STATUS_TEXT } from '@/modules/purchase/constants/purchaseConstants';
import { useAuth } from '@/lib/AuthContext';
import { transactionsApi } from '@/api/transactions';
import type { ITransactionEntity } from '@/modules/transactions';
import { TransactionStatusEnum, TradeModeEnum } from '@/modules/transactions';
import { AD1ListView } from '@/modules/purchase';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import { useListPartyProfiles } from '@/modules/partyProfiles/hooks';
import {
  TransactionListTable,
  type TransactionListRow,
} from '@/modules/transactions';
import { formatDateTime, formatReferenceLabel } from '@/utils';
import { useDebounce } from '@/hooks';
import {
  getPurchasePageBasePath,
  getPurchasePageTitle,
  getPurchasePageTypeFromPath,
  getPurchasePageSlugFromType,
  getPurchasePartyProfileTypes,
  type PurchasePageType,
} from './purchasePage.enum';

interface PurchasePageViewProps {
  purchasePageType: PurchasePageType | null;
}

const PurchasePageView = ({ purchasePageType }: PurchasePageViewProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const branchParam = searchParams.get('branchId') ?? '';
  const partyProfileParam = searchParams.get('partyProfileId') ?? searchParams.get('partyProfile') ?? '';
  const tradeModeParam = searchParams.get('tradeMode') ?? '';
  const statusParam = searchParams.get('status') ?? '';
  const canSeeBranchFilter = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);

  const { data: branches = [] } = useListBranchProfiles({ status: 'active' });
  const branchOptions = useMemo<AsyncSelectOption[]>(
    () =>
      branches.map(branch => ({
        value: branch.id,
        label: `${branch.code} - ${branch.name}`,
      })),
    [branches]
  );
  const selectedBranchOption = useMemo<AsyncSelectOption | null>(
    () => branchOptions.find(option => String(option.value) === branchParam) ?? null,
    [branchParam, branchOptions]
  );
  const loadBranchOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const q = inputValue.trim().toLowerCase();
      const filtered = q ? branchOptions.filter(o => o.label.toLowerCase().includes(q)) : branchOptions;
      return { options: filtered };
    },
    [branchOptions]
  );

  // Party profile options — different for every purchase/sell submenu, separate API per submenu
  const partyProfileTypes = useMemo(() => getPurchasePartyProfileTypes(purchasePageType), [purchasePageType]);
  const { data: partyResponse } = useListPartyProfiles(
    { limit: 100, search: undefined },
    partyProfileTypes,
    Boolean(purchasePageType),
    false
  );
  const partyProfiles = partyResponse?.data ?? [];
  const partyProfileOptions = useMemo<AsyncSelectOption[]>(() => {
    return partyProfiles
      .map(p => ({
        value: p.id,
        label: p.code ? `${p.code} - ${p.name}` : p.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [partyProfiles]);
  const selectedPartyProfileOption = useMemo<AsyncSelectOption | null>(
    () => partyProfileOptions.find(o => String(o.value) === partyProfileParam) ?? (partyProfileParam ? { value: partyProfileParam, label: partyProfileParam } as AsyncSelectOption : null),
    [partyProfileParam, partyProfileOptions]
  );
  const loadPartyProfileOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const q = inputValue.trim().toLowerCase();
      const filtered = q ? partyProfileOptions.filter(o => o.label.toLowerCase().includes(q)) : partyProfileOptions;
      return { options: filtered };
    },
    [partyProfileOptions]
  );

  const tradeModeOptions = useMemo<AsyncSelectOption[]>(
    () => [
      { value: TradeModeEnum.BULK, label: 'BULK' },
      { value: TradeModeEnum.RETAIL, label: 'RETAIL' },
    ],
    []
  );
  const selectedTradeModeOption = useMemo<AsyncSelectOption | null>(
    () => tradeModeOptions.find(o => o.value === tradeModeParam) ?? null,
    [tradeModeParam, tradeModeOptions]
  );
  const loadTradeModeOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const q = inputValue.trim().toLowerCase();
      const filtered = q ? tradeModeOptions.filter(o => o.label.toLowerCase().includes(q)) : tradeModeOptions;
      return { options: filtered };
    },
    [tradeModeOptions]
  );

  const statusOptions = useMemo<AsyncSelectOption[]>(
    () => [
      { value: TransactionStatusEnum.APPROVED, label: 'Approved' },
      { value: TransactionStatusEnum.REJECTED, label: 'Rejected' },
      { value: TransactionStatusEnum.PENDING, label: 'Pending' },
      { value: TransactionStatusEnum.DRAFT, label: 'Draft' },
    ],
    []
  );
  const selectedStatusOption = useMemo<AsyncSelectOption | null>(
    () => statusOptions.find(o => o.value.toLowerCase() === statusParam.toLowerCase()) ?? null,
    [statusParam, statusOptions]
  );
  const loadStatusOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const q = inputValue.trim().toLowerCase();
      const filtered = q ? statusOptions.filter(o => o.label.toLowerCase().includes(q)) : statusOptions;
      return { options: filtered };
    },
    [statusOptions]
  );

  const selectedSlug = useMemo(
    () => getPurchasePageSlugFromType(purchasePageType) ?? routeSlug ?? '',
    [purchasePageType, routeSlug]
  );
  const basePath = useMemo(
    () => getPurchasePageBasePath(purchasePageType),
    [purchasePageType]
  );

  const canCreate = Boolean(user);

  const {
    data: transactions = [],
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['transactions', purchasePageType, selectedSlug, debouncedSearch, branchParam, partyProfileParam, tradeModeParam, statusParam],
    queryFn: () =>
      transactionsApi.getTransactions({
        slug: purchasePageType ?? undefined,
        search: debouncedSearch.trim() || undefined,
        branchId: branchParam || undefined,
        partyProfileId: partyProfileParam || undefined,
        tradeMode: tradeModeParam || undefined,
        status: (statusParam.toUpperCase() as typeof TransactionStatusEnum[keyof typeof TransactionStatusEnum]) || undefined,
      }),
    enabled: Boolean(purchasePageType),
  });

  useEffect(() => {
    const resolvedType = getPurchasePageTypeFromPath(location.pathname, routeSlug);
    if (!resolvedType || resolvedType === purchasePageType) {
      return;
    }

    navigate(`/${getPurchasePageBasePath(resolvedType)}/${routeSlug}`, {
      replace: true,
    });
  }, [location.pathname, navigate, purchasePageType, routeSlug]);

  const rows = useMemo<TransactionListRow[]>(
    () =>
      (transactions as ITransactionEntity[]).map(transaction => ({
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

  useEffect(() => {
    if (!routeSlug && selectedSlug) {
      navigate(`/${basePath}/${selectedSlug}`, { replace: true });
    }
  }, [basePath, navigate, routeSlug, selectedSlug]);

  const hasActiveFilters = Boolean(search || branchParam || partyProfileParam || tradeModeParam || statusParam);

  const handleReset = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('search');
      next.delete('branchId');
      next.delete('partyProfileId');
      next.delete('partyProfile');
      next.delete('tradeMode');
      next.delete('status');
      return next;
    });
  }, [setSearchParams]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (value.trim()) next.set('search', value.trim());
        else next.delete('search');
        return next;
      });
    },
    [setSearchParams]
  );

  if (!purchasePageType) {
    return (
      <NotFoundState message={PURCHASE_PAGE_STATUS_TEXT.transactionPageNotFound} />
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
            Browse transactions for the selected slug, then create or edit records from here.
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

      {/* Filter bar — same design as Branch/Currency (FunnelIcon + search + party/tradeMode/status + Reset), route-based */}
      <div className="flex flex-nowrap items-center gap-3 overflow-x-auto rounded-sm border border-slate-200 bg-white px-3 py-3 shadow-sm">
        <FunnelIcon className="shrink-0 text-slate-500" width={15} height={15} />

        <div className="shrink-0 w-[220px]">
          <Input
            placeholder="Search transaction number"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>

        {canSeeBranchFilter && (
          <div className="shrink-0 w-44">
            <AsyncSelect
              placeholder="All Branches"
              value={selectedBranchOption}
              loadOptions={loadBranchOptions}
              defaultOptions={branchOptions}
              isClearable
              onChange={option => {
                const opt = Array.isArray(option) ? (option[0] ?? null) : option;
                setSearchParams(prev => {
                  const next = new URLSearchParams(prev);
                  if (opt?.value) next.set('branchId', String(opt.value));
                  else next.delete('branchId');
                  return next;
                });
              }}
            />
          </div>
        )}

        <div className="shrink-0 w-48">
          <AsyncSelect
            placeholder="All Party Profiles"
            value={selectedPartyProfileOption}
            loadOptions={loadPartyProfileOptions}
            defaultOptions={partyProfileOptions}
            onChange={option => {
              const opt = Array.isArray(option) ? (option[0] ?? null) : option;
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                if (opt?.value) next.set('partyProfileId', String(opt.value));
                else {
                  next.delete('partyProfileId');
                  next.delete('partyProfile');
                }
                return next;
              });
            }}
            isClearable
            isSearchable
            pagination={false}
          />
        </div>

        <div className="shrink-0 w-44">
          <AsyncSelect
            placeholder="All Trade Modes"
            value={selectedTradeModeOption}
            loadOptions={loadTradeModeOptions}
            defaultOptions={tradeModeOptions}
            onChange={option => {
              const opt = Array.isArray(option) ? (option[0] ?? null) : option;
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                if (opt?.value) next.set('tradeMode', String(opt.value));
                else next.delete('tradeMode');
                return next;
              });
            }}
            isClearable
            isSearchable
            pagination={false}
          />
        </div>

        <div className="shrink-0 w-36">
          <AsyncSelect
            placeholder="All Statuses"
            value={selectedStatusOption}
            loadOptions={loadStatusOptions}
            defaultOptions={statusOptions}
            onChange={option => {
              const opt = Array.isArray(option) ? (option[0] ?? null) : option;
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                if (opt?.value) next.set('status', String(opt.value).toUpperCase());
                else next.delete('status');
                return next;
              });
            }}
            isClearable
            isSearchable
            pagination={false}
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <span className="text-base leading-none">×</span> Reset
          </button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <TransactionListTable
          rows={rows}
          loading={isLoading || isFetching}
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
    return (
      <NotFoundState message={PURCHASE_PAGE_STATUS_TEXT.pageNotFound} />
    );
  }

  return <PurchasePageView purchasePageType={purchasePageType} />;
};

export default PurchasePage;
