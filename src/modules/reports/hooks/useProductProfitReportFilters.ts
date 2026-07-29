import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useListCurrencyProfiles } from '@/modules/currencyProfile/hooks';
import { useListProductProfiles } from '@/modules/productProfile/hooks';
import { buildReportOptionLabel, toggleId } from '../utils';
import {
  buildSearchParams,
  readSearchParamList,
  setSearchParamList,
} from '../utils/reportSearchParams';
import type {
  IProductProfitReportFiltersState,
  IReportSelectOption,
} from '../types';
import { useSalePurchaseReportFilters } from './useSalePurchaseReportFilters';

export const useProductProfitReportFilters = () => {
  const baseFilters = useSalePurchaseReportFilters();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: currencyProfiles = [] } = useListCurrencyProfiles(undefined, true);
  const { data: productProfiles = [] } = useListProductProfiles(true);
  const searchParamsKey = searchParams.toString();
  const parsedSearchParams = useMemo(() => new URLSearchParams(searchParamsKey), [searchParamsKey]);

  const hydratedRouteState = useMemo(() => {
    return {
      currencyIds: readSearchParamList(parsedSearchParams, 'currencyIds'),
      productIds: readSearchParamList(parsedSearchParams, 'productIds'),
    };
  }, [parsedSearchParams]);

  const [currencyIds, setCurrencyIds] = useState<string[]>(hydratedRouteState.currencyIds);
  const [productIds, setProductIds] = useState<string[]>(hydratedRouteState.productIds);
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
        : null,
    );

  const currencyOptions = useMemo<IReportSelectOption[]>(
    () =>
      currencyProfiles.map(currency => ({
        id: currency.id,
        label: buildReportOptionLabel(currency.currencyCode, currency.currencyName),
      })),
    [currencyProfiles],
  );

  const productOptions = useMemo<IReportSelectOption[]>(
    () =>
      productProfiles.map(product => ({
        id: product.id,
        label: buildReportOptionLabel(product.productCode, product.productDescription),
      })),
    [productProfiles],
  );

  const selectedCurrencyIds = useMemo(
    () => currencyIds.filter(currencyId => currencyOptions.some(option => option.id === currencyId)),
    [currencyIds, currencyOptions],
  );

  const selectedProductIds = useMemo(
    () => productIds.filter(productId => productOptions.some(option => option.id === productId)),
    [productIds, productOptions],
  );

  const currencyAllSelected =
    currencyOptions.length > 0 && selectedCurrencyIds.length === currencyOptions.length;
  const productAllSelected =
    productOptions.length > 0 && selectedProductIds.length === productOptions.length;

  const handleView = () => {
    const nextAppliedFilters: IProductProfitReportFiltersState = {
      dateRange: baseFilters.appliedFilters?.dateRange ?? baseFilters.dateRange,
      stateIds: baseFilters.appliedFilters?.stateIds ?? baseFilters.stateIds,
      branchIds: baseFilters.appliedFilters?.branchIds ?? baseFilters.branchIds,
      counterIds: baseFilters.appliedFilters?.counterIds ?? baseFilters.counterIds,
      partyTypeCodes: baseFilters.appliedFilters?.partyTypeCodes ?? baseFilters.partyTypeCodes,
      partyProfileSearch: baseFilters.appliedFilters?.partyProfileSearch ?? baseFilters.partyProfileSearch,
      partyProfileSelection:
        baseFilters.appliedFilters?.partyProfileSelection ?? baseFilters.partyProfileSelection,
      transactionTypes: baseFilters.appliedFilters?.transactionTypes ?? baseFilters.transactionTypes,
      sortBy: baseFilters.appliedFilters?.sortBy ?? baseFilters.sortBy,
      currencyIds: selectedCurrencyIds,
      productIds: selectedProductIds,
    };

    const nextSearchParams = buildSearchParams(undefined, next => {
      setSearchParamList(next, 'stateIds', baseFilters.stateIds);
      setSearchParamList(next, 'branchIds', baseFilters.branchIds);
      setSearchParamList(next, 'counterIds', baseFilters.counterIds);
      setSearchParamList(next, 'partyTypeCodes', baseFilters.partyTypeCodes);
      setSearchParamList(next, 'transactionTypes', baseFilters.transactionTypes);
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

export type ProductProfitReportFilters = ReturnType<typeof useProductProfitReportFilters>;
