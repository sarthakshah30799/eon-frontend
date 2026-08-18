import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { branchProfileApi } from '@/api';
import { useListCurrencyProfiles } from '@/modules/currencyProfile/hooks';
import { useListPartyProfiles } from '@/modules/partyProfiles/hooks';
import { PartyProfileTypeEnum } from '@/modules/partyProfiles/types';
import { useListProductProfiles } from '@/modules/productProfile/hooks';
import { CARD_PRODUCT_CODE } from '@/modules/purchase/utils/purchaseUtils';
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
  ReportSortByEnum,
  type ICardSettlementReportFiltersState,
  type IReportDateRange,
  type IReportSelectOption,
  type ReportSortBy,
} from '../types';

const ISSUER_PAGE_SIZE = 200;

const toOption = (id: string, label: string): IReportSelectOption => ({ id, label });

export const useCardSettlementReportFilters = () => {
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
      dateRange: readDateRangeSearchParams(parsedSearchParams, ReportDatePresetEnum.ALL),
      branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
      productIds: readSearchParamList(parsedSearchParams, 'productIds'),
      currencyIds: readSearchParamList(parsedSearchParams, 'currencyIds'),
      issuerPartyProfileIds: readSearchParamList(
        parsedSearchParams,
        'issuerPartyProfileIds',
      ),
      sortBy:
        (readSearchParamValue(parsedSearchParams, 'sortBy') as ReportSortBy) ||
        ReportSortByEnum.DATE_ASC,
    };
  }, [parsedSearchParams]);

  const [dateRange, setDateRange] = useState<IReportDateRange>(hydratedRouteState.dateRange);
  const [branchIds, setBranchIds] = useState<string[]>(hydratedRouteState.branchIds);
  const [productIds, setProductIds] = useState<string[]>(hydratedRouteState.productIds);
  const [currencyIds, setCurrencyIds] = useState<string[]>(hydratedRouteState.currencyIds);
  const [issuerPartyProfileIds, setIssuerPartyProfileIds] = useState<string[]>(
    hydratedRouteState.issuerPartyProfileIds,
  );
  const [sortBy, setSortBy] = useState<ReportSortBy>(hydratedRouteState.sortBy);
  const [appliedFilters, setAppliedFilters] =
    useState<ICardSettlementReportFiltersState | null>(
      searchParamsKey
        ? {
            dateRange: hydratedRouteState.dateRange,
            branchIds: hydratedRouteState.branchIds,
            productIds: hydratedRouteState.productIds,
            currencyIds: hydratedRouteState.currencyIds,
            issuerPartyProfileIds: hydratedRouteState.issuerPartyProfileIds,
            sortBy: hydratedRouteState.sortBy,
          }
        : null,
    );

  const {
    data: branchProfiles = [],
    isLoading: isLoadingBranches,
    isFetching: isFetchingBranches,
  } = useQuery({
    queryKey: ['reports-card-settlement-branch-profiles'],
    enabled: true,
    queryFn: async () =>
      branchProfileApi.getBranchProfiles({
        activeOnly: true,
      }),
  });

  const {
    data: currencyProfiles = [],
    isLoading: isLoadingCurrencies,
    isFetching: isFetchingCurrencies,
  } = useListCurrencyProfiles(undefined, true);

  const {
    data: productProfiles = [],
    isLoading: isLoadingProducts,
    isFetching: isFetchingProducts,
  } = useListProductProfiles(true);

  const {
    data: issuerResponse,
    isLoading: isLoadingIssuers,
    isFetching: isFetchingIssuers,
  } = useListPartyProfiles(
    { page: 1, limit: ISSUER_PAGE_SIZE, activeOnly: true },
    PartyProfileTypeEnum.CARD_ISSUER_PROFILE,
  );

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
        productProfiles
          .filter(
            product =>
              String(product.productCode ?? '').toUpperCase() === CARD_PRODUCT_CODE,
          )
          .map(product =>
            toOption(
              product.id,
              buildReportOptionLabel(product.productCode, product.productDescription),
            ),
          ),
      ),
    [productProfiles],
  );

  const currencyOptions = useMemo<IReportSelectOption[]>(
    () =>
      uniqueOptions(
        currencyProfiles.map(currency =>
          toOption(
            currency.id,
            buildReportOptionLabel(currency.currencyCode, currency.currencyName),
          ),
        ),
      ),
    [currencyProfiles],
  );

  const issuerOptions = useMemo<IReportSelectOption[]>(
    () =>
      uniqueOptions(
        (issuerResponse?.data ?? []).map(issuer =>
          toOption(issuer.id, buildReportOptionLabel(issuer.code, issuer.name)),
        ),
      ),
    [issuerResponse?.data],
  );

  const selectedBranchIds = useMemo(
    () => branchIds.filter(branchId => branchOptions.some(option => option.id === branchId)),
    [branchIds, branchOptions],
  );
  const selectedProductIds = useMemo(
    () => productIds.filter(productId => productOptions.some(option => option.id === productId)),
    [productIds, productOptions],
  );
  const selectedCurrencyIds = useMemo(
    () =>
      currencyIds.filter(currencyId => currencyOptions.some(option => option.id === currencyId)),
    [currencyIds, currencyOptions],
  );
  const selectedIssuerIds = useMemo(
    () =>
      issuerPartyProfileIds.filter(issuerId =>
        issuerOptions.some(option => option.id === issuerId),
      ),
    [issuerOptions, issuerPartyProfileIds],
  );

  const branchAllSelected =
    branchOptions.length > 0 && selectedBranchIds.length === branchOptions.length;
  const productAllSelected =
    productOptions.length > 0 && selectedProductIds.length === productOptions.length;
  const currencyAllSelected =
    currencyOptions.length > 0 && selectedCurrencyIds.length === currencyOptions.length;
  const issuerAllSelected =
    issuerOptions.length > 0 && selectedIssuerIds.length === issuerOptions.length;

  const toggleBranch = (id: string, checked: boolean) => {
    setBranchIds(current => toggleId(current, id, checked));
  };
  const toggleAllBranches = (checked: boolean) => {
    setBranchIds(checked ? branchOptions.map(option => option.id) : []);
  };
  const toggleProduct = (id: string, checked: boolean) => {
    setProductIds(current => toggleId(current, id, checked));
  };
  const toggleAllProducts = (checked: boolean) => {
    setProductIds(checked ? productOptions.map(option => option.id) : []);
  };
  const toggleCurrency = (id: string, checked: boolean) => {
    setCurrencyIds(current => toggleId(current, id, checked));
  };
  const toggleAllCurrencies = (checked: boolean) => {
    setCurrencyIds(checked ? currencyOptions.map(option => option.id) : []);
  };
  const toggleIssuer = (id: string, checked: boolean) => {
    setIssuerPartyProfileIds(current => toggleId(current, id, checked));
  };
  const toggleAllIssuers = (checked: boolean) => {
    setIssuerPartyProfileIds(checked ? issuerOptions.map(option => option.id) : []);
  };

  const resetFilters = () => {
    setDateRange(buildReportDateRange(ReportDatePresetEnum.ALL));
    setBranchIds([]);
    setProductIds([]);
    setCurrencyIds([]);
    setIssuerPartyProfileIds([]);
    setSortBy(ReportSortByEnum.DATE_ASC);
    setAppliedFilters(null);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleView = () => {
    const nextAppliedFilters: ICardSettlementReportFiltersState = {
      dateRange,
      branchIds: selectedBranchIds,
      productIds: selectedProductIds,
      currencyIds: selectedCurrencyIds,
      issuerPartyProfileIds: selectedIssuerIds,
      sortBy,
    };

    const nextSearchParams = buildSearchParams(undefined, next => {
      setSearchParamValue(next, 'datePreset', dateRange.preset);
      if (dateRange.preset === ReportDatePresetEnum.CUSTOM) {
        setSearchParamValue(next, 'startDate', dateRange.startDate);
        setSearchParamValue(next, 'endDate', dateRange.endDate);
      }
      setSearchParamList(next, 'branchIds', selectedBranchIds);
      setSearchParamList(next, 'productIds', selectedProductIds);
      setSearchParamList(next, 'currencyIds', selectedCurrencyIds);
      setSearchParamList(next, 'issuerPartyProfileIds', selectedIssuerIds);
      setSearchParamValue(next, 'sortBy', sortBy);
    });

    setAppliedFilters(nextAppliedFilters);
    setSearchParams(nextSearchParams, { replace: true });
  };

  const appliedDateRangeLabel = appliedFilters
    ? formatReportDateRangeLabel(appliedFilters.dateRange)
    : formatReportDateRangeLabel(dateRange);

  return {
    dateRange,
    setDateRange,
    branchIds: selectedBranchIds,
    productIds: selectedProductIds,
    currencyIds: selectedCurrencyIds,
    issuerPartyProfileIds: selectedIssuerIds,
    sortBy,
    setSortBy,
    branchOptions,
    productOptions,
    currencyOptions,
    issuerOptions,
    branchAllSelected,
    productAllSelected,
    currencyAllSelected,
    issuerAllSelected,
    isLoadingBranches: isLoadingBranches || isFetchingBranches,
    isLoadingProducts: isLoadingProducts || isFetchingProducts,
    isLoadingCurrencies: isLoadingCurrencies || isFetchingCurrencies,
    isLoadingIssuers: isLoadingIssuers || isFetchingIssuers,
    toggleBranch,
    toggleAllBranches,
    toggleProduct,
    toggleAllProducts,
    toggleCurrency,
    toggleAllCurrencies,
    toggleIssuer,
    toggleAllIssuers,
    resetFilters,
    handleView,
    appliedFilters,
    appliedDateRangeLabel,
  };
};

export type CardSettlementReportFilters = ReturnType<typeof useCardSettlementReportFilters>;
