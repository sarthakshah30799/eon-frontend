import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { branchProfileApi } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import {
  FLM8_AD2_TEXT,
  Flm8Ad2ReportFormatEnum,
  type Flm8Ad2ReportFormat,
} from '../constants/flm8Ad2Constants';
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

export interface Flm8Ad2FiltersState {
  dateRange: IReportDateRange;
  branchIds: string[];
  reportFormat: Flm8Ad2ReportFormat;
  apConnect: boolean;
  branchOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  setDateRange: (value: IReportDateRange) => void;
  setReportFormat: (value: Flm8Ad2ReportFormat) => void;
  setApConnect: (value: boolean) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    branchIds: string[];
    reportFormat: Flm8Ad2ReportFormat;
    apConnect: boolean;
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
  formatLabel: string;
}

const toOption = (id: string, label: string): IReportSelectOption => ({
  id,
  label,
});

const parseFormat = (value: string): Flm8Ad2ReportFormat => {
  if (value === Flm8Ad2ReportFormatEnum.PURPOSE) {
    return Flm8Ad2ReportFormatEnum.PURPOSE;
  }
  if (value === Flm8Ad2ReportFormatEnum.PARTY) {
    return Flm8Ad2ReportFormatEnum.PARTY;
  }
  return Flm8Ad2ReportFormatEnum.CURRENCY;
};

const parseBooleanParam = (value: string) => value === 'true' || value === '1';

const formatLabel = (value: Flm8Ad2ReportFormat) => {
  if (value === Flm8Ad2ReportFormatEnum.PURPOSE) {
    return FLM8_AD2_TEXT.purposeDetails;
  }
  if (value === Flm8Ad2ReportFormatEnum.PARTY) {
    return FLM8_AD2_TEXT.partyDetails;
  }
  return FLM8_AD2_TEXT.currencyDetails;
};

export const useFlm8Ad2Filters = (): Flm8Ad2FiltersState => {
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
      reportFormat: parseFormat(
        readSearchParamValue(parsedSearchParams, 'reportFormat')
      ),
      apConnect: parseBooleanParam(
        readSearchParamValue(parsedSearchParams, 'apConnect')
      ),
    }),
    [parsedSearchParams]
  );

  const [dateRange, setDateRange] = useState<IReportDateRange>(
    hydratedRouteState.dateRange
  );
  const [branchIds, setBranchIds] = useState<string[]>(
    hydratedRouteState.branchIds
  );
  const [reportFormat, setReportFormatState] = useState<Flm8Ad2ReportFormat>(
    hydratedRouteState.reportFormat
  );
  const [apConnect, setApConnectState] = useState(hydratedRouteState.apConnect);
  const [appliedFilters, setAppliedFilters] = useState<
    Flm8Ad2FiltersState['appliedFilters']
  >(
    searchParamsKey
      ? {
          dateRange: hydratedRouteState.dateRange,
          branchIds: hydratedRouteState.branchIds,
          reportFormat: hydratedRouteState.reportFormat,
          apConnect: hydratedRouteState.apConnect,
        }
      : null
  );

  const { data: branchProfiles = [] } = useQuery({
    queryKey: ['reports-flm8-ad2-branch-profiles'],
    queryFn: async () =>
      branchProfileApi.getAllBranchProfiles({
        activeOnly: true,
      }),
  });

  const accessibleBranchProfiles = useMemo(
    () =>
      isRestrictedUser
        ? branchProfiles.filter(branch =>
            userAssignments.some(
              assignment => assignment.branchId === branch.id
            )
          )
        : branchProfiles,
    [branchProfiles, isRestrictedUser, userAssignments]
  );

  const branchOptions = useMemo<IReportSelectOption[]>(
    () =>
      uniqueOptions(
        accessibleBranchProfiles.map(branch =>
          toOption(branch.id, buildReportOptionLabel(branch.code, branch.name))
        )
      ),
    [accessibleBranchProfiles]
  );

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

  const writeSearchParams = (
    nextDateRange: IReportDateRange,
    nextBranchIds: string[],
    nextReportFormat: Flm8Ad2ReportFormat,
    nextApConnect: boolean
  ) =>
    buildSearchParams(undefined, next => {
      setSearchParamValue(next, 'datePreset', nextDateRange.preset);
      setSearchParamValue(next, 'startDate', nextDateRange.startDate);
      setSearchParamValue(next, 'endDate', nextDateRange.endDate);
      setSearchParamList(next, 'branchIds', nextBranchIds);
      setSearchParamValue(next, 'reportFormat', nextReportFormat);
      setSearchParamValue(next, 'apConnect', nextApConnect ? 'true' : '');
    });

  const apply = (
    nextDateRange: IReportDateRange,
    nextBranchIds: string[],
    nextReportFormat: Flm8Ad2ReportFormat,
    nextApConnect: boolean
  ) => {
    setAppliedFilters({
      dateRange: nextDateRange,
      branchIds: nextBranchIds,
      reportFormat: nextReportFormat,
      apConnect: nextApConnect,
    });
    setSearchParams(
      writeSearchParams(
        nextDateRange,
        nextBranchIds,
        nextReportFormat,
        nextApConnect
      ),
      { replace: true }
    );
  };

  const setReportFormat = (nextReportFormat: Flm8Ad2ReportFormat) => {
    setReportFormatState(nextReportFormat);
    if (!appliedFilters) {
      return;
    }
    apply(
      appliedFilters.dateRange,
      appliedFilters.branchIds,
      nextReportFormat,
      apConnect
    );
  };

  const setApConnect = (nextApConnect: boolean) => {
    setApConnectState(nextApConnect);
    if (!appliedFilters) {
      return;
    }
    apply(
      appliedFilters.dateRange,
      appliedFilters.branchIds,
      appliedFilters.reportFormat,
      nextApConnect
    );
  };

  const resetFilters = () => {
    setDateRange(buildReportDateRange(ReportDatePresetEnum.TODAY));
    setBranchIds([]);
    setReportFormatState(Flm8Ad2ReportFormatEnum.CURRENCY);
    setApConnectState(false);
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
    apply(dateRange, effectiveBranchIds, reportFormat, apConnect);
  };

  return {
    dateRange,
    branchIds: selectedBranchIds,
    reportFormat,
    apConnect,
    branchOptions,
    branchAllSelected,
    setDateRange,
    setReportFormat,
    setApConnect,
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
    formatLabel: formatLabel(
      appliedFilters?.reportFormat ?? reportFormat
    ),
  };
};
