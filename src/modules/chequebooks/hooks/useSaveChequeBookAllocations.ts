import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { chequebookApi } from '@/api';

export interface IChequeBookAllocationPayload {
  checkBookId: string;
  bookNo: number;
  cashierId: string;
  remarks?: string;
}

export const useSaveChequeBookAllocations = () => {
  const mutation = useMutation({
    mutationFn: async (allocations: IChequeBookAllocationPayload[]) => {
      const mapped = allocations.map(a => ({
        checkBookId: a.checkBookId,
        bookNo: a.bookNo,
        assignedToUserId: a.cashierId,
        remarks: a.remarks,
      }));
      return chequebookApi.saveAllocations(mapped);
    },
    onSuccess: () => {
      toast.success('Chequebook page allocations saved successfully.');
    },
  });

  return {
    saveAllocations: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
};
