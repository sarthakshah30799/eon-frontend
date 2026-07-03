import { useMutation } from '@tanstack/react-query';
import { manualBillBookApi, type IApproveRejectManualBook } from '@/api';

interface IApproveRejectManualBillBookInput {
  id: string;
  data: IApproveRejectManualBook;
}

export const useApproveRejectManualBillBook = () => {
  const mutation = useMutation({
    mutationFn: async ({ id, data }: IApproveRejectManualBillBookInput) => {
      return manualBillBookApi.approveOrReject(id, data);
    },
  });

  return {
    approveOrReject: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
  };
};
