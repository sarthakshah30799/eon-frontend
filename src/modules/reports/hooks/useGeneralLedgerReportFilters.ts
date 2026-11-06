import { useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  accountProfileApi,
  branchProfileApi,
  financialCodesApi,
} from '@/api';
import { PAGINATION_MAX_LIMIT } from '@/constants/paginationConstants';
import { useAuth } from '@/lib/AuthContext';
import {
  GENERAL_LEDGER_ALL_FINANCIAL_TYPE,
  GENERAL_LEDGER_REPORT_TEXT,
  GeneralLedgerReportLayoutEnum,
  GeneralLedgerReportScopeEnum,
  GeneralLedgerReportViewEnum,
  type GeneralLedgerReportLayout,
  type GeneralLedgerReportScope,
  type GeneralLedgerReportView,
} from '../constants/generalLedgerReportConstants';
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

export interface GeneralLedgerReportFiltersState {
  dateRange: IReportDateRange;
  financialTypeId: string;
  branchIds: string[];
  accountIds: string[];
  layout: GeneralLedgerReportLayout;
  scope: GeneralLedgerReportScope;
  view: GeneralLedgerReportView;
  branchOptions: IReportSelectOption[];
  accountOptions: IReportSelectOption[];
  financialTypeOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  accountAllSelected: boolean;
  isAccountsLoading: boolean;
  isAccountsFetchingMore: boolean;
  hasMoreAccounts: boolean;
  loadMoreAccounts: () => void;
  setDateRange: (value: IReportDateRange) => void;
  setFinancialTypeId: (value: string) => void;
  setLayout: (value: GeneralLedgerReportLayout) => void;
  setScope: (value: GeneralLedgerReportScope) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  toggleAccount: (id: string, checked: boolean) => void;
  toggleAllAccounts: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: (view?: GeneralLedgerReportView) => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    financialTypeId: string;
    branchIds: string[];
    accountIds: string[];
    layout: GeneralLedgerReportLayout;
    scope: GeneralLedgerReportScope;
    view: GeneralLedgerReportView;
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
  layoutLabel: string;
  scopeLabel: string;
  financialTypeLabel: string;
}

const toOption = (id: string, label: string): IReportSelectOption => ({
  id,
  label,
});

const parseLayout = (value: string): GeneralLedgerReportLayout =>
  value === GeneralLedgerReportLayoutEnum.SUMMARY
    ? GeneralLedgerReportLayoutEnum.SUMMARY
    : GeneralLedgerReportLayoutEnum.DETAIL;

const parseScope = (value: string): GeneralLedgerReportScope =>
  value === GeneralLedgerReportScopeEnum.CONSOLIDATED
    ? GeneralLedgerReportScopeEnum.CONSOLIDATED
    : GeneralLedgerReportScopeEnum.BRANCH;

const parseView = (value: string): GeneralLedgerReportView =>
  value === GeneralLedgerReportViewEnum.COLUMNAR
    ? GeneralLedgerReportViewEnum.COLUMNAR
    : GeneralLedgerReportViewEnum.LEDGER;

const layoutLabel = (value: GeneralLedgerReportLayout) =>
  value === GeneralLedgerReportLayoutEnum.SUMMARY
    ? GENERAL_LEDGER_REPORT_TEXT.summary
    : GENERAL_LEDGER_REPORT_TEXT.detail;

const scopeLabel = (value: GeneralLedgerReportScope) =>
  value === GeneralLedgerReportScopeEnum.CONSOLIDATED
    ? GENERAL_LEDGER_REPORT_TEXT.consolidated
    : GENERAL_LEDGER_REPORT_TEXT.branchScope;

