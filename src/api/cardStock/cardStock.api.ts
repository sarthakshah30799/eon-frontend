import { apiClient } from '../api';
import type { ICompanyProfile } from '@/modules/companyProfile/types';
import type { IBranchProfile } from '@/modules/branchProfile/types';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import type { IProductProfile } from '@/modules/productProfile/types';
import type { IPartyProfile } from '@/modules/partyProfiles/types';
import type {
  IOffsetPaginationParams,
  IPaginatedResponse,
} from '@/types/pagination';
import { buildQueryString } from '@/utils';
import { fetchAllMatching, normalizePaginatedResponse } from '@/utils/paginatedList';

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
  kitNumber: string;
  cardNumber: string;
  denomination: string;
  amount: string;
  expirationDate: string;
}

export interface CardStockUploadPreviewRow {
  rowNumber: number;
  series: string;
  kitNumber: string;
  cardNumber: string;
  denomination: string;
  amount: string;
  expirationDate: string;
  error: string;
}

export interface CardStockSelectableCard {
  id: string;
  series: string;
  kitNumber: string;
  maskedCardNumber: string;
  denomination: string;
  amount: string;
  expirationDate: string;
  currencyId: string;
  productId: string;
  issuerPartyProfileId: string;
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
  branchId: string;
  totalFeAmount: string;
  items: CardStockItemPayload[];
}

export interface ICardStockCard extends CardStockCardPayload {
  id: string;
  maskedCardNumber?: string;
}

export interface ICardStockReceiptItem extends Omit<
  CardStockItemPayload,
  'cards'
> {
  id: string;
  currencySnapshot?: ICurrencyProfile | null;
  productSnapshot?: IProductProfile | null;
  issuerPartyProfileSnapshot?: IPartyProfile | null;
  cards: ICardStockCard[];
}

export interface ICardStockReceipt {
  id: string;
  transactionNumber: string;
  receiptDate: string;
  issuerPartyProfileId: string;
  issuerPartyProfileSnapshot?: IPartyProfile | null;
  branchId: string;
  branchSnapshot?: IBranchProfile | null;
  companyId?: string | null;
  companySnapshot?: ICompanyProfile | null;
  totalFeAmount: string;
  status: string;
  createdAt: string;
  printCount?: number;
  items: ICardStockReceiptItem[];
}

export type CardStockPrintCopyType = 'CUSTOMER_COPY' | 'DUPLICATE_COPY';
export type CardStockPrintKind = 'STOCK_IN' | 'STOCK_OUT';

export interface CardStockPrintPayload {
  copyType?: CardStockPrintCopyType;
  kind?: CardStockPrintKind;
  html?: string;
}

export interface CardStockPrintResponse {
  copyType: CardStockPrintCopyType;
  message: string;
}

export type ICardStockReceiptListQuery = IOffsetPaginationParams;

export const cardStockApi = {
  list: async (
    params?: ICardStockReceiptListQuery
  ): Promise<IPaginatedResponse<ICardStockReceipt>> => {
    const response = await apiClient.get<IPaginatedResponse<ICardStockReceipt>>(
      `/card-stock/receipts${buildQueryString(params)}`
    );
    if (response.error) throw new Error(response.error);
    return normalizePaginatedResponse(
      response.data,
      params?.limit,
      params?.offset
    );
  },

  listAll: async (): Promise<ICardStockReceipt[]> =>
    fetchAllMatching(pagination => cardStockApi.list(pagination)),

  get: async (id: string): Promise<ICardStockReceipt> => {
    const response = await apiClient.get<ICardStockReceipt>(
      `/card-stock/receipts/${id}`
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Card stock receipt not found');
    return response.data;
  },

  create: async (
    payload: CardStockReceiptPayload
  ): Promise<ICardStockReceipt> => {
    const response = await apiClient.post<ICardStockReceipt>(
      '/card-stock/receipts',
      payload
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to create card stock receipt');
    return response.data;
  },

  recordPrint: async (
    id: string,
    payload: CardStockPrintPayload
  ): Promise<CardStockPrintResponse> => {
    const response = await apiClient.post<CardStockPrintResponse>(
      `/card-stock/receipts/${id}/print`,
      payload
    );
    if (response.error || !response.data)
      throw new Error(
        response.error || 'Failed to record CARD stock receipt print'
      );
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await apiClient.getDownload(
      '/card-stock/receipts/cards/template'
    );
    if (response.error || !response.data)
      throw new Error(
        response.error || 'Failed to download CARD stock template'
      );
    return response.data.blob;
  },

  previewUpload: async (
    file: File,
    issuerPartyProfileId?: string
  ): Promise<CardStockUploadPreviewRow[]> => {
    const formData = new FormData();
    formData.append('file', file);
    if (issuerPartyProfileId)
      formData.append('issuerPartyProfileId', issuerPartyProfileId);
    const response = await apiClient.postFormData<CardStockUploadPreviewRow[]>(
      '/card-stock/receipts/cards/preview',
      formData
    );
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },

  listAvailableCards: async (params: {
    branchId: string;
    currencyId?: string;
    productId: string;
    issuerPartyProfileId: string;
  }): Promise<CardStockSelectableCard[]> => {
    const query = new URLSearchParams();
    query.set('branchId', params.branchId);
    query.set('productId', params.productId);
    query.set('issuerPartyProfileId', params.issuerPartyProfileId);
    if (params.currencyId) query.set('currencyId', params.currencyId);
    const response = await apiClient.get<CardStockSelectableCard[]>(
      `/card-stock/receipts/cards/available?${query.toString()}`
    );
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },

  listReloadCards: async (params: {
    branchId: string;
    passengerId: string;
    currencyId?: string;
    productId: string;
    issuerPartyProfileId: string;
  }): Promise<CardStockSelectableCard[]> => {
    const query = new URLSearchParams();
    query.set('branchId', params.branchId);
    query.set('passengerId', params.passengerId);
    query.set('productId', params.productId);
    query.set('issuerPartyProfileId', params.issuerPartyProfileId);
    if (params.currencyId) query.set('currencyId', params.currencyId);
    const response = await apiClient.get<CardStockSelectableCard[]>(
      `/card-stock/receipts/cards/reload?${query.toString()}`
    );
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },
};
