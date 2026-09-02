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
  currencyIds: string[];
  branchOptions: IReportSelectOption[];
  counterOptions: IReportSelectOption[];
  currencyOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  counterAllSelected: boolean;
  currencyAllSelected: boolean;
  setDateRange: (value: IReportDateRange) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  toggleCounter: (id: string, checked: boolean) => void;
  toggleAllCounters: (checked: boolean) => void;
  toggleCurrency: (id: string, checked: boolean) => void;
  toggleAllCurrencies: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    branchIds: string[];
    counterIds: string[];
    currencyIds: string[];
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
}

const toOption = (id: string, label: string): IReportSelectOption => ({
  id,
  label,
});

export const useCurrencyBalanceReportFilters =
  (): CurrencyBalanceReportFiltersState => {
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
      const currencyIdsFromList = readSearchParamList(
        parsedSearchParams,
        'currencyIds'
      );
      const legacyCurrencyId = readSearchParamValue(
        parsedSearchParams,
        'currencyId'
      );

      return {
        dateRange,
        branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
        counterIds: readSearchParamList(parsedSearchParams, 'counterIds'),
        currencyIds:
          currencyIdsFromList.length > 0
            ? currencyIdsFromList
            : legacyCurrencyId
              ? [legacyCurrencyId]
              : [],
      };
    }, [parsedSearchParams]);

    const [dateRange, setDateRange] = useState<IReportDateRange>(
      hydratedRouteState.dateRange
    );
    const [branchIds, setBranchIds] = useState<string[]>(
      hydratedRouteState.branchIds
    );
    const [counterIds, setCounterIds] = useState<string[]>(
      hydratedRouteState.counterIds
    );
    const [currencyIds, setCurrencyIds] = useState<string[]>(
      hydratedRouteState.currencyIds
    );
    const [appliedFilters, setAppliedFilters] = useState<
      CurrencyBalanceReportFiltersState['appliedFilters']
    >(
      searchParamsKey
        ? {
            dateRange: hydratedRouteState.dateRange,
            branchIds: hydratedRouteState.branchIds,
            counterIds: hydratedRouteState.counterIds,
            currencyIds: hydratedRouteState.currencyIds,
          }
        : null
    );

    const { data: branchProfiles = [] } = useQuery({
      queryKey: ['reports-currency-balance-branch-profiles'],
      enabled: true,
      queryFn: async () =>
        branchProfileApi.getAllBranchProfiles({
          activeOnly: true,
        }),
    });

    const { data: counterProfiles = [] } = useQuery({
      queryKey: ['reports-currency-balance-counter-profiles'],
      enabled: true,
      queryFn: async () =>
        counterProfileApi.getAllCounterProfiles({
          activeOnly: true,
        }),
    });

    const { data: currencyProfilesPage } = useListCurrencyProfiles(
      undefined,
      true
    );
    const currencyProfiles = currencyProfilesPage?.data ?? [];

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
            toOption(
              branch.id,
              buildReportOptionLabel(branch.code, branch.name)
            )
          )
        ),
      [accessibleBranchProfiles]
    );

    const visibleBranchIds = useMemo(
      () => branchOptions.map(option => option.id),
      [branchOptions]
    );

    const selectedBranchIds = useMemo(
      () => branchIds.filter(branchId => visibleBranchIds.includes(branchId)),
      [branchIds, visibleBranchIds]
    );

    const branchCounterBranchIds = useMemo(
      () =>
        selectedBranchIds.length > 0 ? selectedBranchIds : visibleBranchIds,
      [selectedBranchIds, visibleBranchIds]
    );

    const counterBranchMap = useMemo(
      () => new Set(branchCounterBranchIds),
      [branchCounterBranchIds]
    );

    const counterOptions = useMemo<IReportSelectOption[]>(() => {
      if (branchCounterBranchIds.length === 0) {
        return [];
      }

      if (isRestrictedUser) {
        return uniqueOptions(
          userAssignments
            .filter(assignment => counterBranchMap.has(assignment.branchId))
            .map(assignment =>
              toOption(
                assignment.counterId,
                assignment.counterName || assignment.counterId
              )
            )
            .filter(option => Boolean(option.id))
        );
      }

      return uniqueOptions(
        counterProfiles
          .filter(counter =>
            accessibleBranchProfiles.some(
              branch =>
                branchCounterBranchIds.includes(branch.id) &&
                (branch.connectCounterIds ?? []).includes(counter.id)
            )
          )
          .map(counter =>
            toOption(counter.id, `${counter.counterNo} - ${counter.name}`)
          )
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
      () =>
        counterIds.filter(counterId =>
          counterOptions.some(option => option.id === counterId)
        ),
      [counterIds, counterOptions]
    );

    const currencyOptions = useMemo<IReportSelectOption[]>(
      () =>
        uniqueOptions(
          currencyProfiles.map(currency =>
            toOption(
              currency.id,
              buildReportOptionLabel(
                currency.currencyCode,
                currency.currencyName
              )
            )
          )
        ),
      [currencyProfiles]
    );

    const selectedCurrencyIds = useMemo(
      () =>
        currencyIds.filter(currencyId =>
          currencyOptions.some(option => option.id === currencyId)
        ),
      [currencyIds, currencyOptions]
    );

    const branchAllSelected =
      branchOptions.length > 0 &&
      selectedBranchIds.length === branchOptions.length;
    const counterAllSelected =
      counterOptions.length > 0 &&
      selectedCounterIds.length === counterOptions.length;
    const currencyAllSelected =
      currencyOptions.length > 0 &&
      selectedCurrencyIds.length === currencyOptions.length;

    const toggleBranch = (id: string, checked: boolean) => {
      setBranchIds(current => toggleId(current, id, checked));
      if (!checked) {
        setCounterIds(current =>
          current.filter(counterId =>
            counterOptions.some(option => option.id === counterId)
          )
        );
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

    const toggleCurrency = (id: string, checked: boolean) => {
      setCurrencyIds(current => toggleId(current, id, checked));
    };

    const toggleAllCurrencies = (checked: boolean) => {
      setCurrencyIds(checked ? currencyOptions.map(option => option.id) : []);
    };

    const resetFilters = () => {
      setDateRange(buildReportDateRange(ReportDatePresetEnum.TODAY));
      setBranchIds([]);
      setCounterIds([]);
      setCurrencyIds([]);
      setAppliedFilters(null);
      setSearchParams(new URLSearchParams(), { replace: true });
    };

    const handleView = () => {
      const nextAppliedFilters = {
        dateRange,
        branchIds: selectedBranchIds,
        counterIds: selectedCounterIds,
        currencyIds: selectedCurrencyIds,
      };

      const nextSearchParams = buildSearchParams(undefined, next => {
        setSearchParamValue(next, 'datePreset', dateRange.preset);
        if (dateRange.preset === ReportDatePresetEnum.CUSTOM) {
          setSearchParamValue(next, 'startDate', dateRange.startDate);
          setSearchParamValue(next, 'endDate', dateRange.endDate);
        }
        setSearchParamList(next, 'branchIds', selectedBranchIds);
        setSearchParamList(next, 'counterIds', selectedCounterIds);
        setSearchParamList(next, 'currencyIds', selectedCurrencyIds);
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
      currencyIds: selectedCurrencyIds,
      branchOptions,
      counterOptions,
      currencyOptions,
      branchAllSelected,
      counterAllSelected,
      currencyAllSelected,
      setDateRange,
      toggleBranch,
      toggleAllBranches,
      toggleCounter,
      toggleAllCounters,
      toggleCurrency,
      toggleAllCurrencies,
      resetFilters,
      handleView,
      appliedFilters,
      appliedDateRangeLabel,
      canView: true,
    };
  };

export default useCurrencyBalanceReportFilters;