export const useGeneralLedgerReportFilters =
  (): GeneralLedgerReportFiltersState => {
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
        financialTypeId:
          readSearchParamValue(parsedSearchParams, 'financialTypeId') ||
          GENERAL_LEDGER_ALL_FINANCIAL_TYPE,
        branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
        accountIds: readSearchParamList(parsedSearchParams, 'accountIds'),
        layout: parseLayout(readSearchParamValue(parsedSearchParams, 'layout')),
        scope: parseScope(readSearchParamValue(parsedSearchParams, 'scope')),
        view: parseView(readSearchParamValue(parsedSearchParams, 'view')),
      };
    }, [parsedSearchParams]);

    const [dateRange, setDateRange] = useState(hydrated.dateRange);
    const [financialTypeId, setFinancialTypeIdState] = useState(
      hydrated.financialTypeId
    );
    const [branchIds, setBranchIds] = useState(hydrated.branchIds);
    const [accountIds, setAccountIds] = useState(hydrated.accountIds);
    const [layout, setLayout] = useState(hydrated.layout);
    const [scope, setScope] = useState(hydrated.scope);
    const [view, setView] = useState(hydrated.view);
    const [appliedFilters, setAppliedFilters] = useState<
      GeneralLedgerReportFiltersState['appliedFilters']
    >(searchParamsKey ? hydrated : null);

    const { data: branchProfiles = [] } = useQuery({
      queryKey: ['reports-general-ledger-branches'],
      queryFn: async () =>
        branchProfileApi.getAllBranchProfiles({ activeOnly: true }),
    });

    const { data: financialCodes = [] } = useQuery({
      queryKey: ['reports-general-ledger-financial-codes'],
      queryFn: async () => financialCodesApi.getAllFinancialCodes(),
    });

    const accountsQuery = useInfiniteQuery({
      queryKey: ['reports-general-ledger-accounts'],
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

    const financialTypeIdByCodeId = useMemo(() => {
      const map = new Map<string, string>();
      financialCodes.forEach(code => {
        if (code.financialType?.id) {
          map.set(code.id, code.financialType.id);
        }
      });
      return map;
    }, [financialCodes]);

    const allAccounts = useMemo(
      () => accountsQuery.data?.pages.flatMap(page => page.data ?? []) ?? [],
      [accountsQuery.data]
    );

    const usedFinancialTypeIds = useMemo(() => {
      const ids = new Set<string>();
      allAccounts.forEach(account => {
        const typeId = financialTypeIdByCodeId.get(account.financialCodeId);
        if (typeId) {
          ids.add(typeId);
        }
      });
      return ids;
    }, [allAccounts, financialTypeIdByCodeId]);

    const financialTypeOptions = useMemo<IReportSelectOption[]>(
      () =>
        uniqueOptions(
          financialCodes
            .filter(
              code =>
                code.financialType?.id &&
                usedFinancialTypeIds.has(code.financialType.id)
            )
            .map(code =>
              toOption(
                code.financialType!.id,
                code.financialType!.label ||
                  code.financialType!.value ||
                  code.financialType!.id
              )
            )
        ),
      [financialCodes, usedFinancialTypeIds]
    );

    const selectedFinancialTypeId = financialTypeOptions.some(
      option => option.id === financialTypeId
    )
      ? financialTypeId
      : GENERAL_LEDGER_ALL_FINANCIAL_TYPE;

    const filteredAccounts = useMemo(() => {
      if (!selectedFinancialTypeId) {
        return allAccounts;
      }
      return allAccounts.filter(
        account =>
          financialTypeIdByCodeId.get(account.financialCodeId) ===
          selectedFinancialTypeId
      );
    }, [allAccounts, financialTypeIdByCodeId, selectedFinancialTypeId]);

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
        accountIds.filter(id =>
          accountOptions.some(option => option.id === id)
        ),
      [accountIds, accountOptions]
    );

    const setFinancialTypeId = (value: string) => {
      setFinancialTypeIdState(value);
      setAccountIds([]);
    };

    const resetFilters = () => {
      setDateRange(buildReportDateRange(ReportDatePresetEnum.CURRENT_MONTH));
      setFinancialTypeIdState(GENERAL_LEDGER_ALL_FINANCIAL_TYPE);
      setBranchIds([]);
      setAccountIds([]);
      setLayout(GeneralLedgerReportLayoutEnum.DETAIL);
      setScope(GeneralLedgerReportScopeEnum.BRANCH);
      setView(GeneralLedgerReportViewEnum.LEDGER);
      setAppliedFilters(null);
      setSearchParams(new URLSearchParams(), { replace: true });
    };

    const handleView = (nextView: GeneralLedgerReportView = view) => {
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
      setView(nextView);
      const nextApplied = {
        dateRange,
        financialTypeId: selectedFinancialTypeId,
        branchIds: effectiveBranchIds,
        accountIds: effectiveAccountIds,
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
          setSearchParamValue(next, 'financialTypeId', selectedFinancialTypeId);
          setSearchParamList(next, 'branchIds', effectiveBranchIds);
          setSearchParamList(next, 'accountIds', effectiveAccountIds);
          setSearchParamValue(next, 'layout', layout);
          setSearchParamValue(next, 'scope', scope);
          setSearchParamValue(next, 'view', nextView);
        }),
        { replace: true }
      );
    };

    const resolvedFinancialTypeLabel =
      financialTypeOptions.find(
        option =>
          option.id === (appliedFilters?.financialTypeId ?? selectedFinancialTypeId)
      )?.label ?? GENERAL_LEDGER_REPORT_TEXT.allFinancialTypes;

    return {
      dateRange,
      financialTypeId: selectedFinancialTypeId,
      branchIds: selectedBranchIds,
      accountIds: selectedAccountIds,
      layout,
      scope,
      view,
      branchOptions,
      accountOptions,
      financialTypeOptions,
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
      setFinancialTypeId,
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
      financialTypeLabel: resolvedFinancialTypeLabel,
    };
  };
