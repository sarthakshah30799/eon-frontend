import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { branchProfileApi } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import {
  TRADING_SUMMARY_REPORT_TEXT,
  TradingSummaryDiffFilterEnum,
  TradingSummaryReportScopeEnum,
  type TradingSummaryDiffFilter,
  type TradingSummaryReportScope,
} from '../constants/tradingSummaryReportConstants';
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

export interface TradingSummaryReportFiltersState {
  dateRange: IReportDateRange;
  branchIds: string[];
  scope: TradingSummaryReportScope;
  diffFilter: TradingSummaryDiffFilter;
  branchOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  setDateRange: (value: IReportDateRange) => void;
  setScope: (value: TradingSummaryReportScope) => void;
  setDiffFilter: (value: TradingSummaryDiffFilter) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    branchIds: string[];
    scope: TradingSummaryReportScope;
    diffFilter: TradingSummaryDiffFilter;
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
  scopeLabel: string;
  diffFilterLabel: string;
}

const toOption = (id: string, label: string): IReportSelectOption => ({
  id,
  label,
});

const parseScope = (value: string): TradingSummaryReportScope =>
  value === TradingSummaryReportScopeEnum.CONSOLIDATED
    ? TradingSummaryReportScopeEnum.CONSOLIDATED
    : TradingSummaryReportScopeEnum.BRANCH;

const parseDiffFilter = (value: string): TradingSummaryDiffFilter =>
  value === TradingSummaryDiffFilterEnum.NO_DIFF
    ? TradingSummaryDiffFilterEnum.NO_DIFF
    : TradingSummaryDiffFilterEnum.HAS_DIFF;

const scopeLabel = (value: TradingSummaryReportScope) =>
  value === TradingSummaryReportScopeEnum.CONSOLIDATED
    ? TRADING_SUMMARY_REPORT_TEXT.consolidated
    : TRADING_SUMMARY_REPORT_TEXT.branchScope;

const diffFilterLabel = (value: TradingSummaryDiffFilter) =>
  value === TradingSummaryDiffFilterEnum.NO_DIFF
    ? TRADING_SUMMARY_REPORT_TEXT.noDiff
    : TRADING_SUMMARY_REPORT_TEXT.hasDiff;

export const useTradingSummaryReportFilters =
  (): TradingSummaryReportFiltersState => {
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
        diffFilter: parseDiffFilter(
          readSearchParamValue(parsedSearchParams, 'diffFilter')
        ),
      };
    }, [parsedSearchParams]);

    const [dateRange, setDateRange] = useState(hydrated.dateRange);
    const [branchIds, setBranchIds] = useState(hydrated.branchIds);
    const [scope, setScope] = useState(hydrated.scope);
    const [diffFilter, setDiffFilter] = useState(hydrated.diffFilter);
    const [appliedFilters, setAppliedFilters] = useState<
      TradingSummaryReportFiltersState['appliedFilters']
    >(searchParamsKey ? hydrated : null);

    const { data: branchProfiles = [] } = useQuery({
      queryKey: ['reports-trading-summary-branches'],
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
      setScope(TradingSummaryReportScopeEnum.BRANCH);
      setDiffFilter(TradingSummaryDiffFilterEnum.HAS_DIFF);
      setAppliedFilters(null);
      setSearchParams(new URLSearchParams(), { replace: true });
    };

    const handleView = () => {
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
      const nextApplied = {
        dateRange: resolvedDateRange,
        branchIds: effectiveBranchIds,
        scope,
        diffFilter,
      };
      setDateRange(resolvedDateRange);
      setAppliedFilters(nextApplied);
      setSearchParams(
        buildSearchParams(undefined, next => {
          setSearchParamValue(next, 'datePreset', resolvedDateRange.preset);
          setSearchParamValue(next, 'startDate', resolvedDateRange.startDate);
          setSearchParamValue(next, 'endDate', resolvedDateRange.endDate);
          setSearchParamList(next, 'branchIds', effectiveBranchIds);
          setSearchParamValue(next, 'scope', scope);
          setSearchParamValue(next, 'diffFilter', diffFilter);
        }),
        { replace: true }
      );
    };

    return {
      dateRange,
      branchIds: selectedBranchIds,
      scope,
      diffFilter,
      branchOptions,
      branchAllSelected:
        branchOptions.length > 0 &&
        selectedBranchIds.length === branchOptions.length,
      setDateRange,
      setScope,
      setDiffFilter,
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
      canView: Boolean(dateRange.startDate && dateRange.endDate && user),
      scopeLabel: scopeLabel(appliedFilters?.scope ?? scope),
      diffFilterLabel: diffFilterLabel(
        appliedFilters?.diffFilter ?? diffFilter
      ),
    };
  };

export default useTradingSummaryReportFilters;
