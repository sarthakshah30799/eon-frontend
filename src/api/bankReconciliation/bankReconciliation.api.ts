import { apiClient } from '../api';
import { buildQueryString } from '@/utils';
import type {
  IBankReconciliationClearPayload,
  IBankReconciliationClearResult,
  IBankReconciliationQuery,
  IBankReconciliationResponse,
} from '@/modules/bankReconciliation/types';

const BASE = '/bank-reconciliation';

export const bankReconciliationApi = {
  query: async (
    params: IBankReconciliationQuery
  ): Promise<IBankReconciliationResponse> => {
    const response = await apiClient.get<IBankReconciliationResponse>(
      `${BASE}${buildQueryString(params)}`
    );
    if (response.error) throw new Error(response.error);
    return (
      response.data ?? {
        receivedNotDeposited: [],
        issuedNotPresented: [],
      }
    );
  },

  clear: async (
    payload: IBankReconciliationClearPayload
  ): Promise<IBankReconciliationClearResult> => {
    const response = await apiClient.post<IBankReconciliationClearResult>(
      `${BASE}/clear`,
      payload
    );
    if (response.error) throw new Error(response.error);
    return response.data ?? { updated: 0 };
  },
};
