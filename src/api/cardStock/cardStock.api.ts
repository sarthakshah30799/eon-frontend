import { apiClient } from '../api';

export interface CardStockSnapshot {
  id?: string;
  code?: string;
  name?: string;
  label?: string;
  currencyCode?: string;
  currencyName?: string;
  productCode?: string;
  productDescription?: string;
}

export interface CardStockCardPayload {
  series: string;
  quantity: number;
  kitNumber: string;
  cardNumber: string;
  denomination: string;
  amount: string;
  expirationDate: string;
}

export interface CardStockItemPayload {
  lineNo: number;
  currencyId: string;
  per: string;
  productId: string;
  issuerPartyProfileId: string;
  feAmount: string;
  cards: CardStockCardPayload[];
}

export interface CardStockReceiptPayload {
  transactionNumber?: string;
  receiptDate: string;
  issuerPartyProfileId: string;
  hoBranchId: string;
  totalFeAmount: string;
  items: CardStockItemPayload[];
}

export interface ICardStockCard extends CardStockCardPayload {
  id: string;
  maskedCardNumber?: string;
}

export interface ICardStockReceiptItem extends Omit<CardStockItemPayload, 'cards'> {
  id: string;
  currencySnapshot?: CardStockSnapshot | null;
  productSnapshot?: CardStockSnapshot | null;
  issuerPartyProfileSnapshot?: CardStockSnapshot | null;
  cards: ICardStockCard[];
}

export interface ICardStockReceipt {
  id: string;
  transactionNumber: string;
  receiptDate: string;
  issuerPartyProfileId: string;
  issuerPartyProfileSnapshot?: CardStockSnapshot | null;
  hoBranchId: string;
  hoBranchSnapshot?: CardStockSnapshot | null;
  totalFeAmount: string;
  status: string;
  createdAt: string;
  items: ICardStockReceiptItem[];
}

export const cardStockApi = {
  list: async (): Promise<ICardStockReceipt[]> => {
    const response = await apiClient.get<ICardStockReceipt[]>('/card-stock/receipts');
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },

  get: async (id: string): Promise<ICardStockReceipt> => {
    const response = await apiClient.get<ICardStockReceipt>(`/card-stock/receipts/${id}`);
    if (response.error || !response.data) throw new Error(response.error || 'Card stock receipt not found');
    return response.data;
  },

  create: async (payload: CardStockReceiptPayload): Promise<ICardStockReceipt> => {
    const response = await apiClient.post<ICardStockReceipt>('/card-stock/receipts', payload);
    if (response.error || !response.data) throw new Error(response.error || 'Failed to create card stock receipt');
    return response.data;
  },
};
