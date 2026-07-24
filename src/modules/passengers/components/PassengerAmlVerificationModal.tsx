import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button, Modal } from '@/components/ui';
import { useListCountryProfiles } from '@/modules/countryProfile/hooks';
import type { IPurchaseFormValues } from '@/modules/purchase/types/purchaseTypes';
import type {
  PassengerAmlPartyProfile,
  PassengerEntityType,
  PassengerNationalityType,
  PassengerPanHolderRelationType,
  IPassengerAmlVerifiedPayload,
  IPassengerPanVerificationRequest,
  IPassengerPassportVerificationRequest,
} from '../types/passengerTypes';
import { PassengerEntityTypeEnum, PassengerNationalityTypeEnum } from '../types/passengerTypes';
import { createPassengerAmlDefaultValues, createPassengerDetailsDefaultValues, PASSENGER_PAN_VERIFICATION_FIELDS, PASSENGER_PASSPORT_VERIFICATION_FIELDS } from '../schema/passengerAmlSchema';
import { usePassengerAmlVerification } from '../hooks';
import { PassengerAmlVerificationStepForm } from '../forms/PassengerAmlVerificationStepForm';
import { PassengerAmlDetailsStepForm } from '../forms/PassengerAmlDetailsStepForm';

interface PassengerAmlVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType?: PassengerEntityType;
  selectedPartyProfile?: PassengerAmlPartyProfile | null;
  onVerified: (value: IPassengerAmlVerifiedPayload) => void;
}

type PassengerModalStep = 'verification' | 'details';
type VerificationMode = 'pan' | 'passport';

const getVerificationMode = (
  entityType: PassengerEntityType,
  nationalityType?: PassengerNationalityType | string | null
): VerificationMode =>
  entityType === PassengerEntityTypeEnum.CORPORATE ||
  nationalityType === PassengerNationalityTypeEnum.INDIAN
    ? 'pan'
    : 'passport';

const getPanSnapshot = (values: IPurchaseFormValues) =>
  ({
    panNumber: values.panNumber,
    panHolderName: values.panHolderName,
    panDob: values.panDob,
  });

const getPassportSnapshot = (values: IPurchaseFormValues) =>
  ({
    passportNumber: values.passportNumber,
    passportIssueAt: values.passportIssueAt,
    passportIssueDate: values.passportIssueDate,
    passportExpiryDate: values.passportExpiryDate,
    arrivalDate: values.arrivalDate,
  });

const getVerificationSnapshot = (values: IPurchaseFormValues, mode: VerificationMode) =>
  mode === 'pan'
    ? getPanSnapshot(values)
    : getPassportSnapshot(values);

const isSameSnapshot = (left: Record<string, unknown> | null, right: Record<string, unknown>) =>
  Boolean(left) && JSON.stringify(left) === JSON.stringify(right);

const getVerificationFields = (mode: VerificationMode) =>
  mode === 'pan' ? PASSENGER_PAN_VERIFICATION_FIELDS : PASSENGER_PASSPORT_VERIFICATION_FIELDS;

const hasCompletePanValues = (values: IPurchaseFormValues) =>
  Boolean(values.panNumber && values.panHolderName && values.panDob);

const hasCompletePassportValues = (values: IPurchaseFormValues) =>
  Boolean(
    values.passportNumber &&
      values.passportIssueAt &&
      values.passportIssueDate &&
      values.passportExpiryDate &&
      values.arrivalDate
  );

const getDetailsFieldNames = (mode: VerificationMode) => {
  const baseFields = [
    'entityType',
    'nationalityType',
    'residentStatus',
    'countryId',
    'stateId',
    'panHolderRelationType',
    'paidByPanNumber',
    'paidByPanHolderName',
    'paidByPanDob',
    'email',
    'contactNo',
    'gstNumber',
    'gstStateId',
    'locationId',
    'city',
    'address1',
    'address2',
    'isPep',
    'passportNumber',
    'passportIssueAt',
    'passportIssueDate',
    'passportExpiryDate',
    'arrivalDate',
    'otherDocuments.0.documentType',
    'otherDocuments.0.documentNumber',
    'otherDocuments.0.validTill',
  ] as const;

  return mode === 'pan'
    ? [
        ...baseFields,
        'panNumber',
        'panHolderName',
        'panDob',
      ]
    : [
        ...baseFields,
        'passportNumber',
        'passportIssueAt',
        'passportIssueDate',
        'passportExpiryDate',
        'arrivalDate',
      ];
};

