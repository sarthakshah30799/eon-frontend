import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CardSection } from '@/components/ui';
import {
  Form,
  FormFieldCategoryOption,
  FormFieldCheckbox,
  FormFieldStateDropdown,
  FormFieldInput,
  FormFieldSelect,
  FormFieldDatePicker,
  FormFieldTextarea,
} from '@/components/forms';
import { partyProfileSchema } from '../schema';
import type { ICreatePartyProfile } from '../types';
import { useAuth } from '@/lib/AuthContext';

import { branchProfileApi } from '@/api/branchProfile/branchProfile.api';
import { partyProfileApi } from '@/api/partyProfile';
import { useGetStateProfile } from '@/modules/stateProfile';
import {
  toPartyProfileDisplayLabel,
  toPartyProfileApiType,
} from '../constants';
import { PartyProfileTypeEnum, type PartyProfileType } from '../types/partyProfileTypes';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import type { IReviewPartyProfilePayload } from '../types';
import { PartyProfileReviewActionPanel } from '../components';
import { PartyProfileCommissionRulesFieldArray } from '../components/PartyProfileCommissionRulesFieldArray';
import { normalizeCodeValue } from '@/utils';

type PartyProfileFormValues = Omit<ICreatePartyProfile, 'type'>;

interface PartyProfileFormProps {
  defaultValues: PartyProfileFormValues;
  onSubmit: (values: PartyProfileFormValues) => void | Promise<void>;
  submitLabel?: string;
  onCancel?: () => void | Promise<void>;
  isSubmitting?: boolean;
  disabled?: boolean;
  profileType?: PartyProfileType;
  reviewMode?: boolean;
  branchDisabled?: boolean;
  onReviewSubmit?: (values: IReviewPartyProfilePayload) => void | Promise<void>;
  currentId?: string;
  showSubmit?: boolean;
}

const FORM_ID = 'party-profile-form';

