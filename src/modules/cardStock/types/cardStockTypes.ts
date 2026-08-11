import type { CardStockReceiptPayload, ICardStockReceipt } from '@/api/cardStock';

export interface ICardStockFormCard {
  series: string;
  quantity: string;
  kitNumber: string;
  cardNumber: string;
  denomination: string;
  amount: string;
  expirationDate: string;
}

export interface ICardStockFormItem {
  currencyId: string;
  per: string;
  productId: string;
  issuerPartyProfileId: string;
  feAmount: string;
  cards: ICardStockFormCard[];
}

export interface ICardStockFormValues {
  transactionNumber: string;
  receiptDate: string;
  issuerPartyProfileId: string;
  hoBranchId: string;
  counterId: string;
  totalFeAmount: string;
  items: ICardStockFormItem[];
}

export interface CardStockFormProps {
  initialValues: ICardStockFormValues;
  readOnly?: boolean;
  onSubmit: (values: CardStockReceiptPayload) => void | Promise<void>;
}

export type CardStockReceipt = ICardStockReceipt;
