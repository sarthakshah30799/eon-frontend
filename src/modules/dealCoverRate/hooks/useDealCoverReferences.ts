import { useQuery } from '@tanstack/react-query';
import { currencyProfileApi } from '@/api/currencyProfile';
import { currencyRatesApi } from '@/api/currencyRates';
import { partyProfileApi } from '@/api/partyProfile';
import { productProfileApi } from '@/api/productProfile';
import { PartyProfileTypeEnum } from '@/modules/partyProfiles/types';

export const useDealCoverReferences = () => {
  const issuers = useQuery({
    queryKey: ['deal-cover-rate', 'issuers'],
    queryFn: () =>
      partyProfileApi.getAllPartyProfiles({
        activeOnly: true,
        status: 'APPROVE',
        type: PartyProfileTypeEnum.CARD_ISSUER_PROFILE,
      }),
  });

  const products = useQuery({
    queryKey: ['deal-cover-rate', 'products'],
    queryFn: () =>
      productProfileApi.getAllProductProfiles({
        activeOnly: true,
      }),
  });

  const currencies = useQuery({
    queryKey: ['deal-cover-rate', 'currencies'],
    queryFn: () =>
      currencyProfileApi.getAllCurrencyProfiles({ activeOnly: true }),
  });

  const latestRates = useQuery({
    queryKey: ['deal-cover-rate', 'latest-rates'],
    queryFn: () => currencyRatesApi.getLatestRates(),
  });

  const productCurrencyRates = useQuery({
    queryKey: ['deal-cover-rate', 'product-currency-rates'],
    queryFn: () => currencyRatesApi.getProductCurrencyRates(),
  });

  return {
    issuers: issuers.data ?? [],
    products: products.data ?? [],
    currencies: currencies.data ?? [],
    latestRates: latestRates.data ?? [],
    productCurrencyRates: productCurrencyRates.data ?? [],
    issuersLoading: issuers.isLoading,
    productsLoading: products.isLoading,
    currenciesLoading: currencies.isLoading,
    ratesLoading: latestRates.isLoading || productCurrencyRates.isLoading,
    isLoading:
      issuers.isLoading ||
      products.isLoading ||
      currencies.isLoading ||
      latestRates.isLoading ||
      productCurrencyRates.isLoading,
  };
};
