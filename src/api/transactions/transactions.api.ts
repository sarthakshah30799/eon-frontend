import { apiClient } from '../api';
import type {
  IApproveTransactionPayload,
  ICreateTransactionDraftPayload,
  IRecordTransactionPrintPayload,
  IPurchaseRulePreviewRequest,
  IPurchaseRulePreviewResponse,
  ITransactionTaxPreviewRequest,
  ITransactionTaxPreviewResponse,
  ITransactionTcsPreviewRequest,
  ITransactionTcsPreviewResponse,
  ITransactionEntity,
  ITransactionQuantityAvailability,
  TransactionStatus,
  TransactionType,
} from '@/modules/transactions';
import type {
  IOffsetPaginationParams,
  IPaginatedResponse,
} from '@/types/pagination';
import { API_BASE_URL } from '@/config/api';
import { buildQueryString } from '@/utils';
import { fetchAllMatching, normalizePaginatedResponse } from '@/utils/paginatedList';

const appendJsonPart = (formData: FormData, key: string, value: unknown) => {
  formData.append(key, JSON.stringify(value));
};

export interface ITransactionListQuery extends IOffsetPaginationParams {
  slug?: string;
  branchId?: string;
  search?: string;
  status?: TransactionStatus;
  partyProfileId?: string;
  transactionType?: TransactionType;
}

export const transactionsApi = {
  getTransactionDocumentDownloadUrl: (
    transactionId: string,
    documentId: string
  ) =>
    `${API_BASE_URL}/transactions/${transactionId}/documents/${documentId}/download`,

  getTransactions: async (
    params?: ITransactionListQuery
  ): Promise<IPaginatedResponse<ITransactionEntity>> => {
    const res = await apiClient.get<IPaginatedResponse<ITransactionEntity>>(
      `/transactions${buildQueryString(params)}`
    );

    if (res.error) {
      throw new Error(res.error);
    }

    return normalizePaginatedResponse(res.data, params?.limit, params?.offset);
  },

  getAllTransactions: async (
    params?: Omit<ITransactionListQuery, 'limit' | 'offset'>
  ): Promise<ITransactionEntity[]> =>
    fetchAllMatching(pagination =>
      transactionsApi.getTransactions({ ...params, ...pagination })
    ),

  getQuantityAvailability: async (params: {
    branchId: string;
    counterId: string;
    currencyId: string;
    productId: string;
    excludeTransactionId?: string;
  }): Promise<ITransactionQuantityAvailability> => {
    const query = new URLSearchParams();
    query.set('branchId', params.branchId);
    query.set('counterId', params.counterId);
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

  getAverageSellPrice: async (params: {
    productId: string;
    currencyId: string;
  }) => {
    const query = new URLSearchParams({
      productId: params.productId,
      currencyId: params.currencyId,
    });
    const res = await apiClient.get<{
      productId: string;
      currencyId: string;
      averageSellRate: string;
    }>(`/transactions/average-sell-price?${query.toString()}`);
    if (res.error) throw new Error(res.error);
    return res.data ?? { ...params, averageSellRate: '0.00' };
  },

  getCounterHoldCost: async (params: {
    branchId: string;
    counterId: string;
    currencyId: string;
  }) => {
    const query = new URLSearchParams(params);
    const res = await apiClient.get<{
      branchId: string;
      counterId: string;
      currencyId: string;
      closingQuantity: string;
      closingInrAmount: string;
      holdCostRate: string | null;
    }>(`/transactions/counter-hold-cost?${query.toString()}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to fetch counter hold cost');
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

  getTransactionById: async (
    id: string
  ): Promise<ITransactionEntity | null> => {
    const res = await apiClient.get<ITransactionEntity>(`/transactions/${id}`);

    if (res.error) {
      throw new Error(res.error);
    }

    return res.data || null;
  },

  getNextNumber: async (params: {
    slug: string;
    branchId: string;
  }): Promise<{ nextNumber: string }> => {
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

  previewTax: async (
    payload: ITransactionTaxPreviewRequest,
    signal?: AbortSignal
  ): Promise<ITransactionTaxPreviewResponse> => {
    const res = await apiClient.post<ITransactionTaxPreviewResponse>(
      '/transactions/tax-preview',
      payload,
      { signal }
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to preview transaction tax');
    }

    return res.data;
  },

  previewTcs: async (
    payload: ITransactionTcsPreviewRequest,
    signal?: AbortSignal
  ): Promise<ITransactionTcsPreviewResponse> => {
    const res = await apiClient.post<ITransactionTcsPreviewResponse>(
      '/transactions/tcs-preview',
      payload,
      { signal }
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to preview transaction TCS');
    }

    return res.data;
  },

  previewPurchaseRule: async (
    payload: IPurchaseRulePreviewRequest,
    signal?: AbortSignal
  ): Promise<IPurchaseRulePreviewResponse> => {
    const res = await apiClient.post<IPurchaseRulePreviewResponse>(
      '/transactions/purchase-rule-preview',
      payload,
      { signal }
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to preview purchase rules');
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