export const PassengerAmlVerificationModal = ({
  open,
  onOpenChange,
  entityType = PassengerEntityTypeEnum.CORPORATE,
  selectedPartyProfile,
  onVerified,
}: PassengerAmlVerificationModalProps) => {
  const form = useFormContext<IPurchaseFormValues>();
  const [currentStep, setCurrentStep] = useState<PassengerModalStep>('verification');
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'checking' | 'valid' | 'invalid'
  >('idle');
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verifiedPanSnapshot, setVerifiedPanSnapshot] = useState<Record<string, unknown> | null>(null);
  const [verifiedPassportSnapshot, setVerifiedPassportSnapshot] = useState<Record<string, unknown> | null>(null);
  const hasInitializedRef = useRef(false);
  const verificationRunIdRef = useRef(0);
  const { verifyPan, verifyPassport } = usePassengerAmlVerification();
  const { data: countryProfilesResponse } = useListCountryProfiles({
    page: 1,
    limit: 100,
    search: 'India',
  });
  const countryProfiles = useMemo(
    () => countryProfilesResponse?.data ?? [],
    [countryProfilesResponse]
  );

  const watchedEntityType = useWatch({
    control: form.control,
    name: 'entityType',
  });
  const watchedNationalityType = useWatch({
    control: form.control,
    name: 'nationalityType',
  });
  const watchedPanValues = useWatch({
    control: form.control,
    name: ['panNumber', 'panHolderName', 'panDob'] as const,
  });
  const watchedPassportValues = useWatch({
    control: form.control,
    name: ['passportNumber', 'passportIssueAt', 'passportIssueDate', 'passportExpiryDate', 'arrivalDate'] as const,
  });

  const isCorporate = (watchedEntityType || entityType) === PassengerEntityTypeEnum.CORPORATE;
  const verificationMode = getVerificationMode(
    (watchedEntityType || entityType) as PassengerEntityType,
    (watchedNationalityType || PassengerNationalityTypeEnum.INDIAN) as PassengerNationalityType
  );
  const syncIndiaCountry = useCallback(() => {
    const indiaCountry =
      countryProfiles.find(
        country =>
          country.code?.toUpperCase?.() === 'IN' ||
          country.name?.toLowerCase?.() === 'india'
      ) ?? null;

    if (!indiaCountry || form.getValues('countryId') === indiaCountry.id) {
      return;
    }

    form.setValue('countryId', indiaCountry.id, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [countryProfiles, form]);
  const initializeValues = useCallback(() => {
    const amlDefaults = createPassengerAmlDefaultValues(entityType, selectedPartyProfile);
    const detailsDefaults = createPassengerDetailsDefaultValues(
      entityType,
      amlDefaults,
      selectedPartyProfile
    );
    const currentValues = form.getValues();

    form.reset({
      ...currentValues,
      ...amlDefaults,
      ...detailsDefaults,
      entityType,
      passengerInfoCaptured: false,
      purposeId: currentValues.purposeId || '',
      arrivalDate: '',
    });

    if (entityType === PassengerEntityTypeEnum.CORPORATE) {
      form.setValue('panNumber', amlDefaults.panNumber, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      form.setValue('panHolderName', amlDefaults.panHolderName, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      form.setValue('panDob', amlDefaults.panDob, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }

    syncIndiaCountry();
  }, [entityType, form, selectedPartyProfile, syncIndiaCountry]);

  const clearVerificationState = useCallback(() => {
    setVerifiedPanSnapshot(null);
    setVerifiedPassportSnapshot(null);
    verificationRunIdRef.current += 1;
    setVerificationStatus('idle');
    setVerificationMessage(null);
  }, []);

  const verifyIdentity = useCallback(
    async (
      mode: VerificationMode,
      shouldFocus = false,
      notifyOnSuccess = false,
      validateFields = true
    ) => {
      const runId = ++verificationRunIdRef.current;
      const currentValues = form.getValues() as IPurchaseFormValues;
      const fieldsToValidate = getVerificationFields(mode);

      setVerificationStatus('checking');
      setVerificationMessage(null);

      if (validateFields) {
        const schemaValid = await form.trigger(fieldsToValidate as never, {
          shouldFocus,
        });
        if (runId !== verificationRunIdRef.current) {
          return false;
        }

        if (!schemaValid) {
          setVerificationStatus('invalid');
          setVerificationMessage('Please complete the required fields before verifying.');
          return false;
        }
      }

      try {
        const verificationResult =
          mode === 'pan'
            ? await verifyPan({
                entityType: (currentValues.entityType || entityType) as PassengerEntityType,
                nationalityType: (currentValues.nationalityType || PassengerNationalityTypeEnum.INDIAN) as PassengerNationalityType,
                panNumber: currentValues.panNumber,
                panHolderName: currentValues.panHolderName,
                panDob: currentValues.panDob,
                panHolderRelationType: currentValues.panHolderRelationType as PassengerPanHolderRelationType,
              } satisfies IPassengerPanVerificationRequest)
            : await verifyPassport({
                nationalityType: (currentValues.nationalityType || PassengerNationalityTypeEnum.NRI) as PassengerNationalityType,
                passportNumber: currentValues.passportNumber,
                passportIssueAt: currentValues.passportIssueAt,
                passportIssueDate: currentValues.passportIssueDate,
                passportExpiryDate: currentValues.passportExpiryDate,
                arrivalDate: currentValues.arrivalDate,
                isIndianNationality: false,
              } satisfies IPassengerPassportVerificationRequest);

        if (runId !== verificationRunIdRef.current) {
          return false;
        }

        if (!verificationResult.verified) {
          setVerificationStatus('invalid');
          setVerificationMessage(verificationResult.message || 'Verification failed.');
          return false;
        }

        if (mode === 'pan') {
          setVerifiedPanSnapshot(getPanSnapshot(currentValues));
        } else {
          setVerifiedPassportSnapshot(getPassportSnapshot(currentValues));
        }
        setVerificationStatus('valid');
        setVerificationMessage(
          verificationResult.message || 'Passenger AML details verified successfully'
        );

        if (notifyOnSuccess) {
          onVerified({
            entityType: (currentValues.entityType || entityType) as PassengerEntityType,
            isIndianNationality:
              (currentValues.nationalityType || PassengerNationalityTypeEnum.INDIAN) ===
              PassengerNationalityTypeEnum.INDIAN,
            panNumber: currentValues.panNumber || '',
            panHolderName: currentValues.panHolderName || '',
            panDob: currentValues.panDob || '',
            passportNumber: currentValues.passportNumber || '',
            passportIssueAt: currentValues.passportIssueAt || '',
            passportIssueDate: currentValues.passportIssueDate || '',
            passportExpiryDate: currentValues.passportExpiryDate || '',
          });
        }
        return true;
      } catch (error) {
        if (runId !== verificationRunIdRef.current) {
          return false;
        }

        setVerificationStatus('invalid');
        setVerificationMessage(
          error instanceof Error ? error.message : 'Unable to verify passenger details.'
        );
        return false;
      }
    },
    [entityType, form, onVerified, verifyPan, verifyPassport]
  );

  const verifyIdentityOnBlur = useCallback(async (mode: VerificationMode) => {
    if (verificationStatus === 'checking') {
      return false;
    }

    const currentValues = form.getValues() as IPurchaseFormValues;
    if (mode === 'pan' && !hasCompletePanValues(currentValues)) {
      return false;
    }
    if (mode === 'passport' && !hasCompletePassportValues(currentValues)) {
      return false;
    }

    const currentSnapshot = getVerificationSnapshot(currentValues, mode);
    const verifiedSnapshot =
      mode === 'pan' ? verifiedPanSnapshot : verifiedPassportSnapshot;
    if (
      verificationStatus === 'valid' &&
      isSameSnapshot(verifiedSnapshot, currentSnapshot)
    ) {
      return true;
    }

    return verifyIdentity(mode, false, false, false);
  }, [form, verifiedPanSnapshot, verifiedPassportSnapshot, verifyIdentity, verificationStatus]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (hasInitializedRef.current) {
      return;
    }

    initializeValues();
    hasInitializedRef.current = true;
    if (isCorporate) {
      queueMicrotask(() => {
        void verifyIdentityOnBlur('pan');
      });
    }
  }, [initializeValues, isCorporate, open, verifyIdentityOnBlur]);

  const currentPanSnapshot = {
    panNumber: watchedPanValues[0] ?? '',
    panHolderName: watchedPanValues[1] ?? '',
    panDob: watchedPanValues[2] ?? '',
  };
  const currentPassportSnapshot = {
    passportNumber: watchedPassportValues[0] ?? '',
    passportIssueAt: watchedPassportValues[1] ?? '',
    passportIssueDate: watchedPassportValues[2] ?? '',
    passportExpiryDate: watchedPassportValues[3] ?? '',
    arrivalDate: watchedPassportValues[4] ?? '',
  };
  const panVerificationChanged =
    verificationStatus === 'valid' &&
    Boolean(verifiedPanSnapshot) &&
    !isSameSnapshot(verifiedPanSnapshot, currentPanSnapshot);
  const passportVerificationChanged =
    verificationStatus === 'valid' &&
    Boolean(verifiedPassportSnapshot) &&
    !isSameSnapshot(verifiedPassportSnapshot, currentPassportSnapshot);
  const verificationIsStale = panVerificationChanged || passportVerificationChanged;
  const displayedVerificationStatus: 'idle' | 'checking' | 'valid' | 'invalid' =
    verificationIsStale ? 'invalid' : verificationStatus;
  const displayedVerificationMessage =
    panVerificationChanged
      ? 'PAN details changed. Please verify again before continuing.'
      : passportVerificationChanged
        ? 'Passport details changed. Please verify again before continuing.'
        : verificationMessage;
  const canProceed = displayedVerificationStatus === 'valid';

  const handleNationalityChange = useCallback(
    (value: string | null) => {
      form.setValue('passengerInfoCaptured', false, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      clearVerificationState();

      if (value === PassengerNationalityTypeEnum.INDIAN) {
        syncIndiaCountry();
      }
    },
    [clearVerificationState, form, syncIndiaCountry]
  );

  const handleModalOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        verificationRunIdRef.current += 1;
        setVerifiedPanSnapshot(null);
        setVerifiedPassportSnapshot(null);
        hasInitializedRef.current = false;
        setCurrentStep('verification');
        setVerificationMessage(null);
        setVerificationStatus('idle');
      }

      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  const handleVerification = () => {
    if (canProceed) {
      setCurrentStep('details');
    }
  };

  const handleDetailsDone = async () => {
    const isValid = await form.trigger(getDetailsFieldNames(verificationMode) as never, {
      shouldFocus: true,
    });
    if (!isValid) {
      return;
    }

    const currentValues = form.getValues() as IPurchaseFormValues;
    if (
      hasCompletePanValues(currentValues) &&
      !isSameSnapshot(verifiedPanSnapshot, getPanSnapshot(currentValues))
    ) {
      const reverifiedPan = await verifyIdentity('pan', true, false, false);
      if (!reverifiedPan) {
        return;
      }
    }

    if (
      hasCompletePassportValues(currentValues) &&
      !isSameSnapshot(verifiedPassportSnapshot, getPassportSnapshot(currentValues))
    ) {
      const reverifiedPassport = await verifyIdentity('passport', true, false, false);
      if (!reverifiedPassport) {
        return;
      }
    }

    form.setValue('passengerInfoCaptured', true, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    handleModalOpenChange(false);
  };

  const verificationFooter = (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button type="button" variant="outline" onClick={() => handleModalOpenChange(false)}>
        Cancel
      </Button>
      <Button
        type="button"
        onClick={handleVerification}
        disabled={!canProceed}
      >
        Next
      </Button>
    </div>
  );

  const detailsFooter = (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button type="button" variant="outline" onClick={() => setCurrentStep('verification')}>
        Back
      </Button>
      <Button
        type="button"
        onClick={() => void handleDetailsDone()}
        disabled={!canProceed}
      >
        Done
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      onOpenChange={handleModalOpenChange}
      title={currentStep === 'verification' ? 'AML Verification' : 'Passenger Details'}
      description={
        currentStep === 'verification'
          ? 'Verify identity details before moving to the passenger information step.'
          : 'Capture the passenger details that will be stored on the transaction.'
      }
      size="2xl"
      footer={currentStep === 'verification' ? verificationFooter : detailsFooter}
    >
      {currentStep === 'verification' ? (
        <PassengerAmlVerificationStepForm
          entityType={(watchedEntityType || entityType) as PassengerEntityType}
          isCorporate={isCorporate}
          selectedPartyProfile={selectedPartyProfile}
          verificationStatus={displayedVerificationStatus}
          verificationMessage={displayedVerificationMessage}
          onPanFieldBlur={() => {
            void verifyIdentityOnBlur(verificationMode);
          }}
          onPassportFieldBlur={() => {
            void verifyIdentityOnBlur('passport');
          }}
          onNationalityChange={handleNationalityChange}
        />
      ) : (
        <PassengerAmlDetailsStepForm
          entityType={(watchedEntityType || entityType) as PassengerEntityType}
          onPanFieldBlur={() => {
            void verifyIdentityOnBlur('pan');
          }}
          onPassportFieldBlur={() => {
            void verifyIdentityOnBlur('passport');
          }}
          onNationalityChange={handleNationalityChange}
        />
      )}
    </Modal>
  );
};

export default PassengerAmlVerificationModal;
