import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { corporateClientApi } from '@/api/corporateClient';
import type {
  ICreateCorporateClient,
  ICorporateClientListQuery,
  IUpdateCorporateClient,
} from '../types/corporateClientTypes';

export const useListCorporateClients = (params?: ICorporateClientListQuery) => {
  return useQuery({
    queryKey: ['corporate-clients', params],
    queryFn: () => corporateClientApi.getCorporateClients(params),
  });
};

export const useGetCorporateClient = (id: string) => {
  return useQuery({
    queryKey: ['corporate-client', id],
    queryFn: () => corporateClientApi.getCorporateClientById(id),
    enabled: Boolean(id),
  });
};

export const useCreateCorporateClient = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateCorporateClient) =>
      corporateClientApi.createCorporateClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-clients'] });
      toast.success('Corporate Client Profile created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create corporate client profile');
    },
  });

  return {
    ...mutation,
    submitCorporateClient: mutation.mutateAsync,
  };
};

export const useUpdateCorporateClient = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateCorporateClient }) =>
      corporateClientApi.updateCorporateClient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['corporate-clients'] });
      queryClient.invalidateQueries({ queryKey: ['corporate-client', variables.id] });
      toast.success('Corporate Client Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update corporate client profile');
    },
  });

  return {
    ...mutation,
    updateCorporateClient: mutation.mutateAsync,
  };
};

export const useDeleteCorporateClient = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => corporateClientApi.deleteCorporateClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-clients'] });
      toast.success('Corporate Client Profile deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete corporate client profile');
    },
  });

  return {
    ...mutation,
    deleteCorporateClient: mutation.mutateAsync,
  };
};
