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
import { FLM1_DEFAULT_PRODUCT_CODE } from '../constants/flm1DailyCnSummaryConstants';
import {
  ReportDatePresetEnum,
  type IReportDateRange,
  type IReportSelectOption,
} from '../types';

export interface Flm1DailyCnSummaryFiltersState {
  dateRange: IReportDateRange;
  branchIds: string[];
  productId: string;
  branchOptions: IReportSelectOption[];
  productOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  setDateRange: (value: IReportDateRange) => void;
  setProductId: (value: string) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    branchIds: string[];
    productId: string;
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
}

const toOption = (id: string, label: string): IReportSelectOption => ({ id, label });

export const useFlm1DailyCnSummaryFilters = (): Flm1DailyCnSummaryFiltersState => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isRestrictedUser = !user?.isAdmin && !user?.isHo && !user?.isHoStaff;
  const userAssignments = useMemo(() => user?.assignments ?? [], [user?.assignments]);
  const searchParamsKey = searchParams.toString();
  const parsedSearchParams = useMemo(
    () => new URLSearchParams(searchParamsKey),
    [searchParamsKey],
  );

  const hydratedRouteState = useMemo(() => {
    return {
      dateRange: readDateRangeSearchParams(
        parsedSearchParams,
        ReportDatePresetEnum.TODAY,
      ),
      branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
      productId: readSearchParamValue(parsedSearchParams, 'productId'),
    };
  }, [parsedSearchParams]);

  const [dateRange, setDateRange] = useState<IReportDateRange>(
    hydratedRouteState.dateRange,
  );
  const [branchIds, setBranchIds] = useState<string[]>(hydratedRouteState.branchIds);
  const [productId, setProductId] = useState(hydratedRouteState.productId);
  const [appliedFilters, setAppliedFilters] = useState<
    Flm1DailyCnSummaryFiltersState['appliedFilters']
  >(
    searchParamsKey
      ? {
          dateRange: hydratedRouteState.dateRange,
          branchIds: hydratedRouteState.branchIds,
          productId: hydratedRouteState.productId,
        }
      : null,
  );

  const { data: branchProfiles = [] } = useQuery({
    queryKey: ['reports-flm1-branch-profiles'],
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
        String(product.productCode ?? '').toUpperCase() === FLM1_DEFAULT_PRODUCT_CODE,
    );
    return cnProduct?.id ?? productOptions[0]?.id ?? '';
  }, [productOptions, productProfiles]);

  const selectedBranchIds = useMemo(
    () => branchIds.filter(branchId => branchOptions.some(option => option.id === branchId)),
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

  const resetFilters = () => {
    setDateRange(buildReportDateRange(ReportDatePresetEnum.TODAY));
    setBranchIds([]);
    setProductId(defaultProductId);
    setAppliedFilters(null);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleView = () => {
    if (!selectedProductId || !dateRange.startDate) {
      return;
    }

    const accessibleBranchIds = branchOptions.map(option => option.id);
    const effectiveBranchIds = isRestrictedUser
      ? selectedBranchIds.length > 0
        ? selectedBranchIds
        : accessibleBranchIds
      : selectedBranchIds;

    if (isRestrictedUser && selectedBranchIds.length === 0 && effectiveBranchIds.length > 0) {
      setBranchIds(effectiveBranchIds);
    }

    const nextAppliedFilters = {
      dateRange,
      branchIds: effectiveBranchIds,
      productId: selectedProductId,
    };

    const nextSearchParams = buildSearchParams(undefined, next => {
      setSearchParamValue(next, 'datePreset', dateRange.preset);
      setSearchParamValue(next, 'startDate', dateRange.startDate);
      setSearchParamValue(next, 'endDate', dateRange.startDate);
      setSearchParamList(next, 'branchIds', effectiveBranchIds);
      setSearchParamValue(next, 'productId', selectedProductId);
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
    productId: selectedProductId,
    branchOptions,
    productOptions,
    branchAllSelected,
    setDateRange,
    setProductId,
    toggleBranch,
    toggleAllBranches,
    resetFilters,
    handleView,
    appliedFilters,
    appliedDateRangeLabel,
    canView: Boolean(selectedProductId && dateRange.startDate),
  };
};

export default useFlm1DailyCnSummaryFilters;
