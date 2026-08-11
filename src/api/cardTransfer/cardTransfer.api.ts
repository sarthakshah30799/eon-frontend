import { apiClient } from '../api';
import type { CardTransferFormValues, CardTransferRequest, CardTransferCard } from '@/modules/cardTransfer/types';

// Keep the route contract in one place until the backend controller is released.
const BASE_PATH = '/card-stock/transfers';

const request = async <T>(promise: Promise<{ data?: T; error?: string }>, message: string): Promise<T> => {
  const response = await promise;
  if (response.error) throw new Error(response.error);
  if (!response.data) throw new Error(message);
  return response.data;
};

export const cardTransferApi = {
  list: (params?: { status?: string; search?: string }) => request(apiClient.get<CardTransferRequest[]>(`${BASE_PATH}${params ? `?${new URLSearchParams(Object.entries(params).filter(([, value]) => Boolean(value)) as string[][])}` : ''}`), 'Failed to load CARD transfer requests'),
  get: (id: string) => request(apiClient.get<CardTransferRequest>(`${BASE_PATH}/${id}`), 'Failed to load CARD transfer request'),
  listAvailableCards: (sourceBranchId: string) => request(apiClient.get<CardTransferCard[]>(`${BASE_PATH}/available-cards?sourceBranchId=${encodeURIComponent(sourceBranchId)}`), 'Failed to load available CARD stock'),
  create: (values: CardTransferFormValues) => request(apiClient.post<CardTransferRequest>(BASE_PATH, toPayload(values)), 'Failed to create CARD transfer request'),
  update: (id: string, values: CardTransferFormValues) => request(apiClient.put<CardTransferRequest>(`${BASE_PATH}/${id}`, toPayload(values)), 'Failed to update CARD transfer request'),
  accept: (id: string) => request(apiClient.post<CardTransferRequest>(`${BASE_PATH}/${id}/accept`), 'Failed to accept CARD transfer request'),
  reject: (id: string, remarks: string) => request(apiClient.post<CardTransferRequest>(`${BASE_PATH}/${id}/reject`, { remarks }), 'Failed to reject CARD transfer request'),
  cancel: (id: string, remarks: string) => request(apiClient.post<CardTransferRequest>(`${BASE_PATH}/${id}/cancel`, { remarks }), 'Failed to cancel CARD transfer request'),
  remove: (id: string) => request(apiClient.delete<{ message: string }>(`${BASE_PATH}/${id}`), 'Failed to delete CARD transfer request'),
};

const toPayload = (values: CardTransferFormValues) => ({ sourceBranchId: values.sourceBranchId, destinationBranchId: values.destinationBranchId, transactionDate: values.transactionDate, remarks: values.remarks, items: values.items.map((item, index) => ({ lineNo: index + 1, currencyId: item.currencyId, per: item.per, productId: item.productId, issuerPartyProfileId: item.issuerPartyProfileId, cardIds: item.cards.map(card => card.id) })) });
