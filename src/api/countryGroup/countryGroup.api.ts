import { apiClient } from '../api';

export interface ICountryGroup {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateCountryGroup {
  name: string;
  code?: string;
}

export const countryGroupApi = {
  getCountryGroups: async (): Promise<ICountryGroup[]> => {
    const res = await apiClient.get<ICountryGroup[]>('/country-groups');
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getCountryGroupById: async (id: string): Promise<ICountryGroup | undefined> => {
    const res = await apiClient.get<ICountryGroup>(`/country-groups/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  createCountryGroup: async (values: ICreateCountryGroup): Promise<ICountryGroup> => {
    const res = await apiClient.post<ICountryGroup>('/country-groups', values);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create country group');
    return res.data;
  },

  updateCountryGroup: async (id: string, values: Partial<ICreateCountryGroup>): Promise<ICountryGroup | undefined> => {
    const res = await apiClient.put<ICountryGroup>(`/country-groups/${id}`, values);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  deleteCountryGroup: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/country-groups/${id}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to delete country group');
    return res.data;
  },
};
