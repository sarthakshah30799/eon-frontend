import { useEffect, useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { Button, CardSection, type AsyncSelectOption, type AsyncSelectResponse } from '@/components/ui';
import { Form, FormFieldCategoryOption, FormFieldDatePicker, FormFieldInput, FormFieldSelect, FormFieldTextarea } from '@/components/forms';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { useListAccountProfiles } from '@/modules/accountProfile/hooks';
import { useListPartyProfiles } from '@/modules/partyProfiles/hooks';
import { useCategoryOptions } from '@/hooks';
import { PartyProfileTypeEnum } from '@/modules/partyProfiles/types/partyProfileTypes';
import { PurchaseWorkplaceFields } from '@/modules/purchase/components/PurchaseWorkplaceFields';
import type { VoucherAccountMode, VoucherFormValues, VoucherType } from './types';
import { VOUCHER_LABELS } from './constants';
import { useVoucherNextNumber } from './hooks';

const modeFromLabel = (label: string): VoucherAccountMode => {
  const value = label.toUpperCase().replace(/[ /-]+/g, '_');
  if (value.includes('BANK') || value.includes('CHEQUE')) return 'BANK_CHEQUE';
  if (value.includes('PETTY')) return 'PETTY_CASH';
  if (value.includes('CREDIT')) return 'CREDIT_CARD';
  return 'CASH';
};

const optionFilter = <T extends AsyncSelectOption>(options: T[]) => async (input: string): Promise<AsyncSelectResponse> => ({
  options: options.filter(option => option.label.toLowerCase().includes(input.trim().toLowerCase())),
});

const toCents = (value: unknown) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? Math.round(numeric * 100) : 0;
};

const voucherSchema = (type: VoucherType) => yup.object({
  transactionDate: yup.string().required('Transaction date is required'),
  branchId: yup.string().required('Branch is required'),
  counterId: yup.string().required('Counter is required'),
  accountTypeOptionId: yup.string().when([], { is: () => type !== 'JOURNAL', then: schema => schema.required('A/C Type is required') }),
  headerAccountId: yup.string().when([], { is: () => type !== 'JOURNAL', then: schema => schema.required('A/C Code is required') }),
  entityTypeOptionId: yup.string().when([], { is: () => type !== 'JOURNAL', then: schema => schema.required('Party Type is required') }),
  partyProfileId: yup.string().when([], { is: () => type !== 'JOURNAL', then: schema => schema.required('Party Code is required') }),
  chequeNumber: yup.string().when('accountMode', { is: 'BANK_CHEQUE', then: schema => schema.required('Cheque number is required') }),
  chequeDate: yup.string().when('accountMode', { is: 'BANK_CHEQUE', then: schema => schema.required('Cheque date is required') }),
  chequeBranch: yup.string().when('accountMode', { is: 'BANK_CHEQUE', then: schema => schema.required('Branch is required') }),
  drawnOn: yup.string().when('accountMode', { is: 'BANK_CHEQUE', then: schema => schema.required('Drawn on is required') }),
  narration: yup.string().trim().required('Narration is required'),
  items: yup.array().of(yup.object({
    itemTypeOptionId: yup.string().required('Type is required'),
    subledgerPartyProfileId: type === 'JOURNAL' ? yup.string().nullable() : yup.string().required('Sub ledger is required'),
    accountId: yup.string().required('Account is required'),
    direction: yup.string().oneOf(['DEBIT', 'CREDIT']).required('Sign is required'),
    amount: yup.string().test('positive', 'Amount must be positive', value => Number(value) > 0).required(),
  })).min(1, 'At least one item is required').required().test('voucher-totals', type === 'JOURNAL' ? 'Journal Voucher difference must be 0.00 and both totals must be positive.' : 'Final amount must be positive', rows => {
    const totals = (rows ?? []).reduce((value, row) => {
      value[row?.direction === 'CREDIT' ? 'credit' : 'debit'] += toCents(row?.amount);
      return value;
    }, { debit: 0, credit: 0 });
    if (type === 'JOURNAL') return totals.debit > 0 && totals.credit > 0 && totals.debit === totals.credit;
    return type === 'RECEIPT' ? totals.credit - totals.debit > 0 : totals.debit - totals.credit > 0;
  }),
});

interface Props {
  type: VoucherType;
  defaultValues: VoucherFormValues;
  readOnly?: boolean;
  minDate?: Date;
  maxDate?: Date;
  policyTransactionDate?: string;
  onBranchChange?: (branchId: string) => void;
  cashControlAccountId?: string;
  submitDisabled?: boolean;
  onSubmit: (values: VoucherFormValues) => Promise<void>;
  onBack: () => void;
}

