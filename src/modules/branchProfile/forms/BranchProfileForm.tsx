import { useEffect, useMemo, useRef } from 'react';
import type { Resolver } from 'react-hook-form';
import { useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import {
  Form,
  FormFieldCategoryOption,
  FormFieldCheckbox,
  FormFieldCountryDropdown,
  FormFieldInput,
  FormFieldSelect,
  FormFieldStateDropdown,
} from '@/components/forms';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { branchProfileSchema } from '../schema';
import type { ICreateBranchProfile, IBranchProfileOption } from '../types';
import { useListCounterProfiles } from '@/modules/counterProfile/hooks';

interface BranchProfileFormProps {
  defaultValues: ICreateBranchProfile;
  onSubmit: (values: ICreateBranchProfile) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  branchAttachedToOptions?: IBranchProfileOption[];
}

const formCardClass =
  'rounded-sm border border-border-primary bg-surface-secondary p-4';

const createStaticLoadOptions = (options: { value: string; label: string }[]) => {
  return async () => ({
    options,
    hasMore: false,
  });
};

const BranchProfileFormFields = ({
  isSubmitting = false,
}: {
  isSubmitting?: boolean;
}) => {
  const form = useFormContext<ICreateBranchProfile>();
  const countryId = useWatch({
    control: form.control,
    name: 'countryId',
  });
  const previousCountryIdRef = useRef<string>(countryId);
  const {
    data: counterProfiles = [],
    isLoading: isCountersLoading,
    isFetching: isCountersFetching,
  } = useListCounterProfiles();

  useEffect(() => {
    if (previousCountryIdRef.current !== countryId) {
      form.setValue('stateId', '');
      previousCountryIdRef.current = countryId;
    }
  }, [countryId, form]);

  const connectedCounterOptions = useMemo(
    () =>
      counterProfiles.map(counter => ({
        value: counter.id,
        label: `${counter.counterNo} - ${counter.name}`,
      })),
    [counterProfiles]
  );
  const connectedCounterLoadOptions = useMemo(
    () => createStaticLoadOptions(connectedCounterOptions),
    [connectedCounterOptions]
  );

  return (
    <div className="space-y-6">
      <section className={formCardClass}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Company Branch Details
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldInput
            name="code"
            label="Branch Code"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="name"
            label="Branch Name"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="branchNumber"
            label="Branch Number"
            type="number"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="address1"
            label="Address Line 1"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="address2"
            label="Address Line 2"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="address3"
            label="Address Line 3"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="city"
            label="City"
            disabled={isSubmitting}
          />
          <FormFieldCountryDropdown
            name="countryId"
            label="Country"
            placeholder="Select country"
            disabled={isSubmitting}
          />
          <FormFieldStateDropdown
            name="stateId"
            label="State"
            placeholder={countryId ? 'Select state' : 'Select country first'}
            countryId={countryId}
            disabled={isSubmitting || !countryId}
          />
          <FormFieldInput
            name="gstState"
            label="GST State"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="pinCode"
            label="Pincode"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="gstNo"
            label="GST No."
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="fxRegNo"
            label="FX Reg No."
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="fxRegDate"
            label="FX Reg Date"
            type="date"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="contactName"
            label="Contact Name"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="contactNo"
            label="Contact No."
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="branchEmail"
            label="Branch Email"
            type="email"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="aeonBranchLic"
            label="AEON Branch Lic"
            disabled={isSubmitting}
          />
          <FormFieldCategoryOption
            name="locationType"
            label="Location Type"
            code={CategoryOptionCodeEnum.LocationType}
            placeholder="Select location type"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="cashHolding"
            label="Cash Holding"
            type="number"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="cashHoldingTemp"
            label="Cash Holding Temp"
            type="number"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="currHolding"
            label="Currency Holding"
            type="number"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="currHoldingTemp"
            label="Currency Holding Temp"
            type="number"
            disabled={isSubmitting}
          />
        </div>
      </section>

      <section className={formCardClass}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Relations & Status
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldSelect
            name="connectCounterIds"
            label="Connect Counters"
            placeholder="Select counters to link"
            loadOptions={connectedCounterLoadOptions}
            pagination={false}
            isLoading={isCountersLoading || isCountersFetching}
            defaultOptions={connectedCounterOptions}
            disabled={isSubmitting}
            isMulti
            closeMenuOnSelect={false}
            className="md:col-span-2 lg:col-span-3"
          />
          <div className="md:col-span-2 lg:col-span-3 grid gap-4 md:grid-cols-2 mt-2">
            <FormFieldCheckbox
              name="isHeadOffice"
              label="Is Head Office"
              disabled={isSubmitting}
            />
            <FormFieldCheckbox
              name="isActive"
              label="Is Active"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export const BranchProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Company Branch',
  isSubmitting = false,
}: BranchProfileFormProps) => {
  return (
    <Form
      onSubmit={onSubmit}
      resolver={yupResolver(branchProfileSchema) as Resolver<ICreateBranchProfile>}
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <BranchProfileFormFields isSubmitting={isSubmitting} />

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-sm"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
};
