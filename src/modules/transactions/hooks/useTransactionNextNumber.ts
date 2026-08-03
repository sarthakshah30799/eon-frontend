import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/api/transactions';

export const useTransactionNextNumber = ({
  slug,
  branchId,
  enabled = true,
}: {
  slug: string;
  branchId?: string | null;
  enabled?: boolean;
}) =>
  useQuery({
    queryKey: ['transaction-next-number', slug, branchId ?? ''],
    queryFn: () =>
      transactionsApi.getNextNumber({
        slug,
        branchId: branchId ?? '',
      }),
    enabled: Boolean(enabled && slug && branchId),
  });

export default useTransactionNextNumber;
