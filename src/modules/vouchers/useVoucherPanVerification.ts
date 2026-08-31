import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { usePassengerAmlVerification } from '@/modules/passengers/hooks';
import {
  PassengerEntityTypeEnum,
  PassengerNationalityTypeEnum,
} from '@/modules/passengers/types/passengerTypes';
import { VOUCHER_FORM_TEXT } from './constants';
import type { VoucherFormValues } from './types';

export type VoucherPanVerificationStatus =
  | 'idle'
  | 'checking'
  | 'valid'
  | 'invalid';

const getPanSnapshot = (
  values: Pick<VoucherFormValues, 'panNumber' | 'panName' | 'panDob'>
) =>
  `${String(values.panNumber ?? '')
    .trim()
    .toUpperCase()}|${String(values.panName ?? '').trim()}|${String(values.panDob ?? '').trim()}`;

export const useVoucherPanVerification = (enabled: boolean) => {
  const form = useFormContext<VoucherFormValues>();
  const { verifyPan, isVerifyingPan } = usePassengerAmlVerification();
  const [status, setStatus] = useState<VoucherPanVerificationStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const verifiedSnapshotRef = useRef('');
  const runIdRef = useRef(0);

  const verifyVoucherPan = useCallback(async () => {
    if (!enabled) {
      return false;
    }

    const currentValues = form.getValues();
    const panNumber = String(currentValues.panNumber ?? '').trim();
    const panName = String(currentValues.panName ?? '').trim();
    const panDob = String(currentValues.panDob ?? '').trim();
    const snapshot = getPanSnapshot({ panNumber, panName, panDob });

    if (!panNumber || !panName || !panDob) {
      setStatus('invalid');
      setMessage(VOUCHER_FORM_TEXT.panVerifyIncomplete);
      return false;
    }

    if (status === 'valid' && verifiedSnapshotRef.current === snapshot) {
      return true;
    }

    const runId = ++runIdRef.current;
    setStatus('checking');
    setMessage(VOUCHER_FORM_TEXT.panVerifyChecking);

    try {
      const result = await verifyPan({
        entityType: PassengerEntityTypeEnum.INDIVIDUAL,
        nationalityType: PassengerNationalityTypeEnum.INDIAN,
        panNumber,
        panHolderName: panName,
        panDob,
      });

      if (runId !== runIdRef.current) {
        return false;
      }

      if (!result.verified) {
        verifiedSnapshotRef.current = '';
        setStatus('invalid');
        setMessage(result.message || VOUCHER_FORM_TEXT.panVerifyFailed);
        toast.error(result.message || VOUCHER_FORM_TEXT.panVerifyFailed);
        return false;
      }

      verifiedSnapshotRef.current = snapshot;
      setStatus('valid');
      setMessage(result.message || VOUCHER_FORM_TEXT.panVerifySuccess);
      toast.success(result.message || VOUCHER_FORM_TEXT.panVerifySuccess);
      return true;
    } catch (error) {
      if (runId !== runIdRef.current) {
        return false;
      }

      const nextMessage =
        error instanceof Error
          ? error.message
          : VOUCHER_FORM_TEXT.panVerifyFailed;
      verifiedSnapshotRef.current = '';
      setStatus('invalid');
      setMessage(nextMessage);
      toast.error(nextMessage);
      return false;
    }
  }, [enabled, form, status, verifyPan]);

  const handlePanKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      void verifyVoucherPan();
    },
    [verifyVoucherPan]
  );

  const resetPanVerification = useCallback(() => {
    runIdRef.current += 1;
    verifiedSnapshotRef.current = '';
    setStatus('idle');
    setMessage(null);
  }, []);

  return {
    status,
    message,
    isVerifyingPan,
    verifyVoucherPan,
    handlePanKeyDown,
    resetPanVerification,
  };
};
