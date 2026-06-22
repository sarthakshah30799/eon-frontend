import { useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CardSection } from '@/components/ui';
import {
  Form,
  FormFieldCategoryOption,
  FormFieldCheckbox,
  FormFieldInput,
  FormFieldSelect,
  FormFieldDatePicker,
  FormFieldTextarea,
  FormFieldFileUploader,
} from '@/components/forms';
import { partyProfileSchema } from '../schema';
import type { ICreatePartyProfile } from '../types';
import { branchProfileApi } from '@/api/branchProfile/branchProfile.api';
import { stateProfileApi } from '@/api/stateProfile/stateProfile.api';
import {
  DEFAULT_PARTY_PROFILE_TYPE,
  getPartyProfileTypeConfig,
  type PartyProfileType,
} from '../constants';
import type { AsyncSelectResponse } from '@/components/ui';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { usePartyProfileTypes } from '../hooks';

interface PartyProfileFormProps {
  defaultValues: ICreatePartyProfile;
  onSubmit: (values: ICreatePartyProfile) => void | Promise<void>;
  submitLabel?: string;
  onCancel?: () => void | Promise<void>;
  isSubmitting?: boolean;
  disabled?: boolean;
  profileType?: PartyProfileType;
}

const FORM_ID = 'party-profile-form';

