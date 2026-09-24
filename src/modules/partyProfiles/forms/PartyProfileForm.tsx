import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch, useFormState } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CardSection, Button, type AsyncSelectOption } from '@/components/ui';
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

import { partyProfileApi } from '@/api/partyProfile';
import { useLoadBranchOptions } from '@/modules/branchProfile/hooks';
import { useGetStateProfile } from '@/modules/stateProfile';
import {
  CARD_ISSUER_FORM_TEXT,
  EMPLOYEE_PROFILE_FORM_TEXT,
  PARTY_PROFILE_BRANCH_UPDATE_TEXT,
  PARTY_PROFILE_CREDIT_POLICY_TEXT,
  PARTY_PROFILE_TAX_SETTINGS_TEXT,
  toPartyProfileDisplayLabel,
  toPartyProfileApiType,
} from '../constants';
import {
  PartyProfileTypeEnum,
  type PartyProfileType,
} from '../types/partyProfileTypes';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import type { IReviewPartyProfilePayload } from '../types';
import {
  FormFieldPartyProfileSelect,
  PartyProfileReviewActionPanel,
} from '../components';
import { PartyProfileCommissionRulesFieldArray } from '../components/PartyProfileCommissionRulesFieldArray';
import { normalizeCodeValue } from '@/utils';
import { pickDirtyPartyProfileCreditPolicyValues } from '../utils/partyProfileCreditPolicyUtils';
import type { IUpgradePartyProfileCreditPolicy } from '../types';

type PartyProfileFormValues = Omit<ICreatePartyProfile, 'type'>;

const normalizeBranchIds = (ids?: string[] | null) =>
  [...new Set((ids ?? []).map(id => String(id || '').trim()).filter(Boolean))].sort();

const haveBranchIdsChanged = (
  current?: string[] | null,
  baseline?: string[] | null
) => {
  const next = normalizeBranchIds(current);
  const prev = normalizeBranchIds(baseline);
  return (
    next.length !== prev.length || next.some((id, index) => id !== prev[index])
  );
};

export type PartyProfileFormSubmitMeta = {
  creditUpgradeMode: boolean;
  creditPolicyPayload: IUpgradePartyProfileCreditPolicy;
  branchUpdateMode: boolean;
  branchIds?: string[];
};

interface PartyProfileFormProps {
  defaultValues: PartyProfileFormValues;
  onSubmit: (
    values: PartyProfileFormValues,
    meta?: PartyProfileFormSubmitMeta
  ) => void | Promise<void>;
  submitLabel?: string;
  onCancel?: () => void | Promise<void>;
  isSubmitting?: boolean;
  disabled?: boolean;
  profileType?: PartyProfileType;
  reviewMode?: boolean;
  onReviewSubmit?: (values: IReviewPartyProfilePayload) => void | Promise<void>;
  currentId?: string;
  showSubmit?: boolean;
  allowBranchSelection?: boolean;
  allowCreditPolicyUpgrade?: boolean;
  allowBranchUpdate?: boolean;
  branchDefaultOptions?: AsyncSelectOption[];
}

const FORM_ID = 'party-profile-form';

