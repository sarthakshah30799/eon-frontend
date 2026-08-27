import { useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { branchProfileApi, counterProfileApi, partyProfileApi } from '@/api';
import { usePartyProfileTypes } from '@/modules/partyProfiles/hooks';
import { useDebounce } from '@/hooks';
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
  readSearchParamBoolean,
  readSearchParamList,
  readSearchParamValue,
  setSearchParamBoolean,
  setSearchParamList,
  setSearchParamValue,
} from '../utils/reportSearchParams';
import {
  ReportDatePresetEnum,
  ReportTransactionTypeEnum,
  ReportSortByEnum,
  type IReportDateRange,
  type IReportFiltersState,
  type IReportPartyProfileSelection,
  type IReportSelectOption,
  type ReportTransactionType,
  type ReportSortBy,
} from '../types';
import type { PartyProfileType } from '@/modules/partyProfiles/types';

const PAGE_SIZE = 30;

export const useSalePurchaseReportFilters = () => {
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
    const transactionTypes = readSearchParamList(
      parsedSearchParams,
      'transactionTypes'
    ) as ReportTransactionType[];

    return {
      dateRange: readDateRangeSearchParams(
        parsedSearchParams,
        ReportDatePresetEnum.TODAY
      ),
      stateIds: readSearchParamList(parsedSearchParams, 'stateIds'),
      branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
      counterIds: readSearchParamList(parsedSearchParams, 'counterIds'),
      partyTypeCodes: readSearchParamList(parsedSearchParams, 'partyTypeCodes'),
      transactionTypes,
      sortBy:
        (readSearchParamValue(parsedSearchParams, 'sortBy') as ReportSortBy) ||
        ReportSortByEnum.DATE_ASC,
      partyProfileSearch: readSearchParamValue(
        parsedSearchParams,
        'partyProfileSearch'
      ),
      partyProfileSelection: {
        allSelected: readSearchParamBoolean(
          parsedSearchParams,
          'partyProfileAllSelected'
        ),
        selectedIds: readSearchParamList(
          parsedSearchParams,
          'partyProfileSelectedIds'
        ),
        excludedIds: readSearchParamList(
          parsedSearchParams,
          'partyProfileExcludedIds'
        ),
      } as IReportPartyProfileSelection,
    };
  }, [parsedSearchParams]);

  const [partyProfileSearch, setPartyProfileSearch] = useState(
    hydratedRouteState.partyProfileSearch
  );
  const debouncedPartyProfileSearch = useDebounce(partyProfileSearch, 350);
  const [dateRange, setDateRange] = useState<IReportDateRange>(
    hydratedRouteState.dateRange
  );
  const [stateIds, setStateIds] = useState<string[]>(
    hydratedRouteState.stateIds
  );
  const [branchIds, setBranchIds] = useState<string[]>(
    hydratedRouteState.branchIds
  );
  const [counterIds, setCounterIds] = useState<string[]>(
    hydratedRouteState.counterIds
  );
  const [partyTypeCodes, setPartyTypeCodes] = useState<string[]>(
    hydratedRouteState.partyTypeCodes
  );
  const [transactionTypes, setTransactionTypes] = useState<
    ReportTransactionType[]
  >(
    hydratedRouteState.transactionTypes.length > 0
      ? hydratedRouteState.transactionTypes
      : [ReportTransactionTypeEnum.PURCHASE, ReportTransactionTypeEnum.SALE]
  );
  const [sortBy, setSortBy] = useState<ReportSortBy>(hydratedRouteState.sortBy);
  const [partyProfileSelection, setPartyProfileSelection] =
    useState<IReportPartyProfileSelection>(
      hydratedRouteState.partyProfileSelection
    );
  const [appliedFilters, setAppliedFilters] =
    useState<IReportFiltersState | null>(
      searchParamsKey
        ? {
            dateRange: hydratedRouteState.dateRange,
            stateIds: hydratedRouteState.stateIds,
            branchIds: hydratedRouteState.branchIds,
            counterIds: hydratedRouteState.counterIds,
            partyTypeCodes: hydratedRouteState.partyTypeCodes,
            partyProfileSearch: hydratedRouteState.partyProfileSearch,
            partyProfileSelection: hydratedRouteState.partyProfileSelection,
            transactionTypes:
              hydratedRouteState.transactionTypes.length > 0
                ? hydratedRouteState.transactionTypes
                : [
                    ReportTransactionTypeEnum.PURCHASE,
                    ReportTransactionTypeEnum.SALE,
                  ],
            sortBy: hydratedRouteState.sortBy,
          }
        : null
    );

  const { data: branchProfiles = [] } = useQuery({
    queryKey: ['reports-branch-profiles'],
    enabled: true,
    queryFn: async () =>
      branchProfileApi.getBranchProfiles({
        activeOnly: true,
      }),
  });

  const { data: counterProfiles = [] } = useQuery({
    queryKey: ['reports-counter-profiles'],
    enabled: true,
    queryFn: async () =>
      counterProfileApi.getCounterProfiles({
        activeOnly: true,
      }),
  });

  const { data: partyProfileTypeOptions = [] } = usePartyProfileTypes();

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

  const allStateOptions = useMemo<IReportSelectOption[]>(() => {
    const seen = new Set<string>();
    return accessibleBranchProfiles.flatMap(branch => {
      const state = branch.state;
      if (!state?.id || seen.has(state.id)) {
        return [];
      }
      seen.add(state.id);
      return [
        {
          id: state.id,
          label: buildReportOptionLabel(state.code, state.name),
        },
      ];
    });
  }, [accessibleBranchProfiles]);

  const allBranchOptions = useMemo<IReportSelectOption[]>(() => {
    return uniqueOptions(
      accessibleBranchProfiles.map(branch => ({
        id: branch.id,
        label: buildReportOptionLabel(branch.code, branch.name),
      }))
    );
  }, [accessibleBranchProfiles]);

  const selectedStateSet = useMemo(() => new Set(stateIds), [stateIds]);

  const visibleBranchOptions = useMemo<IReportSelectOption[]>(() => {
    if (stateIds.length === 0) {
      return allBranchOptions;
    }

    return uniqueOptions(
      accessibleBranchProfiles
        .filter(
          branch => branch.state?.id && selectedStateSet.has(branch.state.id)
        )
        .map(branch => ({
          id: branch.id,
          label: buildReportOptionLabel(branch.code, branch.name),
        }))
    );
  }, [
    accessibleBranchProfiles,
    allBranchOptions,
    selectedStateSet,
    stateIds.length,
  ]);

  const visibleBranchIds = useMemo(
    () => visibleBranchOptions.map(option => option.id),
    [visibleBranchOptions]
  );

  const selectedCounterBranchIds = useMemo(() => {
    if (counterIds.length === 0) {
      return [];
    }

    return uniqueOptions(
      accessibleBranchProfiles
        .filter(branch =>
          branch.connectCounterIds?.some(counterId =>
            counterIds.includes(counterId)
          )
        )
        .map(branch => ({
          id: branch.id,
          label: buildReportOptionLabel(branch.code, branch.name),
        }))
    ).map(option => option.id);
  }, [accessibleBranchProfiles, counterIds]);

  const selectedVisibleBranchIds = useMemo(
    () => branchIds.filter(branchId => visibleBranchIds.includes(branchId)),
    [branchIds, visibleBranchIds]
  );

  const reportBranchIds = useMemo(() => {
    const branchSelection =
      selectedVisibleBranchIds.length > 0
        ? selectedVisibleBranchIds
        : visibleBranchIds;

    if (counterIds.length === 0) {
      return branchSelection;
    }

    const allowedByCounter = new Set(selectedCounterBranchIds);
    return branchSelection.filter(branchId => allowedByCounter.has(branchId));
  }, [
    counterIds.length,
    selectedCounterBranchIds,
    selectedVisibleBranchIds,
    visibleBranchIds,
  ]);

  const activeCounterBranchIds = useMemo(
    () =>
      reportBranchIds.length > 0
        ? reportBranchIds
        : selectedVisibleBranchIds.length > 0
          ? selectedVisibleBranchIds
          : visibleBranchIds,
    [reportBranchIds, selectedVisibleBranchIds, visibleBranchIds]
  );

  const allowedCounterIds = useMemo(() => {
    if (isRestrictedUser) {
      const relevantAssignments = userAssignments.filter(assignment =>
        activeCounterBranchIds.includes(assignment.branchId)
      );
      return new Set(
        relevantAssignments.map(assignment => assignment.counterId)
      );
    }

    const selectedBranches = accessibleBranchProfiles.filter(branch =>
      activeCounterBranchIds.includes(branch.id)
    );
    return new Set(
      selectedBranches.flatMap(branch => branch.connectCounterIds ?? [])
    );
  }, [
    accessibleBranchProfiles,
    activeCounterBranchIds,
    isRestrictedUser,
    userAssignments,
  ]);

  const branchCounters = useMemo<IReportSelectOption[]>(() => {
    if (activeCounterBranchIds.length === 0) {
      return [];
    }

    if (isRestrictedUser) {
      return uniqueOptions(
        userAssignments
          .filter(assignment =>
            activeCounterBranchIds.includes(assignment.branchId)
          )
          .map(assignment => ({
            id: assignment.counterId,
            label: assignment.counterName || assignment.counterId,
          }))
          .filter(option => Boolean(option.id))
      );
    }

    return uniqueOptions(
      counterProfiles
        .filter(counter => allowedCounterIds.has(counter.id))
        .map(counter => ({
          id: counter.id,
          label: `${counter.counterNo} - ${counter.name}`,
        }))
    );
  }, [
    allowedCounterIds,
    activeCounterBranchIds,
    counterProfiles,
    isRestrictedUser,
    userAssignments,
  ]);

  const partyTypeOptions = useMemo<IReportSelectOption[]>(
    () =>
      partyProfileTypeOptions.map(option => ({
        id: String(option.value),
        label: option.label,
      })),
    [partyProfileTypeOptions]
  );

  const allAccessibleBranchIds = useMemo(
    () => accessibleBranchProfiles.map(branch => branch.id),
    [accessibleBranchProfiles]
  );

  const partyProfileBranchIds = useMemo(
    () =>
      reportBranchIds.length > 0
        ? reportBranchIds
        : visibleBranchIds.length > 0
          ? visibleBranchIds
          : allAccessibleBranchIds,
    [allAccessibleBranchIds, reportBranchIds, visibleBranchIds]
  );

  const typeFilterValue = useMemo(
    () => (partyTypeCodes.length > 0 ? [...partyTypeCodes] : undefined),
    [partyTypeCodes]
  );

  const partyProfilesQuery = useInfiniteQuery({
    queryKey: [
      'reports-party-profiles',
      debouncedPartyProfileSearch,
      typeFilterValue,
      stateIds,
      partyProfileBranchIds,
    ],
    enabled: partyTypeCodes.length > 0,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      partyProfileApi.getPartyProfiles(
        {
          search: debouncedPartyProfileSearch.trim() || undefined,
          activeOnly: true,
          page: Number(pageParam) || 1,
          limit: PAGE_SIZE,
          branchIds: partyProfileBranchIds,
        },
        partyTypeCodes as PartyProfileType[]
      ),
    getNextPageParam: lastPage => {
      if (lastPage.page >= lastPage.totalPages) {
        return undefined;
      }
      return lastPage.page + 1;
    },
  });

  const partyProfiles = useMemo(
    () => partyProfilesQuery.data?.pages.flatMap(page => page.data) ?? [],
    [partyProfilesQuery.data]
  );
  const partyProfilesTotalItems =
    partyProfilesQuery.data?.pages[0]?.totalItems ?? 0;

  const visibleCounterIds = useMemo(
    () => counterIds.filter(counterId => allowedCounterIds.has(counterId)),
    [allowedCounterIds, counterIds]
  );

  const selectedStateIds = useMemo(
    () =>
      stateIds.filter(stateId =>
        allStateOptions.some(option => option.id === stateId)
      ),
    [allStateOptions, stateIds]
  );

  const selectedBranchIds = useMemo(
    () =>
      branchIds.filter(branchId =>
        visibleBranchOptions.some(option => option.id === branchId)
      ),
    [branchIds, visibleBranchOptions]
  );

  const resetPartyProfileSelection = () => {
    setPartyProfileSelection({
      allSelected: false,
      selectedIds: [],
      excludedIds: [],
    });
  };

  const isPartyProfileSelected = (id: string) => {
    if (partyProfileSelection.allSelected) {
      return !partyProfileSelection.excludedIds.includes(id);
    }

    return partyProfileSelection.selectedIds.includes(id);
  };

  const togglePartyProfile = (id: string, checked: boolean) => {
    setPartyProfileSelection(current => {
      if (current.allSelected) {
        return {
          ...current,
          excludedIds: checked
            ? current.excludedIds.filter(item => item !== id)
            : current.excludedIds.includes(id)
              ? current.excludedIds
              : [...current.excludedIds, id],
        };
      }

      return {
        ...current,
        selectedIds: toggleId(current.selectedIds, id, checked),
      };
    });
  };

  const toggleSelectAllPartyProfiles = (checked: boolean) => {
    setPartyProfileSelection({
      allSelected: checked,
      selectedIds: checked ? [] : [],
      excludedIds: [],
    });
  };

  const pruneBranchAndCounterSelections = (nextStateIds: string[]) => {
    const nextVisibleBranchIds = uniqueOptions(
      accessibleBranchProfiles
        .filter(branch => {
          if (nextStateIds.length === 0) {
            return true;
          }

          return branch.state?.id && nextStateIds.includes(branch.state.id);
        })
        .map(branch => ({
          id: branch.id,
          label: buildReportOptionLabel(branch.code, branch.name),
        }))
    ).map(option => option.id);

    setBranchIds(current =>
      current.filter(branchId => nextVisibleBranchIds.includes(branchId))
    );

    setCounterIds(current =>
      current.filter(counterId => {
        const matchingBranch = accessibleBranchProfiles.find(branch =>
          branch.connectCounterIds?.includes(counterId)
        );

        return Boolean(
          matchingBranch && nextVisibleBranchIds.includes(matchingBranch.id)
        );
      })
    );
  };

  const toggleState = (id: string, checked: boolean) => {
    const nextStateIds = toggleId(stateIds, id, checked);
    setStateIds(nextStateIds);
    pruneBranchAndCounterSelections(nextStateIds);
    resetPartyProfileSelection();
  };

  const toggleAllStates = (checked: boolean) => {
    const nextStateIds = checked
      ? allStateOptions.map(option => option.id)
      : [];
    setStateIds(nextStateIds);
    pruneBranchAndCounterSelections(nextStateIds);
    resetPartyProfileSelection();
  };

  const toggleBranch = (id: string, checked: boolean) => {
    setBranchIds(current => toggleId(current, id, checked));
    resetPartyProfileSelection();
  };

  const toggleAllBranches = (checked: boolean) => {
    setBranchIds(checked ? visibleBranchOptions.map(option => option.id) : []);
    resetPartyProfileSelection();
  };

  const toggleCounter = (id: string, checked: boolean) => {
    setCounterIds(current => toggleId(current, id, checked));
  };

  const toggleAllCounters = (checked: boolean) => {
    setCounterIds(checked ? branchCounters.map(option => option.id) : []);
  };

  const togglePartyType = (id: string, checked: boolean) => {
    setPartyTypeCodes(current => toggleId(current, id, checked));
    resetPartyProfileSelection();
  };

  const toggleAllPartyTypes = (checked: boolean) => {
    const nextTypes = checked ? partyTypeOptions.map(option => option.id) : [];
    setPartyTypeCodes(nextTypes);
    resetPartyProfileSelection();
  };

  const toggleTransactionType = (
    id: ReportTransactionType,
    checked: boolean
  ) => {
    setTransactionTypes(
      current => toggleId(current, id, checked) as ReportTransactionType[]
    );
  };

  const toggleAllTransactionTypes = (checked: boolean) => {
    setTransactionTypes(
      checked
        ? [ReportTransactionTypeEnum.PURCHASE, ReportTransactionTypeEnum.SALE]
        : []
    );
  };

  const resetFilters = () => {
    setDateRange(buildReportDateRange(ReportDatePresetEnum.TODAY));
    setStateIds([]);
    setBranchIds([]);
    setCounterIds([]);
    setPartyTypeCodes([]);
    setTransactionTypes([
      ReportTransactionTypeEnum.PURCHASE,
      ReportTransactionTypeEnum.SALE,
    ]);
    setSortBy(ReportSortByEnum.DATE_ASC);
    setPartyProfileSelection({
      allSelected: false,
      selectedIds: [],
      excludedIds: [],
    });
    setPartyProfileSearch('');
    setAppliedFilters(null);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleView = () => {
    const nextTransactionTypes =
      transactionTypes.length > 0
        ? transactionTypes
        : [ReportTransactionTypeEnum.PURCHASE, ReportTransactionTypeEnum.SALE];

    const nextAppliedFilters: IReportFiltersState = {
      dateRange,
      stateIds: selectedStateIds,
      branchIds: reportBranchIds,
      counterIds: visibleCounterIds,
      partyTypeCodes,
      partyProfileSearch,
      partyProfileSelection,
      transactionTypes: nextTransactionTypes,
      sortBy,
    };

    const nextSearchParams = buildSearchParams(undefined, next => {
      setSearchParamValue(next, 'datePreset', dateRange.preset);
      if (dateRange.preset === ReportDatePresetEnum.CUSTOM) {
        setSearchParamValue(next, 'startDate', dateRange.startDate);
        setSearchParamValue(next, 'endDate', dateRange.endDate);
      }
      setSearchParamList(next, 'stateIds', selectedStateIds);
      setSearchParamList(next, 'branchIds', reportBranchIds);
      setSearchParamList(next, 'counterIds', visibleCounterIds);
      setSearchParamList(next, 'partyTypeCodes', partyTypeCodes);
      setSearchParamList(next, 'transactionTypes', nextTransactionTypes);
      setSearchParamValue(next, 'sortBy', sortBy);
      setSearchParamValue(next, 'partyProfileSearch', partyProfileSearch);
      setSearchParamBoolean(
        next,
        'partyProfileAllSelected',
        partyProfileSelection.allSelected
      );
      setSearchParamList(
        next,
        'partyProfileSelectedIds',
        partyProfileSelection.selectedIds
      );
      setSearchParamList(
        next,
        'partyProfileExcludedIds',
        partyProfileSelection.excludedIds
      );
    });

    setAppliedFilters(nextAppliedFilters);
    setSearchParams(nextSearchParams, { replace: true });
  };

  const appliedDateRangeLabel = useMemo(
    () => formatReportDateRangeLabel(dateRange),
    [dateRange]
  );

  return {
    isRestrictedUser,
    dateRange,
    setDateRange,
    appliedDateRangeLabel,
    stateOptions: allStateOptions,
    stateIds: selectedStateIds,
    setStateIds,
    stateAllSelected:
      allStateOptions.length > 0 &&
      selectedStateIds.length === allStateOptions.length,
    toggleState,
    toggleAllStates,
    branchOptions: visibleBranchOptions,
    branchIds: selectedBranchIds,
    reportBranchIds,
    setBranchIds,
    branchAllSelected:
      visibleBranchOptions.length > 0 &&
      selectedBranchIds.length === visibleBranchOptions.length,
    toggleBranch,
    toggleAllBranches,
    counterOptions: branchCounters,
    counterIds: visibleCounterIds,
    setCounterIds,
    counterAllSelected:
      branchCounters.length > 0 &&
      visibleCounterIds.length === branchCounters.length,
    toggleCounter,
    toggleAllCounters,
    partyTypeOptions,
    partyTypeCodes,
    setPartyTypeCodes,
    partyTypeAllSelected:
      partyTypeOptions.length > 0 &&
      partyTypeCodes.length === partyTypeOptions.length,
    togglePartyType,
    toggleAllPartyTypes,
    transactionTypes,
    toggleTransactionType,
    toggleAllTransactionTypes,
    sortBy,
    setSortBy,
    partyProfileSearch,
    setPartyProfileSearch,
    partyProfiles,
    partyProfilesTotalItems,
    isPartyProfilesLoading: partyProfilesQuery.isLoading,
    isPartyProfilesFetching: partyProfilesQuery.isFetching,
    hasMorePartyProfiles: Boolean(partyProfilesQuery.hasNextPage),
    loadMorePartyProfiles: partyProfilesQuery.fetchNextPage,
    partyProfileSelection,
    isPartyProfileSelected,
    togglePartyProfile,
    toggleSelectAllPartyProfiles,
    appliedFilters,
    resetFilters,
    handleView,
  };
};

export type SalePurchaseReportFilters = ReturnType<
  typeof useSalePurchaseReportFilters
>;
