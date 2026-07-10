import { useQuery } from '@tanstack/react-query';
import { manualBillBookApi, type IManualBookPageTracking } from '@/api';

export interface ISelectableManualBillBookPagesQuery {
  branchId?: string;
  userId?: string;
  transactionType?: string;
  enabled?: boolean;
}

export const useSelectableManualBillBookPages = (
  params?: ISelectableManualBillBookPagesQuery
) => {
  const branchId = params?.branchId?.trim() || undefined;
  const userId = params?.userId?.trim() || undefined;
  const transactionType = params?.transactionType?.trim() || undefined;
  const enabled = params?.enabled ?? true;

  return useQuery<IManualBookPageTracking[]>({
    queryKey: [
      'manual-bill-book-selectable-pages',
      branchId ?? '',
      userId ?? '',
      transactionType ?? '',
    ],
    queryFn: async () => {
      return manualBillBookApi.getSelectablePages({
        userId,
        transactionType,
      });
    },
    enabled: Boolean(enabled && branchId),
  });
};
