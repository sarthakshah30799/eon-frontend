import { apiClient } from '../api';
import type {
  ICreatePurpose,
  IPurpose,
  IPurposeListQuery,
  IPurposeListResponse,
} from '@/modules/purpose/types';
import type { PurposePartyProfileType } from '@/modules/purpose/types';
import { buildQueryString } from '@/utils';
import { fetchAllMatching, normalizePaginatedResponse } from '@/utils/paginatedList';

interface BackendPurposeSlab {
  id: string;
  purposeId: string;
  sortOrder: number;
  fromAmount: string;
  toAmount: string | null;
  rate: string;
  rateType: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendPurpose extends Omit<
  IPurpose,
  'threshold' | 'rate' | 'slabs'
> {
  threshold: string;
  rate: string;
  slabs: BackendPurposeSlab[];
}

const mapSlab = (slab: BackendPurposeSlab) => ({
  ...slab,
  fromAmount: Number(slab.fromAmount),
  toAmount: slab.toAmount === null ? null : Number(slab.toAmount),
  rate: Number(slab.rate),
  rateType: slab.rateType as IPurpose['rateType'],
});

const mapBackendToFrontend = (purpose: BackendPurpose): IPurpose => ({
  ...purpose,
  threshold: Number(purpose.threshold),
  rate: Number(purpose.rate),
  slabs: (purpose.slabs ?? []).map(mapSlab),
});

const preparePayload = (values: ICreatePurpose): ICreatePurpose => ({
  code: values.code.trim().toUpperCase(),
  description: values.description.trim(),
  threshold: Number(values.threshold || 0),
  rate: Number(values.rate || 0),
  rateType: values.rateType,
  corporate: values.corporate,
  individual: values.individual,
  sell: values.sell,
  purchase: values.purchase,
  slabs: (values.slabs ?? []).map(slab => ({
    sortOrder: Number(slab.sortOrder || 0),
    fromAmount: Number(slab.fromAmount || 0),
    toAmount:
      slab.toAmount === null || slab.toAmount === undefined
        ? null
        : Number(slab.toAmount),
    rate: Number(slab.rate || 0),
    rateType: slab.rateType,
  })),
});

const normalizePurposeListQuery = (
  search?: string,
  transactionType?: IPurposeListQuery['transactionType'],
  partyProfileType?: PurposePartyProfileType
): IPurposeListQuery | undefined => {
  if (
    search === undefined &&
    transactionType === undefined &&
    partyProfileType === undefined
  ) {
    return undefined;
  }

  return {
    search: search?.trim() || undefined,
    transactionType,
    partyProfileType,
  };
};

export const purposeApi = {
  getPurposes: async (
    params?: IPurposeListQuery | string,
    transactionType?: IPurposeListQuery['transactionType'],
    partyProfileType?: PurposePartyProfileType
  ): Promise<IPurposeListResponse> => {
    const queryObj: IPurposeListQuery | undefined =
      typeof params === 'string'
        ? normalizePurposeListQuery(params, transactionType, partyProfileType)
        : params;
    const res = await apiClient.get<IPurposeListResponse>(
      `/purposes${buildQueryString(queryObj)}`
    );

    if (res.error) throw new Error(res.error);
    const payload = normalizePaginatedResponse(
      res.data
        ? {
            ...res.data,
            data: (res.data.data ?? []).map(item =>
              mapBackendToFrontend(item as unknown as BackendPurpose)
            ),
          }
        : res.data,
      queryObj?.limit,
      queryObj?.offset
    );
    return payload;
  },

  getAllPurposes: async (
    params?: Omit<IPurposeListQuery, 'limit' | 'offset'>
  ): Promise<IPurpose[]> =>
    fetchAllMatching(pagination =>
      purposeApi.getPurposes({ ...params, ...pagination })
    ),

  getPurposeById: async (id: string): Promise<IPurpose | undefined> => {
    const res = await apiClient.get<BackendPurpose>(`/purposes/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  getPurposeByCode: async (code: string): Promise<IPurpose | undefined> => {
    const res = await apiClient.get<BackendPurpose>(
      `/purposes/code/${encodeURIComponent(code)}`
    );
    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  createPurpose: async (values: ICreatePurpose): Promise<IPurpose> => {
    const res = await apiClient.post<BackendPurpose>(
      '/purposes',
      preparePayload(values)
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) {
      throw new Error('Failed to create purpose');
    }
    return mapBackendToFrontend(res.data);
  },

  updatePurpose: async (
    id: string,
    values: ICreatePurpose
  ): Promise<IPurpose | undefined> => {
    const res = await apiClient.put<BackendPurpose>(
      `/purposes/${id}`,
      preparePayload(values)
    );
    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  deletePurpose: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/purposes/${id}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) {
      throw new Error('Failed to delete purpose');
    }
    return res.data;
  },
};

export default purposeApi;
