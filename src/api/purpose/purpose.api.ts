import { apiClient } from '../api';
import type { ICreatePurpose, IPurpose } from '@/modules/purpose/types';
import type { TransactionType } from '@/modules/transactions';

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

interface BackendPurpose extends Omit<IPurpose, 'threshold' | 'rate' | 'slabs'> {
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
  transactionType: values.transactionType,
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

export const purposeApi = {
  getPurposes: async (search?: string, transactionType?: TransactionType): Promise<IPurpose[]> => {
    const params = new URLSearchParams();
    if (search?.trim()) {
      params.set('search', search.trim());
    }
    if (transactionType) {
      params.set('transactionType', transactionType);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get<BackendPurpose[]>(`/purposes${query}`);

    if (res.error) throw new Error(res.error);
    return (res.data ?? []).map(mapBackendToFrontend);
  },

  getPurposeById: async (id: string): Promise<IPurpose | undefined> => {
    const res = await apiClient.get<BackendPurpose>(`/purposes/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  getPurposeByCode: async (code: string): Promise<IPurpose | undefined> => {
    const res = await apiClient.get<BackendPurpose>(`/purposes/code/${encodeURIComponent(code)}`);
    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  createPurpose: async (values: ICreatePurpose): Promise<IPurpose> => {
    const res = await apiClient.post<BackendPurpose>('/purposes', preparePayload(values));
    if (res.error) throw new Error(res.error);
    if (!res.data) {
      throw new Error('Failed to create purpose');
    }
    return mapBackendToFrontend(res.data);
  },

  updatePurpose: async (id: string, values: ICreatePurpose): Promise<IPurpose | undefined> => {
    const res = await apiClient.put<BackendPurpose>(`/purposes/${id}`, preparePayload(values));
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
