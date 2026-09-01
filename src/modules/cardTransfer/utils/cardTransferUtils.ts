import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import type { IProductProfile } from '@/modules/productProfile/types';
import type {
  CardTransferCard,
  CardTransferFormValues,
  CardTransferItem,
  CardTransferRequest,
} from '../types';
import { CARD_TRANSFER_VALIDATION_TEXT } from '../constants/cardTransferConstants';
import {
  filterCardStockCurrenciesByProduct,
  validateCardStockProductCurrency,
} from '@/modules/cardStock/utils/cardStockCurrencyUtils';

export const emptyTransferItem = (): CardTransferItem => ({
  currencyId: '',
  per: '1',
  productId: '',
  issuerPartyProfileId: '',
  feAmount: '0.00',
  cards: [],
});

export const emptyTransferForm = (): CardTransferFormValues => ({
  sourceBranchId: '',
  destinationBranchId: '',
  transactionDate: '',
  transactionNumber: '',
  remarks: '',
  items: [emptyTransferItem()],
});

export const formatTransferDate = (value: string) => {
  if (!value) return '—';
  const [year, month, day] = value.slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};

export const calculateItemAmount = (item: CardTransferItem) =>
  item.cards
    .reduce((sum, card) => sum + Number(card.amount || 0), 0)
    .toFixed(2);

export const calculateTotalAmount = (items: CardTransferItem[]) =>
  items
    .reduce((sum, item) => sum + Number(calculateItemAmount(item)), 0)
    .toFixed(2);

export const isTransferItemContextComplete = (
  item: Pick<
    CardTransferItem,
    'currencyId' | 'productId' | 'issuerPartyProfileId'
  >
) =>
  Boolean(item.currencyId && item.productId && item.issuerPartyProfileId);

export const cardMatchesTransferItem = (
  card: CardTransferCard,
  item: Pick<
    CardTransferItem,
    'currencyId' | 'productId' | 'issuerPartyProfileId'
  >
) =>
  card.currencyId === item.currencyId &&
  card.productId === item.productId &&
  card.issuerPartyProfileId === item.issuerPartyProfileId;

export const filterTransferCardsForItem = (
  cards: CardTransferCard[],
  item: Pick<
    CardTransferItem,
    'currencyId' | 'productId' | 'issuerPartyProfileId'
  >,
  excludeCardIds: string[] = []
) => {
  if (!isTransferItemContextComplete(item)) return [];
  const excluded = new Set(excludeCardIds);
  return cards.filter(
    card =>
      !excluded.has(card.id) && cardMatchesTransferItem(card, item)
  );
};

export const filterTransferIssuerOptions = (
  issuers: Array<{ id: string; code: string; name: string }>,
  product?: IProductProfile | null
) =>
  product
    ? issuers.filter(issuer =>
        product.cardIssuerProfileIds?.includes(issuer.id)
      )
    : issuers;

export const getTransferItemCurrencies = (
  currencies: ICurrencyProfile[],
  product?: IProductProfile | null
) => filterCardStockCurrenciesByProduct(currencies, product?.productCode);

export const validateTransferProductCurrency = (
  currency: ICurrencyProfile | undefined,
  product?: IProductProfile | null
) => validateCardStockProductCurrency(currency, product?.productCode);

export const validateTransferItemCards = (
  item: CardTransferItem
): { valid: true } | { valid: false; message: string } => {
  if (!item.cards.length) {
    return {
      valid: false,
      message: CARD_TRANSFER_VALIDATION_TEXT.selectAtLeastOneCard,
    };
  }
  if (!isTransferItemContextComplete(item)) {
    return { valid: true };
  }
  const invalidCard = item.cards.find(
    card => !cardMatchesTransferItem(card, item)
  );
  if (invalidCard) {
    return {
      valid: false,
      message: CARD_TRANSFER_VALIDATION_TEXT.cardsMismatch,
    };
  }
  if (calculateItemAmount(item) !== Number(item.feAmount || 0).toFixed(2)) {
    return {
      valid: false,
      message: CARD_TRANSFER_VALIDATION_TEXT.feAmountMismatch,
    };
  }
  return { valid: true };
};

export const mapRequestToForm = (
  request: CardTransferRequest
): CardTransferFormValues => ({
  sourceBranchId: request.sourceBranchId,
  sourceBranchSnapshot: request.sourceBranch ?? request.sourceBranchSnapshot,
  destinationBranchId: request.destinationBranchId,
  destinationBranchSnapshot:
    request.destinationBranch ?? request.destinationBranchSnapshot,
  companyId: request.companyId,
  companySnapshot: request.companySnapshot,
  transactionDate: request.transactionDate?.slice(0, 10) ?? '',
  transactionNumber: request.transactionNumber ?? '',
  remarks: request.remarks ?? '',
  items: (request.items ?? []).map(item => ({
    currencyId: item.currencyId,
    currencySnapshot: item.currencySnapshot,
    per: item.per,
    productId: item.productId,
    productSnapshot: item.productSnapshot,
    issuerPartyProfileId: item.issuerPartyProfileId,
    issuerPartyProfileSnapshot: item.issuerPartyProfileSnapshot,
    feAmount: item.feAmount,
    cards: item.cards ?? [],
  })),
});

export const pruneInvalidItemCards = (
  item: CardTransferItem
): CardTransferItem => {
  if (!isTransferItemContextComplete(item)) {
    return { ...item, cards: [], feAmount: '0.00' };
  }
  const cards = item.cards.filter(card => cardMatchesTransferItem(card, item));
  return {
    ...item,
    cards,
    feAmount: calculateItemAmount({ ...item, cards }),
  };
};
