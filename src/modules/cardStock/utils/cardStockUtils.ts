import type { ICardStockFormCard, ICardStockFormItem, ICardStockFormValues } from '../types';
import type { ICardStockReceipt } from '@/api/cardStock';

export const emptyCard = (): ICardStockFormCard => ({
  series: '', quantity: '1', kitNumber: '', cardNumber: '', denomination: '', amount: '', expirationDate: '',
});

export const emptyItem = (): ICardStockFormItem => ({
  currencyId: '', per: '1', productId: '', issuerPartyProfileId: '', feAmount: '', cards: [emptyCard()],
});

export const emptyForm = (hoBranchId = '', counterId = ''): ICardStockFormValues => ({
  transactionNumber: '', receiptDate: '', issuerPartyProfileId: '', hoBranchId, counterId, totalFeAmount: '', items: [emptyItem()],
});

export const mapReceiptToForm = (receipt: ICardStockReceipt): ICardStockFormValues => ({
  transactionNumber: receipt.transactionNumber ?? '',
  receiptDate: receipt.receiptDate?.slice(0, 10) ?? '',
  issuerPartyProfileId: receipt.issuerPartyProfileId,
  hoBranchId: receipt.hoBranchId,
  counterId: receipt.counterId ?? '',
  totalFeAmount: receipt.totalFeAmount,
  items: receipt.items.map(item => ({
    currencyId: item.currencyId,
    per: item.per,
    productId: item.productId,
    issuerPartyProfileId: item.issuerPartyProfileId,
    feAmount: item.feAmount,
    cards: item.cards.map(card => ({
      series: card.series, quantity: String(card.quantity), kitNumber: card.kitNumber,
      cardNumber: card.maskedCardNumber ?? '', denomination: card.denomination,
      amount: card.amount, expirationDate: card.expirationDate?.slice(0, 10) ?? '',
    })),
  })),
});

export const toReceiptPayload = (values: ICardStockFormValues) => ({
  ...values,
  items: values.items.map((item, index) => ({ ...item, lineNo: index + 1, cards: item.cards.map(card => ({ ...card, quantity: 1 })) })),
});
