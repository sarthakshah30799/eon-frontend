import { apiClient } from '../api';
import type {
  ICreateTransactionDraftPayload,
  IRecordTransactionPrintPayload,
  ITransactionEntity,
} from '@/modules/transactions';

const appendJsonPart = (
  formData: FormData,
  key: string,
  value: unknown
) => {
  formData.append(key, JSON.stringify(value));
};

export const transactionsApi = {
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
