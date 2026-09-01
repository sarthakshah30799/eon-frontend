import { useQuery } from '@tanstack/react-query';
import { currencyProfileApi } from '@/api/currencyProfile';
import { partyProfileApi } from '@/api/partyProfile';
import { productProfileApi } from '@/api/productProfile';
import { PartyProfileTypeEnum } from '@/modules/partyProfiles/types';
import { isCardProductCode } from '@/modules/purchase/utils/purchaseUtils';

export const useCardStockReferences = () => {
  const issuers = useQuery({
    queryKey: ['card-stock', 'issuers'],
    queryFn: async () => {
      const response = await partyProfileApi.getPartyProfiles({
        activeOnly: true,
        status: 'APPROVE',
        limit: 100,
        offset: 0,
        type: PartyProfileTypeEnum.CARD_ISSUER_PROFILE,
      });
      return response.data;
    },
  });
  const products = useQuery({
    queryKey: ['card-stock', 'products'],
    queryFn: async () =>
      (await productProfileApi.getAllProductProfiles({ activeOnly: true })).filter(
        product => isCardProductCode(product.productCode)
      ),
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const currencies = useQuery({
    queryKey: ['card-stock', 'currencies', 'all-active'],
    queryFn: () =>
      currencyProfileApi.getAllCurrencyProfiles({
        activeOnly: true,
        includeAllStockingTypes: true,
      }),
  });
  return {
    issuers: issuers.data ?? [],
    products: products.data ?? [],
    currencies: currencies.data ?? [],
    issuersLoading: issuers.isLoading,
    productsLoading: products.isLoading,
    currenciesLoading: currencies.isLoading,
    isLoading:
      issuers.isLoading || products.isLoading || currencies.isLoading,
  };
};
