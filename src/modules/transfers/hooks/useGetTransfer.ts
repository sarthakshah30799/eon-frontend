import { useQuery } from '@tanstack/react-query';
import { transfersApi } from '@/api/transfers/transfers.api';

export const useGetTransfer = (id: string) => {
  return useQuery({
    queryKey: ['transfer', id],
    queryFn: () => transfersApi.getTransferById(id),
    enabled: Boolean(id),
  });
};
