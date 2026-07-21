import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRef } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Button, Modal } from '@/components/ui';
import {
  FormFieldCategoryOption,
  FormFieldCountryDropdown,
  FormFieldDatePicker,
  FormFieldFileUploader,
  FormFieldInput,
  FormFieldSelect,
  FormFieldStateDropdown,
  FormFieldYesNoToggle,
} from '@/components/forms';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { useListCountryProfiles } from '@/modules/countryProfile/hooks';
import type { IPurchaseFormValues } from '@/modules/purchase/types/purchaseTypes';
import type { PassengerAmlPartyProfile } from '../types/passengerTypes';
import {
  PassengerEntityTypeEnum,
  PassengerNationalityTypeEnum,
  PassengerPanHolderRelationTypeEnum,
  type PassengerEntityType,
  type IPassengerAmlVerifiedPayload,
} from '../types/passengerTypes';
import {
  PASSENGER_NATIONALITY_OPTIONS,
  PASSENGER_OTHER_ID_PROOF_OPTIONS,
  PASSENGER_PAN_HOLDER_RELATION_OPTIONS,
  PASSENGER_RESIDENT_STATUS_OPTIONS,
  createPassengerAmlDefaultValues,
  createPassengerDetailsDefaultValues,
  createStaticPassengerSelectOptions,
} from '../utils/passengerAmlUtils';

interface PassengerAmlVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType?: PassengerEntityType;
  selectedPartyProfile?: PassengerAmlPartyProfile | null;
  onVerified: (value: IPassengerAmlVerifiedPayload) => void;
}

type PassengerModalStep = 'verification' | 'details';

const toProfileLabel = (profile?: PassengerAmlPartyProfile | null) =>
  profile
    ? `${profile.name}${profile.type ? ` (${profile.type})` : ''}`
    : 'No party profile selected yet';

