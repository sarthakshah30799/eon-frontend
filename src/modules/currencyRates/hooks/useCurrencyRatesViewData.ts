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
  productCurrencyRates: IProductCurrencyRate[];
}

const loadCurrencyRatesViewData = async (): Promise<CurrencyRatesViewData> => {
  const [groups, products, currencies, rates, productCurrencyRates] =
    await Promise.all([
      currencyRatesApi.getGroups(),
      productProfileApi.getProductProfiles(),
      currencyProfileApi.getCurrencyProfiles(),
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
    productCurrencyRates,
  };
};

export const useCurrencyRatesViewData = () => {
  return useQuery({
    queryKey: ['currency-rates-view'],
    queryFn: loadCurrencyRatesViewData,
  });
};

