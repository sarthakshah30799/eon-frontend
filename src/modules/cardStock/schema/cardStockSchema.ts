import * as yup from 'yup';
import type { IPartyProfile } from '@/modules/partyProfiles/types';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import type { IProductProfile } from '@/modules/productProfile/types';
import { CARD_STOCK_VALIDATION_TEXT } from '../constants/cardStockConstants';
import { validateCardNumber } from '../utils/cardNumberValidation';
import { validateCardStockProductCurrency } from '../utils/cardStockCurrencyUtils';

const futureDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const issuerRule = (issuers: IPartyProfile[], issuerId?: string) => {
  const issuer = issuers.find(profile => profile.id === issuerId);
  return {
    length: issuer?.cardNumberLength,
    allowMasking: issuer?.allowCardNumberMasking,
  };
};

export const createCardStockSchema = (
  issuers: IPartyProfile[] = [],
  currencies: ICurrencyProfile[] = [],
  products: IProductProfile[] = []
) =>
  yup.object({
    transactionNumber: yup.string().optional(),
    receiptDate: yup.string().required('Receipt date is required'),
    issuerPartyProfileId: yup.string().required('Card issuer is required'),
    branchId: yup.string().required('Branch is required'),
    totalFeAmount: yup.string().required(),
    items: yup
      .array()
      .of(
        yup.object({
          currencyId: yup
            .string()
            .required('Currency is required')
            .test(
              'product-currency',
              CARD_STOCK_VALIDATION_TEXT.ccOnlyTradableCurrency,
              function validateItemCurrency(value) {
                const item = this.parent as { productId?: string };
                if (!value || !item.productId) return true;
                const product = products.find(
                  productRecord => productRecord.id === item.productId
                );
                const currency = currencies.find(
                  currencyRecord => currencyRecord.id === value
                );
                const result = validateCardStockProductCurrency(
                  currency,
                  product?.productCode
                );
                return result.valid
                  ? true
                  : this.createError({ message: result.message });
              }
            ),
          per: yup
            .string()
            .required('Per is required')
            .test(
              'positive',
              'Per must be greater than zero',
              value => Number(value) > 0
            ),
          productId: yup
            .string()
            .required('Product is required')
            .test(
              'product-currency',
              CARD_STOCK_VALIDATION_TEXT.ccOnlyTradableCurrency,
              function validateItemProduct(value) {
                const item = this.parent as { currencyId?: string };
                if (!value || !item.currencyId) return true;
                const product = products.find(
                  productRecord => productRecord.id === value
                );
                const currency = currencies.find(
                  currencyRecord => currencyRecord.id === item.currencyId
                );
                const result = validateCardStockProductCurrency(
                  currency,
                  product?.productCode
                );
                return result.valid
                  ? true
                  : this.createError({ message: result.message });
              }
            ),
          issuerPartyProfileId: yup.string().required('Issuer is required'),
          feAmount: yup.string().required(),
          cards: yup
            .array()
            .of(
              yup.object({
                series: yup
                  .string()
                  .matches(
                    /^[A-Za-z0-9]{1,4}$/,
                    CARD_STOCK_VALIDATION_TEXT.series
                  )
                  .required('Series prefix is required'),
                kitNumber: yup
                  .string()
                  .trim()
                  .required(CARD_STOCK_VALIDATION_TEXT.kitNumber),
                cardNumber: yup
                  .string()
                  .trim()
                  .required('Card number is required')
                  .test(
                    'issuer-card-number',
                    CARD_STOCK_VALIDATION_TEXT.digits(16),
                    function validateIssuerCardNumber(value) {
                      const item = this.from?.[1]?.value as
                        | { issuerPartyProfileId?: string }
                        | undefined;
                      const result = validateCardNumber(
                        value ?? '',
                        issuerRule(issuers, item?.issuerPartyProfileId)
                      );
                      return result.valid
                        ? true
                        : this.createError({ message: result.message });
                    }
                  ),
                denomination: yup
                  .string()
                  .test(
                    'positive',
                    CARD_STOCK_VALIDATION_TEXT.denomination,
                    value => Number(value) > 0
                  )
                  .required('Denomination is required'),
                amount: yup.string().required(),
                expirationDate: yup
                  .string()
                  .required('Expiration date is required')
                  .test(
                    'future',
                    CARD_STOCK_VALIDATION_TEXT.expirationFuture,
                    value =>
                      Boolean(
                        value && new Date(`${value}T00:00:00`) > futureDate()
                      )
                  ),
              })
            )
            .min(1, 'At least one card is required')
            .required(),
        })
      )
      .min(1, 'At least one item is required')
      .required(),
  });

export const cardStockSchema = createCardStockSchema();
