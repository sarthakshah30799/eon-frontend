import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { accountProfileApi } from '@/api/accountProfile';
import type {
  ICreateAccountProfile,
  IAccountProfileListQuery,
} from '../types/accountProfileTypes';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const useListAccountProfiles = (params?: IAccountProfileListQuery, activeOnly = true) => {
  return useQuery({
    queryKey: ['account-profiles', params, activeOnly],
    queryFn: () => accountProfileApi.getAccountProfiles(params),
    select: response =>
      activeOnly
        ? {
            ...response,
            data: response.data.filter(account => account.active !== false),
          }
        : response,
  });
};

export const useGetAccountProfile = (id: string) => {
  return useQuery({
    queryKey: ['account-profile', id],
    queryFn: () => accountProfileApi.getAccountProfileById(id),
    enabled: Boolean(id),
  });
};

export const useCreateAccountProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateAccountProfile) =>
      accountProfileApi.createAccountProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-profiles'] });
      toast.success('Account Profile created successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to create account profile'));
    },
  });

  return {
    ...mutation,
    submitAccountProfile: mutation.mutateAsync,
  };
};

export const useUpdateAccountProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ICreateAccountProfile }) =>
      accountProfileApi.updateAccountProfile(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['account-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['account-profile', variables.id] });
      toast.success('Account Profile updated successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update account profile'));
    },
  });

  return {
    ...mutation,
    updateAccountProfile: mutation.mutateAsync,
  };
};

export const useDeleteAccountProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => accountProfileApi.deleteAccountProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-profiles'] });
      toast.success('Account Profile deleted successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to delete account profile'));
    },
  });

  return {
    ...mutation,
    deleteAccountProfile: mutation.mutateAsync,
  };
};