const PartyProfileFormFields = ({
  isSubmitting: isSubmittingProp = false,
  disabled = false,
  profileType = DEFAULT_PARTY_PROFILE_TYPE,
}: {
  isSubmitting?: boolean;
  disabled?: boolean;
  profileType?: PartyProfileType;
}) => {
  const isSubmitting = isSubmittingProp || disabled;
  const typeConfig = getPartyProfileTypeConfig(profileType);
  const { control } = useFormContext();
  const currentType = useWatch({
    control,
    name: 'type',
  });

  const { data: typeOptions = [] } = usePartyProfileTypes();
  const typeLoadOptions = useCallback(async () => {
    return { options: typeOptions };
  }, [typeOptions]);

  const branchLoadOptions = useCallback(async (inputValue: string) => {
    const branches = await branchProfileApi.getBranchProfiles();
    const options = branches
      .filter(
        branch =>
          !inputValue ||
          `${branch.code} - ${branch.name}`
            .toLowerCase()
            .includes(inputValue.toLowerCase())
      )
      .map(branch => ({
        value: branch.id,
        label: `${branch.code} - ${branch.name}`,
      }));
    return { options };
  }, []);

  const stateLoadOptions = useCallback(async (inputValue: string) => {
    const res = await stateProfileApi.getStateProfiles({ limit: 100 });
    const options = (res.data ?? [])
      .filter(
        state =>
          !inputValue ||
          `${state.code} - ${state.name}`
            .toLowerCase()
            .includes(inputValue.toLowerCase())
      )
      .map(state => ({
        value: state.id,
        label: `${state.code} - ${state.name}`,
      }));
    return { options };
  }, []);

  const loadGroupOptions = useCallback(async (): Promise<AsyncSelectResponse> => {
    return { options: typeConfig.groupOptions };
  }, [typeConfig.groupOptions]);

  return (
    <div className="space-y-4 pb-24">
      <CardSection heading="Basic Info & Credit Policy">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldSelect
            name="type"
            label="Profile Type"
            placeholder="Select profile type"
            loadOptions={typeLoadOptions}
            defaultOptions={typeOptions}
            disabled={isSubmitting}
            isSearchable={false}
          />
          <FormFieldInput
            name="dateOfIntro"
            label="Date of Intro"
            type="date"
            disabled={true}
          />
          <FormFieldInput
            name="code"
            label="Client Code"
            placeholder="Enter client code (4-20 chars)"
            disabled={isSubmitting}
          />
          {currentType === 'ffmc' && (
            <>
              <FormFieldInput
                name="ffmcRegNo"
                label="FFMC Registration Number"
                placeholder="Enter FFMC Registration No."
                disabled={isSubmitting}
              />
              <FormFieldDatePicker
                name="ffmcRegDate"
                label="FFMC Registration Date"
                disabled={isSubmitting}
              />
            </>
          )}
          <FormFieldInput
            name="creditLimit"
            label="Credit Limit"
            type="number"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="creditDays"
            label="Credit Days"
            type="number"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="temporaryCreditLimit"
            label="Temporary Credit Limit"
            type="number"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="temporaryCreditDays"
            label="Temporary Credit Days"
            type="number"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="permanentCreditLimit"
            label="Permanent Credit Limit"
            type="number"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="permanentCreditDays"
            label="Permanent Credit Days"
            type="number"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="Client Identity">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
          <FormFieldInput
            name="name"
            label="Client Name"
            placeholder={`Enter ${typeConfig.label.toLowerCase()} name`}
            disabled={isSubmitting}
          />
          </div>
          <div className="flex items-center pt-6">
            <FormFieldCheckbox
              name="isIndividual"
              label="Individual Category Customer (not a party profile)"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </CardSection>

      <CardSection heading="Address Details">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldInput
            name="address1"
            label="Address Line 1"
            placeholder="Room/Suite, Building"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="address2"
            label="Address Line 2"
            placeholder="Street name, Sector"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="address3"
            label="Address Line 3"
            placeholder="Landmark"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="city"
            label="City"
            placeholder="Enter city"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="pinCode"
            label="Pin Code"
            placeholder="Enter zip/pin code"
            disabled={isSubmitting}
          />
          <FormFieldCategoryOption
            name="location"
            label="Location"
            code={CategoryOptionCodeEnum.LocationType}
            placeholder="Select location"
            disabled={isSubmitting}
            isCreatable={true}
          />
        </div>
      </CardSection>

      <CardSection heading="KYC & Default Controls">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldInput
            name="kycApprovalNumber"
            label="KYC Approval Number"
            placeholder="Enter KYC Approval No."
            disabled={isSubmitting}
          />
          <FormFieldCategoryOption
            name="kycRiskCategory"
            label="KYC Risk Category"
            code={CategoryOptionCodeEnum.KycRiskCategory}
            placeholder="Select Risk Category"
            disabled={isSubmitting}
            isCreatable={true}
          />
          <FormFieldInput
            name="chqTrxnLimit"
            label="Cheque Transaction Limit"
            type="number"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="defaultHandlingCharges"
            label="Default Handling Charges"
            type="number"
            disabled={isSubmitting}
          />
          <FormFieldCategoryOption
            name="defaultAgent"
            label="Default Agent"
            code={CategoryOptionCodeEnum.DefaultAgent}
            placeholder="Select default agent"
            disabled={isSubmitting}
            isCreatable={true}
          />
          <FormFieldInput
            name="phoneNo"
            label="Phone No."
            placeholder="Enter phone number"
            disabled={isSubmitting}
          />
          <FormFieldDatePicker
            name="blockDateFrom"
            label="Block Date From"
            disabled={isSubmitting}
          />
          <FormFieldDatePicker
            name="establishmentDate"
            label="Establishment Date"
            disabled={isSubmitting}
          />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 mt-2 gap-2">
          <FormFieldInput
            name="email"
            label="Email"
            placeholder="Enter email address"
            type="email"
            disabled={isSubmitting}
          />
           <FormFieldInput
            name="webSite"
            label="Web Site"
            placeholder="Enter website URL"
            disabled={isSubmitting}
          />
        </div>
        <div className="md:col-span-4 mt-2">
          <FormFieldTextarea
            name="remarks"
            label="Remarks"
            placeholder="Enter any additional remarks..."
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="Contact Person & Grouping">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput
            name="contactName"
            label="Contact Name"
            placeholder="Enter contact name"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="designation"
            label="Designation"
            placeholder="Enter designation"
            disabled={isSubmitting}
          />
          <FormFieldSelect
            name="group"
            label="Group"
            placeholder="Select group"
            loadOptions={loadGroupOptions}
            defaultOptions={typeConfig.groupOptions}
            disabled={isSubmitting}
            isSearchable={false}
          />
          <FormFieldCategoryOption
            name="entityType"
            label="Entity Type"
            code={CategoryOptionCodeEnum.EntityType}
            placeholder="Select entity type"
            disabled={isSubmitting}
            isCreatable={true}
          />
        </div>
      </CardSection>

      <CardSection heading="PAN Details">
        <div className="grid gap-3 md:grid-cols-3">
          <FormFieldInput
            name="panName"
            label="PAN Name"
            placeholder="Name as on PAN Card"
            disabled={isSubmitting}
          />
          <FormFieldDatePicker
            name="panDob"
            label="PAN Date of Birth"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="panNo"
            label="PAN No."
            placeholder="Enter PAN number"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="TDS Configuration">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldCategoryOption
            name="marketingExecutive"
            label="Marketing Executive"
            code={CategoryOptionCodeEnum.MarketingExecutive}
            placeholder="Select Executive"
            disabled={isSubmitting}
            isCreatable={true}
          />
          <FormFieldCategoryOption
            name="businessNature"
            label="Business Nature"
            code={CategoryOptionCodeEnum.BusinessNature}
            placeholder="Select Business Nature"
            disabled={isSubmitting}
            isCreatable={true}
          />
          <div className="flex items-center pt-6">
            <FormFieldCheckbox
              name="isTdsDeducted"
              label="Is TDS Deducted?"
              disabled={isSubmitting}
            />
          </div>
          <FormFieldInput
            name="tds"
            label="TDS"
            placeholder="Enter TDS percentage/value"
            disabled={isSubmitting}
          />
          <FormFieldCategoryOption
            name="tdsGroup"
            label="TDS Group"
            code={CategoryOptionCodeEnum.TdsGroup}
            placeholder="Select TDS group"
            disabled={isSubmitting}
            isCreatable={true}
          />
        </div>
      </CardSection>

      <CardSection heading="Tax Settings & Status">
        <div className="grid gap-2 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          <FormFieldCheckbox
            name="active"
            label="Active"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="printAddress"
            label="Print Address"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="eefcClient"
            label="EEFC Client"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox name="sale" label="Sale" disabled={isSubmitting} />
          <FormFieldCheckbox
            name="purchase"
            label="Purchase"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="applyTax"
            label="Apply Tax"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="igstOnly"
            label="IGST Only"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="GST Details">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput
            name="gstNo"
            label="GST No"
            placeholder="Enter GSTIN number"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="sgstNo"
            label="SGST No."
            placeholder="Enter SGST number"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="igstNo"
            label="IGST No."
            placeholder="Enter IGST number"
            disabled={isSubmitting}
          />
          <FormFieldSelect
            name="gstStateId"
            label="GST State"
            placeholder="Select state"
            loadOptions={stateLoadOptions}
            disabled={isSubmitting}
          />
          <FormFieldSelect
            name="originBranchId"
            label="Origin Branch"
            placeholder="Select branch"
            loadOptions={branchLoadOptions}
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="Bank Account Details">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput
            name="accountHolderName"
            label="Account Holder Name"
            placeholder="Enter account holder name"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="bankName"
            label="Bank Name"
            placeholder="Enter bank name"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="accountNumber"
            label="Account Number"
            placeholder="Enter account number"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="ifscCode"
            label="IFSC Code"
            placeholder="Enter IFSC code"
            disabled={isSubmitting}
          />
          <div className="md:col-span-2">
            <FormFieldTextarea
              name="bankAddress"
              label="Bank Address"
              placeholder="Enter bank address..."
              disabled={isSubmitting}
            />
          </div>
          <div className="md:col-span-2">
            <FormFieldFileUploader
              name="cancelledChequeCopy"
              label="Cancelled Cheque Copy"
              accept="image/*,application/pdf"
              placeholder="Upload cancelled cheque copy"
              disabled={isSubmitting}
              helperText="Upload cheque copy (Max 5MB, JPG/PNG/PDF)"
            />
          </div>
        </div>
      </CardSection>

    </div>
  );
};

export const PartyProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Submit',
  onCancel,
  isSubmitting = false,
  disabled = false,
  profileType = DEFAULT_PARTY_PROFILE_TYPE,
}: PartyProfileFormProps) => {
  return (
    <Form
      id={FORM_ID}
      onSubmit={onSubmit}
      resolver={
        yupResolver(partyProfileSchema) as Resolver<ICreatePartyProfile>
      }
      defaultValues={defaultValues}
      className="space-y-6"
      footer={{
        submitLabel,
        onBackClick: () => {
          void onCancel?.();
        },
        onCancel,
      }}
    >
      <PartyProfileFormFields
        isSubmitting={isSubmitting}
        disabled={disabled}
        profileType={profileType}
      />
    </Form>
  );
};
