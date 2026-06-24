import { apiClient } from '../api';
import type {
  IPartyProfileDocumentsResponse,
  IUploadPartyProfileDocumentPayload,
} from '@/modules/partyProfileDocuments/types/partyProfileDocumentTypes';

const buildDownloadUrl = (partyProfileId: string, documentProfileRuleId: string) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  return `${baseUrl}/party-profiles/${partyProfileId}/documents/${documentProfileRuleId}/download`;
};

export const partyProfileDocumentsApi = {
  getPartyProfileDocuments: async (
    partyProfileId: string,
  ): Promise<IPartyProfileDocumentsResponse> => {
    const res = await apiClient.get<IPartyProfileDocumentsResponse>(
      `/party-profiles/${partyProfileId}/documents`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('No party profile documents returned from server');
    }

    return res.data;
  },

  uploadPartyProfileDocument: async (
    payload: IUploadPartyProfileDocumentPayload,
  ): Promise<IPartyProfileDocumentsResponse> => {
    const formData = new FormData();
    formData.append('file', payload.file);

    const res = await apiClient.postFormData<IPartyProfileDocumentsResponse>(
      `/party-profiles/${payload.partyProfileId}/documents/${payload.documentProfileRuleId}`,
      formData,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('No party profile documents returned from server');
    }

    return res.data;
  },

  getDownloadUrl: buildDownloadUrl,
};

export default partyProfileDocumentsApi;
