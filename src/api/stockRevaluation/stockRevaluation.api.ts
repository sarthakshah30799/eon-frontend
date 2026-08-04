import { apiClient } from '../api';

export type StockRevaluationFrequency = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY';
export interface StockRevaluationTarget { branchId: string; counterId: string; }

export interface IStockRevaluationItem {
  id: string;
  lineNo: number;
  currencyId: string;
  currencySnapshot: { id?: string; currencyCode?: string; currencyName?: string } | null;
  closingQuantity: string;
  awp: string;
  closingInrAmount: string;
  newRate: string;
  newInrAmount: string;
  differenceInr: string;
}

export interface IStockRevaluation {
  id: string;
  branchId: string;
  counterId: string;
  counterSnapshot: { id?: string; counterNo?: number; name?: string; label?: string } | null;
  branchSnapshot: { id?: string; code?: string; name?: string; label?: string } | null;
  frequency: StockRevaluationFrequency;
  valuationDate: string;
  uploadedDate: string;
  items: IStockRevaluationItem[];
}

export const stockRevaluationApi = {
  getTemplate: async (): Promise<Blob> => {
    const response = await apiClient.getDownload('/stock-revaluations/template');
    if (response.error || !response.data) throw new Error(response.error || 'Failed to download template');
    return response.data.blob;
  },

  process: async (payload: { targets: StockRevaluationTarget[]; frequency: StockRevaluationFrequency; file: File }) => {
    const formData = new FormData();
    formData.append('targets', JSON.stringify(payload.targets));
    formData.append('frequency', payload.frequency);
    formData.append('file', payload.file);
    const response = await apiClient.postFormData<IStockRevaluation[]>('/stock-revaluations/process', formData);
    if (response.error || !response.data) throw new Error(response.error || 'Failed to process stock revaluation');
    return response.data;
  },

  current: async (targets: StockRevaluationTarget[], frequency: StockRevaluationFrequency) => {
    const query = `?targets=${encodeURIComponent(JSON.stringify(targets))}&frequency=${frequency}`;
    const response = await apiClient.get<IStockRevaluation[]>(`/stock-revaluations/current${query}`);
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(`/stock-revaluations/${id}`);
    if (response.error) throw new Error(response.error);
  },
};
