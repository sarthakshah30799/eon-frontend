import { apiClient } from '../api';
import type {
  IApproveTransactionPayload,
  ICreateTransactionDraftPayload,
  IRecordTransactionPrintPayload,
  ITransactionEntity,
  ITransactionQuantityAvailability,
  TransactionStatus,
  TransactionType,
} from '@/modules/transactions';
import { API_BASE_URL } from '@/config/api';

const appendJsonPart = (
  formData: FormData,
  key: string,
  value: unknown
) => {
  formData.append(key, JSON.stringify(value));
};

export const transactionsApi = {
  getTransactionDocumentDownloadUrl: (
    transactionId: string,
    documentId: string
  ) => `${API_BASE_URL}/transactions/${transactionId}/documents/${documentId}/download`,

  getTransactions: async (
    params?: {
      slug?: string;
      branchId?: string;
      search?: string;
      status?: TransactionStatus;
      partyProfileId?: string;
      transactionType?: TransactionType;
    }
  ): Promise<ITransactionEntity[]> => {
    const query = new URLSearchParams();

    if (params?.slug) query.set('slug', params.slug);
    if (params?.branchId) query.set('branchId', params.branchId);
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.partyProfileId) query.set('partyProfileId', params.partyProfileId);
    if (params?.transactionType) query.set('transactionType', params.transactionType);

    const suffix = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient.get<ITransactionEntity[]>(`/transactions${suffix}`);

    if (res.error) {
      throw new Error(res.error);
    }

    return res.data || [];
  },

  getQuantityAvailability: async (
    params: {
      branchId: string;
      currencyId: string;
      productId: string;
      excludeTransactionId?: string;
    }
  ): Promise<ITransactionQuantityAvailability> => {
    const query = new URLSearchParams();
    query.set('branchId', params.branchId);
    query.set('currencyId', params.currencyId);
    query.set('productId', params.productId);

    if (params.excludeTransactionId) {
      query.set('excludeTransactionId', params.excludeTransactionId);
    }

    const res = await apiClient.get<ITransactionQuantityAvailability>(
      `/transactions/quantity-availability?${query.toString()}`
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to fetch quantity availability');
    }

    return res.data;
  },

  requestAccountPostingRebuild: async (
    transactionId: string
  ): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>(
      `/transactions/${transactionId}/account-postings/rebuild`,
      {}
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to queue account posting rebuild');
    }

    return res.data;
  },

  getTransactionById: async (id: string): Promise<ITransactionEntity | null> => {
    const res = await apiClient.get<ITransactionEntity>(`/transactions/${id}`);

    if (res.error) {
      throw new Error(res.error);
    }

    return res.data || null;
  },

  getNextNumber: async (
    params: { slug: string; branchId: string }
  ): Promise<{ nextNumber: string }> => {
    const query = new URLSearchParams();
    query.set('slug', params.slug);
    query.set('branchId', params.branchId);

    const res = await apiClient.get<{ nextNumber: string }>(
      `/transactions/next-number?${query.toString()}`
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to fetch next transaction number');
    }

    return res.data;
  },

  createDraft: async (
    payload: ICreateTransactionDraftPayload
  ): Promise<ITransactionEntity> => {
    const formData = new FormData();
    appendJsonPart(formData, 'transaction', payload.transaction);
    appendJsonPart(
      formData,
      'attachments',
      payload.attachments.map(attachment => ({
        documentProfileId: attachment.documentProfileId,
        fileName: attachment.file.name,
      }))
    );

    payload.attachments.forEach((attachment, index) => {
      formData.append(`files[${index}]`, attachment.file);
      formData.append(
        `fileDocumentProfileIds[${index}]`,
        attachment.documentProfileId
      );
    });

    const res = await apiClient.postFormData<ITransactionEntity>(
      '/transactions/drafts',
      formData
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to create transaction draft');
    }

    return res.data;
  },

  approveTransaction: async (
    transactionId: string,
    payload: IApproveTransactionPayload = {}
  ): Promise<ITransactionEntity> => {
    const res = await apiClient.post<ITransactionEntity>(
      `/transactions/${transactionId}/approve`,
      payload
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to approve transaction');
    }

    return res.data;
  },

  recordPrint: async (
    transactionId: string,
    payload: IRecordTransactionPrintPayload
  ): Promise<{ message: string; messageId?: string }> => {
    const res = await apiClient.post<{ message: string; messageId?: string }>(
      `/transactions/${transactionId}/print`,
      payload
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to record transaction print');
    }

    return res.data;
  },
};

export default transactionsApi;
