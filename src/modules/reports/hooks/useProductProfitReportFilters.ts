import { useMemo, useState } from 'react';
import { useListCurrencyProfiles } from '@/modules/currencyProfile/hooks';
import { useListProductProfiles } from '@/modules/productProfile/hooks';
import { buildReportOptionLabel, toggleId } from '../utils';
import type {
  IProductProfitReportFiltersState,
  IReportSelectOption,
} from '../types';
import { useSalePurchaseReportFilters } from './useSalePurchaseReportFilters';

export const useProductProfitReportFilters = () => {
  const baseFilters = useSalePurchaseReportFilters();
  const { data: currencyProfiles = [] } = useListCurrencyProfiles(undefined, true);
  const { data: productProfiles = [] } = useListProductProfiles(true);

  const [currencyIds, setCurrencyIds] = useState<string[]>([]);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [appliedFilters, setAppliedFilters] =
    useState<IProductProfitReportFiltersState | null>(null);

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
    setAppliedFilters({
      dateRange: baseFilters.dateRange,
      stateIds: baseFilters.stateIds,
      branchIds: baseFilters.branchIds,
      counterIds: baseFilters.counterIds,
      partyTypeCodes: baseFilters.partyTypeCodes,
      partyProfileSearch: baseFilters.partyProfileSearch,
      partyProfileSelection: baseFilters.partyProfileSelection,
      transactionTypes: baseFilters.transactionTypes,
      currencyIds: selectedCurrencyIds,
      productIds: selectedProductIds,
    });
  };

  const resetFilters = () => {
    baseFilters.resetFilters();
    setCurrencyIds([]);
    setProductIds([]);
    setAppliedFilters(null);
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
