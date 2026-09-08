import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useCategoryOptions } from '@/hooks';
import { branchProfileApi } from '@/api';
import { useListAccountProfiles } from '@/modules/accountProfile/hooks';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
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
  GenerateLedgerLayoutEnum,
  ReportDatePresetEnum,
  type GenerateLedgerLayout,
  type IReportDateRange,
  type IReportSelectOption,
} from '../types';

export interface GenerateLedgerFiltersState {
  dateRange: IReportDateRange;
  layout: GenerateLedgerLayout;
  branchIds: string[];
  accountTypeIds: string[];
  accountIds: string[];
  branchOptions: IReportSelectOption[];
  accountTypeOptions: IReportSelectOption[];
  accountOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  accountTypeAllSelected: boolean;
  accountAllSelected: boolean;
  setDateRange: (value: IReportDateRange) => void;
  setLayout: (value: GenerateLedgerLayout) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  toggleAccountType: (id: string, checked: boolean) => void;
  toggleAllAccountTypes: (checked: boolean) => void;
  toggleAccount: (id: string, checked: boolean) => void;
  toggleAllAccounts: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    layout: GenerateLedgerLayout;
    branchIds: string[];
    accountTypeIds: string[];
    accountIds: string[];
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
}

const toOption = (id: string, label: string): IReportSelectOption => ({
  id,
  label,
});

export const useGenerateLedgerFilters = (): GenerateLedgerFiltersState => {
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
      layoutValue === GenerateLedgerLayoutEnum.CONSOLIDATED
        ? GenerateLedgerLayoutEnum.CONSOLIDATED
        : GenerateLedgerLayoutEnum.BRANCH_WISE;

    return {
      dateRange,
      layout,
      branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
      accountTypeIds: readSearchParamList(parsedSearchParams, 'accountTypeIds'),
      accountIds: readSearchParamList(parsedSearchParams, 'accountIds'),
    };
  }, [parsedSearchParams]);

  const [dateRange, setDateRange] = useState<IReportDateRange>(
    hydratedRouteState.dateRange
  );
  const [layout, setLayout] = useState<GenerateLedgerLayout>(
    hydratedRouteState.layout
  );
  const [branchIds, setBranchIds] = useState<string[]>(
    hydratedRouteState.branchIds
  );
  const [accountTypeIds, setAccountTypeIds] = useState<string[]>(
    hydratedRouteState.accountTypeIds
  );
  const [accountIds, setAccountIds] = useState<string[]>(
    hydratedRouteState.accountIds
  );
  const [appliedFilters, setAppliedFilters] = useState<{
    dateRange: IReportDateRange;
    layout: GenerateLedgerLayout;
    branchIds: string[];
    accountTypeIds: string[];
    accountIds: string[];
  } | null>(
    searchParamsKey
      ? {
          dateRange: hydratedRouteState.dateRange,
          layout: hydratedRouteState.layout,
          branchIds: hydratedRouteState.branchIds,
          accountTypeIds: hydratedRouteState.accountTypeIds,
          accountIds: hydratedRouteState.accountIds,
        }
      : null
  );

  const branchesQuery = useQuery({
    queryKey: ['generate-ledger-branches'],
    queryFn: () => branchProfileApi.getAllBranchProfiles({ activeOnly: true }),
  });
  const accountsQuery = useListAccountProfiles({ active: true, limit: 500 });
  const accountTypeCategory = useCategoryOptions(
    CategoryOptionCodeEnum.AccountType
  );

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

  const accountTypeOptions = useMemo(
    () =>
      uniqueOptions(
        (accountTypeCategory.defaultOptions ?? []).map(option =>
          toOption(String(option.value), option.label)
        )
      ),
    [accountTypeCategory.defaultOptions]
  );

  const accountOptions = useMemo(() => {
    const rows = accountsQuery.data?.data ?? [];
    const selectedTypeSet = new Set(accountTypeIds);
    return uniqueOptions(
      rows
        .filter(account => {
          if (!accountTypeIds.length) return true;
          return selectedTypeSet.has(account.accountType?.id ?? '');
        })
        .map(account =>
          toOption(
            account.id,
            buildReportOptionLabel(account.accountCode, account.accountName)
          )
        )
    );
  }, [accountTypeIds, accountsQuery.data]);

  const selectedAccountIds = useMemo(() => {
    const allowed = new Set(accountOptions.map(option => option.id));
    return accountIds.filter(id => allowed.has(id));
  }, [accountIds, accountOptions]);

  const branchAllSelected =
    branchOptions.length > 0 && branchIds.length === branchOptions.length;
  const accountTypeAllSelected =
    accountTypeOptions.length > 0 &&
    accountTypeIds.length === accountTypeOptions.length;
  const accountAllSelected =
    accountOptions.length > 0 &&
    selectedAccountIds.length === accountOptions.length;

  const syncSearchParams = (next: {
    dateRange: IReportDateRange;
    layout: GenerateLedgerLayout;
    branchIds: string[];
    accountTypeIds: string[];
    accountIds: string[];
  }) => {
    const params = buildSearchParams();
    setSearchParamValue(params, 'preset', next.dateRange.preset);
    setSearchParamValue(params, 'startDate', next.dateRange.startDate);
    setSearchParamValue(params, 'endDate', next.dateRange.endDate);
    setSearchParamValue(params, 'layout', next.layout);
    setSearchParamList(params, 'branchIds', next.branchIds);
    setSearchParamList(params, 'accountTypeIds', next.accountTypeIds);
    setSearchParamList(params, 'accountIds', next.accountIds);
    setSearchParams(params, { replace: true });
  };

  const canView = Boolean(dateRange.startDate && dateRange.endDate && user);

  return {
    dateRange,
    layout,
    branchIds,
    accountTypeIds,
    accountIds: selectedAccountIds,
    branchOptions,
    accountTypeOptions,
    accountOptions,
    branchAllSelected,
    accountTypeAllSelected,
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
    toggleAccountType: (id, checked) => {
      setAccountTypeIds(current => toggleId(current, id, checked));
    },
    toggleAllAccountTypes: checked => {
      setAccountTypeIds(
        checked ? accountTypeOptions.map(option => option.id) : []
      );
    },
    toggleAccount: (id, checked) => {
      setAccountIds(current => toggleId(current, id, checked));
    },
    toggleAllAccounts: checked => {
      setAccountIds(checked ? accountOptions.map(option => option.id) : []);
    },
    resetFilters: () => {
      const nextDateRange = buildReportDateRange(ReportDatePresetEnum.TODAY);
      setDateRange(nextDateRange);
      setLayout(GenerateLedgerLayoutEnum.BRANCH_WISE);
      setBranchIds([]);
      setAccountTypeIds([]);
      setAccountIds([]);
      setAppliedFilters(null);
      syncSearchParams({
        dateRange: nextDateRange,
        layout: GenerateLedgerLayoutEnum.BRANCH_WISE,
        branchIds: [],
        accountTypeIds: [],
        accountIds: [],
      });
    },
    handleView: () => {
      const resolvedDateRange =
        dateRange.preset === ReportDatePresetEnum.CUSTOM
          ? dateRange
          : buildReportDateRange(dateRange.preset);
      const next = {
        dateRange: resolvedDateRange,
        layout,
        branchIds,
        accountTypeIds,
        accountIds: selectedAccountIds,
      };
      setDateRange(resolvedDateRange);
      setAccountIds(selectedAccountIds);
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

export default useGenerateLedgerFilters;
