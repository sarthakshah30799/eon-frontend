import { useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { accountProfileApi, branchProfileApi, counterProfileApi } from '@/api';
import { PAGINATION_MAX_LIMIT } from '@/constants/paginationConstants';
import { useAuth } from '@/lib/AuthContext';
import { AccountProfileLedgerLabelEnum } from '@/modules/accountProfile';
import {
  CASH_REPORT_TEXT,
  CashReportScopeEnum,
  type CashReportScope,
} from '../constants/cashReportConstants';
import {
  CashReportLayoutEnum,
  ReportDatePresetEnum,
  type CashReportLayout,
  type IReportDateRange,
  type IReportSelectOption,
} from '../types';
import {
  buildReportDateRange,
  buildReportOptionLabel,
  formatReportDateRangeLabel,
  toggleId,
  uniqueOptions,
} from '../utils';
import {
  buildSearchParams,
  readDateRangeSearchParams,
  readSearchParamList,
  readSearchParamValue,
  setSearchParamList,
  setSearchParamValue,
} from '../utils/reportSearchParams';

export interface CashReportFiltersState {
  dateRange: IReportDateRange;
  branchIds: string[];
  accountIds: string[];
  counterIds: string[];
  scope: CashReportScope;
  layout: CashReportLayout;
  branchOptions: IReportSelectOption[];
  accountOptions: IReportSelectOption[];
  counterOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  accountAllSelected: boolean;
  counterAllSelected: boolean;
  isAccountsLoading: boolean;
  isAccountsFetchingMore: boolean;
  hasMoreAccounts: boolean;
  loadMoreAccounts: () => void;
  setDateRange: (value: IReportDateRange) => void;
  setScope: (value: CashReportScope) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  toggleAccount: (id: string, checked: boolean) => void;
  toggleAllAccounts: (checked: boolean) => void;
  toggleCounter: (id: string, checked: boolean) => void;
  toggleAllCounters: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: (layout?: CashReportLayout) => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    branchIds: string[];
    accountIds: string[];
    counterIds: string[];
    scope: CashReportScope;
    layout: CashReportLayout;
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
  scopeLabel: string;
  layoutLabel: string;
}

const toOption = (id: string, label: string): IReportSelectOption => ({
  id,
  label,
});

const parseScope = (value: string): CashReportScope =>
  value === CashReportScopeEnum.CONSOLIDATED
    ? CashReportScopeEnum.CONSOLIDATED
    : CashReportScopeEnum.BRANCH;

const parseLayout = (value: string): CashReportLayout =>
  value === CashReportLayoutEnum.COLUMNAR
    ? CashReportLayoutEnum.COLUMNAR
    : CashReportLayoutEnum.LEDGER;

const scopeLabel = (value: CashReportScope) =>
  value === CashReportScopeEnum.CONSOLIDATED
    ? CASH_REPORT_TEXT.consolidated
    : CASH_REPORT_TEXT.branchScope;

const layoutLabel = (value: CashReportLayout) =>
  value === CashReportLayoutEnum.COLUMNAR
    ? CASH_REPORT_TEXT.layoutColumnar
    : CASH_REPORT_TEXT.layoutLedger;

export const useCashReportFilters = (): CashReportFiltersState => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isRestrictedUser = !user?.isAdmin && !user?.isHo && !user?.isHoStaff;
  const userAssignments = useMemo(
    () => user?.assignments ?? [],
    [user?.assignments]
  );
  const searchParamsKey = searchParams.toString();
  const parsedSearchParams = useMemo(
    () => new URLSearchParams(searchParamsKey),
    [searchParamsKey]
  );

  const hydrated = useMemo(() => {
    const dateRange = readDateRangeSearchParams(
      parsedSearchParams,
      ReportDatePresetEnum.CURRENT_MONTH
    );
    return {
      dateRange,
      branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
      accountIds: readSearchParamList(parsedSearchParams, 'accountIds'),
      counterIds: readSearchParamList(parsedSearchParams, 'counterIds'),
      scope: parseScope(readSearchParamValue(parsedSearchParams, 'scope')),
      layout: parseLayout(readSearchParamValue(parsedSearchParams, 'layout')),
    };
  }, [parsedSearchParams]);

  const [dateRange, setDateRange] = useState(hydrated.dateRange);
  const [branchIds, setBranchIds] = useState(hydrated.branchIds);
  const [accountIds, setAccountIds] = useState(hydrated.accountIds);
  const [counterIds, setCounterIds] = useState(hydrated.counterIds);
  const [scope, setScope] = useState(hydrated.scope);
  const [layout, setLayout] = useState(hydrated.layout);
  const [appliedFilters, setAppliedFilters] = useState<
    CashReportFiltersState['appliedFilters']
  >(searchParamsKey ? hydrated : null);

  const { data: branchProfiles = [] } = useQuery({
    queryKey: ['reports-cash-report-branches'],
    queryFn: async () =>
      branchProfileApi.getAllBranchProfiles({ activeOnly: true }),
  });
  const { data: counterProfiles = [] } = useQuery({
    queryKey: ['reports-cash-report-counters'],
    queryFn: async () =>
      counterProfileApi.getAllCounterProfiles({ activeOnly: true }),
  });

  const cashAccountsQuery = useInfiniteQuery({
    queryKey: [
      'reports-cash-report-accounts',
      AccountProfileLedgerLabelEnum.CashLedger,
    ],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      accountProfileApi.getAccountProfiles({
        active: true,
        accountType: AccountProfileLedgerLabelEnum.CashLedger,
        offset: Number(pageParam) || 0,
        limit: PAGINATION_MAX_LIMIT,
      }),
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore
        ? (Number(lastPageParam) || 0) + lastPage.limit
        : undefined,
  });

  const branchOptions = useMemo<IReportSelectOption[]>(() => {
    const accessible = isRestrictedUser
      ? branchProfiles.filter(branch =>
          userAssignments.some(assignment => assignment.branchId === branch.id)
        )
      : branchProfiles;
    return uniqueOptions(
      accessible.map(branch =>
        toOption(branch.id, buildReportOptionLabel(branch.code, branch.name))
      )
    );
  }, [branchProfiles, isRestrictedUser, userAssignments]);

  const selectedBranchIds = useMemo(
    () =>
      branchIds.filter(id => branchOptions.some(option => option.id === id)),
    [branchIds, branchOptions]
  );

  const activeBranchIds = useMemo(
    () =>
      selectedBranchIds.length > 0
        ? selectedBranchIds
        : branchOptions.map(option => option.id),
    [branchOptions, selectedBranchIds]
  );

  const accountOptions = useMemo(() => {
    const cashRows =
      cashAccountsQuery.data?.pages.flatMap(page => page.data ?? []) ?? [];
    return uniqueOptions(
      cashRows.map(account =>
        toOption(
          account.id,
          buildReportOptionLabel(account.accountCode, account.accountName)
        )
      )
    );
  }, [cashAccountsQuery.data]);

  const selectedAccountIds = useMemo(
    () =>
      accountIds.filter(id => accountOptions.some(option => option.id === id)),
    [accountIds, accountOptions]
  );

  const counterOptions = useMemo<IReportSelectOption[]>(() => {
    if (!activeBranchIds.length) {
      return [];
    }
    if (isRestrictedUser) {
      return uniqueOptions(
        userAssignments
          .filter(assignment => activeBranchIds.includes(assignment.branchId))
          .map(assignment =>
            toOption(
              assignment.counterId,
              assignment.counterName || assignment.counterId
            )
          )
          .filter(option => Boolean(option.id))
      );
    }
    const allowed = new Set(
      branchProfiles
        .filter(branch => activeBranchIds.includes(branch.id))
        .flatMap(branch => branch.connectCounterIds ?? [])
    );
    return uniqueOptions(
      counterProfiles
        .filter(counter => allowed.has(counter.id))
        .map(counter =>
          toOption(counter.id, `${counter.counterNo} - ${counter.name}`)
        )
    );
  }, [
    activeBranchIds,
    branchProfiles,
    counterProfiles,
    isRestrictedUser,
    userAssignments,
  ]);

  const selectedCounterIds = useMemo(
    () =>
      counterIds.filter(id => counterOptions.some(option => option.id === id)),
    [counterIds, counterOptions]
  );

  const resetFilters = () => {
    setDateRange(buildReportDateRange(ReportDatePresetEnum.CURRENT_MONTH));
    setBranchIds([]);
    setAccountIds([]);
    setCounterIds([]);
    setScope(CashReportScopeEnum.BRANCH);
    setLayout(CashReportLayoutEnum.LEDGER);
    setAppliedFilters(null);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleView = (
    nextLayout: CashReportLayout = layout
  ) => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return;
    }
    const resolvedDateRange =
      dateRange.preset === ReportDatePresetEnum.CUSTOM
        ? dateRange
        : buildReportDateRange(dateRange.preset);
    const accessibleBranchIds = branchOptions.map(option => option.id);
    const effectiveBranchIds = isRestrictedUser
      ? selectedBranchIds.length
        ? selectedBranchIds
        : accessibleBranchIds
      : selectedBranchIds;
    setLayout(nextLayout);
    const nextApplied = {
      dateRange: resolvedDateRange,
      branchIds: effectiveBranchIds,
      accountIds: selectedAccountIds,
      counterIds: selectedCounterIds,
      scope,
      layout: nextLayout,
    };
    setDateRange(resolvedDateRange);
    setAppliedFilters(nextApplied);
    setSearchParams(
      buildSearchParams(undefined, next => {
        setSearchParamValue(next, 'datePreset', resolvedDateRange.preset);
        setSearchParamValue(next, 'startDate', resolvedDateRange.startDate);
        setSearchParamValue(next, 'endDate', resolvedDateRange.endDate);
        setSearchParamList(next, 'branchIds', effectiveBranchIds);
        setSearchParamList(next, 'accountIds', selectedAccountIds);
        setSearchParamList(next, 'counterIds', selectedCounterIds);
        setSearchParamValue(next, 'scope', scope);
        setSearchParamValue(next, 'layout', nextLayout);
      }),
      { replace: true }
    );
  };

  return {
    dateRange,
    branchIds: selectedBranchIds,
    accountIds: selectedAccountIds,
    counterIds: selectedCounterIds,
    scope,
    layout,
    branchOptions,
    accountOptions,
    counterOptions,
    branchAllSelected:
      branchOptions.length > 0 &&
      selectedBranchIds.length === branchOptions.length,
    accountAllSelected:
      accountOptions.length > 0 &&
      selectedAccountIds.length === accountOptions.length,
    counterAllSelected:
      counterOptions.length > 0 &&
      selectedCounterIds.length === counterOptions.length,
    isAccountsLoading: cashAccountsQuery.isLoading,
    isAccountsFetchingMore: cashAccountsQuery.isFetchingNextPage,
    hasMoreAccounts: Boolean(cashAccountsQuery.hasNextPage),
    loadMoreAccounts: () => {
      if (cashAccountsQuery.hasNextPage) {
        void cashAccountsQuery.fetchNextPage();
      }
    },
    setDateRange,
    setScope,
    toggleBranch: (id, checked) => {
      setBranchIds(current => toggleId(current, id, checked));
    },
    toggleAllBranches: checked => {
      setBranchIds(checked ? branchOptions.map(option => option.id) : []);
    },
    toggleAccount: (id, checked) => {
      setAccountIds(current => toggleId(current, id, checked));
    },
    toggleAllAccounts: checked => {
      setAccountIds(checked ? accountOptions.map(option => option.id) : []);
    },
    toggleCounter: (id, checked) => {
      setCounterIds(current => toggleId(current, id, checked));
    },
    toggleAllCounters: checked => {
      setCounterIds(checked ? counterOptions.map(option => option.id) : []);
    },
    resetFilters,
    handleView,
    appliedFilters,
    appliedDateRangeLabel: appliedFilters
      ? formatReportDateRangeLabel(appliedFilters.dateRange)
      : '',
    canView: Boolean(dateRange.startDate && dateRange.endDate && user),
    scopeLabel: scopeLabel(appliedFilters?.scope ?? scope),
    layoutLabel: layoutLabel(appliedFilters?.layout ?? layout),
  };
};

export default useCashReportFilters;