const PartyProfileFormFields = ({
  isSubmitting: isSubmittingProp = false,
  disabled = false,
  profileType,
  reviewMode = false,
  branchDisabled = false,
  onReviewSubmit,
  currentId,
}: {
  isSubmitting?: boolean;
  disabled?: boolean;
  profileType?: PartyProfileType;
  reviewMode?: boolean;
  branchDisabled?: boolean;
  onReviewSubmit?: (values: IReviewPartyProfilePayload) => void | Promise<void>;
  currentId?: string;
}) => {
  const form = useFormContext<PartyProfileFormValues>();
  const { user } = useAuth();
  const canSelectBranch = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const isSubmitting = isSubmittingProp || disabled || reviewMode;
  const reviewActionsDisabled = isSubmittingProp;
  const effectiveProfileType = profileType;
  const panNo = useWatch({ name: 'panNo' });
  const gstStateId = useWatch({ name: 'gstStateId' });
  const gstNo = useWatch({ name: 'gstNo' });
  const isTdsDeducted = useWatch({ name: 'isTdsDeducted' });
  const { data: selectedGstState } = useGetStateProfile(String(gstStateId || ''));
  const lastAutoFilledGstNoRef = useRef('');
  const adultDobMaxDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
  }, []);

  const profileTypeLabel = toPartyProfileDisplayLabel(effectiveProfileType);
  const showTdsFields =
    toPartyProfileApiType(effectiveProfileType) === 'AGENT' ||
    toPartyProfileApiType(effectiveProfileType) === 'MISC_PROFILE';
  const showCorporateClientTaxFields =
    toPartyProfileApiType(effectiveProfileType) === 'CORPORATE_CLIENT';
  const showRfFields = toPartyProfileApiType(effectiveProfileType) === 'RF';
  const showCommissionRules =
    toPartyProfileApiType(effectiveProfileType) === 'AGENT';
  const shouldHideCreditLimitFields = [
    'MISC_PROFILE',
    'AGENT',
    'CARD_ISSUER_PROFILE',
    'FRANCHISE',
  ].includes(toPartyProfileApiType(effectiveProfileType));
  const showTdsGroup = Boolean(isTdsDeducted);

  useEffect(() => {
    if (!showTdsGroup) {
      form.setValue('tdsGroup', '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [form, showTdsGroup]);

  useEffect(() => {
    const normalizedPan = String(panNo || '').trim().toUpperCase();
    const currentGstNo = String(gstNo || '').trim().toUpperCase();
    const gstStateCode = String(selectedGstState?.gstStateCode || '').trim().toUpperCase();
    const nextAutoFilledGstNo = gstStateCode && normalizedPan ? `${gstStateCode}${normalizedPan}` : '';

    if (!nextAutoFilledGstNo) {
      if (!currentGstNo || currentGstNo === lastAutoFilledGstNoRef.current) {
        form.setValue('gstNo', '', {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: false,
        });
      }

      lastAutoFilledGstNoRef.current = '';
      return;
    }

    if (!currentGstNo || currentGstNo === lastAutoFilledGstNoRef.current) {
      form.setValue('gstNo', nextAutoFilledGstNo, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      lastAutoFilledGstNoRef.current = nextAutoFilledGstNo;
    }
  }, [form, gstNo, panNo, selectedGstState?.gstStateCode]);

  const branchLoadOptions = useCallback(async (inputValue: string) => {
    const branches = await branchProfileApi.getBranchProfiles({
      activeOnly: true,
    });
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

  const validatePartyCode = useCallback(
    async (value: string) => {
      const normalizedCode = normalizeCodeValue(value);
      if (!normalizedCode) {
        return false;
      }

      const partyProfiles = await partyProfileApi.getPartyProfiles(
        {
          page: 1,
          limit: 20,
          code: normalizedCode,
          type: effectiveProfileType,
        },
        effectiveProfileType
      );

      return (partyProfiles.data ?? []).some(
        (party: { code: string; id: string }) =>
          normalizeCodeValue(party.code) === normalizedCode &&
          party.id !== currentId
      );
    },
    [currentId, effectiveProfileType]
  );

  return (
    <div className="space-y-4 pb-24">
      <CardSection heading="Basic Info">
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
            placeholder="Enter client code (5-20 chars)"
            disabled={isSubmitting || Boolean(currentId)}
            maxLength={20}
            asyncValidation={{
              enabled: !isSubmitting && !currentId,
              check: validatePartyCode,
              message: 'Client code already exists',
              normalize: normalizeCodeValue,
            }}
          />
          {toPartyProfileApiType(profileType) === PartyProfileTypeEnum.FFMC && (
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
          {showRfFields && (
            <FormFieldInput
              name="divisionFactor"
              label="Division Factor"
              placeholder="Enter division factor"
              type="number"
              disabled={isSubmitting}
            />
          )}
          <div className="lg:col-span-2">
            <FormFieldInput
              name="name"
              label="Client Name"
              placeholder={`Enter ${profileTypeLabel.toLowerCase()} name`}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center pt-6 lg:col-span-2">
            <FormFieldCheckbox
              name="isIndividual"
              label="Individual Category Customer (not a party profile)"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </CardSection>

      <CardSection heading="Credit Policy">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2">
          {!shouldHideCreditLimitFields && (
            <FormFieldInput
              name="temporaryCreditLimit"
              label="Temporary Credit Limit"
              type="number"
              disabled={isSubmitting}
            />
          )}
          <FormFieldInput
            name="temporaryCreditDays"
            label="Temporary Credit Days"
            type="number"
            disabled={isSubmitting}
          />
          {!shouldHideCreditLimitFields && (
            <FormFieldInput
              name="permanentCreditLimit"
              label="Permanent Credit Limit"
              type="number"
              disabled={isSubmitting}
            />
          )}
          <FormFieldInput
            name="permanentCreditDays"
            label="Permanent Credit Days"
            type="number"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="chqTrxnLimit"
            label="Cheque Transaction Limit"
            type="number"
            disabled={isSubmitting}
          />
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
          <FormFieldStateDropdown
            name="stateId"
            label="State"
            placeholder="Select state"
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
          <FormFieldCategoryOption
            name="group"
            label="Group"
            placeholder="Select group"
            code={CategoryOptionCodeEnum.Group}
            disabled={isSubmitting}
            isCreatable={false}
          />
          <FormFieldCategoryOption
            name="entityType"
            label="Entity Type"
            code={CategoryOptionCodeEnum.EntityType}
            placeholder="Select entity type"
            disabled={isSubmitting}
            isCreatable={false}
          />
          <FormFieldCategoryOption
            name="businessNature"
            label="Business Nature"
            code={CategoryOptionCodeEnum.BusinessNature}
            placeholder="Select Business Nature"
            disabled={isSubmitting}
            isCreatable={true}
          />
        </div>
      </CardSection>

      <CardSection heading="PAN Details">
        <div className="grid gap-3 md:grid-cols-3">
          <FormFieldInput
            name="panNo"
            label="PAN Number"
            placeholder="Enter PAN number"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="panName"
            label="Name on PAN Card"
            placeholder="Name as on PAN Card"
            disabled={isSubmitting}
          />
          <FormFieldDatePicker
            name="panDob"
            label="DOB on PAN Card"
            maxDate={adultDobMaxDate}
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
          {showTdsFields && (
            <>
              <div className="flex items-center pt-6">
                <FormFieldCheckbox
                  name="isTdsDeducted"
                  label="TDS Deducted?"
                  disabled={isSubmitting}
                />
              </div>
              {showTdsGroup && (
                <FormFieldCategoryOption
                  name="tdsGroup"
                  label="TDS Group"
                  code={CategoryOptionCodeEnum.TdsGroup}
                  placeholder="Select TDS group"
                  disabled={isSubmitting}
                  isCreatable={true}
                />
              )}
            </>
          )}
        </div>
      </CardSection>

      <CardSection heading="Tax Settings & Status">
        <div className="grid gap-2 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
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
          {showCorporateClientTaxFields && (
            <>
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
            </>
          )}
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
          <FormFieldStateDropdown
            name="gstStateId"
            label="GST State"
            placeholder="Select state"
            disabled={isSubmitting}
          />
          <FormFieldSelect
            name="branchId"
            label="Current Branch"
            placeholder="Select current branch"
            loadOptions={branchLoadOptions}
            disabled={isSubmitting || (branchDisabled && !canSelectBranch)}
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
          <FormFieldInput
            name="bankBranchName"
            label="Bank Branch Name"
            placeholder="Enter bank branch name"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      {showCommissionRules ? (
        <PartyProfileCommissionRulesFieldArray
          name="commissionRules"
          disabled={isSubmitting}
          partyProfileId={currentId}
          canModify={!disabled && !reviewMode}
          isBusy={isSubmittingProp}
        />
      ) : null}

      <PartyProfileReviewActionPanel
        reviewMode={reviewMode}
        isSubmitting={reviewActionsDisabled}
        onReviewSubmit={onReviewSubmit}
      />
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
  profileType,
  reviewMode = false,
  branchDisabled = false,
  onReviewSubmit,
  currentId,
  showSubmit = true,
}: PartyProfileFormProps) => {
  return (
    <Form
      id={FORM_ID}
      onSubmit={onSubmit}
      resolver={
        yupResolver(
          partyProfileSchema
        ) as unknown as Resolver<PartyProfileFormValues>
      }
      defaultValues={defaultValues}
      className="space-y-6"
        footer={{
          submitLabel,
          onBackClick: () => {
            void onCancel?.();
          },
          onCancel,
          showSubmit,
        }}
      >
      <PartyProfileFormFields
        isSubmitting={isSubmitting}
        disabled={disabled}
        profileType={profileType}
        reviewMode={reviewMode}
        branchDisabled={branchDisabled}
        onReviewSubmit={onReviewSubmit}
        currentId={currentId}
      />
    </Form>
  );
};
