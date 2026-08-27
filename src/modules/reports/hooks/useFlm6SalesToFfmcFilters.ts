import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { branchProfileApi } from '@/api';
import { useListProductProfiles } from '@/modules/productProfile/hooks';
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
  DEFAULT_FLM_REPORT_LAYOUT,
  parseFlmReportLayout,
  type FlmReportLayout,
} from '../constants/flmReportLayoutConstants';
import {
  FLM6_DEFAULT_PRODUCT_CODE,
  Flm6ReportViewEnum,
  type Flm6ReportView,
} from '../constants/flm6SalesToFfmcConstants';
import {
  FLM_FFMC_PROFILE_IDS,
  normalizeFlmFfmcPartyProfileType,
} from '../constants/flmFfmcProfileConstants';
import { usePartyProfileTypes } from '@/modules/partyProfiles/hooks';
import {
  ReportDatePresetEnum,
  type IReportDateRange,
  type IReportSelectOption,
} from '../types';

export interface Flm6SalesToFfmcFiltersState {
  dateRange: IReportDateRange;
  branchIds: string[];
  profileTypes: string[];
  productId: string;
  view: Flm6ReportView;
  layout: FlmReportLayout;
  branchOptions: IReportSelectOption[];
  profileOptions: IReportSelectOption[];
  productOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  profileAllSelected: boolean;
  setDateRange: (value: IReportDateRange) => void;
  setProductId: (value: string) => void;
  setView: (value: Flm6ReportView) => void;
  setLayout: (value: FlmReportLayout) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  toggleProfile: (id: string, checked: boolean) => void;
  toggleAllProfiles: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    branchIds: string[];
    profileTypes: string[];
    productId: string;
    view: Flm6ReportView;
    layout: FlmReportLayout;
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
}

const toOption = (id: string, label: string): IReportSelectOption => ({
  id,
  label,
});

const parseView = (value: string): Flm6ReportView =>
  value === Flm6ReportViewEnum.EXTENDED
    ? Flm6ReportViewEnum.EXTENDED
    : Flm6ReportViewEnum.NORMAL;

const normalizeProfileTypeList = (values: string[]) => [
  ...new Set(
    values
      .map(value => normalizeFlmFfmcPartyProfileType(value))
      .filter((value): value is NonNullable<typeof value> => Boolean(value))
  ),
];

const parseProfileTypes = (values: string[], availableIds: string[]) => {
  const selected = normalizeProfileTypeList(values).filter(value =>
    availableIds.length ? availableIds.includes(value) : true
  );
  if (selected.length) {
    return selected;
  }
  return availableIds.length ? [...availableIds] : [...FLM_FFMC_PROFILE_IDS];
};

