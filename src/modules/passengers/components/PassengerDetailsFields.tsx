import { useCallback, useEffect, useMemo } from 'react';
import { useWatch, useFormContext } from 'react-hook-form';
import { FormFieldCategoryOption, FormFieldCountryDropdown, FormFieldDatePicker, FormFieldInput, FormFieldStateDropdown, FormFieldYesNoToggle } from '@/components/forms';
import { useCategoryOptions } from '@/hooks';
import { useGetCountryProfile } from '@/modules/countryProfile/hooks';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import type { IPurchaseFormValues } from '@/modules/purchase/types/purchaseTypes';
import { TransactionTypeEnum } from '@/modules/transactions';
import { PassengerEntityTypeEnum, PassengerNationalityTypeEnum, PassengerResidentStatusEnum } from '../types/passengerTypes';
import { PASSENGER_IDENTITY_TEXT } from '../constants/passengerConstants';
import { PassengerIdentityFields } from './PassengerIdentityFields';
import { PassengerOtherDocumentsSection } from './PassengerOtherDocumentsSection';

interface PassengerDetailsFieldsProps {
  entityType: string;
  showPanRelation?: boolean;
  onPanFieldBlur?: () => void;
  onPassportNumberBlur?: () => void;
  onPassportFieldBlur?: () => void;
  onNationalityChange?: (value: string | null) => void;
  onDocumentChange?: () => void;
}