const VoucherFields = ({ type, readOnly, cashControlAccountId, minDate, maxDate, policyTransactionDate, onBranchChange }: Pick<Props, 'type' | 'readOnly' | 'cashControlAccountId' | 'minDate' | 'maxDate' | 'policyTransactionDate' | 'onBranchChange'>) => {
  const form = useFormContext<VoucherFormValues>();
  const mode = useWatch({ control: form.control, name: 'accountMode' });
  const accountTypeOptionId = useWatch({ control: form.control, name: 'accountTypeOptionId' });
  const entityTypeOptionId = useWatch({ control: form.control, name: 'entityTypeOptionId' });
  const partyProfileId = useWatch({ control: form.control, name: 'partyProfileId' });
  const headerAccountId = useWatch({ control: form.control, name: 'headerAccountId' });
  const watchedItems = useWatch({ control: form.control, name: 'items' });
  const items = useMemo(() => watchedItems ?? [], [watchedItems]);
  const branchId = useWatch({ control: form.control, name: 'branchId' });
  const { data: nextNumber } = useVoucherNextNumber(type, branchId);
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });
  const itemTypeOptions = useCategoryOptions(CategoryOptionCodeEnum.VoucherItemType).defaultOptions;
  const accountTypeOptions = useCategoryOptions(CategoryOptionCodeEnum.VoucherAccountType).defaultOptions;
  const { data: accountResponse } = useListAccountProfiles({ active: true, limit: 100, ...(type === 'RECEIPT' ? { receipt: true } : type === 'PAYMENT' ? { payment: true } : { journalVoucher: true }) });
  const { data: headerAccountResponse } = useListAccountProfiles({ active: true, limit: 100 });
  const allPartyTypes = Object.values(PartyProfileTypeEnum);
  const { data: partyResponse } = useListPartyProfiles({ limit: 100, activeOnly: true, status: 'APPROVE', entityTypeId: entityTypeOptionId || undefined }, allPartyTypes);
  const parties = useMemo(() => partyResponse?.data ?? [], [partyResponse]);
  const selectedParty = parties.find(party => party.id === partyProfileId);
  const { data: subledgerResponse } = useListPartyProfiles({ limit: 100, activeOnly: true, status: 'APPROVE', entityTypeId: type === 'JOURNAL' ? undefined : entityTypeOptionId || undefined, groupId: type === 'JOURNAL' ? undefined : selectedParty?.group?.id }, allPartyTypes, type === 'JOURNAL' || Boolean(selectedParty));

  const accounts = useMemo(() => (accountResponse?.data ?? []).filter(account => (account.currencyCode ?? account.currency?.currencyCode) === 'INR'), [accountResponse]);
  const allHeaderAccounts = useMemo(() => (headerAccountResponse?.data ?? []).filter(account => (account.currencyCode ?? account.currency?.currencyCode) === 'INR'), [headerAccountResponse]);
  const headerAccounts = useMemo(() => allHeaderAccounts.filter(account => {
    if (mode === 'CASH') return account.id === cashControlAccountId;
    if (mode === 'BANK_CHEQUE') return account.accountType?.label?.toUpperCase() === 'BANK LEDGER';
    return true;
  }), [allHeaderAccounts, cashControlAccountId, mode]);
  const accountOptions = useMemo(() => accounts.map(account => ({ value: account.id, label: `${account.accountCode} - ${account.accountName}` })), [accounts]);
  const headerAccountOptions = useMemo(() => headerAccounts.map(account => ({ value: account.id, label: `${account.accountCode} - ${account.accountName}` })), [headerAccounts]);
  const partyOptions = useMemo(() => parties.map(party => ({ value: party.id, label: `${party.code} - ${party.name}` })), [parties]);
  const subledgerParties = type === 'JOURNAL' ? (subledgerResponse?.data ?? []) : selectedParty?.group ? (subledgerResponse?.data ?? []) : selectedParty ? [selectedParty] : [];
  const subledgerOptions = subledgerParties.map(party => ({ value: party.id, label: `${party.code} - ${party.name}` }));

  useEffect(() => {
    onBranchChange?.(branchId ?? '');
  }, [branchId, onBranchChange]);
  useEffect(() => {
    if (!readOnly && policyTransactionDate) form.setValue('transactionDate', policyTransactionDate, { shouldDirty: false, shouldValidate: true });
  }, [form, policyTransactionDate, readOnly]);
  useEffect(() => {
    if (!selectedParty) return;
    form.setValue('partyName', selectedParty.name, { shouldValidate: false });
    form.setValue('panNumber', selectedParty.panNo ?? '', { shouldValidate: false });
  }, [form, selectedParty]);
  useEffect(() => {
    const selected = accountTypeOptions.find(option => String(option.value) === String(accountTypeOptionId));
    if (!selected) return;
    const nextMode = modeFromLabel(selected.label);
    if (nextMode === mode) return;
    form.setValue('accountMode', nextMode);
    form.setValue('headerAccountId', '');
    form.setValue('headerAccountName', '');
    if (nextMode !== 'BANK_CHEQUE') {
      form.setValue('chequeNumber', ''); form.setValue('chequeDate', ''); form.setValue('chequeBranch', ''); form.setValue('drawnOn', '');
    }
  }, [accountTypeOptionId, accountTypeOptions, form, mode]);
  useEffect(() => {
    if (mode !== 'CASH' || !cashControlAccountId) return;
    const account = allHeaderAccounts.find(item => item.id === cashControlAccountId);
    form.setValue('headerAccountId', cashControlAccountId, { shouldValidate: true });
    form.setValue('headerAccountName', account?.accountName ?? '', { shouldValidate: false });
  }, [allHeaderAccounts, cashControlAccountId, form, mode]);
  useEffect(() => {
    const account = headerAccounts.find(item => item.id === headerAccountId);
    form.setValue('headerAccountName', account?.accountName ?? '', { shouldValidate: false });
  }, [form, headerAccountId, headerAccounts]);
  useEffect(() => {
    if (!readOnly && nextNumber) form.setValue('number', nextNumber, { shouldDirty: false });
  }, [form, nextNumber, readOnly]);
  useEffect(() => {
    const accountType = itemTypeOptions.find(option => option.label.toUpperCase() === 'ACCOUNT');
    items.forEach((item, index) => {
      if (!item.itemTypeOptionId && accountType) form.setValue(`items.${index}.itemTypeOptionId`, String(accountType.value), { shouldDirty: false });
      const account = accounts.find(value => value.id === item.accountId);
      if (account && item.accountName !== account.accountName) form.setValue(`items.${index}.accountName`, account.accountName, { shouldDirty: false });
    });
  }, [accounts, form, itemTypeOptions, items]);

  const totals = items.reduce((value, item) => {
    value[item.direction === 'DEBIT' ? 'debit' : 'credit'] += toCents(item.amount);
    return value;
  }, { debit: 0, credit: 0 });
  const final = type === 'RECEIPT' ? totals.credit - totals.debit : type === 'PAYMENT' ? totals.debit - totals.credit : totals.credit - totals.debit;

  return <div className="space-y-4">
    <CardSection heading="Voucher Details">
      <PurchaseWorkplaceFields readOnly={readOnly} />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <FormFieldDatePicker name="transactionDate" label="Transaction Date" dateFormat="dd/MM/yyyy" minDate={minDate} maxDate={maxDate} disabled={readOnly} />
        <FormFieldInput name="number" label="Transaction Number" disabled />
      </div>
      {type !== 'JOURNAL' && <>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {readOnly ? <FormFieldInput name="accountTypeName" label="A/C Type" disabled /> : <FormFieldCategoryOption name="accountTypeOptionId" label="A/C Type" code={CategoryOptionCodeEnum.VoucherAccountType} isCreatable={false} />}
          {readOnly ? <FormFieldInput name="headerAccountCode" label="A/C Code" disabled /> : <FormFieldSelect name="headerAccountId" label="A/C Code" loadOptions={optionFilter(headerAccountOptions)} defaultOptions={headerAccountOptions} disabled={mode === 'CASH'} />}
          <FormFieldInput name="headerAccountName" label="A/C Name" disabled />
          {readOnly ? <FormFieldInput name="entityTypeName" label="Party Type" disabled /> : <FormFieldCategoryOption name="entityTypeOptionId" label="Party Type" code={CategoryOptionCodeEnum.EntityType} isCreatable={false} />}
          {readOnly ? <FormFieldInput name="partyCode" label="Party Code" disabled /> : <FormFieldSelect name="partyProfileId" label="Party Code" loadOptions={optionFilter(partyOptions)} defaultOptions={partyOptions} disabled={!entityTypeOptionId} />}
          <FormFieldInput name="partyName" label="Party Name" disabled />
          <FormFieldInput name="panNumber" label="PAN Number" disabled />
        </div>
        {mode === 'BANK_CHEQUE' && <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput name="chequeNumber" label="Cheque Number" disabled={readOnly} />
          <FormFieldDatePicker name="chequeDate" label="Cheque Date" dateFormat="dd/MM/yyyy" disabled={readOnly} />
          <FormFieldInput name="chequeBranch" label="Branch" disabled={readOnly} />
          <FormFieldInput name="drawnOn" label="Drawn On" disabled={readOnly} />
        </div>}
      </>}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {readOnly ? <FormFieldInput name="remarkName" label="Remark" disabled /> : <FormFieldCategoryOption name="remarkOptionId" label="Remark" code={CategoryOptionCodeEnum.VoucherRemark} isCreatable />}
        <FormFieldTextarea name="narration" label="Narration" disabled={readOnly} />
      </div>
    </CardSection>
    <CardSection heading="Items">
      <div className="space-y-3">
        {fields.map((field, index) => <div key={field.id} className="grid gap-3 rounded-lg border p-3 md:grid-cols-2 lg:grid-cols-8">
          <FormFieldInput name={`items.${index}.lineNumber`} label="Sr. No." disabled value={String(index + 1)} />
          {readOnly ? <FormFieldInput name={`items.${index}.itemTypeName`} label="Type" disabled /> : <FormFieldCategoryOption name={`items.${index}.itemTypeOptionId`} label="Type" code={CategoryOptionCodeEnum.VoucherItemType} isCreatable={false} />}
          {readOnly ? <FormFieldInput name={`items.${index}.subledgerCode`} label="Sub Ledger Code" disabled /> : <FormFieldSelect name={`items.${index}.subledgerPartyProfileId`} label="Sub Ledger Code" loadOptions={optionFilter(subledgerOptions)} defaultOptions={subledgerOptions} disabled={type !== 'JOURNAL' && !partyProfileId} />}
          {readOnly ? <FormFieldInput name={`items.${index}.accountCode`} label="Account Code" disabled /> : <FormFieldSelect name={`items.${index}.accountId`} label="Account Code" loadOptions={optionFilter(accountOptions)} defaultOptions={accountOptions} />}
          <FormFieldInput name={`items.${index}.accountName`} label="Account Name" disabled />
          <FormFieldSelect name={`items.${index}.direction`} label="Sign" loadOptions={optionFilter([{ value: 'DEBIT', label: 'Debit' }, { value: 'CREDIT', label: 'Credit' }])} defaultOptions={[{ value: 'DEBIT', label: 'Debit' }, { value: 'CREDIT', label: 'Credit' }]} disabled={readOnly} />
          <FormFieldInput name={`items.${index}.amount`} label="Amount" type="number" valueTransform="none" disabled={readOnly} />
          {!readOnly && <Button type="button" variant="outline" onClick={() => remove(index)} disabled={fields.length === 1}>Remove</Button>}
        </div>)}
      </div>
      {!readOnly && <Button className="mt-3" type="button" variant="outline" onClick={() => append({ itemTypeOptionId: '', subledgerPartyProfileId: '', accountId: '', accountName: '', direction: 'DEBIT', amount: '' })}>Add Item</Button>}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <FormFieldInput name="totalDebitDisplay" label="Total Debit" disabled value={(totals.debit / 100).toFixed(2)} />
        <FormFieldInput name="totalCreditDisplay" label="Total Credit" disabled value={(totals.credit / 100).toFixed(2)} />
        <FormFieldInput name="finalAmountDisplay" label={type === 'JOURNAL' ? 'Difference' : 'Final Amount'} disabled value={(final / 100).toFixed(2)} />
      </div>
    </CardSection>
  </div>;
};

