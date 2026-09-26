import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useListCurrencyProfiles } from '@/modules/currencyProfile/hooks';
import { useListProductProfiles } from '@/modules/productProfile/hooks';
import { buildReportOptionLabel, toggleId } from '../utils';
import {
  buildSearchParams,
  readSearchParamList,
  setSearchParamList,
  setSearchParamValue,
} from '../utils/reportSearchParams';
import {
  ReportDatePresetEnum,
  type IProductProfitReportFiltersState,
  type IReportSelectOption,
} from '../types';
import { useSalePurchaseReportFilters } from './useSalePurchaseReportFilters';

export const useProductProfitReportFilters = () => {
  const baseFilters = useSalePurchaseReportFilters();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: currencyProfilesPage } = useListCurrencyProfiles(
    undefined,
    true
  );
  const { data: productProfilesPage } = useListProductProfiles(true);
  const searchParamsKey = searchParams.toString();
  const parsedSearchParams = useMemo(
    () => new URLSearchParams(searchParamsKey),
    [searchParamsKey]
  );

  const hydratedRouteState = useMemo(() => {
    return {
      currencyIds: readSearchParamList(parsedSearchParams, 'currencyIds'),
      productIds: readSearchParamList(parsedSearchParams, 'productIds'),
    };
  }, [parsedSearchParams]);

  const [currencyIds, setCurrencyIds] = useState<string[]>(
    hydratedRouteState.currencyIds
  );
  const [productIds, setProductIds] = useState<string[]>(
    hydratedRouteState.productIds
  );
  const [appliedFilters, setAppliedFilters] =
    useState<IProductProfitReportFiltersState | null>(
      searchParamsKey
        ? {
            dateRange: baseFilters.dateRange,
            stateIds: baseFilters.stateIds,
            branchIds: baseFilters.branchIds,
            counterIds: baseFilters.counterIds,
            partyTypeCodes: baseFilters.partyTypeCodes,
            partyProfileSearch: baseFilters.partyProfileSearch,
            partyProfileSelection: baseFilters.partyProfileSelection,
            transactionTypes: baseFilters.transactionTypes,
            sortBy: baseFilters.sortBy,
            currencyIds: hydratedRouteState.currencyIds,
            productIds: hydratedRouteState.productIds,
          }
        : null
    );

  const currencyOptions = useMemo<IReportSelectOption[]>(
    () =>
      (currencyProfilesPage?.data ?? []).map(currency => ({
        id: currency.id,
        label: buildReportOptionLabel(
          currency.currencyCode,
          currency.currencyName
        ),
      })),
    [currencyProfilesPage?.data]
  );

  const productOptions = useMemo<IReportSelectOption[]>(
    () =>
      (productProfilesPage?.data ?? []).map(product => ({
        id: product.id,
        label: buildReportOptionLabel(
          product.productCode,
          product.productDescription
        ),
      })),
    [productProfilesPage?.data]
  );

  const selectedCurrencyIds = useMemo(
    () =>
      currencyIds.filter(currencyId =>
        currencyOptions.some(option => option.id === currencyId)
      ),
    [currencyIds, currencyOptions]
  );

  const selectedProductIds = useMemo(
    () =>
      productIds.filter(productId =>
        productOptions.some(option => option.id === productId)
      ),
    [productIds, productOptions]
  );

  const currencyAllSelected =
    currencyOptions.length > 0 &&
    selectedCurrencyIds.length === currencyOptions.length;
  const productAllSelected =
    productOptions.length > 0 &&
    selectedProductIds.length === productOptions.length;

  const handleView = () => {
    const nextAppliedFilters: IProductProfitReportFiltersState = {
      dateRange: baseFilters.dateRange,
      stateIds: baseFilters.stateIds,
      branchIds: baseFilters.branchIds,
      counterIds: baseFilters.counterIds,
      partyTypeCodes: baseFilters.partyTypeCodes,
      partyProfileSearch: baseFilters.partyProfileSearch,
      partyProfileSelection: baseFilters.partyProfileSelection,
      transactionTypes: baseFilters.transactionTypes,
      sortBy: baseFilters.sortBy,
      currencyIds: selectedCurrencyIds,
      productIds: selectedProductIds,
    };

    const nextSearchParams = buildSearchParams(undefined, next => {
      setSearchParamValue(next, 'datePreset', baseFilters.dateRange.preset);
      if (baseFilters.dateRange.preset === ReportDatePresetEnum.CUSTOM) {
        setSearchParamValue(
          next,
          'startDate',
          baseFilters.dateRange.startDate
        );
        setSearchParamValue(next, 'endDate', baseFilters.dateRange.endDate);
      }
      setSearchParamList(next, 'stateIds', baseFilters.stateIds);
      setSearchParamList(next, 'branchIds', baseFilters.branchIds);
      setSearchParamList(next, 'counterIds', baseFilters.counterIds);
      setSearchParamList(next, 'partyTypeCodes', baseFilters.partyTypeCodes);
      setSearchParamList(
        next,
        'transactionTypes',
        baseFilters.transactionTypes
      );
      setSearchParamValue(next, 'sortBy', baseFilters.sortBy);
      setSearchParamList(next, 'currencyIds', selectedCurrencyIds);
      setSearchParamList(next, 'productIds', selectedProductIds);
    });

    setAppliedFilters(nextAppliedFilters);
    setSearchParams(nextSearchParams, { replace: true });
  };

  const resetFilters = () => {
    baseFilters.resetFilters();
    setCurrencyIds([]);
    setProductIds([]);
    setAppliedFilters(null);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const toggleCurrency = (id: string, checked: boolean) => {
    setCurrencyIds(current => toggleId(current, id, checked));
  };

  const toggleAllCurrencies = (checked: boolean) => {
    setCurrencyIds(checked ? currencyOptions.map(option => option.id) : []);
  };

  const toggleProduct = (id: string, checked: boolean) => {
    setProductIds(current => toggleId(current, id, checked));
  };

  const toggleAllProducts = (checked: boolean) => {
    setProductIds(checked ? productOptions.map(option => option.id) : []);
  };

  return {
    ...baseFilters,
    currencyOptions,
    currencyIds: selectedCurrencyIds,
    setCurrencyIds,
    currencyAllSelected,
    toggleCurrency,
    toggleAllCurrencies,
    productOptions,
    productIds: selectedProductIds,
    setProductIds,
    productAllSelected,
    toggleProduct,
    toggleAllProducts,
    appliedFilters,
    handleView,
    resetFilters,
  };
};

export type ProductProfitReportFilters = ReturnType<
  typeof useProductProfitReportFilters
>;