export const useFlm6SalesToFfmcFilters = (): Flm6SalesToFfmcFiltersState => {
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
    return {
      dateRange: readDateRangeSearchParams(
        parsedSearchParams,
        ReportDatePresetEnum.TODAY
      ),
      branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
      profileTypes: normalizeProfileTypeList(
        readSearchParamList(parsedSearchParams, 'profileTypes')
      ),
      productId: readSearchParamValue(parsedSearchParams, 'productId'),
      view: parseView(readSearchParamValue(parsedSearchParams, 'view')),
      layout: parseFlmReportLayout(
        readSearchParamValue(parsedSearchParams, 'layout') ||
          DEFAULT_FLM_REPORT_LAYOUT
      ),
    };
  }, [parsedSearchParams]);

  const [dateRange, setDateRange] = useState<IReportDateRange>(
    hydratedRouteState.dateRange
  );
  const [branchIds, setBranchIds] = useState<string[]>(
    hydratedRouteState.branchIds
  );
  const [profileTypes, setProfileTypes] = useState<string[]>(
    hydratedRouteState.profileTypes.length
      ? hydratedRouteState.profileTypes
      : [...FLM_FFMC_PROFILE_IDS]
  );
  const [productId, setProductId] = useState(hydratedRouteState.productId);
  const [view, setViewState] = useState<Flm6ReportView>(
    hydratedRouteState.view
  );
  const [layout, setLayoutState] = useState<FlmReportLayout>(
    hydratedRouteState.layout
  );
  const [appliedFilters, setAppliedFilters] = useState<
    Flm6SalesToFfmcFiltersState['appliedFilters']
  >(
    searchParamsKey
      ? {
          dateRange: hydratedRouteState.dateRange,
          branchIds: hydratedRouteState.branchIds,
          profileTypes: hydratedRouteState.profileTypes.length
            ? hydratedRouteState.profileTypes
            : [...FLM_FFMC_PROFILE_IDS],
          productId: hydratedRouteState.productId,
          view: hydratedRouteState.view,
          layout: hydratedRouteState.layout,
        }
      : null
  );

  const { data: branchProfiles = [] } = useQuery({
    queryKey: ['reports-flm6-branch-profiles'],
    enabled: true,
    queryFn: async () =>
      branchProfileApi.getBranchProfiles({
        activeOnly: true,
      }),
  });

  const { data: productProfiles = [] } = useListProductProfiles(true);
  const { data: partyProfileTypes = [] } = usePartyProfileTypes();

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

  const productOptions = useMemo<IReportSelectOption[]>(
    () =>
      uniqueOptions(
        productProfiles.map(product =>
          toOption(
            product.id,
            buildReportOptionLabel(
              product.productCode,
              product.productDescription
            )
          )
        )
      ),
    [productProfiles]
  );

  const defaultProductId = useMemo(() => {
    const cnProduct = productProfiles.find(
      product =>
        String(product.productCode ?? '').toUpperCase() ===
        FLM6_DEFAULT_PRODUCT_CODE
    );
    return cnProduct?.id ?? productOptions[0]?.id ?? '';
  }, [productOptions, productProfiles]);

  const selectedBranchIds = useMemo(
    () =>
      branchIds.filter(branchId =>
        branchOptions.some(option => option.id === branchId)
      ),
    [branchIds, branchOptions]
  );
  const selectedProductId = productOptions.some(
    option => option.id === productId
  )
    ? productId
    : defaultProductId;

  const profileOptions = useMemo<IReportSelectOption[]>(
    () =>
      uniqueOptions(
        partyProfileTypes
          .map(option => {
            const id = normalizeFlmFfmcPartyProfileType(option.value);
            if (!id) {
              return null;
            }
            return toOption(id, option.label);
          })
          .filter((option): option is IReportSelectOption => Boolean(option))
      ),
    [partyProfileTypes]
  );
  const availableProfileIds = useMemo(
    () => profileOptions.map(option => option.id),
    [profileOptions]
  );
  const selectedProfileTypes = useMemo(() => {
    const filtered = profileTypes.filter(value =>
      availableProfileIds.includes(value)
    );
    if (filtered.length || !availableProfileIds.length) {
      return filtered.length ? filtered : profileTypes;
    }
    return [...availableProfileIds];
  }, [availableProfileIds, profileTypes]);

  const branchAllSelected =
    branchOptions.length > 0 &&
    selectedBranchIds.length === branchOptions.length;
  const profileAllSelected =
    profileOptions.length > 0 &&
    selectedProfileTypes.length === profileOptions.length;

  const toggleBranch = (id: string, checked: boolean) => {
    setBranchIds(current => toggleId(current, id, checked));
  };

  const toggleAllBranches = (checked: boolean) => {
    setBranchIds(checked ? branchOptions.map(option => option.id) : []);
  };

  const toggleProfile = (id: string, checked: boolean) => {
    setProfileTypes(current => toggleId(current, id, checked));
  };

  const toggleAllProfiles = (checked: boolean) => {
    setProfileTypes(checked ? [...availableProfileIds] : []);
  };

  const writeSearchParams = (
    nextDateRange: IReportDateRange,
    nextBranchIds: string[],
    nextProfileTypes: string[],
    nextProductId: string,
    nextView: Flm6ReportView,
    nextLayout: FlmReportLayout
  ) => {
    const profileTypesForUrl =
      availableProfileIds.length > 0 &&
      nextProfileTypes.length === availableProfileIds.length
        ? []
        : nextProfileTypes;
    return buildSearchParams(undefined, next => {
      setSearchParamValue(next, 'datePreset', nextDateRange.preset);
      setSearchParamValue(next, 'startDate', nextDateRange.startDate);
      setSearchParamValue(next, 'endDate', nextDateRange.endDate);
      setSearchParamList(next, 'branchIds', nextBranchIds);
      setSearchParamList(next, 'profileTypes', profileTypesForUrl);
      setSearchParamValue(next, 'productId', nextProductId);
      setSearchParamValue(next, 'view', nextView);
      setSearchParamValue(next, 'layout', nextLayout);
    });
  };

  const setView = (nextView: Flm6ReportView) => {
    setViewState(nextView);
    if (!appliedFilters) {
      return;
    }
    setAppliedFilters({
      ...appliedFilters,
      view: nextView,
    });
    setSearchParams(
      writeSearchParams(
        appliedFilters.dateRange,
        appliedFilters.branchIds,
        appliedFilters.profileTypes,
        appliedFilters.productId,
        nextView,
        appliedFilters.layout
      ),
      { replace: true }
    );
  };

  const setLayout = (nextLayout: FlmReportLayout) => {
    setLayoutState(nextLayout);
    if (!appliedFilters) {
      return;
    }
    setAppliedFilters({
      ...appliedFilters,
      layout: nextLayout,
    });
    setSearchParams(
      writeSearchParams(
        appliedFilters.dateRange,
        appliedFilters.branchIds,
        appliedFilters.profileTypes,
        appliedFilters.productId,
        appliedFilters.view,
        nextLayout
      ),
      { replace: true }
    );
  };

  const resetFilters = () => {
    setDateRange(buildReportDateRange(ReportDatePresetEnum.TODAY));
    setBranchIds([]);
    setProfileTypes(
      availableProfileIds.length
        ? [...availableProfileIds]
        : [...FLM_FFMC_PROFILE_IDS]
    );
    setProductId(defaultProductId);
    setViewState(Flm6ReportViewEnum.NORMAL);
    setLayoutState(DEFAULT_FLM_REPORT_LAYOUT);
    setAppliedFilters(null);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleView = () => {
    if (!selectedProductId || !dateRange.startDate || !dateRange.endDate) {
      return;
    }

    const accessibleBranchIds = branchOptions.map(option => option.id);
    const effectiveBranchIds = isRestrictedUser
      ? selectedBranchIds.length > 0
        ? selectedBranchIds
        : accessibleBranchIds
      : selectedBranchIds;

    if (
      isRestrictedUser &&
      selectedBranchIds.length === 0 &&
      effectiveBranchIds.length > 0
    ) {
      setBranchIds(effectiveBranchIds);
    }

    const effectiveProfileTypes = parseProfileTypes(
      selectedProfileTypes,
      availableProfileIds
    );
    if (
      selectedProfileTypes.length === 0 ||
      selectedProfileTypes.length !== effectiveProfileTypes.length
    ) {
      setProfileTypes(effectiveProfileTypes);
    }

    const nextAppliedFilters = {
      dateRange,
      branchIds: effectiveBranchIds,
      profileTypes: effectiveProfileTypes,
      productId: selectedProductId,
      view,
      layout,
    };

    setAppliedFilters(nextAppliedFilters);
    setSearchParams(
      writeSearchParams(
        dateRange,
        effectiveBranchIds,
        effectiveProfileTypes,
        selectedProductId,
        view,
        layout
      ),
      { replace: true }
    );
  };

  const appliedDateRangeLabel = appliedFilters
    ? formatReportDateRangeLabel(appliedFilters.dateRange)
    : formatReportDateRangeLabel(dateRange);

  return {
    dateRange,
    branchIds: selectedBranchIds,
    profileTypes: selectedProfileTypes,
    productId: selectedProductId,
    view,
    layout,
    branchOptions,
    profileOptions,
    productOptions,
    branchAllSelected,
    profileAllSelected,
    setDateRange,
    setProductId,
    setView,
    setLayout,
    toggleBranch,
    toggleAllBranches,
    toggleProfile,
    toggleAllProfiles,
    resetFilters,
    handleView,
    appliedFilters,
    appliedDateRangeLabel,
    canView: Boolean(
      selectedProductId && dateRange.startDate && dateRange.endDate
    ),
  };
};

export default useFlm6SalesToFfmcFilters;
