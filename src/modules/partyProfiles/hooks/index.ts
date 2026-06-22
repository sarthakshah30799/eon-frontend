import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { partyProfileApi } from '@/api/partyProfile';
import {
  DEFAULT_PARTY_PROFILE_TYPE,
  getPartyProfileTypeConfig,
  type PartyProfileType,
} from '../constants';
import type {
  ICreatePartyProfile,
  IPartyProfileListQuery,
  IUpdatePartyProfile,
} from '../types/partyProfileTypes';

export const useListPartyProfiles = (
  params?: IPartyProfileListQuery,
  profileType: PartyProfileType = DEFAULT_PARTY_PROFILE_TYPE
) => {
  return useQuery({
    queryKey: ['party-profiles', profileType, params],
    queryFn: () => partyProfileApi.getPartyProfiles(params, profileType),
  });
};

export const useGetPartyProfile = (
  id: string,
  profileType: PartyProfileType = DEFAULT_PARTY_PROFILE_TYPE
) => {
  return useQuery({
    queryKey: ['party-profile', profileType, id],
    queryFn: () => partyProfileApi.getPartyProfileById(id, profileType),
    enabled: Boolean(id),
  });
};

export const useCreatePartyProfile = (
  profileType: PartyProfileType = DEFAULT_PARTY_PROFILE_TYPE
) => {
  const queryClient = useQueryClient();
  const typeConfig = getPartyProfileTypeConfig(profileType);

  const mutation = useMutation({
    mutationFn: (data: ICreatePartyProfile) =>
      partyProfileApi.createPartyProfile(data, profileType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['party-profiles', profileType] });
      toast.success(`${typeConfig.toastLabel} created successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.message || `Failed to create ${typeConfig.toastLabel.toLowerCase()}`);
    },
  });

  return {
    ...mutation,
    submitPartyProfile: mutation.mutateAsync,
  };
};

export const useUpdatePartyProfile = (
  profileType: PartyProfileType = DEFAULT_PARTY_PROFILE_TYPE
) => {
  const queryClient = useQueryClient();
  const typeConfig = getPartyProfileTypeConfig(profileType);

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdatePartyProfile }) =>
      partyProfileApi.updatePartyProfile(id, data, profileType),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['party-profiles', profileType] });
      queryClient.invalidateQueries({ queryKey: ['party-profile', profileType, variables.id] });
      toast.success(`${typeConfig.toastLabel} updated successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.message || `Failed to update ${typeConfig.toastLabel.toLowerCase()}`);
    },
  });

  return {
    ...mutation,
    updatePartyProfile: mutation.mutateAsync,
  };
};

export const useDeletePartyProfile = (
  profileType: PartyProfileType = DEFAULT_PARTY_PROFILE_TYPE
) => {
  const queryClient = useQueryClient();
  const typeConfig = getPartyProfileTypeConfig(profileType);

  const mutation = useMutation({
    mutationFn: (id: string) => partyProfileApi.deletePartyProfile(id, profileType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['party-profiles', profileType] });
      toast.success(`${typeConfig.toastLabel} deleted successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.message || `Failed to delete ${typeConfig.toastLabel.toLowerCase()}`);
    },
  });

  return {
    ...mutation,
    deletePartyProfile: mutation.mutateAsync,
  };
};

export const usePartyProfileTypes = () => {
  return useQuery({
    queryKey: ['party-profile-types'],
    queryFn: () => partyProfileApi.getPartyProfileTypes(),
  });
};
