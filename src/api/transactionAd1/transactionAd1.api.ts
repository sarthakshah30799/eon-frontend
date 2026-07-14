import { apiClient } from '../api';

export interface ITransactionAd1 {
  id: string;
  number: string;
  branchId: string;
  companyId: string | null;
  transactionType: string;
  profileType: string;
  dealId: string | null;
  docNo: string | null;
  transactionDate: string | null;
  marketingId: string | null;
  segmentId: string | null;
  servicedBy: string | null;
  purposeId: string | null;
  remitterName: string | null;
  contactNo: string | null;
  email: string | null;
  address: string | null;
  pan: string | null;
  dateOfBirth: string | null;
  productId: string | null;
  beneficiaryName: string | null;
  beniAddress: string | null;
  beneAccountNumber: string | null;
  beneBankName: string | null;
  swiftCode: string | null;
  relationshipId: string | null;
  currencyId: string | null;
  fcVolume: string | null;
  saleRate: string | null;
  totalInrAmt: string | null;
  gst: string | null;
  bankCharges: string | null;
  tcs: string | null;
  otherIncome: string | null;
  finalAmount: string | null;
  settlementRate: string | null;
  grossRevenue: string | null;
  revenueReceivable: string | null;
  fxRefAgentId: string | null;
  commGivenId: string | null;
  commPercentOnFe: string | null;
  agentComm: string | null;
  tds: string | null;
  commissionPayable: string | null;
  netRevenue: string | null;
  bankNameId: string | null;
  rtgsImpsNeftRefNo: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ICreateTransactionAd1 = Omit<ITransactionAd1, 'id' | 'number' | 'companyId' | 'createdAt' | 'updatedAt'>;
export type IUpdateTransactionAd1 = Partial<ICreateTransactionAd1>;

export const transactionAd1Api = {
  create: async (payload: ICreateTransactionAd1): Promise<ITransactionAd1> => {
    const res = await apiClient.post<ITransactionAd1>('/transactions/ad1', payload);
    if (res.error) throw new Error(res.error);
    return res.data!;
  },

  getAll: async (params?: { search?: string; branchId?: string }): Promise<ITransactionAd1[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.branchId) query.set('branchId', params.branchId);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient.get<ITransactionAd1[]>(`/transactions/ad1${suffix}`);
    if (res.error) throw new Error(res.error);
    return res.data!;
  },

  getById: async (id: string): Promise<ITransactionAd1> => {
    const res = await apiClient.get<ITransactionAd1>(`/transactions/ad1/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data!;
  },

  update: async (id: string, payload: IUpdateTransactionAd1): Promise<ITransactionAd1> => {
    const res = await apiClient.put<ITransactionAd1>(`/transactions/ad1/${id}`, payload);
    if (res.error) throw new Error(res.error);
    return res.data!;
  },
};