const PartyProfileFormFields = ({
  isSubmitting: isSubmittingProp = false,
  disabled = false,
  profileType,
  reviewMode = false,
  onReviewSubmit,
  currentId,
  allowBranchSelection = false,
  isCreditUpgradeMode = false,
  onCreditUpgradeModeChange,
  isBranchUpdateMode = false,
  onBranchUpdateModeChange,
  onSubmitDisabledChange,
  onDirtyFieldsSnapshotChange,
  allowCreditPolicyUpgrade = false,
  allowBranchUpdate = false,
  branchDefaultOptions,
}: {
  isSubmitting?: boolean;
  disabled?: boolean;
  profileType?: PartyProfileType;
  reviewMode?: boolean;
  onReviewSubmit?: (values: IReviewPartyProfilePayload) => void | Promise<void>;
  currentId?: string;
  allowBranchSelection?: boolean;
  isCreditUpgradeMode?: boolean;
  onCreditUpgradeModeChange?: (enabled: boolean) => void;
  isBranchUpdateMode?: boolean;
  onBranchUpdateModeChange?: (enabled: boolean) => void;
  onSubmitDisabledChange?: (disabled: boolean) => void;
  onDirtyFieldsSnapshotChange?: (
    dirtyFields: Partial<Record<keyof PartyProfileFormValues, boolean | object>>
  ) => void;
  allowCreditPolicyUpgrade?: boolean;
  allowBranchUpdate?: boolean;
  branchDefaultOptions?: AsyncSelectOption[];
}) => {
  const form = useFormContext<PartyProfileFormValues>();
  const { dirtyFields } = useFormState({ control: form.control });
  const reviewActionsDisabled = isSubmittingProp;
  const effectiveProfileType = profileType;
  const panNo = useWatch({ name: 'panNo' });
  const gstStateId = useWatch({ name: 'gstStateId' });
  const gstNo = useWatch({ name: 'gstNo' });
  const isTdsDeducted = useWatch({ name: 'isTdsDeducted' });
  const basicSalary = useWatch({ name: 'basicSalary' });
  const dareness = useWatch({ name: 'dareness' });
  const houseRent = useWatch({ name: 'houseRent' });
  const conveyance = useWatch({ name: 'conveyance' });
  const specialAllowance = useWatch({ name: 'specialAllowance' });
  const otherAllowance = useWatch({ name: 'otherAllowance' });
  const pf = useWatch({ name: 'pf' });
  const ppf = useWatch({ name: 'ppf' });
  const pTax = useWatch({ name: 'pTax' });
  const esic = useWatch({ name: 'esic' });
  const incomeTax = useWatch({ name: 'incomeTax' });
  const otherDeduction = useWatch({ name: 'otherDeduction' });
  const { data: selectedGstState } = useGetStateProfile(
    String(gstStateId || '')
  );
  const lastAutoFilledGstNoRef = useRef('');
  const adultDobMaxDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
  }, []);

  const profileTypeLabel = toPartyProfileDisplayLabel(effectiveProfileType);
  const profileApiType = toPartyProfileApiType(effectiveProfileType);
  const showTdsFields =
    profileApiType === 'AGENT' ||
    profileApiType === 'MISC_PROFILE' ||
    profileApiType === 'EMPLOYEE_PROFILE';
  const showCorporateClientTaxFields =
    profileApiType === 'CORPORATE_CLIENT';
  const showRfFields = profileApiType === 'RF';
  const showCommissionRules = profileApiType === 'AGENT';
  const shouldHideCreditPolicySection =
    profileApiType === 'MISC_PROFILE' ||
    profileApiType === 'EMPLOYEE_PROFILE';
  const shouldHideCreditLimitFields = [
    'MISC_PROFILE',
    'EMPLOYEE_PROFILE',
    'AGENT',
    'CARD_ISSUER_PROFILE',
    'FRANCHISE',
  ].includes(profileApiType);
  const showCardIssuerNumberRules =
    profileApiType === 'CARD_ISSUER_PROFILE';
  const showEmployeePayrollSections =
    profileApiType === 'EMPLOYEE_PROFILE';
  const showTdsGroup = Boolean(isTdsDeducted);
  const isEditMode = Boolean(currentId);
  const isCreditPolicyLocked =
    isEditMode && allowCreditPolicyUpgrade && !isCreditUpgradeMode;
  const isBranchUpdateLocked =
    isEditMode && allowBranchUpdate && !isBranchUpdateMode;
  // Credit fields unlock only after Upgrade Limit; ignore the form-wide
  // disabled flag so upgrade still works when the rest of the profile is locked.
  const areCreditPolicyFieldsDisabled =
    isSubmittingProp ||
    (isEditMode
      ? !allowCreditPolicyUpgrade || !isCreditUpgradeMode
      : disabled);
  const areBranchFieldsDisabled =
    isSubmittingProp ||
    (isEditMode
      ? !allowBranchUpdate || !isBranchUpdateMode
      : disabled || !allowBranchSelection);
  // Party profiles are not editable after create — keep every non-credit /
  // non-branch field locked on edit (including during upgrade modes).
  const isSubmitting = isSubmittingProp || disabled || isEditMode;
  const canShowUpgradeLimitButton =
    isEditMode && allowCreditPolicyUpgrade && !isCreditUpgradeMode;
  const canShowUpdateBranchesButton =
    isEditMode && allowBranchUpdate && !isBranchUpdateMode;

  useEffect(() => {
    onDirtyFieldsSnapshotChange?.(dirtyFields);
  }, [dirtyFields, onDirtyFieldsSnapshotChange]);

  useEffect(() => {
    if (!onSubmitDisabledChange) {
      return;
    }

    const canUseSpecialEdit =
      allowCreditPolicyUpgrade || allowBranchUpdate;
    onSubmitDisabledChange(
      Boolean(
        isEditMode &&
          canUseSpecialEdit &&
          !isCreditUpgradeMode &&
          !isBranchUpdateMode
      )
    );
  }, [
    allowBranchUpdate,
    allowCreditPolicyUpgrade,
    isBranchUpdateMode,
    isCreditUpgradeMode,
    isEditMode,
    onSubmitDisabledChange,
  ]);

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
    if (!showEmployeePayrollSections) {
      return;
    }

    const toAmount = (value: unknown) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const nextAllowanceTotal =
      toAmount(dareness) +
      toAmount(houseRent) +
      toAmount(conveyance) +
      toAmount(specialAllowance) +
      toAmount(otherAllowance);
    const nextDeductionTotal =
      toAmount(pf) +
      toAmount(ppf) +
      toAmount(pTax) +
      toAmount(esic) +
      toAmount(incomeTax) +
      toAmount(otherDeduction);
    const nextNetSalary =
      toAmount(basicSalary) + nextAllowanceTotal - nextDeductionTotal;

    form.setValue('allowanceTotal', nextAllowanceTotal, {
      shouldDirty: false,
      shouldValidate: false,
    });
    form.setValue('deductionTotal', nextDeductionTotal, {
      shouldDirty: false,
      shouldValidate: false,
    });
    form.setValue('netSalary', nextNetSalary, {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [
    basicSalary,
    conveyance,
    dareness,
    esic,
    form,
    houseRent,
    incomeTax,
    otherAllowance,
    otherDeduction,
    pf,
    ppf,
    pTax,
    showEmployeePayrollSections,
    specialAllowance,
  ]);

  useEffect(() => {
    const normalizedPan = String(panNo || '')
      .trim()
      .toUpperCase();
    const currentGstNo = String(gstNo || '')
      .trim()
      .toUpperCase();
    const gstStateCode = String(selectedGstState?.gstStateCode || '')
      .trim()
      .toUpperCase();
    const nextAutoFilledGstNo =
      gstStateCode && normalizedPan ? `${gstStateCode}${normalizedPan}` : '';

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

  const branchLoadOptions = useLoadBranchOptions({ activeOnly: true });

  const validatePartyCode = useCallback(
    async (value: string) => {
      const normalizedCode = normalizeCodeValue(value);
      if (!normalizedCode) {
        return false;
      }

      const partyProfiles = await partyProfileApi.getPartyProfiles(
        {
          limit: 20,
          offset: 0,
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

      {showCardIssuerNumberRules && (
        <CardSection heading={CARD_ISSUER_FORM_TEXT.sectionHeading}>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <FormFieldInput
              name="cardNumberLength"
              label={CARD_ISSUER_FORM_TEXT.lengthLabel}
              type="number"
              placeholder={CARD_ISSUER_FORM_TEXT.lengthPlaceholder}
              disabled={isSubmitting}
            />
            <div className="flex items-center pt-6">
              <FormFieldCheckbox
                name="allowCardNumberMasking"
                label={CARD_ISSUER_FORM_TEXT.maskingLabel}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </CardSection>
      )}

      {showEmployeePayrollSections && (
        <>
          <CardSection heading={EMPLOYEE_PROFILE_FORM_TEXT.detailsHeading}>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <FormFieldDatePicker
                name="dateOfJoining"
                label={EMPLOYEE_PROFILE_FORM_TEXT.dateOfJoining}
                disabled={isSubmitting}
              />
              <FormFieldDatePicker
                name="dateOfExit"
                label={EMPLOYEE_PROFILE_FORM_TEXT.dateOfExit}
                disabled={isSubmitting}
              />
              <FormFieldInput
                name="basicSalary"
                label={EMPLOYEE_PROFILE_FORM_TEXT.basicSalary}
                type="number"
                step="0.01"
                disabled={isSubmitting}
              />
              <FormFieldInput
                name="netSalary"
                label={EMPLOYEE_PROFILE_FORM_TEXT.netSalary}
                type="number"
                step="0.01"
                disabled={true}
              />
            </div>
          </CardSection>

          <CardSection heading={EMPLOYEE_PROFILE_FORM_TEXT.allowanceHeading}>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <FormFieldInput
                name="dareness"
                label={EMPLOYEE_PROFILE_FORM_TEXT.dareness}
                type="number"
                step="0.01"
                disabled={isSubmitting}
              />
              <FormFieldInput
                name="houseRent"
                label={EMPLOYEE_PROFILE_FORM_TEXT.houseRent}
                type="number"
                step="0.01"
                disabled={isSubmitting}
              />
              <FormFieldInput
                name="conveyance"
                label={EMPLOYEE_PROFILE_FORM_TEXT.conveyance}
                type="number"
                step="0.01"
                disabled={isSubmitting}
              />
              <FormFieldInput
                name="specialAllowance"
                label={EMPLOYEE_PROFILE_FORM_TEXT.special}
                type="number"
                step="0.01"
                disabled={isSubmitting}
              />
              <FormFieldInput
                name="otherAllowance"
                label={EMPLOYEE_PROFILE_FORM_TEXT.other}
                type="number"
                step="0.01"
                disabled={isSubmitting}
              />
              <FormFieldInput
                name="allowanceTotal"
                label={EMPLOYEE_PROFILE_FORM_TEXT.allowanceTotal}
                type="number"
                step="0.01"
                disabled={true}
              />
            </div>
          </CardSection>

          <CardSection heading={EMPLOYEE_PROFILE_FORM_TEXT.deductionHeading}>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <FormFieldInput
                name="pf"
                label={EMPLOYEE_PROFILE_FORM_TEXT.pf}
                type="number"
                step="0.01"
                disabled={isSubmitting}
              />
              <FormFieldInput
                name="ppf"
                label={EMPLOYEE_PROFILE_FORM_TEXT.ppf}
                type="number"
                step="0.01"
                disabled={isSubmitting}
              />
              <FormFieldInput
                name="pTax"
                label={EMPLOYEE_PROFILE_FORM_TEXT.pTax}
                type="number"
                step="0.01"
                disabled={isSubmitting}
              />
              <FormFieldInput
                name="esic"
                label={EMPLOYEE_PROFILE_FORM_TEXT.esic}
                type="number"
                step="0.01"
                disabled={isSubmitting}
              />
              <FormFieldInput
                name="incomeTax"
                label={EMPLOYEE_PROFILE_FORM_TEXT.incomeTax}
                type="number"
                step="0.01"
                disabled={isSubmitting}
              />
              <FormFieldInput
                name="otherDeduction"
                label={EMPLOYEE_PROFILE_FORM_TEXT.other}
                type="number"
                step="0.01"
                disabled={isSubmitting}
              />
              <FormFieldInput
                name="deductionTotal"
                label={EMPLOYEE_PROFILE_FORM_TEXT.deductionTotal}
                type="number"
                step="0.01"
                disabled={true}
              />
            </div>
          </CardSection>
        </>
      )}

      {!shouldHideCreditPolicySection && (
        <CardSection
          heading={PARTY_PROFILE_CREDIT_POLICY_TEXT.sectionHeading}
          headerActions={
            canShowUpgradeLimitButton ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onCreditUpgradeModeChange?.(true)}
              >
                {PARTY_PROFILE_CREDIT_POLICY_TEXT.upgradeLimit}
              </Button>
            ) : null
          }
        >
          {isCreditPolicyLocked ? (
            <p className="mb-3 text-sm text-text-secondary">
              {PARTY_PROFILE_CREDIT_POLICY_TEXT.upgradeLimitHint}
            </p>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {!shouldHideCreditLimitFields && (
              <FormFieldInput
                name="temporaryCreditLimit"
                label="Temporary Credit Limit"
                type="number"
                disabled={areCreditPolicyFieldsDisabled}
              />
            )}
            <FormFieldInput
              name="temporaryCreditDays"
              label="Temporary Credit Days"
              type="number"
              disabled={areCreditPolicyFieldsDisabled}
            />
            {!shouldHideCreditLimitFields && (
              <FormFieldInput
                name="permanentCreditLimit"
                label="Permanent Credit Limit"
                type="number"
                disabled={areCreditPolicyFieldsDisabled}
              />
            )}
            <FormFieldInput
              name="permanentCreditDays"
              label="Permanent Credit Days"
              type="number"
              disabled={areCreditPolicyFieldsDisabled}
            />
            <FormFieldInput
              name="chqTrxnLimit"
              label="Cheque Transaction Limit"
              type="number"
              disabled={areCreditPolicyFieldsDisabled}
            />
          </div>
        </CardSection>
      )}

      <CardSection heading="Address, KYC & Contact">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
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
          <FormFieldPartyProfileSelect
            name="defaultAgent"
            label="Default Agent"
            types={PartyProfileTypeEnum.AGENT}
            placeholder="Select default agent"
            disabled={isSubmitting}
            helperText="Optional. Links to an agent party profile."
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
        <div className="mt-2">
          <FormFieldTextarea
            name="remarks"
            label="Remarks"
            placeholder="Enter any additional remarks..."
            disabled={isSubmitting}
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
          <FormFieldPartyProfileSelect
            name="marketingExecutive"
            label="Marketing Executive"
            types={PartyProfileTypeEnum.MARKETING_EXECUTIVE}
            placeholder="Select executive"
            disabled={isSubmitting}
            helperText="Optional. Links to a marketing executive party profile."
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
          <FormFieldCheckbox name="sale" label="Sell" disabled={isSubmitting} />
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
              <FormFieldCheckbox
                name="gstExempt"
                label={PARTY_PROFILE_TAX_SETTINGS_TEXT.gstExempt}
                disabled={isSubmitting}
              />
            </>
          )}
        </div>
      </CardSection>

      <CardSection
        heading={PARTY_PROFILE_BRANCH_UPDATE_TEXT.sectionHeading}
        headerActions={
          canShowUpdateBranchesButton ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onBranchUpdateModeChange?.(true)}
            >
              {PARTY_PROFILE_BRANCH_UPDATE_TEXT.updateBranches}
            </Button>
          ) : null
        }
      >
        {isBranchUpdateLocked ? (
          <p className="mb-3 text-sm text-text-secondary">
            {PARTY_PROFILE_BRANCH_UPDATE_TEXT.updateBranchesHint}
          </p>
        ) : null}
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
            name="branchIds"
            label="Current Branch"
            placeholder="Select current branch"
            loadOptions={branchLoadOptions}
            defaultOptions={true}
            valueOptions={branchDefaultOptions}
            pagination
            isMulti
            disabled={areBranchFieldsDisabled}
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
  onReviewSubmit,
  currentId,
  showSubmit = true,
  allowBranchSelection = false,
  allowCreditPolicyUpgrade = false,
  allowBranchUpdate = false,
  branchDefaultOptions,
}: PartyProfileFormProps) => {
  const [isCreditUpgradeMode, setIsCreditUpgradeMode] = useState(false);
  const [isBranchUpdateMode, setIsBranchUpdateMode] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(
    Boolean(currentId && (allowCreditPolicyUpgrade || allowBranchUpdate))
  );
  const creditPolicyBaselineRef = useRef(defaultValues);
  const branchBaselineRef = useRef(defaultValues.branchIds);
  const dirtyFieldsSnapshotRef = useRef<
    Partial<Record<keyof PartyProfileFormValues, boolean | object>>
  >({});

  useEffect(() => {
    creditPolicyBaselineRef.current = defaultValues;
    branchBaselineRef.current = defaultValues.branchIds;
  }, [defaultValues]);

  const handleDirtyFieldsSnapshotChange = useCallback(
    (
      dirtyFields: Partial<Record<keyof PartyProfileFormValues, boolean | object>>
    ) => {
      dirtyFieldsSnapshotRef.current = dirtyFields;
    },
    []
  );
  const submitMessage =
    currentId &&
    (allowCreditPolicyUpgrade || allowBranchUpdate) &&
    isSubmitDisabled &&
    !isCreditUpgradeMode &&
    !isBranchUpdateMode
      ? PARTY_PROFILE_CREDIT_POLICY_TEXT.saveBlockedUntilUpgrade
      : undefined;

  const handleCreditUpgradeModeChange = useCallback((enabled: boolean) => {
    setIsCreditUpgradeMode(enabled);
    if (enabled) {
      setIsBranchUpdateMode(false);
      setIsSubmitDisabled(false);
    }
  }, []);

  const handleBranchUpdateModeChange = useCallback((enabled: boolean) => {
    setIsBranchUpdateMode(enabled);
    if (enabled) {
      setIsCreditUpgradeMode(false);
      setIsSubmitDisabled(false);
    }
  }, []);

  return (
    <Form
      id={FORM_ID}
      onSubmit={values => {
        const dirtyFields = dirtyFieldsSnapshotRef.current;
        const nextBranchIds = normalizeBranchIds(values.branchIds);
        onSubmit(values, {
          creditUpgradeMode: isCreditUpgradeMode,
          creditPolicyPayload: isCreditUpgradeMode
            ? pickDirtyPartyProfileCreditPolicyValues(
                values,
                dirtyFields,
                creditPolicyBaselineRef.current
              )
            : {},
          branchUpdateMode: isBranchUpdateMode,
          branchIds:
            isBranchUpdateMode &&
            haveBranchIdsChanged(nextBranchIds, branchBaselineRef.current)
              ? nextBranchIds
              : undefined,
        });
      }}
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
        isSubmitDisabled,
        submitMessage,
      }}
    >
      <PartyProfileFormFields
        isSubmitting={isSubmitting}
        disabled={disabled}
        profileType={profileType}
        reviewMode={reviewMode}
        onReviewSubmit={onReviewSubmit}
        currentId={currentId}
        allowBranchSelection={allowBranchSelection}
        isCreditUpgradeMode={isCreditUpgradeMode}
        onCreditUpgradeModeChange={handleCreditUpgradeModeChange}
        isBranchUpdateMode={isBranchUpdateMode}
        onBranchUpdateModeChange={handleBranchUpdateModeChange}
        onSubmitDisabledChange={setIsSubmitDisabled}
        onDirtyFieldsSnapshotChange={handleDirtyFieldsSnapshotChange}
        allowCreditPolicyUpgrade={allowCreditPolicyUpgrade}
        allowBranchUpdate={allowBranchUpdate}
        branchDefaultOptions={branchDefaultOptions}
      />
    </Form>
  );
};
