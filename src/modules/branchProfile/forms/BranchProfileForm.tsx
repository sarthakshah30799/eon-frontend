import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Resolver } from 'react-hook-form';
import { useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CardSection } from '@/components/ui';
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
import { useGetStateProfile } from '@/modules/stateProfile/hooks';
import { useListCompanyProfiles } from '@/modules/companyProfile/hooks';
import { branchProfileApi } from '@/api/branchProfile/branchProfile.api';
import { normalizeCodeValue } from '@/utils';

interface BranchProfileFormProps {
  defaultValues: ICreateBranchProfile;
  onSubmit: (values: ICreateBranchProfile) => void | Promise<void>;
  submitLabel?: string;
  backLabel?: string;
  onBackClick?: () => void;
  cancelLabel?: string;
  onCancel?: () => void | Promise<void>;
  isSubmitting?: boolean;
  branchAttachedToOptions?: IBranchProfileOption[];
  tone?: 'default' | 'review';
  currentId?: string;
}

const createStaticLoadOptions = (
  options: { value: string; label: string }[]
) => {
  return async () => ({
    options,
    hasMore: false,
  });
};

const BRANCH_FORM_ID = 'branch-profile-form';

const BranchProfileFormFields = ({
  isSubmitting = false,
  currentId,
}: {
  isSubmitting?: boolean;
  currentId?: string;
}) => {
  const form = useFormContext<ICreateBranchProfile>();
  const countryId = useWatch({
    control: form.control,
    name: 'countryId',
  });
  const stateId = useWatch({
    control: form.control,
    name: 'stateId',
  });

  const previousCountryIdRef = useRef<string>(countryId);
  const previousStateIdRef = useRef<string>(stateId);

  const {
    data: counterProfiles = [],
    isLoading: isCountersLoading,
    isFetching: isCountersFetching,
  } = useListCounterProfiles();

  const { data: selectedState } = useGetStateProfile(stateId);
  const { data: companies = [] } = useListCompanyProfiles();
  const companyPan = companies[0]?.panNo || '';

  useEffect(() => {
    if (previousCountryIdRef.current !== countryId) {
      form.setValue('stateId', '');
      previousCountryIdRef.current = countryId;
    }
  }, [countryId, form]);

  useEffect(() => {
    if (stateId && selectedState && stateId !== previousStateIdRef.current) {
      // 1. Populate gstState with state name
      const stateNameUpper = selectedState.name.toUpperCase();
      form.setValue('gstState', stateNameUpper);

      // 2. Populate gstNo following GSTIN structure: StateCode + CompanyPAN
      const stateGstCode = selectedState.gstStateCode || '';
      const defaultGstNo = `${stateGstCode}${companyPan.toUpperCase()}`;
      form.setValue('gstNo', defaultGstNo);

      previousStateIdRef.current = stateId;
    } else if (!stateId) {
      previousStateIdRef.current = '';
    }
  }, [stateId, selectedState, companyPan, form]);

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
  const validateBranchCode = useCallback(
    async (value: string) => {
      const normalizedCode = normalizeCodeValue(value);
      if (!normalizedCode) {
        return false;
      }

      const branches = await branchProfileApi.getBranchProfiles();
      return branches.some(
        branch =>
          branch.code.trim().toUpperCase() === normalizedCode &&
          branch.id !== currentId
      );
    },
    [currentId]
  );
  return (
    <div className="space-y-3 pb-24">
      <CardSection heading="Basic Details">
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput
            name="code"
            label="Branch Code"
            disabled={isSubmitting || Boolean(currentId)}
            asyncValidation={{
              enabled: !isSubmitting && !currentId,
              check: validateBranchCode,
              message: 'Branch code already exists',
              normalize: normalizeCodeValue,
            }}
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
          <FormFieldInput name="city" label="City" disabled={isSubmitting} />
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
          <FormFieldCategoryOption
            name="locationType"
            label="Location Type"
            code={CategoryOptionCodeEnum.LocationType}
            placeholder="Select location type"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="Address Details">
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
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
            name="gstState"
            label="GST State"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="pinCode"
            label="Pincode"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="Contact Details">
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
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
        </div>
      </CardSection>

      <CardSection heading="Tax & Finance">
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput
            name="gstNo"
            label="GST No."
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="fxRegNo"
            label="Foreign Exchange registration No."
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="fxRegDate"
            label="Foreign Exchange registration Date"
            type="date"
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
            label="Cash Holding Temporary"
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
            label="Currency Holding Temporary"
            type="number"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="Relations & Status">
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
            className={['md:col-span-2 lg:col-span-4'].join(' ')}
          />
        <div className="mt-2 grid gap-2 md:col-span-2 md:grid-cols-2 lg:col-span-4">
          <FormFieldCheckbox
            name="isHeadOffice"
            label="Head Office"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isActive"
            label="Active"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>
    </div>
  );
};

export const BranchProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Submit',
  onCancel,
  isSubmitting = false,
  currentId,
}: BranchProfileFormProps) => {
  return (
    <Form
      id={BRANCH_FORM_ID}
      onSubmit={onSubmit}
      resolver={
        yupResolver(branchProfileSchema) as Resolver<ICreateBranchProfile>
      }
      defaultValues={defaultValues}
      className={'space-y-6'}
      footer={{
        submitLabel,
        backLabel: 'Back',
        onBackClick: () => {
          void onCancel?.();
        },
        onCancel,
      }}
    >
      <BranchProfileFormFields
        isSubmitting={isSubmitting}
        currentId={currentId}
      />
    </Form>
  );
};
