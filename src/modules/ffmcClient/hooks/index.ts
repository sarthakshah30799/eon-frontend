import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ffmcClientApi } from '@/api/ffmcClient';
import type {
  ICreateFfmcClient,
  IFfmcClientListQuery,
  IUpdateFfmcClient,
} from '../types/ffmcClientTypes';

export const useListFfmcClients = (params?: IFfmcClientListQuery) => {
  return useQuery({
    queryKey: ['ffmc-clients', params],
    queryFn: () => ffmcClientApi.getFfmcClients(params),
  });
};

export const useGetFfmcClient = (id: string) => {
  return useQuery({
    queryKey: ['ffmc-client', id],
    queryFn: () => ffmcClientApi.getFfmcClientById(id),
    enabled: Boolean(id),
  });
};

export const useCreateFfmcClient = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: ICreateFfmcClient) => ffmcClientApi.createFfmcClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ffmc-clients'] });
      toast.success('FFMC Client Profile created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create FFMC client profile');
    },
  });
  return { ...mutation, submitFfmcClient: mutation.mutateAsync };
};

export const useUpdateFfmcClient = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateFfmcClient }) =>
      ffmcClientApi.updateFfmcClient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ffmc-clients'] });
      queryClient.invalidateQueries({ queryKey: ['ffmc-client', variables.id] });
      toast.success('FFMC Client Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update FFMC client profile');
    },
  });
  return { ...mutation, updateFfmcClient: mutation.mutateAsync };
};

export const useDeleteFfmcClient = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) => ffmcClientApi.deleteFfmcClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ffmc-clients'] });
      toast.success('FFMC Client Profile deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete FFMC client profile');
    },
  });
  return { ...mutation, deleteFfmcClient: mutation.mutateAsync };
};
