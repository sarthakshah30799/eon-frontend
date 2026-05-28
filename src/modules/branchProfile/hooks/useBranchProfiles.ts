import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { branchProfileApi } from '@/api/branchProfile/branchProfile.api';
import type { BranchProfileFormValues } from '../types';

export const useListBranchProfiles = () => {
  return useQuery({
    queryKey: ['branch-profiles'],
    queryFn: async () => {
      const res = await branchProfileApi.getBranches();
      if (res.error) throw new Error(res.error);
      return res.data || [];
    },
  });
};

export const useGetBranchProfile = (id: string | undefined) => {
  return useQuery({
    queryKey: ['branch-profile', id],
    queryFn: async () => {
      if (!id) throw new Error('Branch ID is required');
      const res = await branchProfileApi.getBranchById(id);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    enabled: Boolean(id),
  });
};

export const useCreateBranchProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: BranchProfileFormValues) => {
      const res = await branchProfileApi.createBranch(values);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-profiles'] });
      toast.success('Branch profile created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create branch profile');
    },
  });

  return {
    createBranchProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};

export const useUpdateBranchProfile = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: BranchProfileFormValues) => {
      const res = await branchProfileApi.updateBranch(id, values);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ['branch-profiles'] });
      queryClient.setQueryData(['branch-profile', id], updatedData);
      toast.success('Branch profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update branch profile');
    },
  });

  return {
    updateBranchProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};

export const useDeleteBranchProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await branchProfileApi.deleteBranch(id);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-profiles'] });
      toast.success('Branch profile deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete branch profile');
    },
  });

  return {
    deleteBranch: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};
