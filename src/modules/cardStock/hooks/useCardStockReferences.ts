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
    queryFn: async () => {
      const response = await partyProfileApi.getPartyProfiles({
        activeOnly: true,
        status: 'APPROVE',
        limit: 100,
        type: PartyProfileTypeEnum.CARD_ISSUER_PROFILE,
      });
      return response.data;
    },
  });
  const products = useQuery({
    queryKey: ['card-stock', 'products'],
    queryFn: async () =>
      (await productProfileApi.getProductProfiles({ activeOnly: true })).filter(
        product => isCardProductCode(product.productCode)
      ),
  });
  const tradableCurrencies = useQuery({
    queryKey: ['card-stock', 'currencies', 'tradable'],
    queryFn: () => currencyProfileApi.getCurrencyProfiles({ activeOnly: true }),
  });
  const cmStockingCurrencies = useQuery({
    queryKey: ['card-stock', 'currencies', 'cm-stocking'],
    queryFn: () =>
      currencyProfileApi.getCurrencyProfiles({
        activeOnly: true,
        includeOnlyStocking: true,
        productAllowed: MULTI_CURRENCY_CARD_PRODUCT_CODE,
      }),
  });
  return {
    issuers: issuers.data ?? [],
    products: products.data ?? [],
    tradableCurrencies: tradableCurrencies.data ?? [],
    cmStockingCurrencies: cmStockingCurrencies.data ?? [],
    /** @deprecated prefer tradableCurrencies / cmStockingCurrencies by product */
    currencies: tradableCurrencies.data ?? [],
    issuersLoading: issuers.isLoading,
    productsLoading: products.isLoading,
    currenciesLoading:
      tradableCurrencies.isLoading || cmStockingCurrencies.isLoading,
    isLoading:
      issuers.isLoading ||
      products.isLoading ||
      tradableCurrencies.isLoading ||
      cmStockingCurrencies.isLoading,
  };
};
