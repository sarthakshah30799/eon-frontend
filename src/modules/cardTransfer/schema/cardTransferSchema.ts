import * as yup from 'yup';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import type { IProductProfile } from '@/modules/productProfile/types';
import { CARD_STOCK_VALIDATION_TEXT } from '@/modules/cardStock/constants/cardStockConstants';
import { CARD_TRANSFER_VALIDATION_TEXT } from '../constants/cardTransferConstants';
import { validateTransferProductCurrency } from '../utils/cardTransferUtils';

export const createCardTransferSchema = (
  currencies: ICurrencyProfile[] = [],
  products: IProductProfile[] = []
) =>
  yup.object({
    sourceBranchId: yup.string().required('Source branch is required'),
    destinationBranchId: yup
      .string()
      .required('Destination branch is required')
      .test(
        'different-branches',
        CARD_TRANSFER_VALIDATION_TEXT.branchesMustDiffer,
        function validateBranches(value) {
          const sourceBranchId = this.parent?.sourceBranchId;
          if (!value || !sourceBranchId) return true;
          return value !== sourceBranchId;
        }
      ),
    transactionDate: yup.string().required('Transaction date is required'),
    transactionNumber: yup.string().optional(),
    remarks: yup
      .string()
      .max(500, 'Remarks cannot exceed 500 characters')
      .optional(),
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
                const result = validateTransferProductCurrency(
                  currency,
                  product
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
                const result = validateTransferProductCurrency(
                  currency,
                  product
                );
                return result.valid
                  ? true
                  : this.createError({ message: result.message });
              }
            ),
          issuerPartyProfileId: yup.string().required('Issuer is required'),
          feAmount: yup
            .string()
            .required()
            .test(
              'matches-cards',
              CARD_TRANSFER_VALIDATION_TEXT.feAmountMismatch,
              function validateFeAmount(value) {
                const item = this.parent as {
                  cards?: Array<{ amount?: string }>;
                };
                const cards = item.cards ?? [];
                if (!cards.length) return true;
                const total = cards
                  .reduce((sum, card) => sum + Number(card.amount || 0), 0)
                  .toFixed(2);
                return Number(value || 0).toFixed(2) === total;
              }
            ),
          cards: yup
            .array()
            .min(1, CARD_TRANSFER_VALIDATION_TEXT.selectAtLeastOneCard)
            .required('Cards are required')
            .test(
              'match-item',
              CARD_TRANSFER_VALIDATION_TEXT.cardsMismatch,
              function validateCards(cards) {
                const item = this.parent as {
                  currencyId?: string;
                  productId?: string;
                  issuerPartyProfileId?: string;
                };
                if (!cards?.length) return true;
                if (
                  !item.currencyId ||
                  !item.productId ||
                  !item.issuerPartyProfileId
                ) {
                  return true;
                }
                return (cards as Array<{
                  currencyId?: string;
                  productId?: string;
                  issuerPartyProfileId?: string;
                }>).every(
                  card =>
                    (card.currencyId ?? item.currencyId) === item.currencyId &&
                    (card.productId ?? item.productId) === item.productId &&
                    (card.issuerPartyProfileId ?? item.issuerPartyProfileId) ===
                      item.issuerPartyProfileId
                );
              }
            ),
        })
      )
      .min(1, 'Add at least one transfer item')
      .required(),
  });

export const cardTransferSchema = createCardTransferSchema();