export const PassengerDetailsFields = ({
  entityType,
  showPanRelation: _showPanRelation = false,
  onPanFieldBlur,
  onPassportNumberBlur,
  onPassportFieldBlur,
  onNationalityChange,
  onDocumentChange,
}: PassengerDetailsFieldsProps) => {
  void _showPanRelation;
  const form = useFormContext<IPurchaseFormValues>();
  const nationalityType = useWatch({
    control: form.control,
    name: 'nationalityType',
  });
  const residentStatus = useWatch({
    control: form.control,
    name: 'residentStatus',
  });
  const countryId = useWatch({
    control: form.control,
    name: 'countryId',
  });
  const panHolderRelationType = useWatch({
    control: form.control,
    name: 'panHolderRelationType',
  });
  const panNumber = useWatch({
    control: form.control,
    name: 'panNumber',
  });
  const panHolderName = useWatch({
    control: form.control,
    name: 'panHolderName',
  });
  const panDob = useWatch({
    control: form.control,
    name: 'panDob',
  });
  const paidByPanNumber = useWatch({
    control: form.control,
    name: 'paidByPanNumber',
  });
  const paidByPanHolderName = useWatch({
    control: form.control,
    name: 'paidByPanHolderName',
  });
  const paidByPanDob = useWatch({
    control: form.control,
    name: 'paidByPanDob',
  });
  const transactionType = useWatch({
    control: form.control,
    name: 'transactionType',
  });
  const { data: selectedCountryProfile } = useGetCountryProfile(countryId || '');
  const { defaultOptions: panRelationOptions } = useCategoryOptions(
    CategoryOptionCodeEnum.PassengerPanHolderRelation,
    true
  );
  const isIndianNationality =
    nationalityType === PassengerNationalityTypeEnum.INDIAN;
  const isSaleTransaction = transactionType === TransactionTypeEnum.SALE;
  const showTravelDetails =
    isSaleTransaction &&
    (entityType === PassengerEntityTypeEnum.CORPORATE ||
      entityType === PassengerEntityTypeEnum.INDIVIDUAL);
  const isCorporateEntity = entityType === PassengerEntityTypeEnum.CORPORATE;
  const showPanSection = isCorporateEntity || isIndianNationality;
  const isIndiaCountry = useMemo(() => {
    const code = String(selectedCountryProfile?.code ?? '').trim().toUpperCase();
    const name = String(selectedCountryProfile?.name ?? '').trim().toLowerCase();

    return code === 'IN' || name === 'india';
  }, [selectedCountryProfile?.code, selectedCountryProfile?.name]);
  const showPanRelationField = isCorporateEntity || isIndianNationality;
  const selfRelationOption = useMemo(
    () =>
      panRelationOptions.find(option => {
        const normalizedValue = String(option.value ?? '').trim().toLowerCase();
        const normalizedLabel = String(option.label ?? '').trim().toLowerCase();

        return normalizedValue === 'self' || normalizedLabel === 'self';
      }) ?? null,
    [panRelationOptions]
  );
  const isSelfRelationSelected = useMemo(() => {
    if (!selfRelationOption) {
      const normalizedRelation = String(panHolderRelationType ?? '')
        .trim()
        .toLowerCase();

      return normalizedRelation === 'self';
    }

    return String(panHolderRelationType ?? '') === String(selfRelationOption.value ?? '');
  }, [panHolderRelationType, selfRelationOption]);

  useEffect(() => {
    if (!showPanSection || !isCorporateEntity) {
      return;
    }

    const companyRelationOption =
      panRelationOptions.find(option => {
        const normalizedValue = String(option.value ?? '').trim().toLowerCase();
        const normalizedLabel = String(option.label ?? '').trim().toLowerCase();

        return normalizedValue === 'company' || normalizedLabel === 'company';
      }) ?? null;

    if (!companyRelationOption) {
      return;
    }

    if (String(panHolderRelationType ?? '') === String(companyRelationOption.value ?? '')) {
      return;
    }

    form.setValue('panHolderRelationType', String(companyRelationOption.value), {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [form, isCorporateEntity, panHolderRelationType, panRelationOptions, showPanSection]);

  useEffect(() => {
    if (isIndiaCountry) {
      if (residentStatus !== PassengerResidentStatusEnum.RESIDENT) {
        form.setValue('residentStatus', PassengerResidentStatusEnum.RESIDENT, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: false,
        });
      }
      return;
    }

    if (nationalityType === PassengerNationalityTypeEnum.NRI) {
      if (residentStatus !== PassengerResidentStatusEnum.NON_RESIDENT) {
        form.setValue('residentStatus', PassengerResidentStatusEnum.NON_RESIDENT, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: false,
        });
      }
      return;
    }

    if (nationalityType === PassengerNationalityTypeEnum.FOREIGNER) {
      if (residentStatus !== PassengerResidentStatusEnum.FOREIGNER) {
        form.setValue('residentStatus', PassengerResidentStatusEnum.FOREIGNER, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: false,
        });
      }
    }
  }, [form, isIndiaCountry, nationalityType, residentStatus]);

  const clearCountrySelection = useCallback(() => {
    form.setValue('countryId', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('stateId', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  }, [form]);

  useEffect(() => {
    if (!isSelfRelationSelected) {
      return;
    }

    const nextPaidByValues = {
      paidByPanNumber: String(panNumber ?? ''),
      paidByPanHolderName: String(panHolderName ?? ''),
      paidByPanDob: String(panDob ?? ''),
    };

    const currentPaidByValues = {
      paidByPanNumber: String(paidByPanNumber ?? ''),
      paidByPanHolderName: String(paidByPanHolderName ?? ''),
      paidByPanDob: String(paidByPanDob ?? ''),
    };

    if (
      nextPaidByValues.paidByPanNumber === currentPaidByValues.paidByPanNumber &&
      nextPaidByValues.paidByPanHolderName === currentPaidByValues.paidByPanHolderName &&
      nextPaidByValues.paidByPanDob === currentPaidByValues.paidByPanDob
    ) {
      return;
    }

    form.setValue('paidByPanNumber', nextPaidByValues.paidByPanNumber, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.setValue('paidByPanHolderName', nextPaidByValues.paidByPanHolderName, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.setValue('paidByPanDob', nextPaidByValues.paidByPanDob, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [
    form,
    isSelfRelationSelected,
    panNumber,
    panHolderName,
    panDob,
    paidByPanNumber,
    paidByPanHolderName,
    paidByPanDob,
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="space-y-6">
        <section className="space-y-4 rounded-sm border border-border-primary bg-surface-secondary p-4">
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Passenger Details
            </h3>
            <p className="text-sm text-text-secondary">
              Keep nationality, resident status, and base location aligned with the passenger record.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FormFieldCategoryOption
              name="nationalityType"
              label="Nationality"
              placeholder="Select nationality"
              code={CategoryOptionCodeEnum.PassengerNationality}
              useValueAsId
              onValueChange={value => {
                const nextNationalityType = Array.isArray(value) ? null : value;

                if (nextNationalityType) {
                  clearCountrySelection();
                }

                onNationalityChange?.(nextNationalityType);
              }}
            />
            <FormFieldCategoryOption
              name="residentStatus"
              label="Resident Status"
              placeholder="Select resident status"
              code={CategoryOptionCodeEnum.PassengerResidentStatus}
              useValueAsId
              disabled={!isIndianNationality}
              onValueChange={value => {
                const nextResidentStatus = Array.isArray(value) ? null : value;

                if (nextResidentStatus === PassengerResidentStatusEnum.RESIDENT) {
                  form.setValue('nationalityType', PassengerNationalityTypeEnum.INDIAN, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: false,
                  });
                  return;
                }

                if (nextResidentStatus === PassengerResidentStatusEnum.NON_RESIDENT) {
                  form.setValue('nationalityType', PassengerNationalityTypeEnum.NRI, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: false,
                  });
                  clearCountrySelection();
                  return;
                }

                if (nextResidentStatus === PassengerResidentStatusEnum.FOREIGNER) {
                  form.setValue('nationalityType', PassengerNationalityTypeEnum.FOREIGNER, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: false,
                  });
                  clearCountrySelection();
                }
              }}
            />
            <FormFieldCountryDropdown
              name="countryId"
              label="Country"
              placeholder="Select country"
              hideBlockedCountry
              hideRestrictedCountry
              hideBaseCountry
              onValueChange={() => {
                // Country-driven resident synchronization happens in the effect above.
              }}
            />
          </div>
          {!isIndianNationality ? (
            <p className="text-xs text-text-secondary">
              Resident status is locked for non-Indian nationality.
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <FormFieldStateDropdown
              name="stateId"
              label="State"
              placeholder="Select state"
              countryId={countryId || undefined}
            />
          </div>

          <PassengerIdentityFields
            entityType={entityType}
            onPanFieldBlur={onPanFieldBlur}
            onPassportNumberBlur={onPassportNumberBlur}
            showPassport={false}
          />
        </section>

        <section className="space-y-4 rounded-sm border border-border-primary bg-surface-secondary p-4">
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Billing And Contact
            </h3>
            <p className="text-sm text-text-secondary">
              These fields can be prefilled from the selected corporate profile and edited if needed.
            </p>
          </div>

          {showPanSection ? (
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
              onBlur={onPanFieldBlur}
            />
            {showPanRelationField ? (
              <FormFieldCategoryOption
                name="panHolderRelationType"
                label="PAN Holder Relation"
                placeholder="Select relation"
                code={CategoryOptionCodeEnum.PassengerPanHolderRelation}
                useValueAsId
                disabled={isCorporateEntity}
              />
            ) : null}
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
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <FormFieldStateDropdown
              name="gstStateId"
              label="GST State"
              placeholder="Select GST state"
              countryId={countryId || undefined}
            />
            <FormFieldCategoryOption
              name="locationId"
              label="Location"
              placeholder="Select location"
              code={CategoryOptionCodeEnum.LocationType}
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
          </div>

          <FormFieldYesNoToggle
            name="isPep"
            label="Is PEP"
            yesLabel="Yes"
            noLabel="No"
          />
        </section>

        {isSaleTransaction ? (
          <section className="space-y-4 rounded-sm border border-border-primary bg-surface-secondary p-4">
            <div>
              <h3 className="text-base font-semibold text-text-primary">
                Sale Compliance
              </h3>
              <p className="text-sm text-text-secondary">
                These transaction-side values are captured here for the sell flow and stored on the transaction.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormFieldInput
                name="loanAmount"
                label="Loan Amount"
                placeholder="Enter loan amount"
                type="number"
                valueTransform="none"
              />
              <FormFieldInput
                name="declaredAmount"
                label="Declared Amount"
                placeholder="Enter declared amount"
                type="number"
                valueTransform="none"
              />
              <FormFieldInput
                name="preTcsFinalAmount"
                label="Pre-TCS Final Amount"
                placeholder="Calculated before TCS"
                type="number"
                valueTransform="none"
                disabled
              />
              <FormFieldInput
                name="tcsAmount"
                label="TCS Amount"
                placeholder="Calculated during preview"
                type="number"
                valueTransform="none"
                disabled
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormFieldYesNoToggle
                name="tcsDeclarationAccepted"
                label="TCS Declaration / Exemption"
                yesLabel="Yes"
                noLabel="No"
              />
              <FormFieldYesNoToggle
                name="itrFiled"
                label="ITR Filed"
                yesLabel="Yes"
                noLabel="No"
              />
              {isCorporateEntity ? (
                <FormFieldYesNoToggle
                  name="isProprietorship"
                  label="Proprietorship"
                  yesLabel="Yes"
                  noLabel="No"
                />
              ) : null}
            </div>
          </section>
        ) : null}
      </div>

      <div className="space-y-6">
        <section className="space-y-4 rounded-sm border border-border-primary bg-surface-secondary p-4">
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Passport Details
            </h3>
            <p className="text-sm text-text-secondary">
              {PASSENGER_IDENTITY_TEXT.passportOptionalHelper}
            </p>
          </div>

          <PassengerIdentityFields
            entityType={entityType}
            showPan={false}
            showPassport
            onPassportNumberBlur={onPassportNumberBlur}
            onPassportFieldBlur={onPassportFieldBlur}
          />
        </section>

        {showTravelDetails ? (
          <section className="space-y-4 rounded-sm border border-border-primary bg-surface-secondary p-4">
            <div>
              <h3 className="text-base font-semibold text-text-primary">
                Travel Details
              </h3>
              <p className="text-sm text-text-secondary">
                Capture the travel reference details for this sale transaction.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormFieldCategoryOption
                name="travelAirlineId"
                label="Airline"
                placeholder="Select airline"
                code={CategoryOptionCodeEnum.Airline}
              />
              <FormFieldInput
                name="travelTicketNo"
                label="Ticket No"
                placeholder="Enter ticket number"
              />
              <FormFieldInput
                name="travelRoute"
                label="Route"
                placeholder="Enter route"
              />
              <FormFieldCountryDropdown
                name="travelCountryId"
                label="Travel Country"
                placeholder="Select travel country"
              />
              <FormFieldInput
                name="travelNoOfDays"
                label="No of Days"
                placeholder="Enter number of days"
                type="number"
                valueTransform="none"
              />
              <FormFieldInput
                name="travelNoOfPax"
                label="No of Passengers"
                placeholder="Enter number of passengers"
                type="number"
                valueTransform="none"
              />
              <FormFieldDatePicker
                name="travelDepartureDate"
                label="Departure Date"
                placeholder="Select departure date"
              />
              <FormFieldInput
                name="travelPnr"
                label="Travel PNR"
                placeholder="Enter travel PNR"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormFieldYesNoToggle
                name="travelVisa"
                label="Visa"
                yesLabel="Yes"
                noLabel="No"
              />
              <FormFieldYesNoToggle
                name="travelIsCisCountry"
                label="CIS Country"
                yesLabel="Yes"
                noLabel="No"
              />
            </div>
          </section>
        ) : null}

        {(isIndianNationality || showTravelDetails) ? (
          <section className="space-y-4 rounded-sm border border-border-primary bg-surface-secondary p-4">
            <div>
              <h3 className="text-base font-semibold text-text-primary">
                Other Documents
              </h3>
              <p className="text-sm text-text-secondary">
                {showTravelDetails
                  ? 'Add any supporting passenger documents for the sell flow.'
                  : PASSENGER_IDENTITY_TEXT.otherDocumentsOptional}
              </p>
            </div>
            <PassengerOtherDocumentsSection
              onDocumentChange={onDocumentChange}
              description={
                showTravelDetails
                  ? 'Add any supporting passenger documents for the sell flow.'
                  : PASSENGER_IDENTITY_TEXT.otherDocumentsOptional
              }
            />
          </section>
        ) : null}
      </div>
    </div>
  );
};
