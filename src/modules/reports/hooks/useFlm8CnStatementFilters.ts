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
  FLM8_DEFAULT_PRODUCT_CODE,
  Flm8ProfileTypeEnum,
  Flm8ReportViewEnum,
  type Flm8ProfileType,
  type Flm8ReportView,
} from '../constants/flm8CnStatementConstants';
import {
  ReportDatePresetEnum,
  type IReportDateRange,
  type IReportSelectOption,
} from '../types';

export interface Flm8CnStatementFiltersState {
  dateRange: IReportDateRange;
  branchIds: string[];
  productId: string;
  profileType: Flm8ProfileType | '';
  apConnect: boolean;
  view: Flm8ReportView;
  branchOptions: IReportSelectOption[];
  productOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  setDateRange: (value: IReportDateRange) => void;
  setProductId: (value: string) => void;
  setProfileType: (value: Flm8ProfileType | '') => void;
  setApConnect: (value: boolean) => void;
  setView: (value: Flm8ReportView) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    branchIds: string[];
    productId: string;
    profileType: Flm8ProfileType;
    apConnect: boolean;
    view: Flm8ReportView;
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
}

const toOption = (id: string, label: string): IReportSelectOption => ({ id, label });

const parseView = (value: string): Flm8ReportView =>
  value === Flm8ReportViewEnum.HORIZONTAL
    ? Flm8ReportViewEnum.HORIZONTAL
    : Flm8ReportViewEnum.VERTICAL;

const parseProfileType = (value: string): Flm8ProfileType | '' =>
  value === Flm8ProfileTypeEnum.FFMC || value === Flm8ProfileTypeEnum.AD
    ? value
    : '';

const parseBooleanParam = (value: string) =>
  value === 'true' || value === '1';

