import { useWatch, useFormContext } from 'react-hook-form';
import {
  FormFieldCategoryOption,
  FormFieldCountryDropdown,
  FormFieldDatePicker,
  FormFieldInput,
} from '@/components/forms';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import type { IPurchaseFormValues } from '@/modules/purchase/types/purchaseTypes';
import {
  PassengerEntityTypeEnum,
  PassengerNationalityTypeEnum,
} from '../types/passengerTypes';

interface PassengerIdentityFieldsProps {
  entityType: string;
  showNationality?: boolean;
  showResident?: boolean;
  showPanRelation?: boolean;
  showPan?: boolean;
  showPassport?: boolean;
  showCountryInPassport?: boolean;
  identityLocked?: boolean;
  onPanFieldBlur?: () => void;
  onPassportNumberBlur?: () => void;
  onPassportFieldBlur?: () => void;
  onNationalityChange?: (value: string | null) => void;
}

export const PassengerIdentityFields = ({
  entityType,
  showNationality = false,
  showResident = false,
  showPanRelation: _showPanRelation = false,
  showPan = true,
  showPassport = false,
  showCountryInPassport = false,
  identityLocked = false,
  onPanFieldBlur,
  onPassportNumberBlur,
  onPassportFieldBlur,
  onNationalityChange,
}: PassengerIdentityFieldsProps) => {
  void _showPanRelation;
  const form = useFormContext<IPurchaseFormValues>();
  const nationalityType = useWatch({
    control: form.control,
    name: 'nationalityType',
  });
  const panNumber = useWatch({ control: form.control, name: 'panNumber' });
  const panHolderName = useWatch({
    control: form.control,
    name: 'panHolderName',
  });
  const panDob = useWatch({ control: form.control, name: 'panDob' });
  const passportPassengerName = useWatch({
    control: form.control,
    name: 'passportPassengerName',
  });
  const passportNumber = useWatch({
    control: form.control,
    name: 'passportNumber',
  });
  const isCorporate = entityType === PassengerEntityTypeEnum.CORPORATE;
  const isIndianNationality =
    nationalityType === PassengerNationalityTypeEnum.INDIAN;
  const isPanVisible = showPan && (isCorporate || isIndianNationality);
  const showCountry = showNationality && !isIndianNationality;
  // Deal-cover autofill: lock only prefilled identity values. Issue place/dates,
  // country, relation, and empty identity fields stay editable on create.
  const lockIfFilled = (value: unknown) =>
    identityLocked && Boolean(String(value ?? '').trim());

  return (
    <div className="space-y-4">
      {showNationality ? (
        <>
          <div
            className={`grid gap-4 ${
              showResident ? 'md:grid-cols-2' : 'md:grid-cols-1'
            }`}
          >
            <FormFieldCategoryOption
              name="nationalityType"
              label="Nationality"
              placeholder="Select nationality"
              code={CategoryOptionCodeEnum.PassengerNationality}
              useValueAsId
              onValueChange={value =>
                onNationalityChange?.(Array.isArray(value) ? null : value)
              }
            />
            {showResident ? (
              <FormFieldCategoryOption
                name="residentStatus"
                label="Resident Status"
                placeholder="Select resident status"
                code={CategoryOptionCodeEnum.PassengerResidentStatus}
                useValueAsId
                disabled={!isIndianNationality}
              />
            ) : null}
          </div>
          {showCountry ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FormFieldCountryDropdown
                name="countryId"
                label="Country"
                placeholder="Select country"
                hideBlockedCountry
                hideRestrictedCountry
                hideBaseCountry
              />
            </div>
          ) : null}
        </>
      ) : null}

      {isPanVisible ? (
        <div className="grid gap-4 md:grid-cols-3">
          <FormFieldInput
            name="panNumber"
            label="PAN Number"
            placeholder="Enter PAN number"
            valueTransform="uppercase"
            disabled={lockIfFilled(panNumber)}
            onBlur={onPanFieldBlur}
          />
          <FormFieldInput
            name="panHolderName"
            label="PAN Holder Name"
            placeholder="Enter PAN holder name"
            disabled={lockIfFilled(panHolderName)}
            onBlur={onPanFieldBlur}
          />
          <FormFieldDatePicker
            name="panDob"
            label="PAN Holder DOB"
            placeholder="Select DOB"
            disabled={lockIfFilled(panDob)}
            onBlur={onPanFieldBlur}
          />
        </div>
      ) : null}

      {showPassport ? (
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="passportPassengerName"
            label="Passport Passenger Name"
            placeholder="Enter passport passenger name"
            disabled={lockIfFilled(passportPassengerName)}
            onBlur={onPassportFieldBlur}
          />
          <FormFieldInput
            name="passportNumber"
            label="Passport Number"
            placeholder="Enter passport number"
            valueTransform="uppercase"
            maxLength={8}
            disabled={lockIfFilled(passportNumber)}
            onBlur={onPassportNumberBlur}
          />
          <FormFieldDatePicker
            name="passportIssueDate"
            label="Passport Issue Date"
            placeholder="Select issue date"
            onBlur={onPassportFieldBlur}
          />
          <FormFieldDatePicker
            name="passportExpiryDate"
            label="Passport Expiry Date"
            placeholder="Select expiry date"
            onBlur={onPassportFieldBlur}
          />
          {showCountryInPassport ? (
            <FormFieldCountryDropdown
              name="countryId"
              label="Country"
              placeholder="Select country"
              hideBlockedCountry
              hideRestrictedCountry
              hideBaseCountry
            />
          ) : null}
          <FormFieldInput
            name="passportIssueAt"
            label="Issue At"
            placeholder="Enter issue place"
            onBlur={onPassportFieldBlur}
          />
        </div>
      ) : null}
    </div>
  );
};
