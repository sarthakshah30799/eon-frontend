import { useQuery } from '@tanstack/react-query';
import { transfersApi } from '@/api/transfers/transfers.api';
import type { TransferStatus, TransferType } from '../types';

export const useListTransfers = (params?: {
  transferType?: TransferType;
  status?: TransferStatus;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['transfers', params],
    queryFn: () => transfersApi.listTransfers(params),
  });
};