export const useFlm8CnStatementFilters = (): Flm8CnStatementFiltersState => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isRestrictedUser = !user?.isAdmin && !user?.isHo && !user?.isHoStaff;
  const userAssignments = useMemo(
    () => user?.assignments ?? [],
    [user?.assignments],
  );
  const searchParamsKey = searchParams.toString();
  const parsedSearchParams = useMemo(
    () => new URLSearchParams(searchParamsKey),
    [searchParamsKey],
  );

  const hydratedRouteState = useMemo(() => {
    const nextProfileType = parseProfileType(
      readSearchParamValue(parsedSearchParams, 'profileType'),
    );
    return {
      dateRange: readDateRangeSearchParams(
        parsedSearchParams,
        ReportDatePresetEnum.TODAY,
      ),
      branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
      productId: readSearchParamValue(parsedSearchParams, 'productId'),
      profileType: nextProfileType,
      apConnect:
        nextProfileType === Flm8ProfileTypeEnum.AD &&
        parseBooleanParam(readSearchParamValue(parsedSearchParams, 'apConnect')),
      view: parseView(readSearchParamValue(parsedSearchParams, 'view')),
    };
  }, [parsedSearchParams]);

  const [dateRange, setDateRange] = useState<IReportDateRange>(
    hydratedRouteState.dateRange,
  );
  const [branchIds, setBranchIds] = useState<string[]>(hydratedRouteState.branchIds);
  const [productId, setProductId] = useState(hydratedRouteState.productId);
  const [profileType, setProfileTypeState] = useState<Flm8ProfileType | ''>(
    hydratedRouteState.profileType,
  );
  const [apConnect, setApConnectState] = useState(hydratedRouteState.apConnect);
  const [view, setViewState] = useState<Flm8ReportView>(hydratedRouteState.view);
  const [appliedFilters, setAppliedFilters] = useState<
    Flm8CnStatementFiltersState['appliedFilters']
  >(
    searchParamsKey && hydratedRouteState.profileType
      ? {
          dateRange: hydratedRouteState.dateRange,
          branchIds: hydratedRouteState.branchIds,
          productId: hydratedRouteState.productId,
          profileType: hydratedRouteState.profileType,
          apConnect: hydratedRouteState.apConnect,
          view: hydratedRouteState.view,
        }
      : null,
  );

  const { data: branchProfiles = [] } = useQuery({
    queryKey: ['reports-flm8-branch-profiles'],
    enabled: true,
    queryFn: async () =>
      branchProfileApi.getBranchProfiles({
        activeOnly: true,
      }),
  });

  const { data: productProfiles = [] } = useListProductProfiles(true);

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

  const productOptions = useMemo<IReportSelectOption[]>(
    () =>
      uniqueOptions(
        productProfiles.map(product =>
          toOption(
            product.id,
            buildReportOptionLabel(product.productCode, product.productDescription),
          ),
        ),
      ),
    [productProfiles],
  );

  const defaultProductId = useMemo(() => {
    const cnProduct = productProfiles.find(
      product =>
        String(product.productCode ?? '').toUpperCase() === FLM8_DEFAULT_PRODUCT_CODE,
    );
    return cnProduct?.id ?? productOptions[0]?.id ?? '';
  }, [productOptions, productProfiles]);

  const selectedBranchIds = useMemo(
    () =>
      branchIds.filter(branchId =>
        branchOptions.some(option => option.id === branchId),
      ),
    [branchIds, branchOptions],
  );
  const selectedProductId = productOptions.some(option => option.id === productId)
    ? productId
    : defaultProductId;

  const branchAllSelected =
    branchOptions.length > 0 && selectedBranchIds.length === branchOptions.length;

  const toggleBranch = (id: string, checked: boolean) => {
    setBranchIds(current => toggleId(current, id, checked));
  };

  const toggleAllBranches = (checked: boolean) => {
    setBranchIds(checked ? branchOptions.map(option => option.id) : []);
  };

  const writeSearchParams = (
    nextDateRange: IReportDateRange,
    nextBranchIds: string[],
    nextProductId: string,
    nextProfileType: Flm8ProfileType | '',
    nextApConnect: boolean,
    nextView: Flm8ReportView,
  ) => {
    return buildSearchParams(undefined, next => {
      setSearchParamValue(next, 'datePreset', nextDateRange.preset);
      setSearchParamValue(next, 'startDate', nextDateRange.startDate);
      setSearchParamValue(next, 'endDate', nextDateRange.endDate);
      setSearchParamList(next, 'branchIds', nextBranchIds);
      setSearchParamValue(next, 'productId', nextProductId);
      setSearchParamValue(next, 'profileType', nextProfileType);
      setSearchParamValue(
        next,
        'apConnect',
        nextProfileType === Flm8ProfileTypeEnum.AD && nextApConnect ? 'true' : '',
      );
      setSearchParamValue(next, 'view', nextView);
    });
  };

  const setProfileType = (nextProfileType: Flm8ProfileType | '') => {
    setProfileTypeState(nextProfileType);
    if (nextProfileType !== Flm8ProfileTypeEnum.AD) {
      setApConnectState(false);
    }
  };

  const setApConnect = (value: boolean) => {
    if (profileType !== Flm8ProfileTypeEnum.AD) {
      setApConnectState(false);
      return;
    }
    setApConnectState(value);
  };

  const setView = (nextView: Flm8ReportView) => {
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
        appliedFilters.productId,
        appliedFilters.profileType,
        appliedFilters.apConnect,
        nextView,
      ),
      { replace: true },
    );
  };

  const resetFilters = () => {
    setDateRange(buildReportDateRange(ReportDatePresetEnum.TODAY));
    setBranchIds([]);
    setProductId(defaultProductId);
    setProfileTypeState('');
    setApConnectState(false);
    setViewState(Flm8ReportViewEnum.VERTICAL);
    setAppliedFilters(null);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleView = () => {
    if (!selectedProductId || !dateRange.startDate || !dateRange.endDate || !profileType) {
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

    const effectiveApConnect =
      profileType === Flm8ProfileTypeEnum.AD ? apConnect : false;

    const nextAppliedFilters = {
      dateRange,
      branchIds: effectiveBranchIds,
      productId: selectedProductId,
      profileType,
      apConnect: effectiveApConnect,
      view,
    };

    setAppliedFilters(nextAppliedFilters);
    setSearchParams(
      writeSearchParams(
        dateRange,
        effectiveBranchIds,
        selectedProductId,
        profileType,
        effectiveApConnect,
        view,
      ),
      { replace: true },
    );
  };

  const appliedDateRangeLabel = appliedFilters
    ? formatReportDateRangeLabel(appliedFilters.dateRange)
    : formatReportDateRangeLabel(dateRange);

  return {
    dateRange,
    branchIds: selectedBranchIds,
    productId: selectedProductId,
    profileType,
    apConnect: profileType === Flm8ProfileTypeEnum.AD ? apConnect : false,
    view,
    branchOptions,
    productOptions,
    branchAllSelected,
    setDateRange,
    setProductId,
    setProfileType,
    setApConnect,
    setView,
    toggleBranch,
    toggleAllBranches,
    resetFilters,
    handleView,
    appliedFilters,
    appliedDateRangeLabel,
    canView: Boolean(
      selectedProductId && dateRange.startDate && dateRange.endDate && profileType,
    ),
  };
};

export default useFlm8CnStatementFilters;
