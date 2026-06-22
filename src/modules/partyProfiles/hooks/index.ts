import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { partyProfileApi } from '@/api/partyProfile';
import {
  toPartyProfileDisplayLabel,
  type PartyProfileType,
} from '../constants';
import type {
  ICreatePartyProfile,
  IPartyProfileListQuery,
  IUpdatePartyProfile,
} from '../types/partyProfileTypes';

export const useListPartyProfiles = (
  params?: IPartyProfileListQuery,
  profileType?: PartyProfileType,
  enabled = true
) => {
  return useQuery({
    queryKey: ['party-profiles', profileType, params],
    queryFn: () => partyProfileApi.getPartyProfiles(params, profileType),
    enabled,
  });
};

export const useGetPartyProfile = (
  id: string,
  profileType?: PartyProfileType,
  enabled = true
) => {
  return useQuery({
    queryKey: ['party-profile', profileType, id],
    queryFn: () => partyProfileApi.getPartyProfileById(id),
    enabled: Boolean(id) && enabled,
  });
};

export const useCreatePartyProfile = (
  profileType?: PartyProfileType
) => {
  const queryClient = useQueryClient();
  const typeLabel = toPartyProfileDisplayLabel(profileType);

  const mutation = useMutation({
    mutationFn: (data: ICreatePartyProfile) =>
      partyProfileApi.createPartyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['party-profiles', profileType] });
      toast.success(`${typeLabel} created successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.message || `Failed to create ${typeLabel.toLowerCase()}`);
    },
  });

  return {
    ...mutation,
    submitPartyProfile: mutation.mutateAsync,
  };
};

export const useUpdatePartyProfile = (
  profileType?: PartyProfileType
) => {
  const queryClient = useQueryClient();
  const typeLabel = toPartyProfileDisplayLabel(profileType);

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdatePartyProfile }) =>
      partyProfileApi.updatePartyProfile(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['party-profiles', profileType] });
      queryClient.invalidateQueries({ queryKey: ['party-profile', profileType, variables.id] });
      toast.success(`${typeLabel} updated successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.message || `Failed to update ${typeLabel.toLowerCase()}`);
    },
  });

  return {
    ...mutation,
    updatePartyProfile: mutation.mutateAsync,
  };
};

export const useDeletePartyProfile = (
  profileType?: PartyProfileType
) => {
  const queryClient = useQueryClient();
  const typeLabel = toPartyProfileDisplayLabel(profileType);

  const mutation = useMutation({
    mutationFn: (id: string) => partyProfileApi.deletePartyProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['party-profiles', profileType] });
      toast.success(`${typeLabel} deleted successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.message || `Failed to delete ${typeLabel.toLowerCase()}`);
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
