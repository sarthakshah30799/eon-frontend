import { useMutation } from '@tanstack/react-query';
import { passengersApi } from '@/api';
import type { IPassengerPassportLookupResponse } from '../types/passengerTypes';

export const usePassengerPassportLookup = () => {
  const lookupMutation = useMutation({
    mutationFn: async (payload: { passportNumber: string }) =>
      passengersApi.lookupPassport(payload),
  });

  return {
    lookupPassport: lookupMutation.mutateAsync,
    isLookingUpPassport: lookupMutation.isPending,
    lookupPassportError: lookupMutation.error as Error | null,
    resetPassportLookup: lookupMutation.reset,
    lookupPassportData: lookupMutation.data as IPassengerPassportLookupResponse | undefined,
  };
};
