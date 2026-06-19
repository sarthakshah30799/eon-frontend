import { useCallback } from 'react';
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
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { ffmcClientSchema } from '../schema/ffmcClientSchema';
import type { ICreateFfmcClient } from '../types/ffmcClientTypes';
import { branchProfileApi } from '@/api/branchProfile/branchProfile.api';
import { stateProfileApi } from '@/api/stateProfile/stateProfile.api';

interface FfmcClientFormProps {
  defaultValues: ICreateFfmcClient;
  onSubmit: (values: ICreateFfmcClient) => void | Promise<void>;
  submitLabel?: string;
  onCancel?: () => void | Promise<void>;
  isSubmitting?: boolean;
  disabled?: boolean;
}

const FORM_ID = 'ffmc-client-profile-form';

const FfmcClientFormFields = ({
  isSubmitting: isSubmittingProp = false,
  disabled = false,
}: {
  isSubmitting?: boolean;
  disabled?: boolean;
}) => {
  const isDisabled = isSubmittingProp || disabled;

  const branchLoadOptions = useCallback(async (inputValue: string) => {
    const branches = await branchProfileApi.getBranchProfiles();
    const options = branches
      .filter(
        branch =>
          !inputValue ||
          `${branch.code} - ${branch.name}`.toLowerCase().includes(inputValue.toLowerCase())
      )
      .map(branch => ({ value: branch.id, label: `${branch.code} - ${branch.name}` }));
    return { options };
  }, []);

  const stateLoadOptions = useCallback(async (inputValue: string) => {
    try {
      const res = await stateProfileApi.getStateProfiles({ limit: 100 });
      const options = (res?.data ?? [])
        .filter(
          state =>
            !inputValue ||
            `${state.code} - ${state.name}`.toLowerCase().includes(inputValue.toLowerCase())
        )
        .map(state => ({
          value: state.id,
          label: `${state.code} - ${state.name}`,
        }));
      return { options };
    } catch (err) {
      console.error('[FfmcClientForm] stateLoadOptions error:', err);
      return { options: [] };
    }
  }, []);

  return (
    <div className="space-y-4 pb-24">
      {/* ── FFMC Registration Details ─────────────────────────────────── */}
      <CardSection heading="FFMC Registration Details">
        <div className="grid gap-3 md:grid-cols-3">
          <FormFieldInput
            name="ffmcRegNo"
            label="FFMC Registration No."
            placeholder="Enter FFMC registration number"
            disabled={isDisabled}
          />
          <FormFieldDatePicker
            name="ffmcRegDate"
            label="FFMC Registration Date"
            disabled={isDisabled}
          />
        </div>
      </CardSection>

      {/* ── Basic Info & Credit Policy ────────────────────────────────── */}
      <CardSection heading="Basic Info & Credit Policy">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
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
            disabled={isDisabled}
          />
          <FormFieldInput name="creditLimit" label="Credit Limit" type="number" disabled={isDisabled} />
          <FormFieldInput name="creditDays" label="Credit Days" type="number" disabled={isDisabled} />
          <FormFieldInput name="temporaryCreditLimit" label="Temporary Credit Limit" type="number" disabled={isDisabled} />
          <FormFieldInput name="temporaryCreditDays" label="Temporary Credit Days" type="number" disabled={isDisabled} />
          <FormFieldInput name="permanentCreditLimit" label="Permanent Credit Limit" type="number" disabled={isDisabled} />
          <FormFieldInput name="permanentCreditDays" label="Permanent Credit Days" type="number" disabled={isDisabled} />
        </div>
      </CardSection>

      {/* ── Client Identity ───────────────────────────────────────────── */}
      <CardSection heading="Client Identity">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FormFieldInput
              name="name"
              label="Client Name"
              placeholder="Enter FFMC client name"
              disabled={isDisabled}
            />
          </div>
          <div className="flex items-center pt-6">
            <FormFieldCheckbox
              name="isIndividual"
              label="Individual Category Customer"
              disabled={isDisabled}
            />
          </div>
        </div>
      </CardSection>

      {/* ── Address Details ───────────────────────────────────────────── */}
      <CardSection heading="Address Details">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldInput name="address1" label="Address Line 1" placeholder="Room/Suite, Building" disabled={isDisabled} />
          <FormFieldInput name="address2" label="Address Line 2" placeholder="Street name, Sector" disabled={isDisabled} />
          <FormFieldInput name="address3" label="Address Line 3" placeholder="Landmark" disabled={isDisabled} />
          <FormFieldInput name="city" label="City" placeholder="Enter city" disabled={isDisabled} />
          <FormFieldInput name="pinCode" label="Pin Code" placeholder="Enter zip/pin code" disabled={isDisabled} />
          <FormFieldCategoryOption
            name="location"
            label="Location"
            code={CategoryOptionCodeEnum.LocationType}
            placeholder="Select location"
            disabled={isDisabled}
            isCreatable={true}
          />
        </div>
      </CardSection>

      {/* ── KYC & Default Controls ────────────────────────────────────── */}
      <CardSection heading="KYC & Default Controls">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldInput name="kycApprovalNumber" label="KYC Approval Number" placeholder="Enter KYC Approval No." disabled={isDisabled} />
          <FormFieldCategoryOption name="kycRiskCategory" label="KYC Risk Category" code={CategoryOptionCodeEnum.KycRiskCategory} placeholder="Select Risk Category" disabled={isDisabled} isCreatable={true} />
          <FormFieldInput name="chqTrxnLimit" label="Chq Trxn Limit" type="number" disabled={isDisabled} />
          <FormFieldInput name="defaultHandlingCharges" label="Default Handling Charges" type="number" disabled={isDisabled} />
          <FormFieldCategoryOption name="defaultAgent" label="Default Agent" code={CategoryOptionCodeEnum.DefaultAgent} placeholder="Select default agent" disabled={isDisabled} isCreatable={true} />
          <FormFieldInput name="phoneNo" label="Phone No." placeholder="Enter phone number" disabled={isDisabled} />
          <FormFieldDatePicker name="blockDateFrom" label="Block Date From" disabled={isDisabled} />
          <FormFieldDatePicker name="establishmentDate" label="Establishment Date" disabled={isDisabled} />
        </div>
        <div className="grid md:grid-cols-2 mt-2 gap-2">
          <FormFieldInput name="email" label="Email" placeholder="Enter email address" type="email" disabled={isDisabled} />
          <FormFieldInput name="webSite" label="Web Site" placeholder="Enter website URL" disabled={isDisabled} />
        </div>
        <div className="md:col-span-4 mt-2">
          <FormFieldTextarea name="remarks" label="Remarks" placeholder="Enter any additional remarks..." disabled={isDisabled} />
        </div>
      </CardSection>

      {/* ── Contact Person & Grouping ─────────────────────────────────── */}
      <CardSection heading="Contact Person & Grouping">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput name="contactName" label="Contact Name" placeholder="Enter contact name" disabled={isDisabled} />
          <FormFieldInput name="designation" label="Designation" placeholder="Enter designation" disabled={isDisabled} />
          {/* Group uses FFMC-specific category option code */}
          <FormFieldCategoryOption
            name="group"
            label="Group"
            code={CategoryOptionCodeEnum.FfmcGroup}
            placeholder="Select FFMC group"
            disabled={isDisabled}
            isCreatable={true}
          />
          <FormFieldCategoryOption name="entityType" label="Entity Type" code={CategoryOptionCodeEnum.EntityType} placeholder="Select entity type" disabled={isDisabled} isCreatable={true} />
        </div>
      </CardSection>

      {/* ── PAN Details ───────────────────────────────────────────────── */}
      <CardSection heading="PAN Details">
        <div className="grid gap-3 md:grid-cols-3">
          <FormFieldInput name="panName" label="PAN Name" placeholder="Name as on PAN Card" disabled={isDisabled} />
          <FormFieldDatePicker name="panDob" label="PAN DOB" disabled={isDisabled} />
          <FormFieldInput name="panNo" label="PAN No." placeholder="Enter PAN number" disabled={isDisabled} />
        </div>
      </CardSection>

      {/* ── TDS Configuration ─────────────────────────────────────────── */}
      <CardSection heading="TDS Configuration">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldCategoryOption name="marketingExecutive" label="Marketing Executive" code={CategoryOptionCodeEnum.MarketingExecutive} placeholder="Select Executive" disabled={isDisabled} isCreatable={true} />
          <FormFieldCategoryOption name="businessNature" label="Business Nature" code={CategoryOptionCodeEnum.BusinessNature} placeholder="Select Business Nature" disabled={isDisabled} isCreatable={true} />
          <div className="flex items-center pt-6">
            <FormFieldCheckbox name="isTdsDeducted" label="Is TDS Deducted?" disabled={isDisabled} />
          </div>
          <FormFieldInput name="tds" label="TDS" placeholder="Enter TDS percentage/value" disabled={isDisabled} />
          <FormFieldCategoryOption name="tdsGroup" label="TDS Group" code={CategoryOptionCodeEnum.TdsGroup} placeholder="Select TDS group" disabled={isDisabled} isCreatable={true} />
        </div>
      </CardSection>

      {/* ── Tax Settings & Status ─────────────────────────────────────── */}
      <CardSection heading="Tax Settings & Status">
        <div className="grid gap-2 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          <FormFieldCheckbox name="active" label="Active" disabled={isDisabled} />
          <FormFieldCheckbox name="printAddress" label="Print Address" disabled={isDisabled} />
          <FormFieldCheckbox name="eefcClient" label="EEFC Client" disabled={isDisabled} />
          <FormFieldCheckbox name="sale" label="Sale" disabled={isDisabled} />
          <FormFieldCheckbox name="purchase" label="Purchase" disabled={isDisabled} />
          <FormFieldCheckbox name="applyTax" label="Apply Tax" disabled={isDisabled} />
          <FormFieldCheckbox name="igstOnly" label="IGST Only" disabled={isDisabled} />
        </div>
      </CardSection>

      {/* ── GST Details ───────────────────────────────────────────────── */}
      <CardSection heading="GST Details">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput name="gstNo" label="GST No" placeholder="Enter GSTIN number" disabled={isDisabled} />
          <FormFieldInput name="sgstNo" label="SGST No." placeholder="Enter SGST number" disabled={isDisabled} />
          <FormFieldInput name="igstNo" label="IGST No." placeholder="Enter IGST number" disabled={isDisabled} />
          <FormFieldSelect name="gstStateId" label="GST State" placeholder="Select state" loadOptions={stateLoadOptions} disabled={isDisabled} />
          <FormFieldSelect name="originBranchId" label="Origin Branch" placeholder="Select branch" loadOptions={branchLoadOptions} disabled={isDisabled} />
        </div>
      </CardSection>

      {/* ── Bank Account Details ──────────────────────────────────────── */}
      <CardSection heading="Bank Account Details">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput name="accountHolderName" label="Account Holder Name" placeholder="Enter account holder name" disabled={isDisabled} />
          <FormFieldInput name="bankName" label="Bank Name" placeholder="Enter bank name" disabled={isDisabled} />
          <FormFieldInput name="accountNumber" label="Account Number" placeholder="Enter account number" disabled={isDisabled} />
          <FormFieldInput name="ifscCode" label="IFSC Code" placeholder="Enter IFSC code" disabled={isDisabled} />
          <div className="md:col-span-2">
            <FormFieldTextarea name="bankAddress" label="Bank Address" placeholder="Enter bank address..." disabled={isDisabled} />
          </div>
          <div className="md:col-span-2">
            <FormFieldFileUploader
              name="cancelledChequeCopy"
              label="Cancelled Cheque Copy"
              accept="image/*,application/pdf"
              placeholder="Upload cancelled cheque copy"
              disabled={isDisabled}
              helperText="Upload cheque copy (Max 5MB, JPG/PNG/PDF)"
            />
          </div>
        </div>
      </CardSection>
    </div>
  );
};

export const FfmcClientForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Submit',
  onCancel,
  isSubmitting = false,
  disabled = false,
}: FfmcClientFormProps) => {
  return (
    <Form
      id={FORM_ID}
      onSubmit={onSubmit}
      resolver={yupResolver(ffmcClientSchema) as Resolver<ICreateFfmcClient>}
      defaultValues={defaultValues}
      className="space-y-6"
      footer={{
        submitLabel,
        onBackClick: () => { void onCancel?.(); },
        onCancel,
      }}
    >
      <FfmcClientFormFields isSubmitting={isSubmitting} disabled={disabled} />
    </Form>
  );
};

export default FfmcClientForm;
