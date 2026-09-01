import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import { CARD_STOCK_VALIDATION_TEXT } from '../constants/cardStockConstants';
import {
  isCardProductCode,
  isMultiCurrencyCardProduct,
  MULTI_CURRENCY_CARD_PRODUCT_CODE,
} from '@/modules/purchase/utils/purchaseUtils';

export const filterCardStockCurrenciesByProduct = (
  currencies: ICurrencyProfile[],
  productCode?: string | null
): ICurrencyProfile[] => {
  if (isMultiCurrencyCardProduct(productCode)) {
    return currencies.filter(
      currency =>
        currency.onlyStocking &&
        String(currency.productAllowed ?? '').toUpperCase() ===
          MULTI_CURRENCY_CARD_PRODUCT_CODE
    );
  }

  return currencies.filter(currency => !currency.onlyStocking);
};

export const validateCardStockProductCurrency = (
  currency: ICurrencyProfile | undefined,
  productCode?: string | null
): { valid: true } | { valid: false; message: string } => {
  if (!currency) {
    return { valid: false, message: 'Currency is invalid or inactive' };
  }

  if (isMultiCurrencyCardProduct(productCode)) {
    if (
      !currency.onlyStocking ||
      String(currency.productAllowed ?? '').toUpperCase() !==
        MULTI_CURRENCY_CARD_PRODUCT_CODE
    ) {
      return {
        valid: false,
        message: CARD_STOCK_VALIDATION_TEXT.cmOnlyStockingCurrency,
      };
    }
    return { valid: true };
  }

  if (isCardProductCode(productCode) && currency.onlyStocking) {
    return {
      valid: false,
      message: CARD_STOCK_VALIDATION_TEXT.ccOnlyTradableCurrency,
    };
  }

  return { valid: true };
};

export const toCardStockCurrencyOptions = (currencies: ICurrencyProfile[]) =>
  currencies.map(currency => ({
    value: currency.id,
    label: `${currency.currencyCode} - ${currency.currencyName}`,
  }));
