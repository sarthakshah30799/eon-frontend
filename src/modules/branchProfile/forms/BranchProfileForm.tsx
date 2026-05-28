import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Resolver } from 'react-hook-form';
import { Button } from '@/components/ui/button1';
import {
  Form,
  FormFieldCheckbox,
  FormFieldDatePicker,
  FormFieldInput,
  FormFieldPhoneInput,
  FormFieldSelect,
  FormFieldYesNoToggle,
} from '@/components/forms';
import {
  AC_USER_INCHARGE_OPTIONS,
  BRANCH_PHONE_COUNTRY_CODE_OPTIONS,
  BRANCH_PROFILE_TEXTS,
  IBM_BRANCH_OPTIONS,
  LOCATION_TYPE_OPTIONS,
  OPERATIONAL_GROUP_OPTIONS,
  OPERATIONAL_USER_OPTIONS,
  STATE_OPTIONS,
  WU_AC_BRANCH_POSTING_OPTIONS,
  createStaticLoadOptions,
} from '../constants';
import { branchProfileSchema } from '../schema';
import type { BranchProfileFormValues, BranchProfileOption } from '../types';

interface BranchProfileFormProps {
  defaultValues: BranchProfileFormValues;
  onSubmit: (values: BranchProfileFormValues) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  branchAttachedToOptions: BranchProfileOption[];
}

const formCardClass =
  'rounded-sm border border-border-primary bg-surface-secondary p-4';

