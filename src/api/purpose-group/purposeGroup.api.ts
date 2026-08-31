import { apiClient } from '../api';
import type {
  ICreatePurposeGroup,
  IPurposeGroup,
  IPurposeGroupListQuery,
  IPurposeGroupListResponse,
  PurposeGroupProfileType,
} from '@/modules/purpose-group/types';
import { buildQueryString } from '@/utils';
import { fetchAllMatching, normalizePaginatedResponse } from '@/utils/paginatedList';

const preparePayload = (values: ICreatePurposeGroup) => ({
  name: values.name.trim(),
  title: values.title.trim(),
  profileType: values.profileType,
  sortOrder: Number(values.sortOrder || 0),
  purposeIds: [...new Set((values.purposeIds ?? []).filter(Boolean))],
});

const normalizePurposeGroupListQuery = (
  search?: string,
  profileType?: PurposeGroupProfileType
): IPurposeGroupListQuery | undefined => {
  if (search === undefined && profileType === undefined) {
    return undefined;
  }

  return {
    search: search?.trim() || undefined,
    profileType,
  };
};

export const purposeGroupApi = {
  getPurposeGroups: async (
    params?: IPurposeGroupListQuery | string,
    profileType?: PurposeGroupProfileType
  ): Promise<IPurposeGroupListResponse> => {
    const queryObj: IPurposeGroupListQuery | undefined =
      typeof params === 'string'
        ? normalizePurposeGroupListQuery(params, profileType)
        : params;
    const res = await apiClient.get<IPurposeGroupListResponse>(
      `/purpose-groups${buildQueryString(queryObj)}`
    );
    if (res.error) throw new Error(res.error);
    return normalizePaginatedResponse(res.data, queryObj?.limit, queryObj?.offset);
  },

  getAllPurposeGroups: async (
    params?: Omit<IPurposeGroupListQuery, 'limit' | 'offset'>
  ): Promise<IPurposeGroup[]> =>
    fetchAllMatching(pagination =>
      purposeGroupApi.getPurposeGroups({ ...params, ...pagination })
    ),

  getPurposeGroupById: async (
    id: string
  ): Promise<IPurposeGroup | undefined> => {
    const res = await apiClient.get<IPurposeGroup>(`/purpose-groups/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data ?? undefined;
  },

  createPurposeGroup: async (
    values: ICreatePurposeGroup
  ): Promise<IPurposeGroup> => {
    const res = await apiClient.post<IPurposeGroup>(
      '/purpose-groups',
      preparePayload(values)
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) {
      throw new Error('Failed to create purpose group');
    }
    return res.data;
  },

  updatePurposeGroup: async (
    id: string,
    values: ICreatePurposeGroup
  ): Promise<IPurposeGroup | undefined> => {
    const res = await apiClient.put<IPurposeGroup>(
      `/purpose-groups/${id}`,
      preparePayload(values)
    );
    if (res.error) throw new Error(res.error);
    return res.data ?? undefined;
  },

  deletePurposeGroup: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(
      `/purpose-groups/${id}`
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) {
      throw new Error('Failed to delete purpose group');
    }
    return res.data;
  },
};

export default purposeGroupApi;
