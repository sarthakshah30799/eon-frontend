import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { branchProfileApi } from '@/api';
import { useAuth } from '@/lib/AuthContext';
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
  setSearchParamList,
  setSearchParamValue,
} from '../utils/reportSearchParams';

export interface TourPaxReportFiltersState {
  dateRange: IReportDateRange;
  branchIds: string[];
  branchOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  setDateRange: (value: IReportDateRange) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    branchIds: string[];
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
}

const toOption = (id: string, label: string): IReportSelectOption => ({
  id,
  label,
});

export const useTourPaxReportFilters = (): TourPaxReportFiltersState => {
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
  const hydratedRouteState = useMemo(
    () => ({
      dateRange: readDateRangeSearchParams(
        parsedSearchParams,
        ReportDatePresetEnum.TODAY
      ),
      branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
    }),
    [parsedSearchParams]
  );

  const [dateRange, setDateRange] = useState<IReportDateRange>(
    hydratedRouteState.dateRange
  );
  const [branchIds, setBranchIds] = useState<string[]>(
    hydratedRouteState.branchIds
  );
  const [appliedFilters, setAppliedFilters] = useState<
    TourPaxReportFiltersState['appliedFilters']
  >(
    searchParamsKey
      ? {
          dateRange: hydratedRouteState.dateRange,
          branchIds: hydratedRouteState.branchIds,
        }
      : null
  );

  const { data: branchProfiles = [] } = useQuery({
    queryKey: ['reports-tour-pax-branch-profiles'],
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
      branchIds.filter(branchId =>
        branchOptions.some(option => option.id === branchId)
      ),
    [branchIds, branchOptions]
  );
  const branchAllSelected =
    branchOptions.length > 0 &&
    selectedBranchIds.length === branchOptions.length;

  const resetFilters = () => {
    setDateRange(buildReportDateRange(ReportDatePresetEnum.TODAY));
    setBranchIds([]);
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
    setAppliedFilters({ dateRange, branchIds: effectiveBranchIds });
    setSearchParams(
      buildSearchParams(undefined, next => {
        setSearchParamValue(next, 'datePreset', dateRange.preset);
        setSearchParamValue(next, 'startDate', dateRange.startDate);
        setSearchParamValue(next, 'endDate', dateRange.endDate);
        setSearchParamList(next, 'branchIds', effectiveBranchIds);
      }),
      { replace: true }
    );
  };

  return {
    dateRange,
    branchIds: selectedBranchIds,
    branchOptions,
    branchAllSelected,
    setDateRange,
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
  };
};
