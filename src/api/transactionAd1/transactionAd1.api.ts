import { apiClient } from '../api';

export type Ad1TransactionStatus = 'DRAFT' | 'APPROVED' | 'REJECTED';

export interface ITransactionAd1 {
  id: string;
  number: string;
  branchId: string;
  companyId: string | null;
  transactionType: string;
  profileType: string;
  status: Ad1TransactionStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  approvedById: string | null;
  rejectedById: string | null;
  approvalRemarks: string | null;
  rejectionReason: string | null;
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
  agentId: string | null;
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

type ITransactionAd1WriteFields = Pick<
  ITransactionAd1,
  | 'transactionType'
  | 'profileType'
  | 'dealId'
  | 'docNo'
  | 'transactionDate'
  | 'marketingId'
  | 'segmentId'
  | 'servicedBy'
  | 'purposeId'
  | 'remitterName'
  | 'contactNo'
  | 'email'
  | 'address'
  | 'pan'
  | 'dateOfBirth'
  | 'productId'
  | 'beneficiaryName'
  | 'beniAddress'
  | 'beneAccountNumber'
  | 'beneBankName'
  | 'swiftCode'
  | 'relationshipId'
  | 'currencyId'
  | 'fcVolume'
  | 'saleRate'
  | 'totalInrAmt'
  | 'gst'
  | 'bankCharges'
  | 'tcs'
  | 'otherIncome'
  | 'finalAmount'
  | 'settlementRate'
  | 'grossRevenue'
  | 'revenueReceivable'
  | 'agentId'
  | 'commPercentOnFe'
  | 'agentComm'
  | 'tds'
  | 'commissionPayable'
  | 'netRevenue'
  | 'bankNameId'
  | 'rtgsImpsNeftRefNo'
  | 'remarks'
>;

export type ICreateTransactionAd1 = ITransactionAd1WriteFields & {
  requiresApproval?: boolean;
};
export type IUpdateTransactionAd1 = Partial<Omit<ICreateTransactionAd1, 'requiresApproval'>>;

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

  approve: async (id: string, payload?: { approvalRemarks?: string }): Promise<ITransactionAd1> => {
    const res = await apiClient.post<ITransactionAd1>(`/transactions/ad1/${id}/approve`, payload ?? {});
    if (res.error) throw new Error(res.error);
    return res.data!;
  },

  reject: async (id: string, payload?: { rejectionReason?: string }): Promise<ITransactionAd1> => {
    const res = await apiClient.post<ITransactionAd1>(`/transactions/ad1/${id}/reject`, payload ?? {});
    if (res.error) throw new Error(res.error);
    return res.data!;
  },
};
