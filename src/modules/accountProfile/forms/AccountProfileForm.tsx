import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useFormContext, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CardSection } from '@/components/ui';
import {
  Form,
  FormFieldCheckbox,
  FormFieldInput,
  FormFieldSelect,
  FormFieldCategoryOption,
} from '@/components/forms';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { currencyProfileApi } from '@/api/currencyProfile';
import { financialCodesApi } from '@/api/financialCodes/financialCodes.api';
import { branchProfileApi } from '@/api/branchProfile/branchProfile.api';
import { accountProfileApi } from '@/api/accountProfile';
import { useGetFinancialCode } from '@/modules/financialCodes/hooks/useGetFinancialCode';
import { accountProfileSchema } from '../schema/accountProfileSchema';
import type { ICreateAccountProfile } from '../types/accountProfileTypes';

interface AccountProfileFormProps {
  defaultValues: ICreateAccountProfile;
  onSubmit: (values: ICreateAccountProfile) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  readOnly?: boolean;
  currentId?: string;
}

const FinancialCodeObserver = ({ isDisabled }: { isDisabled: boolean }) => {
  const { watch, setValue } = useFormContext();
  const financialCodeId = watch('financialCodeId');
  const financialType = watch('financialType');
  const prevFCIdRef = useRef(financialCodeId);
  const prevFTypeRef = useRef(financialType);

  // Fetch the specific financial code details including subProfiles
  const { data: selectedFC, isLoading } = useGetFinancialCode(financialCodeId);

  // Fetch all financial codes for looking up and filtering
  const { data: financialCodesRes } = useQuery({
    queryKey: ['financial-codes-lookup'],
    queryFn: () => financialCodesApi.getFinancialCodes({ page: 1, limit: 100 }),
  });
  const financialCodes = financialCodesRes?.data || [];

  // Sync Financial Type when Financial Code changes
  useEffect(() => {
    if (selectedFC && selectedFC.financialType) {
      if (watch('financialType') !== selectedFC.financialType) {
        setValue('financialType', selectedFC.financialType);
        prevFTypeRef.current = selectedFC.financialType;
      }
    }
  }, [selectedFC, setValue, watch]);

  // Sync Financial Code when Financial Type changes
  useEffect(() => {
    if (financialType && prevFTypeRef.current !== financialType) {
      prevFTypeRef.current = financialType;
      // Find the first financial code matching this type
      const matched = financialCodes.find(fc => fc.financialType === financialType);
      if (matched && matched.id !== financialCodeId) {
        setValue('financialCodeId', matched.id);
        setValue('financialSubProfileId', ''); // Reset SubCode
      }
    }
  }, [financialType, financialCodes, financialCodeId, setValue]);

  // Reset SubCode if Financial Code changes
  useEffect(() => {
    if (prevFCIdRef.current !== financialCodeId) {
      setValue('financialSubProfileId', '');
      prevFCIdRef.current = financialCodeId;
    }
  }, [financialCodeId, setValue]);

  // Options for Financial SubCode select
  const subProfileOptions = useMemo(() => {
    return (selectedFC?.subProfiles || []).map(sub => ({
      value: sub.id || '',
      label: `${sub.financialSubCode} - ${sub.financialSubName}`,
    }));
  }, [selectedFC]);

  const loadSubProfileOptions = useCallback(async (inputValue: string) => {
    return {
      options: subProfileOptions.filter(opt =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase())
      ),
    };
  }, [subProfileOptions]);

  const loadFinancialCodeOptions = useCallback(async (inputValue: string) => {
    const res = await financialCodesApi.getFinancialCodes({ page: 1, limit: 100, search: inputValue });
    let data = res.data || [];
    if (financialType) {
      data = data.filter(fc => fc.financialType === financialType);
    }
    const options = data.map(fc => ({
      value: fc.id,
      label: fc.financialCode, // Just show code
    }));
    return { options };
  }, [financialType]);

  const loadFinancialTypeOptions = useCallback(async (inputValue: string) => {
    const res = await financialCodesApi.getFinancialCodes({ page: 1, limit: 100 });
    const types = new Set<string>();
    const options: { value: string; label: string }[] = [];
    (res.data || []).forEach(fc => {
      if (fc.financialType && !types.has(fc.financialType)) {
        types.add(fc.financialType);
        if (fc.financialType.toLowerCase().includes(inputValue.toLowerCase())) {
          options.push({
            value: fc.financialType,
            label: fc.financialType, // Just show type
          });
        }
      }
    });
    return { options };
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <FormFieldSelect
        name="financialType"
        label="Financial Type"
        placeholder="Select Financial Type"
        disabled={isDisabled || isLoading}
        loadOptions={loadFinancialTypeOptions}
        key={financialCodes.length} // Force reload when types are loaded
      />

      <FormFieldSelect
        name="financialCodeId"
        label="Financial Code"
        placeholder="Search financial codes..."
        disabled={isDisabled}
        loadOptions={loadFinancialCodeOptions}
        key={financialType || 'empty'} // Force reload of codes when type changes
      />

      <FormFieldSelect
        name="financialSubProfileId"
        label="Financial SubCode"
        placeholder={
          isLoading
            ? 'Loading subcodes...'
            : financialCodeId
            ? subProfileOptions.length > 0
              ? 'Search subcodes...'
              : 'No subcodes available'
            : 'Select code first'
        }
        disabled={isDisabled || !financialCodeId || subProfileOptions.length === 0 || isLoading}
        loadOptions={loadSubProfileOptions}
        key={`${financialCodeId}_${subProfileOptions.length}`}
      />
    </div>
  );
};