const BranchProfileFormFields = ({
  branchAttachedToOptions,
  isSubmitting = false,
}: {
  branchAttachedToOptions: BranchProfileOption[];
  isSubmitting?: boolean;
}) => {
  const form = useFormContext<BranchProfileFormValues>();
  const serviceTaxApplicable = useWatch({
    control: form.control,
    name: 'serviceTaxApplicable',
  });

  const locationTypeLoadOptions = useMemo(
    () => createStaticLoadOptions(LOCATION_TYPE_OPTIONS),
    []
  );
  const stateLoadOptions = useMemo(
    () => createStaticLoadOptions(STATE_OPTIONS),
    []
  );
  const operationalGroupLoadOptions = useMemo(
    () => createStaticLoadOptions(OPERATIONAL_GROUP_OPTIONS),
    []
  );
  const operationalUserLoadOptions = useMemo(
    () => createStaticLoadOptions(OPERATIONAL_USER_OPTIONS),
    []
  );
  const acUserInchargeLoadOptions = useMemo(
    () => createStaticLoadOptions(AC_USER_INCHARGE_OPTIONS),
    []
  );
  const wuAcBranchPostingLoadOptions = useMemo(
    () => createStaticLoadOptions(WU_AC_BRANCH_POSTING_OPTIONS),
    []
  );
  const ibmBranchLoadOptions = useMemo(
    () => createStaticLoadOptions(IBM_BRANCH_OPTIONS),
    []
  );
  const branchAttachedToLoadOptions = useMemo(
    () => createStaticLoadOptions(branchAttachedToOptions),
    [branchAttachedToOptions]
  );

  return (
    <div className="space-y-6">
      <section className={formCardClass}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Profile
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="branchName"
            label="Branch Name"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="branchCode"
            label="Branch Code"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="branchNo"
            label="Branch No"
            disabled={isSubmitting}
          />
        </div>
      </section>

      <section className={formCardClass}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Address
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldInput name="address1" label="Address 1" disabled={isSubmitting} />
          <FormFieldInput name="address2" label="Address 2" disabled={isSubmitting} />
          <FormFieldInput name="address3" label="Address 3" disabled={isSubmitting} />
          <FormFieldInput name="city" label="City" disabled={isSubmitting} />
          <FormFieldSelect
            name="stateId"
            label="State"
            placeholder="Select state"
            loadOptions={stateLoadOptions}
            pagination={false}
            disabled={isSubmitting}
          />
          <FormFieldInput name="stdCode" label="STD Code" disabled={isSubmitting} />
          <FormFieldInput name="pinCode" label="Pin Code" disabled={isSubmitting} />
          <FormFieldSelect
            name="operationalGroupId"
            label="Operational Group"
            placeholder="Select operational group"
            loadOptions={operationalGroupLoadOptions}
            pagination={false}
            disabled={isSubmitting}
          />
        </div>
      </section>

      <section className={formCardClass}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Contact
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldPhoneInput
            countryCodeName="phoneNo1CountryCode"
            numberName="phoneNo1"
            label="Phone No.1"
            countryCodeOptions={BRANCH_PHONE_COUNTRY_CODE_OPTIONS}
            disabled={isSubmitting}
          />
          <FormFieldPhoneInput
            countryCodeName="phoneNo2CountryCode"
            numberName="phoneNo2"
            label="Phone No.2"
            countryCodeOptions={BRANCH_PHONE_COUNTRY_CODE_OPTIONS}
            disabled={isSubmitting}
          />
          <FormFieldPhoneInput
            countryCodeName="faxNo1CountryCode"
            numberName="faxNo1"
            label="Fax No 1"
            countryCodeOptions={BRANCH_PHONE_COUNTRY_CODE_OPTIONS}
            disabled={isSubmitting}
          />
          <FormFieldPhoneInput
            countryCodeName="faxNo2CountryCode"
            numberName="faxNo2"
            label="Fax No 2"
            countryCodeOptions={BRANCH_PHONE_COUNTRY_CODE_OPTIONS}
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="emailId"
            label="Email ID"
            type="email"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="contactPerson"
            label="Contact Person"
            disabled={isSubmitting}
          />
          <FormFieldPhoneInput
            countryCodeName="contactNoCountryCode"
            numberName="contactNo"
            label="Contact No."
            countryCodeOptions={BRANCH_PHONE_COUNTRY_CODE_OPTIONS}
            disabled={isSubmitting}
          />
        </div>
      </section>

      <section className={formCardClass}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Other details
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldSelect
            name="locationTypeId"
            label="Location Type"
            placeholder="Select location type"
            loadOptions={locationTypeLoadOptions}
            pagination={false}
            disabled={isSubmitting}
          />
          <FormFieldSelect
            name="operationalUserId"
            label="Operational User"
            placeholder="Select operational user"
            loadOptions={operationalUserLoadOptions}
            pagination={false}
            disabled={isSubmitting}
          />
          <FormFieldSelect
            name="acUserInchargeId"
            label="A/C User Incharge"
            placeholder="Select A/C user incharge"
            loadOptions={acUserInchargeLoadOptions}
            pagination={false}
            disabled={isSubmitting}
          />
          <FormFieldInput name="aiiNo" label="AII No." disabled={isSubmitting} />
          <FormFieldInput name="wuAiiNo" label="WU-AII No." disabled={isSubmitting} />
          <FormFieldInput
            name="rbiLicenceNo"
            label="RBI Licence No."
            disabled={isSubmitting}
          />
          <FormFieldDatePicker
            name="rbiRegDate"
            label="RBI Reg Date"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="authSignatory"
            label="Auth. Signatory"
            disabled={isSubmitting}
          />
          <FormFieldSelect
            name="branchAttachedToId"
            label="Branch Attached To"
            placeholder="Select branch"
            loadOptions={branchAttachedToLoadOptions}
            pagination={false}
            disabled={isSubmitting}
          />
          <FormFieldSelect
            name="wuAcBranchPostingId"
            label="WU A/c Branch Posting"
            placeholder="Select posting branch"
            loadOptions={wuAcBranchPostingLoadOptions}
            pagination={false}
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="cashLimit"
            label="Cash Limit"
            disabled={isSubmitting}
          />
          <FormFieldInput name="ibmHo1" label="IBM HO 1." disabled={isSubmitting} />
          <FormFieldInput name="ibmHo2" label="IBM HO 2." disabled={isSubmitting} />
          <FormFieldSelect
            name="ibmBranchId"
            label="IBM Branch"
            placeholder="Select IBM branch"
            loadOptions={ibmBranchLoadOptions}
            pagination={false}
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="lastSettlementRef"
            label="Last Settlement Ref."
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="currencyLimit"
            label="Currency Limit"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="tempCashLimit"
            label="Temp Cash Limit"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="tempCurrencyLimit"
            label="Temp Currency Limit"
            disabled={isSubmitting}
          />

          <div className="md:col-span-2 lg:col-span-3 grid gap-4 md:grid-cols-2">
            <FormFieldCheckbox
              name="branchHasShifts"
              label="Branch has Shifts"
              disabled={isSubmitting}
            />
            <FormFieldCheckbox
              name="canReferenceOnBehalfEntries"
              label="Can this Branch be a reference 'On Behalf' entries"
              disabled={isSubmitting}
            />
            <FormFieldYesNoToggle
              name="serviceTaxApplicable"
              label="Service Tax Applicable"
              disabled={isSubmitting}
            />        
          </div>
           {serviceTaxApplicable && (
              <FormFieldInput
                name="serviceTaxRegnNo"
                label="Serv.Tax Regn No"
                disabled={isSubmitting || !serviceTaxApplicable}
              />
            )}
        </div>
      </section>
    </div>
  );
};

export const BranchProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = BRANCH_PROFILE_TEXTS.CREATE_BRANCH,
  isSubmitting = false,
  branchAttachedToOptions,
}: BranchProfileFormProps) => {
  return (
    <Form
      onSubmit={onSubmit}
      resolver={yupResolver(branchProfileSchema) as Resolver<BranchProfileFormValues>}
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <BranchProfileFormFields
        branchAttachedToOptions={branchAttachedToOptions}
        isSubmitting={isSubmitting}
      />

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