const PassengerOtherDocumentsSection = ({
  nationalityType,
}: {
  nationalityType: IPurchaseFormValues['nationalityType'];
}) => {
  const form = useFormContext<IPurchaseFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'otherDocuments',
  });
  const isIndianNationality =
    nationalityType === PassengerNationalityTypeEnum.INDIAN;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            Other Documents
          </h3>
          <p className="text-sm text-text-secondary">
            {isIndianNationality
              ? 'At least one other document is mandatory for Indian passengers.'
              : 'Add any supporting documents you want to capture now.'}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              documentType: '',
              documentNumber: '',
              validTill: '',
              issueAt: '',
              issueDate: '',
              expiryDate: '',
              documentFile: '',
            })
          }
        >
          Add Document
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-sm border border-border-primary bg-surface-secondary p-4"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-text-primary">
                Document {index + 1}
              </div>
              {fields.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormFieldSelect
                name={`otherDocuments.${index}.documentType`}
                label="Type of ID"
                placeholder="Select document type"
                loadOptions={createStaticPassengerSelectOptions(
                  PASSENGER_OTHER_ID_PROOF_OPTIONS
                )}
              />
              <FormFieldInput
                name={`otherDocuments.${index}.documentNumber`}
                label="ID Number"
                placeholder="Enter ID number"
              />
              <FormFieldDatePicker
                name={`otherDocuments.${index}.validTill`}
                label="Valid Till"
                placeholder="Select expiry date"
              />
              <FormFieldFileUploader
                name={`otherDocuments.${index}.documentFile`}
                label="Upload Document"
                placeholder="Choose file"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PassengerDetailsSection = ({
  entityType,
  selectedPartyProfile,
}: {
  entityType: PassengerEntityType;
  selectedPartyProfile?: PassengerAmlPartyProfile | null;
}) => {
  const form = useFormContext<IPurchaseFormValues>();
  const nationalityType = useWatch({
    control: form.control,
    name: 'nationalityType',
  });
  const countryId = useWatch({
    control: form.control,
    name: 'countryId',
  });
  const corporatePanVisible = entityType === PassengerEntityTypeEnum.CORPORATE;

  const isPassportRequired =
    nationalityType === PassengerNationalityTypeEnum.NRI ||
    nationalityType === PassengerNationalityTypeEnum.FOREIGNER;

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-border-primary bg-surface-secondary px-4 py-3">
        <div className="text-sm font-medium text-text-primary">
          Passenger Context
        </div>
        <div className="mt-1 text-sm text-text-secondary">
          {corporatePanVisible
            ? `Corporate passenger bound to ${toProfileLabel(selectedPartyProfile)}`
            : 'Individual passenger details captured after AML verification.'}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormFieldSelect
          name="nationalityType"
          label="Nationality"
          placeholder="Select nationality"
          loadOptions={createStaticPassengerSelectOptions(
            PASSENGER_NATIONALITY_OPTIONS
          )}
        />
        <FormFieldSelect
          name="residentStatus"
          label="Resident Status"
          placeholder="Select resident status"
          loadOptions={createStaticPassengerSelectOptions(
            PASSENGER_RESIDENT_STATUS_OPTIONS
          )}
        />
        <FormFieldCountryDropdown
          name="countryId"
          label="Country"
          placeholder={
            nationalityType === PassengerNationalityTypeEnum.INDIAN && !countryId
              ? 'India will be auto-selected'
              : 'Select country'
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormFieldInput
          name="panNumber"
          label="PAN Number"
          placeholder="Enter PAN number"
          valueTransform="uppercase"
        />
        <FormFieldInput
          name="panHolderName"
          label="PAN Holder Name"
          placeholder="Enter PAN holder name"
        />
        <FormFieldDatePicker
          name="panDob"
          label="PAN Holder DOB"
          placeholder="Select DOB"
        />
      </div>

      {corporatePanVisible ? (
        <div className="rounded-sm border border-dashed border-border-secondary bg-surface-secondary px-4 py-4">
          <div className="mb-4 text-sm font-semibold text-text-primary">
            Corporate PAN Details
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <FormFieldInput
              name="corporatePanNumber"
              label="Corporate PAN Number"
              placeholder="Enter corporate PAN number"
              valueTransform="uppercase"
            />
            <FormFieldInput
              name="corporatePanHolderName"
              label="Corporate PAN Holder Name"
              placeholder="Enter corporate PAN holder name"
            />
            <FormFieldDatePicker
              name="corporatePanDob"
              label="Corporate PAN Holder DOB"
              placeholder="Select DOB"
            />
          </div>
          <div className="mt-4">
            <FormFieldSelect
              name="corporatePanHolderRelationType"
              label="Corporate PAN Holder Relation"
              placeholder="Select relation"
              loadOptions={createStaticPassengerSelectOptions(
                PASSENGER_PAN_HOLDER_RELATION_OPTIONS
              )}
            />
          </div>
        </div>
      ) : null}

      {isPassportRequired ? (
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="passportNumber"
            label="Passport Number"
            placeholder="Enter passport number"
            valueTransform="uppercase"
          />
          <FormFieldInput
            name="passportIssueAt"
            label="Issue At"
            placeholder="Enter issue place"
          />
          <FormFieldDatePicker
            name="passportIssueDate"
            label="Issue Date"
            placeholder="Select issue date"
          />
          <FormFieldDatePicker
            name="passportExpiryDate"
            label="Expiry Date"
            placeholder="Select expiry date"
          />
          <FormFieldDatePicker
            name="arrivalDate"
            label="Arrival Date"
            placeholder="Select arrival date"
          />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput
          name="paidByPanNumber"
          label="Paid By PAN Number"
          placeholder="Enter paid by PAN number"
          valueTransform="uppercase"
        />
        <FormFieldInput
          name="paidByPanHolderName"
          label="Paid By PAN Holder Name"
          placeholder="Enter paid by PAN holder name"
        />
        <FormFieldDatePicker
          name="paidByPanDob"
          label="Paid By PAN Holder DOB"
          placeholder="Select DOB"
        />
        <FormFieldInput
          name="email"
          label="Email"
          placeholder="Enter email address"
          type="email"
          valueTransform="none"
        />
        <FormFieldInput
          name="contactNo"
          label="Contact Number"
          placeholder="Enter contact number"
          valueTransform="none"
        />
        <FormFieldInput
          name="gstNumber"
          label="GST Number"
          placeholder="Enter GST number"
          valueTransform="uppercase"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormFieldStateDropdown
          name="gstStateId"
          label="GST State"
          placeholder="Select GST state"
          countryId={countryId || undefined}
        />
        <FormFieldStateDropdown
          name="stateId"
          label="State"
          placeholder="Select state"
          countryId={countryId || undefined}
        />
        <FormFieldInput name="city" label="City" placeholder="Enter city" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput
          name="address1"
          label="Address Line 1"
          placeholder="Enter address line 1"
          valueTransform="none"
        />
        <FormFieldInput
          name="address2"
          label="Address Line 2"
          placeholder="Enter address line 2"
          valueTransform="none"
        />
        <FormFieldCategoryOption
          name="locationId"
          label="Location"
          placeholder="Select location"
          code={CategoryOptionCodeEnum.LocationType}
          useValueAsId
        />
        <FormFieldYesNoToggle
          name="isPep"
          label="Is PEP"
          yesLabel="Yes"
          noLabel="No"
        />
      </div>

      <PassengerOtherDocumentsSection nationalityType={nationalityType} />
    </div>
  );
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
  const hasInitializedRef = useRef(false);
  const verificationValidationRunIdRef = useRef(0);
  const watchedEntityType = useWatch({
    control: form.control,
    name: 'entityType',
  });
  const watchedNationalityType = useWatch({
    control: form.control,
    name: 'nationalityType',
  });
  const { data: countryProfilesResponse } = useListCountryProfiles({
    page: 1,
    limit: 100,
    search: 'India',
  });
  const countryProfiles = countryProfilesResponse?.data ?? [];
  const verificationWatchedValues = useWatch({
    control: form.control,
    name: [
      'entityType',
      'nationalityType',
      'panNumber',
      'panHolderName',
      'panDob',
      'passportNumber',
      'passportIssueAt',
      'passportIssueDate',
      'passportExpiryDate',
    ] as const,
  });

  const isCorporate = (watchedEntityType || entityType) === PassengerEntityTypeEnum.CORPORATE;
  const isIndianNationality =
    watchedNationalityType === PassengerNationalityTypeEnum.INDIAN;

  const initializeValues = useCallback(() => {
    const amlDefaults = createPassengerAmlDefaultValues(
      entityType,
      selectedPartyProfile
    );
    const detailsDefaults = createPassengerDetailsDefaultValues(
      entityType,
      amlDefaults
    );
    const currentValues = form.getValues();

    form.reset({
      ...currentValues,
      ...amlDefaults,
      ...detailsDefaults,
      entityType: entityType,
      passengerInfoCaptured: false,
      purposeId: currentValues.purposeId || '',
      arrivalDate: '',
      corporatePanNumber:
        entityType === PassengerEntityTypeEnum.CORPORATE
          ? selectedPartyProfile?.panNo ?? currentValues.corporatePanNumber ?? amlDefaults.panNumber
          : currentValues.corporatePanNumber || '',
      corporatePanHolderName:
        entityType === PassengerEntityTypeEnum.CORPORATE
          ? selectedPartyProfile?.panName ?? selectedPartyProfile?.name ?? currentValues.corporatePanHolderName ?? amlDefaults.panHolderName
          : currentValues.corporatePanHolderName || '',
      corporatePanDob:
        entityType === PassengerEntityTypeEnum.CORPORATE
          ? selectedPartyProfile?.panDob ?? currentValues.corporatePanDob ?? amlDefaults.panDob
          : currentValues.corporatePanDob || '',
      corporatePanHolderRelationType:
        entityType === PassengerEntityTypeEnum.CORPORATE
          ? PassengerPanHolderRelationTypeEnum.COMPANY
          : currentValues.corporatePanHolderRelationType || '',
    });
  }, [entityType, form, selectedPartyProfile]);

  useEffect(() => {
    if (!open) {
      hasInitializedRef.current = false;
      return;
    }

    if (hasInitializedRef.current) {
      return;
    }

    const hasExistingPassengerValues =
      Boolean(form.getValues('panNumber')) ||
      Boolean(form.getValues('panHolderName')) ||
      Boolean(form.getValues('passportNumber')) ||
      Boolean(form.getValues('passportIssueAt')) ||
      Boolean(form.getValues('otherDocuments')?.length);

    if (hasExistingPassengerValues) {
      hasInitializedRef.current = true;
      form.setValue('entityType', entityType, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      return;
    }

    initializeValues();
    hasInitializedRef.current = true;
  }, [entityType, form, open, selectedPartyProfile]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isCorporate) {
      form.setValue('nationalityType', PassengerNationalityTypeEnum.INDIAN, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      form.setValue('residentStatus', form.getValues('residentStatus') || 'RESIDENT', {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [form, isCorporate, open]);

  useEffect(() => {
    if (!open || watchedNationalityType !== PassengerNationalityTypeEnum.INDIAN) {
      return;
    }

    const indiaCountry =
      countryProfiles.find(
        (country: { code?: string; name?: string; id: string }) =>
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
  }, [countryProfiles, form, open, watchedNationalityType]);

  const selectedPartyProfileLabel = toProfileLabel(selectedPartyProfile);

  const step1FieldNames = useMemo(() => {
    if (isCorporate) {
      return ['panNumber', 'panHolderName', 'panDob'] as const;
    }

    if (isIndianNationality) {
      return ['panNumber', 'panHolderName', 'panDob'] as const;
    }

    return ['passportNumber', 'passportIssueAt', 'passportIssueDate', 'passportExpiryDate'] as const;
  }, [isCorporate, isIndianNationality]);

  useEffect(() => {
    if (!open || currentStep !== 'verification') {
      return;
    }

    const runId = ++verificationValidationRunIdRef.current;

    const validateVerificationStep = async () => {
      const isValid = await form.trigger(step1FieldNames as never, {
        shouldFocus: false,
      });

      if (runId !== verificationValidationRunIdRef.current) {
        return;
      }

      setVerificationStatus(isValid ? 'valid' : 'invalid');
    };

    void validateVerificationStep();
  }, [currentStep, form, open, step1FieldNames, verificationWatchedValues]);

  const step2FieldNames = useMemo(() => {
    const fields = [
      'entityType',
      'nationalityType',
      'residentStatus',
      'countryId',
      'panNumber',
      'panHolderName',
      'panDob',
      'panHolderRelationType',
      'paidByPanNumber',
      'paidByPanHolderName',
      'paidByPanDob',
      'email',
      'contactNo',
      'gstNumber',
      'gstStateId',
      'stateId',
      'locationId',
      'city',
      'address1',
      'address2',
      'isPep',
    ] as const;

    const corporateFields = isCorporate
      ? ([
          'corporatePanNumber',
          'corporatePanHolderName',
          'corporatePanDob',
          'corporatePanHolderRelationType',
        ] as const)
      : ([] as const);

    const passportFields = isIndianNationality
      ? ([] as const)
      : ([
          'passportNumber',
          'passportIssueAt',
          'passportIssueDate',
          'passportExpiryDate',
          'arrivalDate',
        ] as const);

    const docFields = isIndianNationality
      ? ([
          'otherDocuments.0.documentType',
          'otherDocuments.0.documentNumber',
        ] as const)
      : ([] as const);

    return [...fields, ...corporateFields, ...passportFields, ...docFields] as const;
  }, [isCorporate, isIndianNationality]);

  const handleVerification = async () => {
    const isValid = await form.trigger(step1FieldNames as never, {
      shouldFocus: true,
    });
    if (!isValid) {
      setVerificationStatus('invalid');
      return;
    }

    setVerificationStatus('valid');

    onVerified({
      entityType: (form.getValues('entityType') || entityType) as PassengerEntityType,
      isIndianNationality: form.getValues('nationalityType') === PassengerNationalityTypeEnum.INDIAN,
      panNumber: form.getValues('panNumber') || '',
      panHolderName: form.getValues('panHolderName') || '',
      panDob: form.getValues('panDob') || '',
      passportNumber: form.getValues('passportNumber') || '',
      passportIssueAt: form.getValues('passportIssueAt') || '',
      passportIssueDate: form.getValues('passportIssueDate') || '',
      passportExpiryDate: form.getValues('passportExpiryDate') || '',
    });

    setCurrentStep('details');
  };

  const handleDetailsDone = async () => {
    const isValid = await form.trigger(step2FieldNames as never, {
      shouldFocus: true,
    });
    if (!isValid) {
      return;
    }

    form.setValue('passengerInfoCaptured', true, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          setCurrentStep('verification');
          setVerificationStatus('idle');
          hasInitializedRef.current = false;
        }
        onOpenChange(nextOpen);
      }}
      title={currentStep === 'verification' ? 'AML Verification' : 'Passenger Details'}
      description={
        currentStep === 'verification'
          ? 'Verify identity details before moving to the passenger information step.'
          : 'Capture the passenger details that will be stored on the transaction.'
      }
      size="xl"
      footer={
        currentStep === 'verification' ? (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleVerification()}
              disabled={verificationStatus !== 'valid'}
            >
              Verify & Continue
            </Button>
          </div>
        ) : (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep('verification')}
            >
              Back
            </Button>
            <Button type="button" onClick={() => void handleDetailsDone()}>
              Done
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-5">
        {currentStep === 'verification' ? (
          <>
            {isCorporate ? (
              <div className="rounded-sm border border-border-primary bg-surface-secondary px-4 py-3 text-sm text-text-secondary">
                <div className="font-medium text-text-primary">
                  Selected Party Profile
                </div>
                <div>{selectedPartyProfileLabel}</div>
              </div>
            ) : (
              <div className="rounded-sm border border-border-primary bg-surface-secondary px-4 py-3 text-sm text-text-secondary">
                <div className="font-medium text-text-primary">
                  Individual Passenger
                </div>
                <div>Choose Indian or NRI / Foreigner before AML verification.</div>
              </div>
            )}

            {!isCorporate ? (
              <div className="space-y-3">
                <div className="text-sm font-medium text-text-primary">
                  Nationality
                </div>
                <div className="inline-flex rounded-sm border border-border-secondary bg-surface-primary p-1">
                  <Button
                    type="button"
                    variant={isIndianNationality ? 'default' : 'ghost'}
                    onClick={() =>
                      form.setValue('nationalityType', PassengerNationalityTypeEnum.INDIAN, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    Indian
                  </Button>
                  <Button
                    type="button"
                    variant={!isIndianNationality ? 'default' : 'ghost'}
                    onClick={() =>
                      form.setValue('nationalityType', PassengerNationalityTypeEnum.NRI, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    NRI / Foreigner
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
              <FormFieldInput
                name="panNumber"
                label="PAN Number"
                placeholder="Enter PAN number"
                valueTransform="uppercase"
              />
              <FormFieldInput
                name="panHolderName"
                label="PAN Holder Name"
                placeholder="Enter PAN holder name"
              />
              <FormFieldDatePicker
                name="panDob"
                label="PAN Holder DOB"
                placeholder="Select DOB"
              />
            </div>

            {!isCorporate && !isIndianNationality ? (
              <div className="grid gap-4 md:grid-cols-2">
                <FormFieldInput
                  name="passportNumber"
                  label="Passport Number"
                  placeholder="Enter passport number"
                  valueTransform="uppercase"
                />
                <FormFieldInput
                  name="passportIssueAt"
                  label="Issue At"
                  placeholder="Enter issue place"
                />
                <FormFieldDatePicker
                  name="passportIssueDate"
                  label="Issue Date"
                  placeholder="Select issue date"
                />
                <FormFieldDatePicker
                  name="passportExpiryDate"
                  label="Expiry Date"
                  placeholder="Select expiry date"
                />
              </div>
            ) : null}

            <div className="rounded-sm border border-dashed border-border-secondary bg-surface-secondary px-4 py-3 text-xs text-text-secondary">
              Validation is mocked for now. Any PAN or passport field containing
              <span className="font-semibold text-text-primary"> test</span> will
              be rejected until the third-party verification is wired.
            </div>
          </>
        ) : (
          <>
            {isCorporate ? (
              <div className="rounded-sm border border-border-primary bg-surface-secondary px-4 py-3 text-sm text-text-secondary">
                <div className="font-medium text-text-primary">
                  Selected Party Profile
                </div>
                <div>{selectedPartyProfileLabel}</div>
              </div>
            ) : (
              <div className="rounded-sm border border-border-primary bg-surface-secondary px-4 py-3 text-sm text-text-secondary">
                <div className="font-medium text-text-primary">
                  Captured Passenger
                </div>
                <div>Review and adjust the passenger details before saving.</div>
              </div>
            )}

            <PassengerDetailsSection
              entityType={isCorporate ? PassengerEntityTypeEnum.CORPORATE : PassengerEntityTypeEnum.INDIVIDUAL}
              selectedPartyProfile={selectedPartyProfile}
            />
          </>
        )}
      </div>
    </Modal>
  );
};

export default PassengerAmlVerificationModal;