export const AccountProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Create Account Profile',
  isSubmitting = false,
  readOnly = false,
  currentId,
}: AccountProfileFormProps) => {
  const navigate = useNavigate();
  const isDisabled = isSubmitting || readOnly;

  const onCancel = () => {
    navigate('/admin/accounts-profile');
  };

  const loadCurrencyOptions = useCallback(async (inputValue: string) => {
    const data = await currencyProfileApi.getCurrencyProfiles();
    const filtered = data.filter(
      c =>
        c.currencyCode.toLowerCase().includes(inputValue.toLowerCase()) ||
        c.currencyName.toLowerCase().includes(inputValue.toLowerCase())
    );
    return {
      options: filtered.map(c => ({
        value: c.id,
        label: `${c.currencyCode} - ${c.currencyName}`,
      })),
    };
  }, []);

  const loadBranchOptions = useCallback(async (inputValue: string) => {
    const data = await branchProfileApi.getBranchProfiles();
    const filtered = data.filter(
      b =>
        b.code.toLowerCase().includes(inputValue.toLowerCase()) ||
        b.name.toLowerCase().includes(inputValue.toLowerCase())
    );
    return {
      options: filtered.map(b => ({
        value: b.id,
        label: `${b.code} - ${b.name}`,
      })),
    };
  }, []);

  const loadMapToAccountOptions = useCallback(async (inputValue: string) => {
    const res = await accountProfileApi.getAccountProfiles({ page: 1, limit: 100, search: inputValue });
    const filtered = (res.data || []).filter(a => a.id !== currentId);
    return {
      options: filtered.map(a => ({
        value: a.id,
        label: `${a.accountCode} - ${a.accountName}`,
      })),
    };
  }, [currentId]);

  return (
    <Form
      id="account-profile-form"
      onSubmit={onSubmit}
      resolver={yupResolver(accountProfileSchema) as Resolver<ICreateAccountProfile>}
      defaultValues={defaultValues}
      className="space-y-6"
      footer={!readOnly ? {
        submitLabel,
        onBackClick: onCancel,
        onCancel,
      } : undefined}
    >
      <CardSection heading="Account Detail">
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldCategoryOption
            name="divisionDept"
            label="Division/Dept"
            code={CategoryOptionCodeEnum.DivisionDept}
            placeholder="Select Division/Dept"
            disabled={isDisabled}
            useValueAsId={true}
          />
          <div className="grid gap-4 grid-cols-2">
            <FormFieldInput
              name="accountCode"
              label="Account Code"
              placeholder="e.g. ACCINT"
              disabled={isDisabled}
            />
            <FormFieldInput
              name="accountName"
              label="Account Name"
              placeholder="e.g. ACCRUED FD INTEREST"
              disabled={isDisabled}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <FormFieldCategoryOption
            name="accountType"
            label="Account Type"
            code={CategoryOptionCodeEnum.AccountType}
            placeholder="Select Account Type"
            disabled={isDisabled}
            useValueAsId={true}
          />
          <FormFieldCategoryOption
            name="subLedger"
            label="Sub Ledger"
            code={CategoryOptionCodeEnum.SubLedger}
            placeholder="Select Sub Ledger"
            disabled={isDisabled}
            useValueAsId={true}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <FormFieldCategoryOption
            name="bankNature"
            label="Bank Nature"
            code={CategoryOptionCodeEnum.BankNature}
            placeholder="Select Bank Nature"
            disabled={isDisabled}
            useValueAsId={true}
          />
          <FormFieldSelect
            name="currencyId"
            label="Currency"
            placeholder="Select Currency"
            disabled={isDisabled}
            loadOptions={loadCurrencyOptions}
          />
        </div>
      </CardSection>

      <CardSection heading="Financial Mapping">
        <FinancialCodeObserver isDisabled={isDisabled} />
      </CardSection>

      <CardSection heading="Mapping & Transfer Options">
        <div className="grid gap-4 md:grid-cols-3">
          <FormFieldInput
            name="pettyCashExpenseId"
            label="Petty Cash Expense ID"
            placeholder="Enter Petty Cash Expense ID"
            disabled={isDisabled}
          />
          <FormFieldSelect
            name="branchIdToTransfer"
            label="Branch ID to Transfer"
            placeholder="Select Branch"
            disabled={isDisabled}
            loadOptions={loadBranchOptions}
            isClearable
          />
          <FormFieldSelect
            name="mapToAccountId"
            label="Map To Account"
            placeholder="Select Account to Map"
            disabled={isDisabled}
            loadOptions={loadMapToAccountOptions}
            isClearable
          />
        </div>
      </CardSection>

      <CardSection heading="Configuration Checkboxes">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          <div className="rounded-sm border border-border-primary bg-surface-primary p-3 hover:border-border-secondary transition-all">
            <FormFieldCheckbox name="doSale" label="Do Sale" disabled={isDisabled} />
          </div>
          <div className="rounded-sm border border-border-primary bg-surface-primary p-3 hover:border-border-secondary transition-all">
            <FormFieldCheckbox name="doPurchase" label="Do Purchase" disabled={isDisabled} />
          </div>
          <div className="rounded-sm border border-border-primary bg-surface-primary p-3 hover:border-border-secondary transition-all">
            <FormFieldCheckbox name="doReceipt" label="Do Receipt" disabled={isDisabled} />
          </div>
          <div className="rounded-sm border border-border-primary bg-surface-primary p-3 hover:border-border-secondary transition-all">
            <FormFieldCheckbox name="doPayment" label="Do Payment" disabled={isDisabled} />
          </div>
          <div className="rounded-sm border border-border-primary bg-surface-primary p-3 hover:border-border-secondary transition-all">
            <FormFieldCheckbox name="active" label="Active" disabled={isDisabled} />
          </div>
          <div className="rounded-sm border border-border-primary bg-surface-primary p-3 hover:border-border-secondary transition-all">
            <FormFieldCheckbox name="cmsBank" label="CMS Bank" disabled={isDisabled} />
          </div>
          <div className="rounded-sm border border-border-primary bg-surface-primary p-3 hover:border-border-secondary transition-all">
            <FormFieldCheckbox name="directRemittance" label="Direct Remittance" disabled={isDisabled} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <FormFieldCheckbox name="zeroBalanceAtEod" label="Zero Balance at EOD" disabled={isDisabled} />
        </div>
      </CardSection>

      {readOnly && (
        <div className="flex justify-end border-t border-border-primary pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-sm bg-neutral-100 hover:bg-neutral-200 text-text-primary px-4 py-2 text-sm font-semibold"
          >
            Close
          </button>
        </div>
      )}
    </Form>
  );
};
export default AccountProfileForm;
