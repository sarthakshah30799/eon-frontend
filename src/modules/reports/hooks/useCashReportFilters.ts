import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { branchProfileApi } from '@/api';
import { useListAccountProfiles } from '@/modules/accountProfile/hooks';
import { AccountProfileLedgerLabelEnum } from '@/modules/accountProfile';
import {
  buildReportDateRange,
  formatReportDateRangeLabel,
  buildReportOptionLabel,
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
import {
  CashReportLayoutEnum,
  ReportDatePresetEnum,
  type CashReportLayout,
  type IReportDateRange,
  type IReportSelectOption,
} from '../types';

export interface CashReportFiltersState {
  dateRange: IReportDateRange;
  layout: CashReportLayout;
  branchIds: string[];
  accountIds: string[];
  branchOptions: IReportSelectOption[];
  accountOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  accountAllSelected: boolean;
  setDateRange: (value: IReportDateRange) => void;
  setLayout: (value: CashReportLayout) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  toggleAccount: (id: string, checked: boolean) => void;
  toggleAllAccounts: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    layout: CashReportLayout;
    branchIds: string[];
    accountIds: string[];
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
}

const toOption = (id: string, label: string): IReportSelectOption => ({
  id,
  label,
});

const isCashLedger = (account: {
  accountType?: { value?: string | null; label?: string | null } | null;
}) => {
  const tokens = [account.accountType?.value, account.accountType?.label].map(
    value =>
      String(value ?? '')
        .trim()
        .toUpperCase()
  );
  return tokens.includes(AccountProfileLedgerLabelEnum.CashLedger);
};

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

  const hydratedRouteState = useMemo(() => {
    const dateRange = readDateRangeSearchParams(
      parsedSearchParams,
      ReportDatePresetEnum.TODAY
    );
    const layoutValue = readSearchParamValue(parsedSearchParams, 'layout');
    const layout =
      layoutValue === CashReportLayoutEnum.CONSOLIDATED
        ? CashReportLayoutEnum.CONSOLIDATED
        : CashReportLayoutEnum.BRANCH_WISE;

    return {
      dateRange,
      layout,
      branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
      accountIds: readSearchParamList(parsedSearchParams, 'accountIds'),
    };
  }, [parsedSearchParams]);

  const [dateRange, setDateRange] = useState<IReportDateRange>(
    hydratedRouteState.dateRange
  );
  const [layout, setLayout] = useState<CashReportLayout>(
    hydratedRouteState.layout
  );
  const [branchIds, setBranchIds] = useState<string[]>(
    hydratedRouteState.branchIds
  );
  const [accountIds, setAccountIds] = useState<string[]>(
    hydratedRouteState.accountIds
  );
  const [appliedFilters, setAppliedFilters] = useState<{
    dateRange: IReportDateRange;
    layout: CashReportLayout;
    branchIds: string[];
    accountIds: string[];
  } | null>(
    searchParamsKey
      ? {
          dateRange: hydratedRouteState.dateRange,
          layout: hydratedRouteState.layout,
          branchIds: hydratedRouteState.branchIds,
          accountIds: hydratedRouteState.accountIds,
        }
      : null
  );

  const branchesQuery = useQuery({
    queryKey: ['cash-report-branches'],
    queryFn: () => branchProfileApi.getAllBranchProfiles({ activeOnly: true }),
  });
  const accountsQuery = useListAccountProfiles({ active: true, limit: 500 });

  const branchOptions = useMemo(() => {
    const rows = branchesQuery.data ?? [];
    const options = rows
      .filter(branch => {
        if (!isRestrictedUser) return true;
        return userAssignments.some(
          assignment => assignment.branchId === branch.id
        );
      })
      .map(branch =>
        toOption(branch.id, buildReportOptionLabel(branch.code, branch.name))
      );
    return uniqueOptions(options);
  }, [branchesQuery.data, isRestrictedUser, userAssignments]);

  const accountOptions = useMemo(() => {
    const rows = accountsQuery.data?.data ?? [];
    return uniqueOptions(
      rows
        .filter(isCashLedger)
        .map(account =>
          toOption(
            account.id,
            buildReportOptionLabel(account.accountCode, account.accountName)
          )
        )
    );
  }, [accountsQuery.data]);

  const branchAllSelected =
    branchOptions.length > 0 && branchIds.length === branchOptions.length;
  const accountAllSelected =
    accountOptions.length > 0 && accountIds.length === accountOptions.length;

  const syncSearchParams = (next: {
    dateRange: IReportDateRange;
    layout: CashReportLayout;
    branchIds: string[];
    accountIds: string[];
  }) => {
    const params = buildSearchParams();
    const range = buildReportDateRange(next.dateRange);
    setSearchParamValue(params, 'preset', next.dateRange.preset);
    setSearchParamValue(params, 'startDate', range.startDate);
    setSearchParamValue(params, 'endDate', range.endDate);
    setSearchParamValue(params, 'layout', next.layout);
    setSearchParamList(params, 'branchIds', next.branchIds);
    setSearchParamList(params, 'accountIds', next.accountIds);
    setSearchParams(params, { replace: true });
  };

  const canView = Boolean(dateRange.startDate && dateRange.endDate && user);

  return {
    dateRange,
    layout,
    branchIds,
    accountIds,
    branchOptions,
    accountOptions,
    branchAllSelected,
    accountAllSelected,
    setDateRange: value => {
      setDateRange(value);
    },
    setLayout: value => {
      setLayout(value);
    },
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
    resetFilters: () => {
      const nextDateRange = buildReportDateRange({
        preset: ReportDatePresetEnum.TODAY,
        startDate: '',
        endDate: '',
      });
      setDateRange(nextDateRange);
      setLayout(CashReportLayoutEnum.BRANCH_WISE);
      setBranchIds([]);
      setAccountIds([]);
      setAppliedFilters(null);
      syncSearchParams({
        dateRange: nextDateRange,
        layout: CashReportLayoutEnum.BRANCH_WISE,
        branchIds: [],
        accountIds: [],
      });
    },
    handleView: () => {
      const resolvedDateRange = buildReportDateRange(dateRange);
      const next = {
        dateRange: resolvedDateRange,
        layout,
        branchIds,
        accountIds,
      };
      setDateRange(resolvedDateRange);
      setAppliedFilters(next);
      syncSearchParams(next);
    },
    appliedFilters,
    appliedDateRangeLabel: formatReportDateRangeLabel(
      appliedFilters?.dateRange ?? dateRange
    ),
    canView,
  };
};

export default useCashReportFilters;
