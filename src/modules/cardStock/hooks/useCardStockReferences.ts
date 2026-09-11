import { useQuery } from '@tanstack/react-query';
import { currencyProfileApi } from '@/api/currencyProfile';
import { partyProfileApi } from '@/api/partyProfile';
import { productProfileApi } from '@/api/productProfile';
import { PartyProfileTypeEnum } from '@/modules/partyProfiles/types';
import {
  isCardProductCode,
  MULTI_CURRENCY_CARD_PRODUCT_CODE,
} from '@/modules/purchase/utils/purchaseUtils';

export const useCardStockReferences = () => {
  const issuers = useQuery({
    queryKey: ['card-stock', 'issuers'],
    queryFn: () =>
      partyProfileApi.getAllPartyProfiles({
        activeOnly: true,
        status: 'APPROVE',
        type: PartyProfileTypeEnum.CARD_ISSUER_PROFILE,
      }),
  });
  const products = useQuery({
    queryKey: ['card-stock', 'products'],
    queryFn: async () =>
      (
        await productProfileApi.getAllProductProfiles({ activeOnly: true })
      ).filter(product => isCardProductCode(product.productCode)),
    staleTime: 0,
    refetchOnMount: 'always',
  });
  // Tradable currencies for CC card stock (only-stocking excluded by API default).
  const tradableCurrencies = useQuery({
    queryKey: ['card-stock', 'currencies', 'tradable-active'],
    queryFn: () =>
      currencyProfileApi.getAllCurrencyProfiles({
        activeOnly: true,
      }),
  });
  // Only-stocking currencies are fetched only for multi-currency (CM) card stock.
  const cmStockingCurrencies = useQuery({
    queryKey: ['card-stock', 'currencies', 'cm-only-stocking-active'],
    queryFn: () =>
      currencyProfileApi.getAllCurrencyProfiles({
        activeOnly: true,
        includeOnlyStocking: true,
        productAllowed: MULTI_CURRENCY_CARD_PRODUCT_CODE,
      }),
  });
  const currencies = [
    ...(tradableCurrencies.data ?? []),
    ...(cmStockingCurrencies.data ?? []),
  ];
  const currenciesLoading =
    tradableCurrencies.isLoading || cmStockingCurrencies.isLoading;

  return {
    issuers: issuers.data ?? [],
    products: products.data ?? [],
    currencies,
    issuersLoading: issuers.isLoading,
    productsLoading: products.isLoading,
    currenciesLoading,
    isLoading:
      issuers.isLoading || products.isLoading || currenciesLoading,
  };
};
