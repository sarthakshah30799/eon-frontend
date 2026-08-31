import { apiClient } from '../api';
import type {
  CardStockPrintPayload,
  CardStockPrintResponse,
} from '@/api/cardStock';
import type {
  CardTransferFormValues,
  CardTransferRequest,
  CardTransferCard,
} from '@/modules/cardTransfer/types';
import type {
  IOffsetPaginationParams,
  IPaginatedResponse,
} from '@/types/pagination';
import { buildQueryString } from '@/utils';
import { fetchAllMatching, normalizePaginatedResponse } from '@/utils/paginatedList';

// Keep the route contract in one place until the backend controller is released.
const BASE_PATH = '/card-stock/transfers';

const request = async <T>(
  promise: Promise<{ data?: T; error?: string }>,
  message: string
): Promise<T> => {
  const response = await promise;
  if (response.error) throw new Error(response.error);
  if (!response.data) throw new Error(message);
  return response.data;
};

export interface ICardTransferListQuery extends IOffsetPaginationParams {
  status?: string;
  search?: string;
}

export const cardTransferApi = {
  list: (params?: ICardTransferListQuery) =>
    request(
      apiClient
        .get<IPaginatedResponse<CardTransferRequest>>(
          `${BASE_PATH}${buildQueryString(params)}`
        )
        .then(response => {
          if (response.error) return response;
          return {
            ...response,
            data: normalizePaginatedResponse(
              response.data,
              params?.limit,
              params?.offset
            ),
          };
        }),
      'Failed to load CARD transfer requests'
    ),

  listAll: (params?: Omit<ICardTransferListQuery, 'limit' | 'offset'>) =>
    fetchAllMatching(pagination =>
      cardTransferApi.list({ ...params, ...pagination })
    ),
  get: (id: string) =>
    request(
      apiClient.get<CardTransferRequest>(`${BASE_PATH}/${id}`),
      'Failed to load CARD transfer request'
    ),
  listAvailableCards: (sourceBranchId: string) =>
    request(
      apiClient.get<CardTransferCard[]>(
        `${BASE_PATH}/available-cards?sourceBranchId=${encodeURIComponent(sourceBranchId)}`
      ),
      'Failed to load available CARD stock'
    ),
  create: (values: CardTransferFormValues) =>
    request(
      apiClient.post<CardTransferRequest>(BASE_PATH, toPayload(values)),
      'Failed to create CARD transfer request'
    ),
  update: (id: string, values: CardTransferFormValues) =>
    request(
      apiClient.put<CardTransferRequest>(
        `${BASE_PATH}/${id}`,
        toPayload(values)
      ),
      'Failed to update CARD transfer request'
    ),
  accept: (id: string) =>
    request(
      apiClient.post<CardTransferRequest>(`${BASE_PATH}/${id}/accept`),
      'Failed to accept CARD transfer request'
    ),
  reject: (id: string, remarks: string) =>
    request(
      apiClient.post<CardTransferRequest>(`${BASE_PATH}/${id}/reject`, {
        remarks,
      }),
      'Failed to reject CARD transfer request'
    ),
  cancel: (id: string, remarks: string) =>
    request(
      apiClient.post<CardTransferRequest>(`${BASE_PATH}/${id}/cancel`, {
        remarks,
      }),
      'Failed to cancel CARD transfer request'
    ),
  remove: (id: string) =>
    request(
      apiClient.delete<{ message: string }>(`${BASE_PATH}/${id}`),
      'Failed to delete CARD transfer request'
    ),
  recordPrint: (
    id: string,
    payload: CardStockPrintPayload & {
      kind: NonNullable<CardStockPrintPayload['kind']>;
    }
  ) =>
    request(
      apiClient.post<CardStockPrintResponse>(
        `${BASE_PATH}/${id}/print`,
        payload
      ),
      'Failed to record CARD transfer print'
    ),
};

const toPayload = (values: CardTransferFormValues) => ({
  sourceBranchId: values.sourceBranchId,
  destinationBranchId: values.destinationBranchId,
  transactionDate: values.transactionDate,
  remarks: values.remarks,
  items: values.items.map((item, index) => ({
    lineNo: index + 1,
    currencyId: item.currencyId,
    per: item.per,
    productId: item.productId,
    issuerPartyProfileId: item.issuerPartyProfileId,
    cardIds: item.cards.map(card => card.id),
  })),
});
