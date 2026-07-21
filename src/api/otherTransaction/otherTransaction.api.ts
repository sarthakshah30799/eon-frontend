import { apiClient } from '../api';

export type OtherTransactionStatus = 'DRAFT' | 'APPROVED' | 'REJECTED';

export interface IOtherTransaction {
  id: string;
  number: string;
  branchId: string;
  companyId: string | null;
  transactionType: string;
  profileType: string;
  slug: string | null;
  status: OtherTransactionStatus;
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

type IOtherTransactionWriteFields = Pick<
  IOtherTransaction,
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

export type ICreateOtherTransaction = IOtherTransactionWriteFields & {
  requiresApproval?: boolean;
};
export type IUpdateOtherTransaction = Partial<Omit<ICreateOtherTransaction, 'requiresApproval'>>;

export const otherTransactionApi = {
  create: async (payload: ICreateOtherTransaction): Promise<IOtherTransaction> => {
    const res = await apiClient.post<IOtherTransaction>('/transactions/other', payload);
    if (res.error) throw new Error(res.error);
    return res.data!;
  },

  getAll: async (params?: { search?: string; branchId?: string }): Promise<IOtherTransaction[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.branchId) query.set('branchId', params.branchId);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient.get<IOtherTransaction[]>(`/transactions/other${suffix}`);
    if (res.error) throw new Error(res.error);
    return res.data!;
  },

  getById: async (id: string): Promise<IOtherTransaction> => {
    const res = await apiClient.get<IOtherTransaction>(`/transactions/other/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data!;
  },

  update: async (id: string, payload: IUpdateOtherTransaction): Promise<IOtherTransaction> => {
    const res = await apiClient.put<IOtherTransaction>(`/transactions/other/${id}`, payload);
    if (res.error) throw new Error(res.error);
    return res.data!;
  },

  approve: async (id: string, payload?: { approvalRemarks?: string }): Promise<IOtherTransaction> => {
    const res = await apiClient.post<IOtherTransaction>(`/transactions/other/${id}/approve`, payload ?? {});
    if (res.error) throw new Error(res.error);
    return res.data!;
  },

  reject: async (id: string, payload?: { rejectionReason?: string }): Promise<IOtherTransaction> => {
    const res = await apiClient.post<IOtherTransaction>(`/transactions/other/${id}/reject`, payload ?? {});
    if (res.error) throw new Error(res.error);
    return res.data!;
  },
};
