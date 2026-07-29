import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { branchProfileApi, counterProfileApi } from '@/api';
import { useListCurrencyProfiles } from '@/modules/currencyProfile/hooks';
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
  ReportDatePresetEnum,
  type IReportDateRange,
  type IReportSelectOption,
} from '../types';

export interface CurrencyBalanceReportFiltersState {
  dateRange: IReportDateRange;
  branchIds: string[];
  counterIds: string[];
  currencyId: string;
  branchOptions: IReportSelectOption[];
  counterOptions: IReportSelectOption[];
  currencyOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  counterAllSelected: boolean;
  setDateRange: (value: IReportDateRange) => void;
  setCurrencyId: (value: string) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  toggleCounter: (id: string, checked: boolean) => void;
  toggleAllCounters: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    branchIds: string[];
    counterIds: string[];
    currencyId: string;
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
}

const toOption = (id: string, label: string): IReportSelectOption => ({ id, label });

export const useCurrencyBalanceReportFilters = (): CurrencyBalanceReportFiltersState => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isRestrictedUser = !user?.isAdmin && !user?.isHo && !user?.isHoStaff;
  const userAssignments = useMemo(() => user?.assignments ?? [], [user?.assignments]);
  const searchParamsKey = searchParams.toString();
  const parsedSearchParams = useMemo(() => new URLSearchParams(searchParamsKey), [searchParamsKey]);

  const hydratedRouteState = useMemo(() => {
    const dateRange = readDateRangeSearchParams(parsedSearchParams, ReportDatePresetEnum.TODAY);
    return {
      dateRange,
      branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
      counterIds: readSearchParamList(parsedSearchParams, 'counterIds'),
      currencyId: readSearchParamValue(parsedSearchParams, 'currencyId'),
    };
  }, [parsedSearchParams]);

  const [dateRange, setDateRange] = useState<IReportDateRange>(hydratedRouteState.dateRange);
  const [branchIds, setBranchIds] = useState<string[]>(hydratedRouteState.branchIds);
  const [counterIds, setCounterIds] = useState<string[]>(hydratedRouteState.counterIds);
  const [currencyId, setCurrencyId] = useState(hydratedRouteState.currencyId);
  const [appliedFilters, setAppliedFilters] = useState<CurrencyBalanceReportFiltersState['appliedFilters']>(
    hydratedRouteState.currencyId
      ? {
          dateRange: hydratedRouteState.dateRange,
          branchIds: hydratedRouteState.branchIds,
          counterIds: hydratedRouteState.counterIds,
          currencyId: hydratedRouteState.currencyId,
        }
      : null,
  );

  const { data: branchProfiles = [] } = useQuery({
    queryKey: ['reports-currency-balance-branch-profiles'],
    enabled: true,
    queryFn: async () =>
      branchProfileApi.getBranchProfiles({
        activeOnly: true,
      }),
  });

  const { data: counterProfiles = [] } = useQuery({
    queryKey: ['reports-currency-balance-counter-profiles'],
    enabled: true,
    queryFn: async () =>
      counterProfileApi.getCounterProfiles({
        activeOnly: true,
      }),
  });

  const { data: currencyProfiles = [] } = useListCurrencyProfiles(undefined, true);

  const accessibleBranchProfiles = useMemo(
    () =>
      isRestrictedUser
        ? branchProfiles.filter(branch =>
            userAssignments.some(assignment => assignment.branchId === branch.id),
          )
        : branchProfiles,
    [branchProfiles, isRestrictedUser, userAssignments],
  );

  const branchOptions = useMemo<IReportSelectOption[]>(
    () =>
      uniqueOptions(
        accessibleBranchProfiles.map(branch =>
          toOption(branch.id, buildReportOptionLabel(branch.code, branch.name)),
        ),
      ),
    [accessibleBranchProfiles],
  );

  const visibleBranchIds = useMemo(
    () => branchOptions.map(option => option.id),
    [branchOptions],
  );

  const selectedBranchIds = useMemo(
    () => branchIds.filter(branchId => visibleBranchIds.includes(branchId)),
    [branchIds, visibleBranchIds],
  );

  const branchCounterBranchIds = useMemo(
    () => (selectedBranchIds.length > 0 ? selectedBranchIds : visibleBranchIds),
    [selectedBranchIds, visibleBranchIds],
  );

  const counterBranchMap = useMemo(() => new Set(branchCounterBranchIds), [branchCounterBranchIds]);

  const counterOptions = useMemo<IReportSelectOption[]>(() => {
    if (branchCounterBranchIds.length === 0) {
      return [];
    }

    if (isRestrictedUser) {
      return uniqueOptions(
        userAssignments
          .filter(assignment => counterBranchMap.has(assignment.branchId))
          .map(assignment => toOption(assignment.counterId, assignment.counterName || assignment.counterId))
          .filter(option => Boolean(option.id)),
      );
    }

    return uniqueOptions(
      counterProfiles
        .filter(counter =>
          accessibleBranchProfiles.some(branch =>
            branchCounterBranchIds.includes(branch.id) &&
            (branch.connectCounterIds ?? []).includes(counter.id),
          ),
        )
        .map(counter => toOption(counter.id, `${counter.counterNo} - ${counter.name}`)),
    );
  }, [
    accessibleBranchProfiles,
    branchCounterBranchIds,
    counterProfiles,
    counterBranchMap,
    isRestrictedUser,
    userAssignments,
  ]);

  const selectedCounterIds = useMemo(
    () => counterIds.filter(counterId => counterOptions.some(option => option.id === counterId)),
    [counterIds, counterOptions],
  );

  const currencyOptions = useMemo<IReportSelectOption[]>(
    () =>
      uniqueOptions(
        currencyProfiles.map(currency =>
          toOption(currency.id, buildReportOptionLabel(currency.currencyCode, currency.currencyName)),
        ),
      ),
    [currencyProfiles],
  );

  const branchAllSelected =
    branchOptions.length > 0 && selectedBranchIds.length === branchOptions.length;
  const counterAllSelected =
    counterOptions.length > 0 && selectedCounterIds.length === counterOptions.length;

  const toggleBranch = (id: string, checked: boolean) => {
    setBranchIds(current => toggleId(current, id, checked));
    if (!checked) {
      setCounterIds(current => current.filter(counterId => counterOptions.some(option => option.id === counterId)));
    }
  };

  const toggleAllBranches = (checked: boolean) => {
    setBranchIds(checked ? branchOptions.map(option => option.id) : []);
    if (!checked) {
      setCounterIds([]);
    }
  };

  const toggleCounter = (id: string, checked: boolean) => {
    setCounterIds(current => toggleId(current, id, checked));
  };

  const toggleAllCounters = (checked: boolean) => {
    setCounterIds(checked ? counterOptions.map(option => option.id) : []);
  };

  const resetFilters = () => {
    setDateRange(buildReportDateRange(ReportDatePresetEnum.TODAY));
    setBranchIds([]);
    setCounterIds([]);
    setCurrencyId('');
    setAppliedFilters(null);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleView = () => {
    if (!currencyId) {
      return;
    }

    const nextAppliedFilters = {
      dateRange,
      branchIds: selectedBranchIds,
      counterIds: selectedCounterIds,
      currencyId,
    };

    const nextSearchParams = buildSearchParams(undefined, next => {
      setSearchParamValue(next, 'datePreset', dateRange.preset);
      if (dateRange.preset === ReportDatePresetEnum.CUSTOM) {
        setSearchParamValue(next, 'startDate', dateRange.startDate);
        setSearchParamValue(next, 'endDate', dateRange.endDate);
      }
      setSearchParamList(next, 'branchIds', selectedBranchIds);
      setSearchParamList(next, 'counterIds', selectedCounterIds);
      setSearchParamValue(next, 'currencyId', currencyId);
    });

    setAppliedFilters(nextAppliedFilters);
    setSearchParams(nextSearchParams, { replace: true });
  };

  const appliedDateRangeLabel = appliedFilters
    ? formatReportDateRangeLabel(appliedFilters.dateRange)
    : formatReportDateRangeLabel(dateRange);

  return {
    dateRange,
    branchIds: selectedBranchIds,
    counterIds: selectedCounterIds,
    currencyId,
    branchOptions,
    counterOptions,
    currencyOptions,
    branchAllSelected,
    counterAllSelected,
    setDateRange,
    setCurrencyId,
    toggleBranch,
    toggleAllBranches,
    toggleCounter,
    toggleAllCounters,
    resetFilters,
    handleView,
    appliedFilters,
    appliedDateRangeLabel,
    canView: Boolean(currencyId),
  };
};

export default useCurrencyBalanceReportFilters;
