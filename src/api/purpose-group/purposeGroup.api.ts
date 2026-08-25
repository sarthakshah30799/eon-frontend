import { apiClient } from '../api';
import type {
  ICreatePurposeGroup,
  IPurposeGroup,
  PurposeGroupProfileType,
} from '@/modules/purpose-group/types';

const preparePayload = (values: ICreatePurposeGroup) => ({
  name: values.name.trim(),
  title: values.title.trim(),
  profileType: values.profileType,
  sortOrder: Number(values.sortOrder || 0),
  purposeIds: [...new Set((values.purposeIds ?? []).filter(Boolean))],
});

export const purposeGroupApi = {
  getPurposeGroups: async (
    search?: string,
    profileType?: PurposeGroupProfileType,
  ): Promise<IPurposeGroup[]> => {
    const params = new URLSearchParams();
    if (search?.trim()) {
      params.set('search', search.trim());
    }
    if (profileType) {
      params.set('profileType', profileType);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get<IPurposeGroup[]>(`/purpose-groups${query}`);
    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },

  getPurposeGroupById: async (id: string): Promise<IPurposeGroup | undefined> => {
    const res = await apiClient.get<IPurposeGroup>(`/purpose-groups/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data ?? undefined;
  },

  createPurposeGroup: async (values: ICreatePurposeGroup): Promise<IPurposeGroup> => {
    const res = await apiClient.post<IPurposeGroup>(
      '/purpose-groups',
      preparePayload(values),
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) {
      throw new Error('Failed to create purpose group');
    }
    return res.data;
  },

  updatePurposeGroup: async (
    id: string,
    values: ICreatePurposeGroup,
  ): Promise<IPurposeGroup | undefined> => {
    const res = await apiClient.put<IPurposeGroup>(
      `/purpose-groups/${id}`,
      preparePayload(values),
    );
    if (res.error) throw new Error(res.error);
    return res.data ?? undefined;
  },

  deletePurposeGroup: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/purpose-groups/${id}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) {
      throw new Error('Failed to delete purpose group');
    }
    return res.data;
  },
};

export default purposeGroupApi;
