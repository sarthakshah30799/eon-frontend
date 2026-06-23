import { apiClient } from '../api';
import type { ICreateTdsProfile, ITdsProfile } from '@/modules/tdsProfile/types';
import { normalizeCodeValue } from '@/utils';

interface BackendTdsProfile extends Omit<ITdsProfile, 'from' | 'to'> {
  from: string | null;
  to: string | null;
}

const mapBackendToFrontend = (profile: BackendTdsProfile): ITdsProfile => ({
  ...profile,
  from: profile.from || '',
  to: profile.to || '',
});

const preparePayload = (values: ICreateTdsProfile): ICreateTdsProfile => ({
  code: normalizeCodeValue(values.code),
  name: values.name.trim(),
  description: values.description?.trim() || '',
  active: values.active ?? true,
  sortOrder: values.sortOrder ?? 0,
  from: values.from?.trim() || undefined,
  to: values.to?.trim() || undefined,
  value: values.value,
});

export const tdsProfileApi = {
  getTdsProfiles: async (): Promise<ITdsProfile[]> => {
    const res = await apiClient.get<BackendTdsProfile[]>('/tds-profiles');

    if (res.error) throw new Error(res.error);
    return (res.data || []).map(mapBackendToFrontend);
  },

  getTdsProfileById: async (id: string): Promise<ITdsProfile | undefined> => {
    const res = await apiClient.get<BackendTdsProfile>(`/tds-profiles/${id}`);

    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  createTdsProfile: async (values: ICreateTdsProfile): Promise<ITdsProfile> => {
    const res = await apiClient.post<BackendTdsProfile>(
      '/tds-profiles',
      preparePayload(values)
    );

    if (res.error) throw new Error(res.error);
    if (!res.data) {
      throw new Error('Failed to create TDS profile');
    }

    return mapBackendToFrontend(res.data);
  },

  updateTdsProfile: async (
    id: string,
    values: ICreateTdsProfile
  ): Promise<ITdsProfile | undefined> => {
    const res = await apiClient.put<BackendTdsProfile>(
      `/tds-profiles/${id}`,
      preparePayload(values)
    );

    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  deleteTdsProfile: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/tds-profiles/${id}`);

    if (res.error) throw new Error(res.error);
    if (!res.data) {
      throw new Error('Failed to delete TDS profile');
    }

    return res.data;
  },
};

export default tdsProfileApi;
