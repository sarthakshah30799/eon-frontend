import { apiClient } from '../api';
import type { ITransactionReferenceSnapshot } from '@/modules/transactions';
import type { IBranchProfile } from '@/modules/branchProfile/types/branchProfileTypes';
import type { ICounterProfile } from '@/modules/counterProfile/types/counterProfileTypes';

export type TransferType = 'COUNTER' | 'BRANCH';
export type TransferStatus = 'HELD' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface ITransferItem {
  id: string;
  lineNo: number;
  currencyId: string;
  productId: string;
  currencySnapshot?: ITransactionReferenceSnapshot | null;
  productSnapshot?: ITransactionReferenceSnapshot | null;
  quantity: string;
  per: string;
  rate: string;
  rateEditable: boolean;
  amount: string;
  roundOff: string;
  finalAmount: string;
  remarks: string | null;
}

export interface ICurrencyTransfer {
  id: string;
  number: string | null;
  transferType: TransferType;
  status: TransferStatus;
  transactionDate: string | null;
  billReference: string | null;
  sourceBranchId: string;
  sourceBranch?: IBranchProfile | null;
  sourceBranchSnapshot?: ITransactionReferenceSnapshot | null;
  sourceCounterId: string;
  sourceCounter?: ICounterProfile | null;
  sourceCounterSnapshot?: ITransactionReferenceSnapshot | null;
  destinationBranchId: string;
  destinationBranch?: IBranchProfile | null;
  destinationBranchSnapshot?: ITransactionReferenceSnapshot | null;
  destinationCounterId: string;
  destinationCounter?: ICounterProfile | null;
  destinationCounterSnapshot?: ITransactionReferenceSnapshot | null;
  sourceNumberSeriesCode: string | null;
  destinationNumberSeriesCode: string | null;
  sourceTransactionId: string | null;
  sourceTransaction?: ITransactionReferenceSnapshot | null;
  destinationTransactionId: string | null;
  destinationTransaction?: ITransactionReferenceSnapshot | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  items: ITransferItem[];
}

export interface ICreateTransferItemPayload {
  currencyId: string;
  productId: string;
  quantity: string | number;
  per: string | number;
  rate: string | number;
  rateEditable?: boolean;
  amount?: string | number;
  roundOff?: string | number;
  finalAmount?: string | number;
  remarks?: string | null;
}

export interface ICreateTransferPayload {
  transferType: TransferType;
  transactionDate?: string | null;
  billReference: string;
  sourceBranchId?: string | null;
  sourceCounterId?: string | null;
  destinationBranchId?: string | null;
  destinationCounterId?: string | null;
  remarks?: string | null;
  items: ICreateTransferItemPayload[];
}

export type ITransferPrintCopyType = 'CUSTOMER_COPY' | 'DUPLICATE_COPY';

export interface IRecordTransferPrintPayload {
  copyType?: ITransferPrintCopyType;
  recipientEmail?: string;
  subject?: string;
  text?: string;
  html?: string;
  sendEmail?: boolean;
}

const buildQuery = (params?: Record<string, string | undefined>) => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const transfersApi = {
  listTransfers: async (params?: {
    transferType?: TransferType;
    status?: TransferStatus;
    search?: string;
  }) => {
    const res = await apiClient.get<ICurrencyTransfer[]>(`/transfers${buildQuery(params)}`);
    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },
  getTransferById: async (id: string) => {
    const res = await apiClient.get<ICurrencyTransfer>(`/transfers/${id}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to load transfer');
    return res.data;
  },
  createCounterTransfer: async (payload: Omit<ICreateTransferPayload, 'transferType'>) => {
    const res = await apiClient.post<ICurrencyTransfer>('/transfers/counter', payload);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create transfer');
    return res.data;
  },
  createBranchTransfer: async (payload: Omit<ICreateTransferPayload, 'transferType'>) => {
    const res = await apiClient.post<ICurrencyTransfer>('/transfers/branch', payload);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create transfer');
    return res.data;
  },
  acceptTransfer: async (id: string) => {
    const res = await apiClient.post<ICurrencyTransfer>(`/transfers/${id}/accept`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to accept transfer');
    return res.data;
  },
  rejectTransfer: async (id: string, remarks?: string | null) => {
    const res = await apiClient.post<ICurrencyTransfer>(`/transfers/${id}/reject`, { remarks: remarks ?? null });
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to reject transfer');
    return res.data;
  },
  recordPrint: async (
    id: string,
    payload: IRecordTransferPrintPayload
  ): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>(
      `/transfers/${id}/print`,
      payload
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to record transfer print');
    return res.data;
  },
};
