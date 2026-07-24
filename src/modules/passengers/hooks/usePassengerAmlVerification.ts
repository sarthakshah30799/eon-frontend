import { useMutation } from '@tanstack/react-query';
import { passengersApi } from '@/api';
import type {
  IPassengerOtherDocumentVerificationRequest,
  IPassengerPanVerificationRequest,
  IPassengerPassportVerificationRequest,
  IPassengerAmlVerificationResponse,
} from '../types/passengerTypes';

const useVerificationMutation = <TRequest extends object>(
  mutateFn: (payload: TRequest) => Promise<IPassengerAmlVerificationResponse>
) =>
  useMutation({
    mutationFn: async (payload: TRequest) => mutateFn(payload),
  });

export const usePassengerAmlVerification = () => {
  const panMutation = useVerificationMutation<IPassengerPanVerificationRequest>(
    passengersApi.verifyPan
  );
  const passportMutation = useVerificationMutation<IPassengerPassportVerificationRequest>(
    passengersApi.verifyPassport
  );
  const otherDocumentMutation = useVerificationMutation<IPassengerOtherDocumentVerificationRequest>(
    passengersApi.verifyOtherDocument
  );

  return {
    verifyPan: panMutation.mutateAsync,
    verifyPassport: passportMutation.mutateAsync,
    verifyOtherDocument: otherDocumentMutation.mutateAsync,
    isVerifyingPan: panMutation.isPending,
    isVerifyingPassport: passportMutation.isPending,
    isVerifyingOtherDocument: otherDocumentMutation.isPending,
    panVerificationError: panMutation.error,
    passportVerificationError: passportMutation.error,
    otherDocumentVerificationError: otherDocumentMutation.error,
    resetPanVerification: panMutation.reset,
    resetPassportVerification: passportMutation.reset,
    resetOtherDocumentVerification: otherDocumentMutation.reset,
  };
};
