import { useMutation } from '@tanstack/react-query';
import { passengersApi } from '@/api';
import type { IPassengerPassportLookupResponse } from '../types/passengerTypes';

export const usePassengerPassportLookup = () => {
  const lookupMutation = useMutation({
    mutationFn: async (payload: { passportNumber: string }) =>
      passengersApi.lookupPassport(payload),
  });
  const identityLookupMutation = useMutation({
    mutationFn: async (payload: {
      panNumber?: string;
      passportNumber?: string;
    }) => passengersApi.lookupIdentity(payload),
  });

  return {
    lookupPassport: lookupMutation.mutateAsync,
    isLookingUpPassport: lookupMutation.isPending,
    lookupPassportError: lookupMutation.error as Error | null,
    resetPassportLookup: lookupMutation.reset,
    lookupPassportData: lookupMutation.data as
      | IPassengerPassportLookupResponse
      | undefined,
    lookupIdentity: identityLookupMutation.mutateAsync,
    isLookingUpIdentity: identityLookupMutation.isPending,
    lookupIdentityError: identityLookupMutation.error as Error | null,
    resetIdentityLookup: identityLookupMutation.reset,
    lookupIdentityData: identityLookupMutation.data as
      | IPassengerPassportLookupResponse
      | undefined,
  };
};
