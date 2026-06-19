import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { corporateClientApi } from '@/api/corporateClient';
import {
  DEFAULT_CORPORATE_CLIENT_PROFILE_TYPE,
  getCorporateClientProfileTypeConfig,
  type CorporateClientProfileType,
} from '../constants';
import type {
  ICreateCorporateClient,
  ICorporateClientListQuery,
  IUpdateCorporateClient,
} from '../types/corporateClientTypes';

export const useListCorporateClients = (
  params?: ICorporateClientListQuery,
  profileType: CorporateClientProfileType = DEFAULT_CORPORATE_CLIENT_PROFILE_TYPE
) => {
  return useQuery({
    queryKey: ['corporate-clients', profileType, params],
    queryFn: () => corporateClientApi.getCorporateClients(params, profileType),
  });
};

export const useGetCorporateClient = (
  id: string,
  profileType: CorporateClientProfileType = DEFAULT_CORPORATE_CLIENT_PROFILE_TYPE
) => {
  return useQuery({
    queryKey: ['corporate-client', profileType, id],
    queryFn: () => corporateClientApi.getCorporateClientById(id, profileType),
    enabled: Boolean(id),
  });
};

export const useCreateCorporateClient = (
  profileType: CorporateClientProfileType = DEFAULT_CORPORATE_CLIENT_PROFILE_TYPE
) => {
  const queryClient = useQueryClient();
  const typeConfig = getCorporateClientProfileTypeConfig(profileType);

  const mutation = useMutation({
    mutationFn: (data: ICreateCorporateClient) =>
      corporateClientApi.createCorporateClient(data, profileType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-clients', profileType] });
      toast.success(`${typeConfig.toastLabel} created successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.message || `Failed to create ${typeConfig.toastLabel.toLowerCase()}`);
    },
  });

  return {
    ...mutation,
    submitCorporateClient: mutation.mutateAsync,
  };
};

export const useUpdateCorporateClient = (
  profileType: CorporateClientProfileType = DEFAULT_CORPORATE_CLIENT_PROFILE_TYPE
) => {
  const queryClient = useQueryClient();
  const typeConfig = getCorporateClientProfileTypeConfig(profileType);

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateCorporateClient }) =>
      corporateClientApi.updateCorporateClient(id, data, profileType),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['corporate-clients', profileType] });
      queryClient.invalidateQueries({ queryKey: ['corporate-client', profileType, variables.id] });
      toast.success(`${typeConfig.toastLabel} updated successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.message || `Failed to update ${typeConfig.toastLabel.toLowerCase()}`);
    },
  });

  return {
    ...mutation,
    updateCorporateClient: mutation.mutateAsync,
  };
};

export const useDeleteCorporateClient = (
  profileType: CorporateClientProfileType = DEFAULT_CORPORATE_CLIENT_PROFILE_TYPE
) => {
  const queryClient = useQueryClient();
  const typeConfig = getCorporateClientProfileTypeConfig(profileType);

  const mutation = useMutation({
    mutationFn: (id: string) => corporateClientApi.deleteCorporateClient(id, profileType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-clients', profileType] });
      toast.success(`${typeConfig.toastLabel} deleted successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.message || `Failed to delete ${typeConfig.toastLabel.toLowerCase()}`);
    },
  });

  return {
    ...mutation,
    deleteCorporateClient: mutation.mutateAsync,
  };
};
