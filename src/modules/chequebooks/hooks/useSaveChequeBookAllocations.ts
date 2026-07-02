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
      return chequebookApi.saveAllocations(allocations);
    },
    onSuccess: () => {
      toast.success('Manager to Cashier allocations saved successfully.');
    },
  });

  return {
    saveAllocations: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
};