export const VoucherForm = ({ type, defaultValues, readOnly = false, onSubmit, onBack, cashControlAccountId, minDate, maxDate, policyTransactionDate, onBranchChange, submitDisabled = false }: Props) => (
  <Form<VoucherFormValues>
    id={`${type.toLowerCase()}-voucher-form`}
    defaultValues={defaultValues}
    resolver={yupResolver(voucherSchema(type)) as never}
    mode="onChange"
    onSubmit={onSubmit}
    onError={errors => {
      const itemMessage = (errors.items as { message?: string } | undefined)?.message;
      const narrationMessage = errors.narration?.message;
      toast.error(String(itemMessage ?? narrationMessage ?? (type === 'JOURNAL' ? 'Journal Voucher difference must be 0.00 before saving.' : 'Please correct the highlighted voucher fields.')));
    }}
    footer={{ submitLabel: `Save ${VOUCHER_LABELS[type]}`, backLabel: 'Back', onBackClick: onBack, showSubmit: !readOnly, isSubmitDisabled: submitDisabled }}
  >
    <VoucherFields type={type} readOnly={readOnly} cashControlAccountId={cashControlAccountId} minDate={minDate} maxDate={maxDate} policyTransactionDate={policyTransactionDate} onBranchChange={onBranchChange} />
  </Form>
);
