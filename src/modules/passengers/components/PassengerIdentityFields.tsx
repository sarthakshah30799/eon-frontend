import { useWatch, useFormContext } from 'react-hook-form';
import {
  FormFieldCategoryOption,
  FormFieldDatePicker,
  FormFieldInput,
} from '@/components/forms';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import type { IPurchaseFormValues } from '@/modules/purchase/types/purchaseTypes';
import { PassengerEntityTypeEnum, PassengerNationalityTypeEnum } from '../types/passengerTypes';

interface PassengerIdentityFieldsProps {
  entityType: string;
  showNationality?: boolean;
  showResident?: boolean;
  showPanRelation?: boolean;
  showPan?: boolean;
  showPassport?: boolean;
  onPanFieldBlur?: () => void;
  onPassportFieldBlur?: () => void;
  onNationalityChange?: (value: string | null) => void;
}

export const PassengerIdentityFields = ({
  entityType,
  showNationality = false,
  showResident = false,
  showPanRelation = false,
  showPan = true,
  showPassport = false,
  onPanFieldBlur,
  onPassportFieldBlur,
  onNationalityChange,
}: PassengerIdentityFieldsProps) => {
  const form = useFormContext<IPurchaseFormValues>();
  const nationalityType = useWatch({
    control: form.control,
    name: 'nationalityType',
  });
  const isCorporate = entityType === PassengerEntityTypeEnum.CORPORATE;
  const isIndianNationality =
    nationalityType === PassengerNationalityTypeEnum.INDIAN;
  const isPassportRequired = showPassport || (!isCorporate && !isIndianNationality);
  const isPanRequired = showPan && (isCorporate || isIndianNationality);

  return (
    <div className="space-y-4">
      {showNationality ? (
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldCategoryOption
            name="nationalityType"
            label="Nationality"
            placeholder="Select nationality"
            code={CategoryOptionCodeEnum.PassengerNationality}
            useValueAsId
            onValueChange={value => onNationalityChange?.(Array.isArray(value) ? null : value)}
          />
          {showResident ? (
            <FormFieldCategoryOption
              name="residentStatus"
              label="Resident Status"
              placeholder="Select resident status"
              code={CategoryOptionCodeEnum.PassengerResidentStatus}
              useValueAsId
            />
          ) : null}
        </div>
      ) : null}

      {isPanRequired ? (
        <div className="grid gap-4 md:grid-cols-3">
          <FormFieldInput
            name="panNumber"
            label="PAN Number"
            placeholder="Enter PAN number"
            valueTransform="uppercase"
            onBlur={onPanFieldBlur}
          />
          <FormFieldInput
            name="panHolderName"
            label="PAN Holder Name"
            placeholder="Enter PAN holder name"
            onBlur={onPanFieldBlur}
          />
          <FormFieldDatePicker
            name="panDob"
            label="PAN Holder DOB"
            placeholder="Select DOB"
            onBlur={onPanFieldBlur}
          />
          {showPanRelation ? (
            <FormFieldCategoryOption
              name="panHolderRelationType"
              label="PAN Holder Relation"
              placeholder="Select relation"
              code={CategoryOptionCodeEnum.PassengerPanHolderRelation}
              useValueAsId
            />
          ) : null}
        </div>
      ) : null}

      {isPassportRequired ? (
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="passportNumber"
            label="Passport Number"
            placeholder="Enter passport number"
            valueTransform="uppercase"
            onBlur={onPassportFieldBlur}
          />
          <FormFieldInput
            name="passportIssueAt"
            label="Issue At"
            placeholder="Enter issue place"
            onBlur={onPassportFieldBlur}
          />
          <FormFieldDatePicker
            name="passportIssueDate"
            label="Issue Date"
            placeholder="Select issue date"
            onBlur={onPassportFieldBlur}
          />
          <FormFieldDatePicker
            name="passportExpiryDate"
            label="Expiry Date"
            placeholder="Select expiry date"
            onBlur={onPassportFieldBlur}
          />
          <FormFieldDatePicker
            name="arrivalDate"
            label="Arrival Date"
            placeholder="Select arrival date"
            onBlur={onPassportFieldBlur}
          />
        </div>
      ) : null}
    </div>
  );
};
