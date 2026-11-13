import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { branchProfileApi } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import {
  FINAL_ACCOUNT_REPORT_TEXT,
  FinalAccountReportScopeEnum,
  FinalAccountStatementTypeEnum,
  type FinalAccountReportScope,
  type FinalAccountStatementType,
} from '../constants/finalAccountReportConstants';
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
  readSearchParamBoolean,
  readSearchParamList,
  readSearchParamValue,
  setSearchParamBoolean,
  setSearchParamList,
  setSearchParamValue,
} from '../utils/reportSearchParams';

export interface FinalAccountReportFiltersState {
  dateRange: IReportDateRange;
  branchIds: string[];
  scope: FinalAccountReportScope;
  statementType: FinalAccountStatementType;
  mergeProfit: boolean;
  branchOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  setDateRange: (value: IReportDateRange) => void;
  setScope: (value: FinalAccountReportScope) => void;
  setStatementType: (value: FinalAccountStatementType) => void;
  setMergeProfit: (value: boolean) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    branchIds: string[];
    scope: FinalAccountReportScope;
    statementType: FinalAccountStatementType;
    mergeProfit: boolean;
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
  scopeLabel: string;
  statementLabel: string;
  mergeProfitLabel: string;
}

const toOption = (id: string, label: string): IReportSelectOption => ({
  id,
  label,
});

const parseScope = (value: string): FinalAccountReportScope =>
  value === FinalAccountReportScopeEnum.CONSOLIDATED
    ? FinalAccountReportScopeEnum.CONSOLIDATED
    : FinalAccountReportScopeEnum.BRANCH;

const parseStatementType = (value: string): FinalAccountStatementType => {
  if (value === FinalAccountStatementTypeEnum.PROFIT_AND_LOSS) {
    return FinalAccountStatementTypeEnum.PROFIT_AND_LOSS;
  }
  if (value === FinalAccountStatementTypeEnum.BALANCE_SHEET) {
    return FinalAccountStatementTypeEnum.BALANCE_SHEET;
  }
  return FinalAccountStatementTypeEnum.TRADING;
};

const scopeLabel = (value: FinalAccountReportScope) =>
  value === FinalAccountReportScopeEnum.CONSOLIDATED
    ? FINAL_ACCOUNT_REPORT_TEXT.consolidated
    : FINAL_ACCOUNT_REPORT_TEXT.branchScope;

const statementLabel = (value: FinalAccountStatementType) => {
  switch (value) {
    case FinalAccountStatementTypeEnum.PROFIT_AND_LOSS:
      return FINAL_ACCOUNT_REPORT_TEXT.profitAndLoss;
    case FinalAccountStatementTypeEnum.BALANCE_SHEET:
      return FINAL_ACCOUNT_REPORT_TEXT.balanceSheet;
    default:
      return FINAL_ACCOUNT_REPORT_TEXT.trading;
  }
};

const mergeProfitLabel = (value: boolean) =>
  value
    ? FINAL_ACCOUNT_REPORT_TEXT.mergeProfitYes
    : FINAL_ACCOUNT_REPORT_TEXT.mergeProfitNo;

export const useFinalAccountReportFilters =
  (): FinalAccountReportFiltersState => {
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
        scope: parseScope(readSearchParamValue(parsedSearchParams, 'scope')),
        statementType: parseStatementType(
          readSearchParamValue(parsedSearchParams, 'statementType')
        ),
        mergeProfit: readSearchParamBoolean(parsedSearchParams, 'mergeProfit'),
      };
    }, [parsedSearchParams]);

    const [dateRange, setDateRange] = useState(hydrated.dateRange);
    const [branchIds, setBranchIds] = useState(hydrated.branchIds);
    const [scope, setScope] = useState(hydrated.scope);
    const [statementType, setStatementType] = useState(hydrated.statementType);
    const [mergeProfit, setMergeProfit] = useState(hydrated.mergeProfit);
    const [appliedFilters, setAppliedFilters] = useState<
      FinalAccountReportFiltersState['appliedFilters']
    >(searchParamsKey ? hydrated : null);

    const { data: branchProfiles = [] } = useQuery({
      queryKey: ['reports-final-account-branches'],
      queryFn: async () =>
        branchProfileApi.getAllBranchProfiles({ activeOnly: true }),
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

    const resetFilters = () => {
      setDateRange(buildReportDateRange(ReportDatePresetEnum.CURRENT_MONTH));
      setBranchIds([]);
      setScope(FinalAccountReportScopeEnum.BRANCH);
      setStatementType(FinalAccountStatementTypeEnum.TRADING);
      setMergeProfit(false);
      setAppliedFilters(null);
      setSearchParams(new URLSearchParams(), { replace: true });
    };

    const handleView = () => {
      if (!dateRange.startDate || !dateRange.endDate) {
        return;
      }
      const accessibleBranchIds = branchOptions.map(option => option.id);
      const effectiveBranchIds = isRestrictedUser
        ? selectedBranchIds.length
          ? selectedBranchIds
          : accessibleBranchIds
        : selectedBranchIds;
      const nextApplied = {
        dateRange,
        branchIds: effectiveBranchIds,
        scope,
        statementType,
        mergeProfit,
      };
      setAppliedFilters(nextApplied);
      setSearchParams(
        buildSearchParams(undefined, next => {
          setSearchParamValue(next, 'datePreset', dateRange.preset);
          setSearchParamValue(next, 'startDate', dateRange.startDate);
          setSearchParamValue(next, 'endDate', dateRange.endDate);
          setSearchParamList(next, 'branchIds', effectiveBranchIds);
          setSearchParamValue(next, 'scope', scope);
          setSearchParamValue(next, 'statementType', statementType);
          setSearchParamBoolean(next, 'mergeProfit', mergeProfit);
        }),
        { replace: true }
      );
    };

    return {
      dateRange,
      branchIds: selectedBranchIds,
      scope,
      statementType,
      mergeProfit,
      branchOptions,
      branchAllSelected:
        branchOptions.length > 0 &&
        selectedBranchIds.length === branchOptions.length,
      setDateRange,
      setScope,
      setStatementType,
      setMergeProfit,
      toggleBranch: (id, checked) => {
        setBranchIds(current => toggleId(current, id, checked));
      },
      toggleAllBranches: checked => {
        setBranchIds(checked ? branchOptions.map(option => option.id) : []);
      },
      resetFilters,
      handleView,
      appliedFilters,
      appliedDateRangeLabel: appliedFilters
        ? formatReportDateRangeLabel(appliedFilters.dateRange)
        : '',
      canView: Boolean(dateRange.startDate && dateRange.endDate),
      scopeLabel: scopeLabel(appliedFilters?.scope ?? scope),
      statementLabel: statementLabel(
        appliedFilters?.statementType ?? statementType
      ),
      mergeProfitLabel: mergeProfitLabel(
        appliedFilters?.mergeProfit ?? mergeProfit
      ),
    };
  };
