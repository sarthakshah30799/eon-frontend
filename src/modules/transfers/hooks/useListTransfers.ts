import { useQuery } from '@tanstack/react-query';
import { transfersApi, type ITransferListQuery } from '@/api/transfers/transfers.api';

export const useListTransfers = (params?: Omit<ITransferListQuery, 'limit' | 'offset'>) => {
  return useQuery({
    queryKey: ['transfers', 'all', params],
    queryFn: () => transfersApi.listAllTransfers(params),
  });
};
