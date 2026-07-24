import { useWatch, useFormContext } from 'react-hook-form';
import { FormFieldCategoryOption, FormFieldCountryDropdown, FormFieldDatePicker, FormFieldInput, FormFieldStateDropdown, FormFieldYesNoToggle } from '@/components/forms';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import type { IPurchaseFormValues } from '@/modules/purchase/types/purchaseTypes';
import { PassengerNationalityTypeEnum } from '../types/passengerTypes';
import { PassengerIdentityFields } from './PassengerIdentityFields';
import { PassengerOtherDocumentsSection } from './PassengerOtherDocumentsSection';

interface PassengerDetailsFieldsProps {
  entityType: string;
  onPanFieldBlur?: () => void;
  onPassportFieldBlur?: () => void;
  onNationalityChange?: (value: string | null) => void;
}

export const PassengerDetailsFields = ({
  entityType,
  onPanFieldBlur,
  onPassportFieldBlur,
  onNationalityChange,
}: PassengerDetailsFieldsProps) => {
  const form = useFormContext<IPurchaseFormValues>();
  const nationalityType = useWatch({
    control: form.control,
    name: 'nationalityType',
  });
  const countryId = useWatch({
    control: form.control,
    name: 'countryId',
  });
  const isIndianNationality =
    nationalityType === PassengerNationalityTypeEnum.INDIAN;

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
              onValueChange={value => onNationalityChange?.(Array.isArray(value) ? null : value)}
            />
            <FormFieldCategoryOption
              name="residentStatus"
              label="Resident Status"
              placeholder="Select resident status"
              code={CategoryOptionCodeEnum.PassengerResidentStatus}
              useValueAsId
            />
            <FormFieldCountryDropdown
              name="countryId"
              label="Country"
              placeholder="Select country"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormFieldStateDropdown
              name="stateId"
              label="State"
              placeholder="Select state"
              countryId={countryId || undefined}
            />
            <FormFieldCategoryOption
              name="panHolderRelationType"
              label="PAN Holder Relation"
              placeholder="Select relation"
              code={CategoryOptionCodeEnum.PassengerPanHolderRelation}
              useValueAsId
            />
          </div>

          <PassengerIdentityFields
            entityType={entityType}
            onPanFieldBlur={onPanFieldBlur}
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
            <FormFieldCategoryOption
              name="locationId"
              label="Location"
              placeholder="Select location"
              code={CategoryOptionCodeEnum.LocationType}
              useValueAsId
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
      </div>

      <div className="space-y-6">
        <section className="space-y-4 rounded-sm border border-border-primary bg-surface-secondary p-4">
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Passport Details
            </h3>
            <p className="text-sm text-text-secondary">
              Passport stays visible for every passenger and becomes required for NRI or foreign residents.
            </p>
          </div>

          <PassengerIdentityFields
            entityType={entityType}
            showPan={false}
            showPassport
            onPassportFieldBlur={onPassportFieldBlur}
          />
        </section>

        {isIndianNationality ? (
          <section className="space-y-4 rounded-sm border border-border-primary bg-surface-secondary p-4">
            <div>
              <h3 className="text-base font-semibold text-text-primary">
                Other Documents
              </h3>
              <p className="text-sm text-text-secondary">
                Add supporting documents for Indian passengers here.
              </p>
            </div>
            <PassengerOtherDocumentsSection />
          </section>
        ) : null}
      </div>
    </div>
  );
};
