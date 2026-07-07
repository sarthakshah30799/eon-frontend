import { useQuery } from '@tanstack/react-query';
import { currencyProfileApi } from '@/api/currencyProfile';
import { currencyRatesApi } from '@/api/currencyRates';
import { productProfileApi } from '@/api/productProfile';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import type {
  ICurrencyRate,
  ICurrencyRateGroup,
  IProductCurrencyRate,
} from '../types/currencyRatesTypes';

interface CurrencyRatesViewData {
  groups: ICurrencyRateGroup[];
  products: Array<{
    id: string;
    productCode: string;
    productDescription: string;
  }>;
  currencies: ICurrencyProfile[];
  rates: ICurrencyRate[];
  latestRates: ICurrencyRate[];
  productCurrencyRates: IProductCurrencyRate[];
}

const loadCurrencyRatesViewData = async (): Promise<CurrencyRatesViewData> => {
  const [groups, products, currencies, rates, productCurrencyRates] =
    await Promise.all([
      currencyRatesApi.getGroups(),
      productProfileApi.getProductProfiles().then(list =>
        list.filter(product => product.isActiveProduct !== false)
      ),
      currencyProfileApi.getCurrencyProfiles().then(list =>
        list.filter(currency => currency.active !== false)
      ),
      currencyRatesApi.getLatestRates(),
      currencyRatesApi.getProductCurrencyRates(),
    ]);

  return {
    groups,
    products: products.map(product => ({
      id: product.id,
      productCode: product.productCode,
      productDescription: product.productDescription,
    })),
    currencies,
    rates,
    latestRates: rates,
    productCurrencyRates,
  };
};

export const useCurrencyRatesViewData = () => {
  return useQuery({
    queryKey: ['currency-rates-view'],
    queryFn: loadCurrencyRatesViewData,
  });
};
