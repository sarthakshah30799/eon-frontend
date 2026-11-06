import { useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { accountProfileApi, branchProfileApi } from '@/api';
import { PAGINATION_MAX_LIMIT } from '@/constants/paginationConstants';
import { useAuth } from '@/lib/AuthContext';
import {
  SUB_LEDGER_ALL,
  SUB_LEDGER_REPORT_TEXT,
  SubLedgerReportLayoutEnum,
  SubLedgerReportScopeEnum,
  SubLedgerReportViewEnum,
  type SubLedgerReportLayout,
  type SubLedgerReportScope,
  type SubLedgerReportView,
} from '../constants/subLedgerReportConstants';
import {
  ReportDatePresetEnum,
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

export interface SubLedgerReportFiltersState {
  dateRange: IReportDateRange;
  subLedgerId: string;
  branchIds: string[];
  accountIds: string[];
  passengerName: string;
  layout: SubLedgerReportLayout;
  scope: SubLedgerReportScope;
  view: SubLedgerReportView;
  branchOptions: IReportSelectOption[];
  accountOptions: IReportSelectOption[];
  subLedgerOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  accountAllSelected: boolean;
  isAccountsLoading: boolean;
  isAccountsFetchingMore: boolean;
  hasMoreAccounts: boolean;
  loadMoreAccounts: () => void;
  setDateRange: (value: IReportDateRange) => void;
  setSubLedgerId: (value: string) => void;
  setPassengerName: (value: string) => void;
  setLayout: (value: SubLedgerReportLayout) => void;
  setScope: (value: SubLedgerReportScope) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  toggleAccount: (id: string, checked: boolean) => void;
  toggleAllAccounts: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: (view?: SubLedgerReportView) => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    subLedgerId: string;
    branchIds: string[];
    accountIds: string[];
    passengerName: string;
    layout: SubLedgerReportLayout;
    scope: SubLedgerReportScope;
    view: SubLedgerReportView;
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
  layoutLabel: string;
  scopeLabel: string;
  subLedgerLabel: string;
}

const toOption = (id: string, label: string): IReportSelectOption => ({
  id,
  label,
});

const parseLayout = (value: string): SubLedgerReportLayout =>
  value === SubLedgerReportLayoutEnum.SUMMARY
    ? SubLedgerReportLayoutEnum.SUMMARY
    : SubLedgerReportLayoutEnum.DETAIL;

const parseScope = (value: string): SubLedgerReportScope =>
  value === SubLedgerReportScopeEnum.CONSOLIDATED
    ? SubLedgerReportScopeEnum.CONSOLIDATED
    : SubLedgerReportScopeEnum.BRANCH;

const parseView = (value: string): SubLedgerReportView =>
  value === SubLedgerReportViewEnum.COLUMNAR
    ? SubLedgerReportViewEnum.COLUMNAR
    : SubLedgerReportViewEnum.LEDGER;

const layoutLabel = (value: SubLedgerReportLayout) =>
  value === SubLedgerReportLayoutEnum.SUMMARY
    ? SUB_LEDGER_REPORT_TEXT.summary
    : SUB_LEDGER_REPORT_TEXT.detail;

const scopeLabel = (value: SubLedgerReportScope) =>
  value === SubLedgerReportScopeEnum.CONSOLIDATED
    ? SUB_LEDGER_REPORT_TEXT.consolidated
    : SUB_LEDGER_REPORT_TEXT.branchScope;

export const useSubLedgerReportFilters = (): SubLedgerReportFiltersState => {
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
      subLedgerId:
        readSearchParamValue(parsedSearchParams, 'subLedgerId') ||
        SUB_LEDGER_ALL,
      branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
      accountIds: readSearchParamList(parsedSearchParams, 'accountIds'),
      passengerName: readSearchParamValue(parsedSearchParams, 'passengerName'),
      layout: parseLayout(readSearchParamValue(parsedSearchParams, 'layout')),
      scope: parseScope(readSearchParamValue(parsedSearchParams, 'scope')),
      view: parseView(readSearchParamValue(parsedSearchParams, 'view')),
    };
  }, [parsedSearchParams]);

  const [dateRange, setDateRange] = useState(hydrated.dateRange);
  const [subLedgerId, setSubLedgerIdState] = useState(hydrated.subLedgerId);
  const [branchIds, setBranchIds] = useState(hydrated.branchIds);
  const [accountIds, setAccountIds] = useState(hydrated.accountIds);
  const [passengerName, setPassengerName] = useState(hydrated.passengerName);
  const [layout, setLayout] = useState(hydrated.layout);
  const [scope, setScope] = useState(hydrated.scope);
  const [view, setView] = useState(hydrated.view);
  const [appliedFilters, setAppliedFilters] = useState<
    SubLedgerReportFiltersState['appliedFilters']
  >(searchParamsKey ? hydrated : null);

  const { data: branchProfiles = [] } = useQuery({
    queryKey: ['reports-sub-ledger-branches'],
    queryFn: async () =>
      branchProfileApi.getAllBranchProfiles({ activeOnly: true }),
  });

  const accountsQuery = useInfiniteQuery({
    queryKey: ['reports-sub-ledger-accounts'],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      accountProfileApi.getAccountProfiles({
        active: true,
        offset: Number(pageParam) || 0,
        limit: PAGINATION_MAX_LIMIT,
      }),
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore
        ? (Number(lastPageParam) || 0) + lastPage.limit
        : undefined,
  });

  const allAccounts = useMemo(
    () => accountsQuery.data?.pages.flatMap(page => page.data ?? []) ?? [],
    [accountsQuery.data]
  );

  const subLedgerOptions = useMemo<IReportSelectOption[]>(() => {
    const options: IReportSelectOption[] = [];
    allAccounts.forEach(account => {
      if (!account.subLedger?.id) {
        return;
      }
      options.push(
        toOption(
          account.subLedger.id,
          account.subLedger.label ||
            account.subLedger.value ||
            account.subLedger.id
        )
      );
    });
    return uniqueOptions(options);
  }, [allAccounts]);

  const selectedSubLedgerId = subLedgerOptions.some(
    option => option.id === subLedgerId
  )
    ? subLedgerId
    : SUB_LEDGER_ALL;

  const filteredAccounts = useMemo(() => {
    if (!selectedSubLedgerId) {
      return allAccounts.filter(account => Boolean(account.subLedger?.id));
    }
    return allAccounts.filter(
      account => account.subLedger?.id === selectedSubLedgerId
    );
  }, [allAccounts, selectedSubLedgerId]);

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

  const accountOptions = useMemo<IReportSelectOption[]>(
    () =>
      uniqueOptions(
        filteredAccounts.map(account =>
          toOption(
            account.id,
            buildReportOptionLabel(account.accountCode, account.accountName)
          )
        )
      ),
    [filteredAccounts]
  );

  const selectedBranchIds = useMemo(
    () =>
      branchIds.filter(id => branchOptions.some(option => option.id === id)),
    [branchIds, branchOptions]
  );
  const selectedAccountIds = useMemo(
    () =>
      accountIds.filter(id => accountOptions.some(option => option.id === id)),
    [accountIds, accountOptions]
  );

  const setSubLedgerId = (value: string) => {
    setSubLedgerIdState(value);
    setAccountIds([]);
  };

  const resetFilters = () => {
    setDateRange(buildReportDateRange(ReportDatePresetEnum.CURRENT_MONTH));
    setSubLedgerIdState(SUB_LEDGER_ALL);
    setBranchIds([]);
    setAccountIds([]);
    setPassengerName('');
    setLayout(SubLedgerReportLayoutEnum.DETAIL);
    setScope(SubLedgerReportScopeEnum.BRANCH);
    setView(SubLedgerReportViewEnum.LEDGER);
    setAppliedFilters(null);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleView = (nextView: SubLedgerReportView = view) => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return;
    }
    const accessibleBranchIds = branchOptions.map(option => option.id);
    const effectiveBranchIds = isRestrictedUser
      ? selectedBranchIds.length
        ? selectedBranchIds
        : accessibleBranchIds
      : selectedBranchIds;
    const effectiveAccountIds = selectedAccountIds.length
      ? selectedAccountIds
      : accountOptions.map(option => option.id);
    const effectivePassengerName = passengerName.trim();
    setView(nextView);
    const nextApplied = {
      dateRange,
      subLedgerId: selectedSubLedgerId,
      branchIds: effectiveBranchIds,
      accountIds: effectiveAccountIds,
      passengerName: effectivePassengerName,
      layout,
      scope,
      view: nextView,
    };
    setAppliedFilters(nextApplied);
    setSearchParams(
      buildSearchParams(undefined, next => {
        setSearchParamValue(next, 'datePreset', dateRange.preset);
        setSearchParamValue(next, 'startDate', dateRange.startDate);
        setSearchParamValue(next, 'endDate', dateRange.endDate);
        setSearchParamValue(next, 'subLedgerId', selectedSubLedgerId);
        setSearchParamList(next, 'branchIds', effectiveBranchIds);
        setSearchParamList(next, 'accountIds', effectiveAccountIds);
        setSearchParamValue(next, 'passengerName', effectivePassengerName);
        setSearchParamValue(next, 'layout', layout);
        setSearchParamValue(next, 'scope', scope);
        setSearchParamValue(next, 'view', nextView);
      }),
      { replace: true }
    );
  };

  const resolvedSubLedgerLabel =
    subLedgerOptions.find(
      option =>
        option.id === (appliedFilters?.subLedgerId ?? selectedSubLedgerId)
    )?.label ?? SUB_LEDGER_REPORT_TEXT.allSubLedgers;

  return {
    dateRange,
    subLedgerId: selectedSubLedgerId,
    branchIds: selectedBranchIds,
    accountIds: selectedAccountIds,
    passengerName,
    layout,
    scope,
    view,
    branchOptions,
    accountOptions,
    subLedgerOptions,
    branchAllSelected:
      branchOptions.length > 0 &&
      selectedBranchIds.length === branchOptions.length,
    accountAllSelected:
      accountOptions.length > 0 &&
      selectedAccountIds.length === accountOptions.length,
    isAccountsLoading: accountsQuery.isLoading,
    isAccountsFetchingMore: accountsQuery.isFetchingNextPage,
    hasMoreAccounts: Boolean(accountsQuery.hasNextPage),
    loadMoreAccounts: () => {
      if (accountsQuery.hasNextPage && !accountsQuery.isFetchingNextPage) {
        void accountsQuery.fetchNextPage();
      }
    },
    setDateRange,
    setSubLedgerId,
    setPassengerName,
    setLayout,
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
    resetFilters,
    handleView,
    appliedFilters,
    appliedDateRangeLabel: appliedFilters
      ? formatReportDateRangeLabel(appliedFilters.dateRange)
      : '',
    canView: Boolean(dateRange.startDate && dateRange.endDate),
    layoutLabel: layoutLabel(appliedFilters?.layout ?? layout),
    scopeLabel: scopeLabel(appliedFilters?.scope ?? scope),
    subLedgerLabel: resolvedSubLedgerLabel,
  };
};
