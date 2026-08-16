import { useQuery } from '@tanstack/react-query';
import { currencyProfileApi } from '@/api/currencyProfile';
import { partyProfileApi } from '@/api/partyProfile';
import { productProfileApi } from '@/api/productProfile';
import { PartyProfileTypeEnum } from '@/modules/partyProfiles/types';

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
        product => product.productCode.toUpperCase() === 'CC'
      ),
  });
  const currencies = useQuery({
    queryKey: ['card-stock', 'currencies'],
    queryFn: () => currencyProfileApi.getCurrencyProfiles({ activeOnly: true }),
  });
  return {
    issuers: issuers.data ?? [],
    products: products.data ?? [],
    currencies: currencies.data ?? [],
    issuersLoading: issuers.isLoading,
    productsLoading: products.isLoading,
    currenciesLoading: currencies.isLoading,
    isLoading: issuers.isLoading || products.isLoading || currencies.isLoading,
  };
};
