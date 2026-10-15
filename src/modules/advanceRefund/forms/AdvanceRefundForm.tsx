import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  CardSection,
  Badge,
  type AsyncSelectOption,
  type AsyncSelectResponse,
} from '@/components/ui';
import {
  FormFieldInput,
  FormFieldSelect,
  FormFieldDatePicker,
  FormFieldCategoryOption,
} from '@/components/forms';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { useAuth } from '@/lib/AuthContext';
import { useLoadBranchOptions } from '@/modules/branchProfile/hooks';
import { useListPartyProfiles } from '@/modules/partyProfiles/hooks';
import { PartyProfileTypeEnum } from '@/modules/partyProfiles/types/partyProfileTypes';
import { accountProfileApi } from '@/api/accountProfile';
import type { IAccountProfile } from '@/modules/accountProfile/types/accountProfileTypes';
import { counterProfileApi } from '@/api/counterProfile/counterProfile.api';
import { transactionPoliciesApi } from '@/api/transactionPolicies';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import { useAvailableAdvances } from '../hooks';
import {
  AdvanceRefundPayoutSource,
  AdvanceRefundType,
  type AdvanceRefundFormValues,
  type CreateAdvanceRefundPayload,
} from '../types';
import {
  ADVANCE_REFUND_PAYOUT_OPTIONS,
  ADVANCE_REFUND_TYPE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from '../constants';
import { toast } from 'react-hot-toast';

const staticLoader =
  (options: AsyncSelectOption[]) =>
  async (input: string): Promise<AsyncSelectResponse> => ({
    options: input
      ? options.filter(option =>
          option.label.toLowerCase().includes(input.toLowerCase())
        )
      : options,
  });

const StaticFormFieldSelect = ({
  name,
  label,
  placeholder,
  options,
  disabled,
  isLoading,
  onValueChange,
}: {
  name: string;
  label: string;
  placeholder?: string;
  options: AsyncSelectOption[];
  disabled?: boolean;
  isLoading?: boolean;
  onValueChange?: (value: string | string[] | null) => void;
}) => {
  const loadOptions = useMemo(() => staticLoader(options), [options]);
  return (
    <FormFieldSelect
      name={name}
      label={label}
      placeholder={placeholder}
      loadOptions={loadOptions}
      defaultOptions={true}
      isLoading={isLoading}
      disabled={disabled || isLoading}
      onValueChange={onValueChange}
    />
  );
};

const schema = yup.object().shape({
  branchId: yup.string().required('Branch is required'),
  counterId: yup.string().required('Counter is required'),
  transactionDate: yup.string().required('Transaction date is required'),
  asOnDate: yup.string().required('As-on date is required'),
  partyProfileId: yup.string().required('Party Profile is required'),
  panNumber: yup.string().optional(),
  panName: yup.string().optional(),
  panDob: yup.string().optional(),
  refundType: yup
    .string()
    .oneOf([AdvanceRefundType.REFUND, AdvanceRefundType.KNOCK_OFF])
    .required('Refund type is required'),
  narration: yup.string().trim().required('Narration / Remark is required'),
  remarkOptionId: yup.string().optional(),
  knockOffAccountId: yup.string().when('refundType', {
    is: AdvanceRefundType.KNOCK_OFF,
    then: s => s.required('Knock-off account is required'),
  }),
  payoutSource: yup.string().when('refundType', {
    is: AdvanceRefundType.REFUND,
    then: s => s.required('Payout source is required'),
  }),
  payingBankAccountId: yup.string().when(['refundType', 'payoutSource'], {
    is: (rt: string, ps: string) =>
      rt === AdvanceRefundType.REFUND &&
      ps === AdvanceRefundPayoutSource.LOCAL_BANK,
    then: s => s.required('Paying bank account is required for local refund'),
  }),
});

interface AdvanceRefundFormProps {
  onSubmit: (payload: CreateAdvanceRefundPayload) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const AdvanceRefundForm: React.FC<AdvanceRefundFormProps> = ({
  onSubmit,
  isSubmitting,
  onCancel,
}) => {
  const { user, activeBranchId, activeCounterId, policyContext } = useAuth();
  const canSelectWorkplace = Boolean(user?.isHo || user?.isHoStaff);

  const [selectedBranchId, setSelectedBranchId] = useState(
    activeBranchId || ''
  );

  // Policy context for selected branch
  const [branchPolicyContext, setBranchPolicyContext] = useState(policyContext);

  useEffect(() => {
    if (!selectedBranchId) return;
    if (selectedBranchId === activeBranchId && policyContext) {
      setBranchPolicyContext(policyContext);
    } else {
      transactionPoliciesApi
        .getPolicyContext(selectedBranchId)
        .then(setBranchPolicyContext)
        .catch(() => setBranchPolicyContext(null));
    }
  }, [selectedBranchId, activeBranchId, policyContext]);

  const datePolicy = useMemo(
    () => getTransactionDatePolicy(branchPolicyContext),
    [branchPolicyContext]
  );

  const initialTransactionDate =
    datePolicy.defaultTransactionDate ||
    branchPolicyContext?.transactionDate ||
    new Date().toISOString().slice(0, 10);

  const form = useForm<AdvanceRefundFormValues>({
    resolver: yupResolver(schema) as unknown as Resolver<AdvanceRefundFormValues>,
    defaultValues: {
      branchId: activeBranchId || '',
      counterId: activeCounterId || '',
      transactionDate: initialTransactionDate,
      asOnDate: initialTransactionDate,
      partyProfileId: '',
      panNumber: '',
      panName: '',
      panDob: '',
      refundType: AdvanceRefundType.REFUND,
      payoutSource: AdvanceRefundPayoutSource.LOCAL_BANK,
      payingBankAccountId: '',
      paymentMethod: 'NEFT',
      beneficiaryAccountNumber: '',
      beneficiaryIfscCode: '',
      beneficiaryName: '',
      bankName: '',
      chequeNumber: '',
      chequeDate: '',
      drawnOn: '',
      narration: '',
      items: [],
    },
  });

  const {
    watch,
    setValue,
    handleSubmit,
  } = form;

  const watchedBranchId = watch('branchId');
  const watchedPartyId = watch('partyProfileId');
  const watchedAsOnDate = watch('asOnDate');
  const watchedRefundType = watch('refundType');
  const watchedPayoutSource = watch('payoutSource');
  const watchedKnockOffAccountId = watch('knockOffAccountId');
  const watchedItemsRaw = watch('items');
  const watchedItems = useMemo(
    () => watchedItemsRaw || [],
    [watchedItemsRaw]
  );

  // Update selectedBranchId when branch field changes
  useEffect(() => {
    if (watchedBranchId && watchedBranchId !== selectedBranchId) {
      setSelectedBranchId(watchedBranchId);
    }
  }, [watchedBranchId, selectedBranchId]);

  // Load Branch options
  const loadBranchOptions = useLoadBranchOptions({ activeOnly: true });

  // Load Counter options for selected branch
  const loadCounterOptions = useCallback(
    async (search: string) => {
      if (!watchedBranchId) return { options: [] };
      const res = await counterProfileApi.getCounterProfiles({
        limit: 100,
        offset: 0,
        search,
      });
      return {
        options: (res.data || [])
          .filter(c => !c.branchIds || c.branchIds.includes(watchedBranchId))
          .map(c => ({
            value: c.id,
            label: `${c.counterNo} - ${c.name}`,
          })),
      };
    },
    [watchedBranchId]
  );

  // Load Parties
  const allPartyTypes = useMemo(() => Object.values(PartyProfileTypeEnum), []);
  const { data: partyRes, isLoading: isPartiesLoading } = useListPartyProfiles(
    {
      limit: 100,
      activeOnly: true,
      status: 'APPROVE',
      branchId: watchedBranchId || undefined,
    },
    allPartyTypes,
    Boolean(watchedBranchId)
  );

  const partyList = useMemo(() => partyRes?.data || [], [partyRes]);
  const selectedParty = useMemo(
    () => partyList.find(p => p.id === watchedPartyId),
    [partyList, watchedPartyId]
  );

  // Check if selected party is individual
  const isIndividual = Boolean(
    selectedParty?.isIndividual ||
      String(selectedParty?.entityType?.value || '')
        .trim()
        .toUpperCase() === 'INDIVIDUAL'
  );

  // Sync PAN fields based on individual status
  useEffect(() => {
    if (!selectedParty) {
      setValue('panNumber', '');
      setValue('panName', '');
      setValue('panDob', '');
      return;
    }

    if (!isIndividual) {
      setValue('panNumber', selectedParty.panNo || '');
      setValue('panName', selectedParty.panName || selectedParty.name || '');
      setValue(
        'panDob',
        selectedParty.panDob ? String(selectedParty.panDob).slice(0, 10) : ''
      );
    }
  }, [selectedParty, isIndividual, setValue]);

  // Load Available Advances for party
  const {
    data: availableAdvances = [],
    isLoading: isAdvancesLoading,
  } = useAvailableAdvances({
    partyProfileId: watchedPartyId,
    branchId: watchedBranchId,
    asOnDate: watchedAsOnDate,
  });

  // Keep items array in form state synced when availableAdvances change
  useEffect(() => {
    if (!availableAdvances || availableAdvances.length === 0) {
      setValue('items', []);
      return;
    }

    const currentItems = form.getValues('items') || [];
    const currentMap = new Map(
      currentItems.map(i => [i.receiptVoucherId, i])
    );

    const updated = availableAdvances.map(adv => {
      const existing = currentMap.get(adv.id);
      return {
        receiptVoucherId: adv.id,
        receiptNumber: adv.number,
        receiptDate: adv.transactionDate,
        originalAmount: adv.originalAmount,
        availableAmount: adv.availableAmount,
        refundAmount: existing?.refundAmount || adv.availableAmount,
        selected: existing?.selected ?? true,
      };
    });

    setValue('items', updated);
  }, [availableAdvances, setValue, form]);

  // Load Knock Off Accounts (visibleDuringRefund: true)
  const { data: knockOffAccountsRes, isLoading: isAccountsLoading } = useQuery({
    queryKey: [
      'account-profiles',
      'knock-off-accounts',
      watchedBranchId,
      watchedRefundType,
    ],
    queryFn: () =>
      accountProfileApi.getAccountProfiles({
        limit: 100,
        offset: 0,
        visibleDuringRefund: true,
        active: true,
        branchId: watchedBranchId || undefined,
      }),
    enabled: watchedRefundType === AdvanceRefundType.KNOCK_OFF,
  });
  const knockOffAccounts: IAccountProfile[] = useMemo(
    () => knockOffAccountsRes?.data || [],
    [knockOffAccountsRes?.data]
  );

  const selectedKnockOffAccount = useMemo(
    () => knockOffAccounts.find(a => a.id === watchedKnockOffAccountId),
    [knockOffAccounts, watchedKnockOffAccountId]
  );

  // Load Local Paying Bank Accounts
  const { data: payingBankAccountsRes } = useQuery({
    queryKey: [
      'account-profiles',
      'paying-bank-accounts',
      watchedBranchId,
      watchedRefundType,
      watchedPayoutSource,
    ],
    queryFn: () =>
      accountProfileApi.getAccountProfiles({
        limit: 100,
        offset: 0,
        payment: true,
        active: true,
        branchId: watchedBranchId || undefined,
      }),
    enabled:
      watchedRefundType === AdvanceRefundType.REFUND &&
      watchedPayoutSource === AdvanceRefundPayoutSource.LOCAL_BANK,
  });
  const payingBankAccounts: IAccountProfile[] = useMemo(
    () => payingBankAccountsRes?.data || [],
    [payingBankAccountsRes?.data]
  );

  // Compute Total Refund Amount
  const totalRefundAmount = useMemo(() => {
    return (watchedItems || [])
      .filter(i => i.selected)
      .reduce((acc, curr) => acc + (parseFloat(curr.refundAmount) || 0), 0);
  }, [watchedItems]);

  // Handle select all toggle
  const allSelected =
    watchedItems.length > 0 && watchedItems.every(i => i.selected);

  const toggleSelectAll = (checked: boolean) => {
    const updated = watchedItems.map(item => ({
      ...item,
      selected: checked,
      refundAmount: checked ? item.availableAmount : '0.00',
    }));
    setValue('items', updated);
  };

  const handleRowCheckbox = (index: number, checked: boolean) => {
    const updated = [...watchedItems];
    updated[index].selected = checked;
    if (checked && !parseFloat(updated[index].refundAmount)) {
      updated[index].refundAmount = updated[index].availableAmount;
    }
    setValue('items', updated);
  };

  const handleRowRefundAmountChange = (index: number, val: string) => {
    const updated = [...watchedItems];
    updated[index].refundAmount = val;
    setValue('items', updated);
  };

  // Submit Handler
  const onFormSubmit = async (values: AdvanceRefundFormValues) => {
    const selectedRows = (values.items || []).filter(i => i.selected);
    if (selectedRows.length === 0) {
      toast.error('Please select at least one advance receipt to refund');
      return;
    }

    // Validate refund amounts
    for (const row of selectedRows) {
      const refundNum = parseFloat(row.refundAmount);
      const availNum = parseFloat(row.availableAmount);
      if (!refundNum || refundNum <= 0) {
        toast.error(`Invalid refund amount for receipt ${row.receiptNumber}`);
        return;
      }
      if (refundNum > availNum) {
        toast.error(
          `Refund amount for receipt ${row.receiptNumber} exceeds available balance (₹${row.availableAmount})`
        );
        return;
      }
    }

    // Knock Off limit check
    if (
      values.refundType === AdvanceRefundType.KNOCK_OFF &&
      selectedKnockOffAccount?.refundLimit
    ) {
      const limit = parseFloat(selectedKnockOffAccount.refundLimit);
      if (totalRefundAmount > limit) {
        toast.error(
          `Total refund amount (₹${totalRefundAmount.toFixed(2)}) exceeds the knock-off account refund limit of ₹${selectedKnockOffAccount.refundLimit}`
        );
        return;
      }
    }

    const payload: CreateAdvanceRefundPayload = {
      branchId: values.branchId,
      counterId: values.counterId,
      transactionDate: values.transactionDate,
      asOnDate: values.asOnDate,
      partyProfileId: values.partyProfileId,
      panNumber: values.panNumber || undefined,
      panName: values.panName || undefined,
      panDob: values.panDob || undefined,
      refundType: values.refundType,
      narration: values.narration,
      remarkOptionId: values.remarkOptionId || undefined,
      knockOffAccountId:
        values.refundType === AdvanceRefundType.KNOCK_OFF
          ? values.knockOffAccountId
          : undefined,
      payoutSource:
        values.refundType === AdvanceRefundType.REFUND
          ? values.payoutSource
          : undefined,
      payingBankAccountId:
        values.refundType === AdvanceRefundType.REFUND &&
        values.payoutSource === AdvanceRefundPayoutSource.LOCAL_BANK
          ? values.payingBankAccountId
          : undefined,
      paymentMethod:
        values.refundType === AdvanceRefundType.REFUND
          ? values.paymentMethod
          : undefined,
      beneficiaryAccountNumber:
        values.refundType === AdvanceRefundType.REFUND
          ? values.beneficiaryAccountNumber
          : undefined,
      beneficiaryIfscCode:
        values.refundType === AdvanceRefundType.REFUND
          ? values.beneficiaryIfscCode
          : undefined,
      beneficiaryName:
        values.refundType === AdvanceRefundType.REFUND
          ? values.beneficiaryName
          : undefined,
      bankName:
        values.refundType === AdvanceRefundType.REFUND
          ? values.bankName
          : undefined,
      chequeNumber:
        values.refundType === AdvanceRefundType.REFUND
          ? values.chequeNumber
          : undefined,
      chequeDate:
        values.refundType === AdvanceRefundType.REFUND
          ? values.chequeDate
          : undefined,
      drawnOn:
        values.refundType === AdvanceRefundType.REFUND
          ? values.drawnOn
          : undefined,
      items: selectedRows.map(row => ({
        receiptVoucherId: row.receiptVoucherId,
        refundAmount: parseFloat(row.refundAmount).toFixed(2),
      })),
    };

    await onSubmit(payload);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* 1. Workplace & Dates */}
      <CardSection heading="Workplace & Dates">
        <div className="grid gap-4 md:grid-cols-4">
          <FormFieldSelect
            name="branchId"
            label="Branch"
            placeholder="Select Branch"
            disabled={!canSelectWorkplace}
            loadOptions={loadBranchOptions}
            defaultOptions={true}
          />
          <FormFieldSelect
            name="counterId"
            label="Counter"
            placeholder="Select Counter"
            loadOptions={loadCounterOptions}
            defaultOptions={true}
            key={watchedBranchId}
          />
          <FormFieldDatePicker
            name="transactionDate"
            label="Transaction Date (dd/mm/yyyy)"
            placeholder="DD/MM/YYYY"
            disabled={!datePolicy.canPunchTransactions}
          />
          <FormFieldDatePicker
            name="asOnDate"
            label="As-on Date (dd/mm/yyyy)"
            placeholder="DD/MM/YYYY"
          />
        </div>
      </CardSection>

      {/* 2. Party Profile & Identification */}
      <CardSection heading="Party & Identification">
        <div className="grid gap-4 md:grid-cols-2">
          <StaticFormFieldSelect
            name="partyProfileId"
            label="Party Profile"
            placeholder="Search party by code or name"
            options={partyList.map(p => ({
              value: p.id,
              label: `${p.code} - ${p.name}`,
            }))}
            isLoading={isPartiesLoading}
          />
          <div className="flex items-center gap-2 pt-6">
            <span className="text-sm font-medium text-text-secondary">
              Entity Type:
            </span>
            <Badge variant={isIndividual ? 'info' : 'default'}>
              {selectedParty?.entityType?.label ||
                (isIndividual ? 'Individual' : 'Non-Individual')}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mt-4">
          <div>
            <FormFieldInput
              name="panNumber"
              label="PAN Card Number"
              placeholder="e.g. ABCDE1234F"
              disabled={!isIndividual}
            />
            <p className="text-xs text-text-secondary mt-1">
              {!isIndividual
                ? 'Auto-filled from party profile for non-individual parties'
                : 'Editable for individual parties'}
            </p>
          </div>
          <FormFieldInput
            name="panName"
            label="PAN Holder Name"
            placeholder="Full Name as per PAN"
            disabled={!isIndividual}
          />
          <FormFieldDatePicker
            name="panDob"
            label="PAN DOB / Inc. Date"
            placeholder="DD/MM/YYYY"
            disabled={!isIndividual}
          />
        </div>
      </CardSection>

      {/* 3. Refund Type & Narration */}
      <CardSection heading="Refund Configuration">
        <div className="grid gap-4 md:grid-cols-3">
          <StaticFormFieldSelect
            name="refundType"
            label="Refund Type"
            options={[...ADVANCE_REFUND_TYPE_OPTIONS]}
          />
          <FormFieldCategoryOption
            name="remarkOptionId"
            label="Remark Category"
            code={CategoryOptionCodeEnum.VoucherRemark}
            placeholder="Select Remark Option"
            isClearable
          />
          <FormFieldInput
            name="narration"
            label="Narration / Remarks"
            placeholder="Enter reason for advance refund or knock-off"
          />
        </div>
      </CardSection>

      {/* 4. Settlement Details */}
      {watchedRefundType === AdvanceRefundType.KNOCK_OFF && (
        <CardSection heading="Knock Off Account Selection">
          <div className="grid gap-4 md:grid-cols-2">
            <StaticFormFieldSelect
              name="knockOffAccountId"
              label="Knock Off Account (Income / Round-off)"
              placeholder="Select Account"
              options={knockOffAccounts.map(a => ({
                value: a.id,
                label: `${a.accountCode} - ${a.accountName}`,
              }))}
              isLoading={isAccountsLoading}
            />
            <div className="flex items-center gap-3 pt-6">
              {selectedKnockOffAccount && (
                <Badge
                  variant={
                    selectedKnockOffAccount.refundLimit &&
                    totalRefundAmount >
                      parseFloat(selectedKnockOffAccount.refundLimit)
                      ? 'error'
                      : 'success'
                  }
                >
                  Limit: ₹
                  {selectedKnockOffAccount.refundLimit
                    ? Number(
                        selectedKnockOffAccount.refundLimit
                      ).toLocaleString('en-IN', { minimumFractionDigits: 2 })
                    : 'Unlimited'}
                </Badge>
              )}
              {selectedKnockOffAccount?.refundLimit &&
                totalRefundAmount >
                  parseFloat(selectedKnockOffAccount.refundLimit) && (
                  <span className="text-xs text-error-600 font-medium">
                    Refund amount exceeds account limit!
                  </span>
                )}
            </div>
          </div>
        </CardSection>
      )}

      {watchedRefundType === AdvanceRefundType.REFUND && (
        <CardSection heading="Bank Payout & Beneficiary Details">
          <div className="grid gap-4 md:grid-cols-3">
            <StaticFormFieldSelect
              name="payoutSource"
              label="Payout Source"
              options={[...ADVANCE_REFUND_PAYOUT_OPTIONS]}
            />
            {watchedPayoutSource === AdvanceRefundPayoutSource.LOCAL_BANK && (
              <StaticFormFieldSelect
                name="payingBankAccountId"
                label="Local Paying Bank Account"
                placeholder="Select Paying Bank"
                options={payingBankAccounts.map(a => ({
                  value: a.id,
                  label: `${a.accountCode} - ${a.accountName}`,
                }))}
              />
            )}
            <StaticFormFieldSelect
              name="paymentMethod"
              label="Payment Method"
              options={[...PAYMENT_METHOD_OPTIONS]}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4 mt-4">
            <FormFieldInput
              name="beneficiaryName"
              label="Beneficiary Name"
              placeholder="Full Name"
            />
            <FormFieldInput
              name="beneficiaryAccountNumber"
              label="Beneficiary Account Number"
              placeholder="Account No"
            />
            <FormFieldInput
              name="beneficiaryIfscCode"
              label="Beneficiary IFSC Code"
              placeholder="e.g. HDFC0001234"
            />
            <FormFieldInput
              name="bankName"
              label="Bank Name"
              placeholder="e.g. HDFC Bank"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <FormFieldInput
              name="chequeNumber"
              label="Cheque / Ref Number"
              placeholder="Optional"
            />
            <FormFieldDatePicker
              name="chequeDate"
              label="Cheque Date (dd/mm/yyyy)"
              placeholder="DD/MM/YYYY"
            />
            <FormFieldInput
              name="drawnOn"
              label="Drawn On Bank"
              placeholder="Optional"
            />
          </div>
        </CardSection>
      )}

      {/* 5. Advance Receipts Multi-Item Grid */}
      <CardSection heading="Advance Receipts to Refund">
        {!watchedPartyId ? (
          <div className="py-8 text-center text-text-secondary text-sm">
            Please select a Party Profile above to view available advance
            receipts.
          </div>
        ) : isAdvancesLoading ? (
          <div className="py-8 text-center text-text-secondary text-sm">
            Loading available advance receipts...
          </div>
        ) : availableAdvances.length === 0 ? (
          <div className="py-8 text-center text-text-secondary text-sm">
            No outstanding advance receipts found for this party as of{' '}
            {watchedAsOnDate}.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-border-primary rounded-md">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-surface-secondary text-text-secondary text-xs uppercase border-b border-border-primary">
                  <tr>
                    <th className="p-3 w-12 text-center font-semibold text-text-primary">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={e => toggleSelectAll(e.target.checked)}
                        className="rounded border-border-primary text-primary-600 focus:ring-primary-500"
                      />
                    </th>
                    <th className="p-3 font-semibold text-text-primary">Receipt No</th>
                    <th className="p-3 font-semibold text-text-primary">Receipt Date</th>
                    <th className="p-3 text-right font-semibold text-text-primary">
                      Original Amount (₹)
                    </th>
                    <th className="p-3 text-right font-semibold text-text-primary">
                      Available Balance (₹)
                    </th>
                    <th className="p-3 text-right w-48 font-semibold text-text-primary">
                      Refund Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary">
                  {watchedItems.map((item, index) => (
                    <tr key={item.receiptVoucherId} className="hover:bg-surface-secondary/50 transition-colors">
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={e =>
                            handleRowCheckbox(index, e.target.checked)
                          }
                          className="rounded border-border-primary text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="p-3 font-medium text-text-primary">
                        {item.receiptNumber}
                      </td>
                      <td className="p-3">{item.receiptDate}</td>
                      <td className="p-3 text-right">
                        {Number(item.originalAmount).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-3 text-right font-medium text-emerald-600">
                        {Number(item.availableAmount).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={item.availableAmount}
                          disabled={!item.selected}
                          value={item.refundAmount}
                          onChange={e =>
                            handleRowRefundAmountChange(index, e.target.value)
                          }
                          className="w-full text-right px-2.5 py-1.5 text-sm border border-border-primary rounded-md bg-surface-primary disabled:bg-surface-secondary disabled:opacity-50 focus:border-primary-500 focus:outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary card */}
            <div className="flex justify-between items-center p-4 bg-surface-secondary rounded-md border border-border-primary">
              <div className="text-sm text-text-secondary">
                Selected Receipts:{' '}
                <span className="font-semibold text-text-primary">
                  {watchedItems.filter(i => i.selected).length}
                </span>{' '}
                of {watchedItems.length}
              </div>
              <div className="text-base font-bold text-text-primary">
                Total Refund Amount:{' '}
                <span className="text-primary-600 ml-2">
                  ₹
                  {totalRefundAmount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardSection>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border-primary">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="default"
          loading={isSubmitting}
          disabled={isSubmitting || totalRefundAmount <= 0}
        >
          Submit Advance Refund
        </Button>
      </div>
    </form>
  </FormProvider>
);
};
