import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { branchProfileApi } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import {
  TRIAL_BALANCE_REPORT_TEXT,
  TrialBalanceReportScopeEnum,
  type TrialBalanceReportScope,
} from '../constants/trialBalanceReportConstants';
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

export interface TrialBalanceReportFiltersState {
  dateRange: IReportDateRange;
  branchIds: string[];
  scope: TrialBalanceReportScope;
  groupBy: boolean;
  mergeProfit: boolean;
  branchOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  setDateRange: (value: IReportDateRange) => void;
  setScope: (value: TrialBalanceReportScope) => void;
  setGroupBy: (value: boolean) => void;
  setMergeProfit: (value: boolean) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    branchIds: string[];
    scope: TrialBalanceReportScope;
    groupBy: boolean;
    mergeProfit: boolean;
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
  scopeLabel: string;
  groupByLabel: string;
  mergeProfitLabel: string;
}

const toOption = (id: string, label: string): IReportSelectOption => ({
  id,
  label,
});

const parseScope = (value: string): TrialBalanceReportScope =>
  value === TrialBalanceReportScopeEnum.CONSOLIDATED
    ? TrialBalanceReportScopeEnum.CONSOLIDATED
    : TrialBalanceReportScopeEnum.BRANCH;

const parseGroupBy = (value: string) =>
  value === 'true' || value === '1';

const scopeLabel = (value: TrialBalanceReportScope) =>
  value === TrialBalanceReportScopeEnum.CONSOLIDATED
    ? TRIAL_BALANCE_REPORT_TEXT.consolidated
    : TRIAL_BALANCE_REPORT_TEXT.branchScope;

const yesNoLabel = (value: boolean) =>
  value ? TRIAL_BALANCE_REPORT_TEXT.yes : TRIAL_BALANCE_REPORT_TEXT.no;

export const useTrialBalanceReportFilters =
  (): TrialBalanceReportFiltersState => {
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
        groupBy: parseGroupBy(
          readSearchParamValue(parsedSearchParams, 'groupBy')
        ),
        mergeProfit: readSearchParamBoolean(parsedSearchParams, 'mergeProfit'),
      };
    }, [parsedSearchParams]);

    const [dateRange, setDateRange] = useState(hydrated.dateRange);
    const [branchIds, setBranchIds] = useState(hydrated.branchIds);
    const [scope, setScope] = useState(hydrated.scope);
    const [groupBy, setGroupBy] = useState(hydrated.groupBy);
    const [mergeProfit, setMergeProfit] = useState(hydrated.mergeProfit);
    const [appliedFilters, setAppliedFilters] = useState<
      TrialBalanceReportFiltersState['appliedFilters']
    >(searchParamsKey ? hydrated : null);

    const { data: branchProfiles = [] } = useQuery({
      queryKey: ['reports-trial-balance-branches'],
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
      setScope(TrialBalanceReportScopeEnum.BRANCH);
      setGroupBy(false);
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
        groupBy,
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
          setSearchParamValue(next, 'groupBy', groupBy ? 'true' : 'false');
          setSearchParamBoolean(next, 'mergeProfit', mergeProfit);
        }),
        { replace: true }
      );
    };

    return {
      dateRange,
      branchIds: selectedBranchIds,
      scope,
      groupBy,
      mergeProfit,
      branchOptions,
      branchAllSelected:
        branchOptions.length > 0 &&
        selectedBranchIds.length === branchOptions.length,
      setDateRange,
      setScope,
      setGroupBy,
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
      groupByLabel: yesNoLabel(appliedFilters?.groupBy ?? groupBy),
      mergeProfitLabel: yesNoLabel(
        appliedFilters?.mergeProfit ?? mergeProfit
      ),
    };
  };
