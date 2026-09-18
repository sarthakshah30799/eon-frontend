import type {
  ICardStockFormCard,
  ICardStockFormItem,
  ICardStockFormValues,
} from '../types';
import type { ICardStockReceipt } from '@/api/cardStock';
import { CARD_STOCK_FIXED_DENOMINATION } from '../constants/cardStockConstants';

export const cardStockDenominationAmount = (
  denomination = CARD_STOCK_FIXED_DENOMINATION
) => Number(denomination || 0).toFixed(2);

export const withFixedCardDenomination = (
  card: ICardStockFormCard
): ICardStockFormCard => ({
  ...card,
  denomination: CARD_STOCK_FIXED_DENOMINATION,
  amount: cardStockDenominationAmount(),
});

export const emptyCard = (): ICardStockFormCard => ({
  series: '',
  kitNumber: '',
  cardNumber: '',
  denomination: CARD_STOCK_FIXED_DENOMINATION,
  amount: cardStockDenominationAmount(),
  expirationDate: '',
});

export const emptyItem = (): ICardStockFormItem => ({
  currencyId: '',
  per: '1',
  productId: '',
  issuerPartyProfileId: '',
  feAmount: '',
  cards: [emptyCard()],
});

export const emptyForm = (branchId = ''): ICardStockFormValues => ({
  transactionNumber: '',
  receiptDate: '',
  issuerPartyProfileId: '',
  branchId,
  totalFeAmount: '',
  items: [emptyItem()],
});

export const mapReceiptToForm = (
  receipt: ICardStockReceipt
): ICardStockFormValues => ({
  transactionNumber: receipt.transactionNumber ?? '',
  receiptDate: receipt.receiptDate?.slice(0, 10) ?? '',
  issuerPartyProfileId: receipt.issuerPartyProfileId,
  branchId: receipt.branchId,
  totalFeAmount: receipt.totalFeAmount,
  items: receipt.items.map(item => ({
    currencyId: item.currencyId,
    per: item.per,
    productId: item.productId,
    issuerPartyProfileId: item.issuerPartyProfileId,
    feAmount: item.feAmount,
    cards: item.cards.map(card => ({
      series: card.series,
      kitNumber: card.kitNumber,
      cardNumber: card.maskedCardNumber ?? '',
      denomination: card.denomination,
      amount: card.amount,
      expirationDate: card.expirationDate?.slice(0, 10) ?? '',
    })),
  })),
});

export const toReceiptPayload = (values: ICardStockFormValues) => {
  const items = values.items.map((item, index) => {
    const cards = item.cards.map(withFixedCardDenomination);
    const feAmount = cards
      .reduce(
        (sum, card) => sum + Number(card.denomination || 0),
        0
      )
      .toFixed(2);
    return { ...item, lineNo: index + 1, cards, feAmount };
  });
  const totalFeAmount = items
    .reduce((sum, item) => sum + Number(item.feAmount || 0), 0)
    .toFixed(2);
  return { ...values, items, totalFeAmount };
};
