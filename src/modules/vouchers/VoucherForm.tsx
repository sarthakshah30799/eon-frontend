import { useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { TrashIcon } from '@heroicons/react/24/outline';
import {
  Button,
  CardSection,
  type AsyncSelectOption,
  type AsyncSelectResponse,
} from '@/components/ui';
import {
  Form,
  FormFieldCategoryOption,
  FormFieldDatePicker,
  FormFieldInput,
  FormFieldSelect,
  FormFieldTextarea,
} from '@/components/forms';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { useListAccountProfiles } from '@/modules/accountProfile/hooks';
import { useListPartyProfiles } from '@/modules/partyProfiles/hooks';
import { useCategoryOptions } from '@/hooks';
import { PartyProfileTypeEnum } from '@/modules/partyProfiles/types/partyProfileTypes';
import { AccountProfileLedgerLabelEnum } from '@/modules/accountProfile';
import { PurchaseWorkplaceFields } from '@/modules/purchase/components/PurchaseWorkplaceFields';
import type {
  OutstandingBill,
  VoucherAccountMode,
  VoucherFormValues,
  VoucherType,
} from './types';
import {
  DEPOSIT_WITHDRAWAL_TEXT,
  OUTSTANDING_BILL_TEXT,
  VOUCHER_FORM_TEXT,
  VOUCHER_LABELS,
} from './constants';
import { SelectOutstandingBills } from './components/SelectOutstandingBills';
import { useVoucherItemTypeCategoryOptions, useVoucherNextNumber } from './hooks';
import { useVoucherPanVerification } from './useVoucherPanVerification';
import {
  formatVoucherDateInput,
  getVoucherItemTypeValueById,
  isVoucherAccountItemTypeValue,
  isVoucherBillItemTypeValue,
  isVoucherIndividualSelection,
  voucherBillDirection,
} from './utils';
import { useListAdditionalSettings } from '@/modules/additionalSettings/hooks';
import { AdditionalSettingsCodeEnum } from '@/modules/additionalSettings/constants';
import { getAdditionalSettingTextValue } from '@/modules/additionalSettings/utils';

const modeFromLabel = (label: string): VoucherAccountMode => {
  const value = label.toUpperCase().replace(/[ /-]+/g, '_');
  if (value.includes('BANK') || value.includes('CHEQUE')) return 'BANK_CHEQUE';
  if (value.includes('PETTY')) return 'PETTY_CASH';
  if (value.includes('CREDIT')) return 'CREDIT_CARD';
  return 'CASH';
};

const optionFilter =
  <T extends AsyncSelectOption>(options: T[]) =>
  async (input: string): Promise<AsyncSelectResponse> => ({
    options: options.filter(option =>
      option.label.toLowerCase().includes(input.trim().toLowerCase())
    ),
  });

const toCents = (value: unknown) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? Math.round(numeric * 100) : 0;
};

const isPartyVoucherType = (type: VoucherType) =>
  type === 'RECEIPT' || type === 'PAYMENT';

const isDepositWithdrawalType = (type: VoucherType) =>
  type === 'DEPOSIT_WITHDRAWAL';

const voucherSchema = (type: VoucherType) => {
  const partyVoucher = isPartyVoucherType(type);
  const depositWithdrawal = isDepositWithdrawalType(type);

  return yup.object({
    transactionDate: yup.string().required('Transaction date is required'),
    branchId: yup.string().required('Branch is required'),
    counterId: yup.string().required('Counter is required'),
    accountTypeOptionId: yup.string().when([], {
      is: () => partyVoucher,
      then: schema => schema.required('A/C Type is required'),
    }),
    headerAccountId: yup.string().when([], {
      is: () => partyVoucher,
      then: schema => schema.required('A/C Code is required'),
    }),
    entityTypeOptionId: yup.string().when([], {
      is: () => partyVoucher,
      then: schema => schema.required('Party Type is required'),
    }),
    partyProfileId: yup.string().when([], {
      is: () => partyVoucher,
      then: schema => schema.required('Party Code is required'),
    }),
    panNumber: yup
      .string()
      .trim()
      .optional()
      .nullable()
      .test(
        'pan-format',
        'PAN Number must be a valid 10-character Indian PAN',
        value => {
          if (!value) return true;
          return /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(value);
        }
      ),
    panName: yup.string().trim().optional().nullable(),
    panDob: yup.string().trim().optional().nullable(),
    chequeNumber: yup.string().when(['accountMode'], {
      is: (accountMode: string) =>
        depositWithdrawal || accountMode === 'BANK_CHEQUE',
      then: schema => schema.required('Cheque number is required'),
    }),
    chequeDate: yup.string().when(['accountMode'], {
      is: (accountMode: string) =>
        depositWithdrawal || accountMode === 'BANK_CHEQUE',
      then: schema => schema.required('Cheque date is required'),
    }),
    chequeBranch: yup.string().when('accountMode', {
      is: (accountMode: string) =>
        partyVoucher && accountMode === 'BANK_CHEQUE',
      then: schema => schema.required('Branch is required'),
    }),
    drawnOn: yup.string().when('accountMode', {
      is: (accountMode: string) =>
        partyVoucher && accountMode === 'BANK_CHEQUE',
      then: schema => schema.required('Drawn on is required'),
    }),
    narration: yup.string().trim().required('Narration is required'),
    items: depositWithdrawal
      ? yup
          .array()
          .of(
            yup.object({
              itemTypeOptionId: yup.string().required('Type is required'),
              itemTypeValue: yup.string().optional(),
              accountId: yup.string().optional().nullable(),
              direction: yup
                .string()
                .oneOf(['DEBIT', 'CREDIT'])
                .required('Sign is required'),
              amount: yup.string().optional().nullable(),
            })
          )
          .length(3, 'Deposit / Withdrawal requires three item rows')
          .required()
          .test(
            'deposit-withdrawal-lines',
            'Deposit / Withdrawal amounts and accounts are invalid',
            function validateDepositWithdrawal(rows) {
              const deposited = rows?.[0];
              const withdrawal = rows?.[1];
              const fee = rows?.[2];
              if (!deposited?.accountId)
                return this.createError({
                  message: 'Deposited in account is required',
                });
              if (!withdrawal?.accountId)
                return this.createError({
                  message: 'Withdrawal from account is required',
                });
              if (deposited.accountId === withdrawal.accountId)
                return this.createError({
                  message:
                    'Deposited in and Withdrawal from must use different accounts',
                });
              if (deposited.direction !== 'DEBIT')
                return this.createError({
                  message: 'Deposited in must be Debit',
                });
              if (withdrawal.direction !== 'CREDIT')
                return this.createError({
                  message: 'Withdrawal from must be Credit',
                });
              const depositedCents = toCents(deposited.amount);
              const withdrawalCents = toCents(withdrawal.amount);
              const feeRaw = String(fee?.amount ?? '').trim();
              const feeCents = feeRaw ? toCents(feeRaw) : 0;
              if (depositedCents <= 0 || withdrawalCents <= 0)
                return this.createError({
                  message:
                    'Deposited in and Withdrawal from amounts must be greater than zero',
                });
              if (feeRaw && feeCents <= 0)
                return this.createError({
                  message: 'Handling fee must be blank or greater than zero',
                });
              if (feeRaw && fee?.direction !== 'DEBIT')
                return this.createError({
                  message: 'Handling fee must be Debit',
                });
              if (depositedCents + feeCents !== withdrawalCents)
                return this.createError({
                  message:
                    'Withdrawal from must equal Deposited in plus optional Handling fee',
                });
              return true;
            }
          )
      : yup
          .array()
          .of(
            yup
              .object({
                itemTypeOptionId: yup.string().required('Type is required'),
                itemTypeValue: yup.string().optional(),
                subledgerPartyProfileId:
                  type === 'JOURNAL'
                    ? yup.string().nullable()
                    : yup.string().required('Sub ledger is required'),
                accountId: yup.string().when('itemTypeValue', {
                  is: (value: string | undefined) =>
                    isVoucherBillItemTypeValue(value),
                  then: schema => schema.optional().nullable(),
                  otherwise: schema => schema.required('Account is required'),
                }),
                settledTransactionId: yup.string().when('itemTypeValue', {
                  is: (value: string | undefined) =>
                    isVoucherBillItemTypeValue(value),
                  then: schema =>
                    schema.required('Outstanding bill is required'),
                  otherwise: schema => schema.optional().nullable(),
                }),
                direction: yup
                  .string()
                  .oneOf(['DEBIT', 'CREDIT'])
                  .required('Sign is required'),
                amount: yup
                  .string()
                  .test(
                    'positive',
                    'Amount must be positive',
                    value => Number(value) > 0
                  )
                  .required(),
              })
              .test(
                'journal-account-only',
                'Journal vouchers only support Account item lines',
                item =>
                  type !== 'JOURNAL' ||
                  isVoucherAccountItemTypeValue(item?.itemTypeValue)
              )
          )
          .min(1, 'At least one item is required')
          .required()
          .test(
            'voucher-totals',
            type === 'JOURNAL'
              ? 'Journal Voucher difference must be 0.00 and both totals must be positive.'
              : 'Final amount must be positive',
            rows => {
              const totals = (rows ?? []).reduce(
                (value, row) => {
                  value[row?.direction === 'CREDIT' ? 'credit' : 'debit'] +=
                    toCents(row?.amount);
                  return value;
                },
                { debit: 0, credit: 0 }
              );
              if (type === 'JOURNAL')
                return (
                  totals.debit > 0 &&
                  totals.credit > 0 &&
                  totals.debit === totals.credit
                );
              return type === 'RECEIPT'
                ? totals.credit - totals.debit > 0
                : totals.debit - totals.credit > 0;
            }
          ),
  });
};

interface Props {
  type: VoucherType;
  defaultValues: VoucherFormValues;
  readOnly?: boolean;
  minDate?: Date;
  maxDate?: Date;
  policyTransactionDate?: string;
  onBranchChange?: (branchId: string) => void;
  submitDisabled?: boolean;
  onSubmit: (values: VoucherFormValues) => Promise<void>;
  onBack: () => void;
}

const VoucherFields = ({
  type,
  readOnly,
  minDate,
  maxDate,
  policyTransactionDate,
  onBranchChange,
}: Pick<
  Props,
  | 'type'
  | 'readOnly'
  | 'minDate'
  | 'maxDate'
  | 'policyTransactionDate'
  | 'onBranchChange'
>) => {
  const form = useFormContext<VoucherFormValues>();
  const [outstandingModalIndex, setOutstandingModalIndex] = useState<
    number | null
  >(null);
  const mode = useWatch({ control: form.control, name: 'accountMode' });
  const accountTypeOptionId = useWatch({
    control: form.control,
    name: 'accountTypeOptionId',
  });
  const entityTypeOptionId = useWatch({
    control: form.control,
    name: 'entityTypeOptionId',
  });
  const partyProfileId = useWatch({
    control: form.control,
    name: 'partyProfileId',
  });
  const headerAccountId = useWatch({
    control: form.control,
    name: 'headerAccountId',
  });
  const transactionDate = useWatch({
    control: form.control,
    name: 'transactionDate',
  });
  const counterId = useWatch({ control: form.control, name: 'counterId' });
  const watchedItems = useWatch({ control: form.control, name: 'items' });
  const items = useMemo(() => watchedItems ?? [], [watchedItems]);
  const branchId = useWatch({ control: form.control, name: 'branchId' });
  const { data: nextNumber } = useVoucherNextNumber(type, branchId);
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  const itemTypeOptions = useCategoryOptions(
    CategoryOptionCodeEnum.VoucherItemType
  ).defaultOptions;
  const { data: itemTypeCategoryOptions = [] } =
    useVoucherItemTypeCategoryOptions();
  const journalItemTypeOptions = useMemo(
    () =>
      itemTypeCategoryOptions
        .filter(option => isVoucherAccountItemTypeValue(option.value))
        .map(option => ({
          value: option.id,
          label: option.label,
        })),
    [itemTypeCategoryOptions]
  );
  const accountTypeOptions = useCategoryOptions(
    CategoryOptionCodeEnum.VoucherAccountType
  ).defaultOptions;
  const entityTypeOptions = useCategoryOptions(
    CategoryOptionCodeEnum.EntityType
  ).defaultOptions;
  const lastPartyIdRef = useRef(form.getValues('partyProfileId') || '');
  const adultDobMaxDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
  }, []);
  const { data: accountResponse, isLoading: accountsLoading } =
    useListAccountProfiles({
    active: true,
    limit: 100,
    ...(type === 'RECEIPT'
      ? { receipt: true }
      : type === 'PAYMENT'
        ? { payment: true }
        : type === 'DEPOSIT_WITHDRAWAL'
          ? {}
          : { journalVoucher: true }),
  });
  const { data: headerAccountResponse } = useListAccountProfiles({
    active: true,
    limit: 100,
  });
  const { data: additionalSettings = [] } = useListAdditionalSettings();
  const handlingFeeControlAccountId = useMemo(
    () =>
      getAdditionalSettingTextValue(
        additionalSettings,
        AdditionalSettingsCodeEnum.TransactionAccounting,
        AdditionalSettingsCodeEnum.HandlingChargeAccount,
        ''
      ),
    [additionalSettings]
  );
  const allPartyTypes = Object.values(PartyProfileTypeEnum);
  const { data: partyResponse } = useListPartyProfiles(
    {
      limit: 100,
      activeOnly: true,
      status: 'APPROVE',
      entityTypeId: entityTypeOptionId || undefined,
    },
    allPartyTypes
  );
  const parties = useMemo(() => partyResponse?.data ?? [], [partyResponse]);
  const selectedParty = parties.find(party => party.id === partyProfileId);
  const { data: subledgerResponse } = useListPartyProfiles(
    {
      limit: 100,
      activeOnly: true,
      status: 'APPROVE',
      entityTypeId:
        type === 'JOURNAL' ? undefined : entityTypeOptionId || undefined,
      groupId: type === 'JOURNAL' ? undefined : selectedParty?.group?.id,
    },
    allPartyTypes,
    type === 'JOURNAL' || Boolean(selectedParty)
  );

  const accounts = useMemo(
    () =>
      (accountResponse?.data ?? []).filter(account => {
        const isInr =
          String(account.currencyCode ?? account.currency?.currencyCode ?? '')
            .trim()
            .toUpperCase() === 'INR';
        if (!isInr) return false;
        if (type !== 'DEPOSIT_WITHDRAWAL') return true;
        const ledgerTypes = [
          account.accountType?.value,
          account.accountType?.label,
        ].map(value =>
          String(value ?? '')
            .trim()
            .toUpperCase()
        );
        return (
          ledgerTypes.includes(AccountProfileLedgerLabelEnum.CashLedger) ||
          ledgerTypes.includes(AccountProfileLedgerLabelEnum.BankLedger)
        );
      }),
    [accountResponse, type]
  );
  const allHeaderAccounts = useMemo(
    () =>
      (headerAccountResponse?.data ?? []).filter(
        account =>
          String(account.currencyCode ?? account.currency?.currencyCode ?? '')
            .trim()
            .toUpperCase() === 'INR'
      ),
    [headerAccountResponse]
  );
  const headerAccounts = useMemo(
    () =>
      allHeaderAccounts.filter(account => {
        const ledgerTypes = [
          account.accountType?.value,
          account.accountType?.label,
        ].map(value =>
          String(value ?? '')
            .trim()
            .toUpperCase()
        );
        if (mode === 'CASH')
          return ledgerTypes.includes(AccountProfileLedgerLabelEnum.CashLedger);
        if (mode === 'BANK_CHEQUE')
          return ledgerTypes.includes(AccountProfileLedgerLabelEnum.BankLedger);
        return true;
      }),
    [allHeaderAccounts, mode]
  );
  const accountOptions = useMemo(
    () =>
      accounts.map(account => ({
        value: account.id,
        label: `${account.accountCode} - ${account.accountName}`,
      })),
    [accounts]
  );
  const handlingFeeAccountLabel = useMemo(() => {
    const account = (headerAccountResponse?.data ?? []).find(
      item => item.id === handlingFeeControlAccountId
    );
    if (!account) return DEPOSIT_WITHDRAWAL_TEXT.feeAccountHint;
    return `${account.accountCode} - ${account.accountName}`;
  }, [handlingFeeControlAccountId, headerAccountResponse]);
  const headerAccountOptions = useMemo(
    () =>
      headerAccounts.map(account => ({
        value: account.id,
        label: `${account.accountCode} - ${account.accountName}`,
      })),
    [headerAccounts]
  );
  const partyOptions = useMemo(
    () =>
      parties.map(party => ({
        value: party.id,
        label: `${party.code} - ${party.name}`,
      })),
    [parties]
  );
  const subledgerParties =
    type === 'JOURNAL'
      ? (subledgerResponse?.data ?? [])
      : selectedParty?.group
        ? (subledgerResponse?.data ?? [])
        : selectedParty
          ? [selectedParty]
          : [];
  const subledgerOptions = subledgerParties.map(party => ({
    value: party.id,
    label: `${party.code} - ${party.name}`,
  }));
  const selectedEntityTypeOption = entityTypeOptions.find(
    option => String(option.value) === String(entityTypeOptionId)
  );
  const isIndividualSelection = isVoucherIndividualSelection({
    entityType: selectedParty?.entityType ?? selectedEntityTypeOption,
    isIndividual: selectedParty?.isIndividual,
  });
  const panFieldsDisabled = Boolean(readOnly) || !isIndividualSelection;
  const {
    status: panVerificationStatus,
    message: panVerificationMessage,
    isVerifyingPan,
    handlePanKeyDown,
    resetPanVerification,
  } = useVoucherPanVerification(!panFieldsDisabled);

  useEffect(() => {
    onBranchChange?.(branchId ?? '');
  }, [branchId, onBranchChange]);
  useEffect(() => {
    if (!readOnly && policyTransactionDate)
      form.setValue('transactionDate', policyTransactionDate, {
        shouldDirty: false,
        shouldValidate: true,
      });
  }, [form, policyTransactionDate, readOnly]);
  useEffect(() => {
    const nextPartyId = selectedParty?.id ?? '';
    if (nextPartyId === lastPartyIdRef.current) {
      if (selectedParty) {
        form.setValue('partyName', selectedParty.name, {
          shouldValidate: false,
        });
      }
      return;
    }

    lastPartyIdRef.current = nextPartyId;
    form.setValue('partyName', selectedParty?.name ?? '', {
      shouldValidate: false,
    });
    form.setValue('panNumber', selectedParty?.panNo ?? '', {
      shouldValidate: false,
    });
    form.setValue('panName', selectedParty?.panName ?? '', {
      shouldValidate: false,
    });
    form.setValue('panDob', formatVoucherDateInput(selectedParty?.panDob), {
      shouldValidate: false,
    });
    // Edit/view is immutable; do not wipe settled bill lines when party options load.
    if (readOnly) {
      return;
    }
    const currentItems = form.getValues('items') ?? [];
    currentItems.forEach((item, index) => {
      const itemTypeValue =
        item.itemTypeValue ||
        getVoucherItemTypeValueById(
          item.itemTypeOptionId,
          itemTypeCategoryOptions
        );
      if (!isVoucherBillItemTypeValue(itemTypeValue)) {
        return;
      }
      form.setValue(`items.${index}.settledTransactionId`, '', {
        shouldValidate: true,
      });
      form.setValue(`items.${index}.settledTransactionNumber`, '', {
        shouldValidate: false,
      });
      form.setValue(`items.${index}.amount`, '', { shouldValidate: true });
      form.setValue(
        `items.${index}.subledgerPartyProfileId`,
        nextPartyId,
        { shouldValidate: true }
      );
    });
    resetPanVerification();
  }, [form, itemTypeCategoryOptions, readOnly, resetPanVerification, selectedParty]);
  useEffect(() => {
    const selected = accountTypeOptions.find(
      option => String(option.value) === String(accountTypeOptionId)
    );
    if (!selected) return;
    const nextMode = modeFromLabel(selected.label);
    if (nextMode === mode) return;
    form.setValue('accountMode', nextMode);
    form.setValue('headerAccountId', '');
    form.setValue('headerAccountName', '');
    if (nextMode !== 'BANK_CHEQUE') {
      form.setValue('chequeNumber', '');
      form.setValue('chequeDate', '');
      form.setValue('chequeBranch', '');
      form.setValue('drawnOn', '');
    }
  }, [accountTypeOptionId, accountTypeOptions, form, mode]);
  useEffect(() => {
    const account = headerAccounts.find(item => item.id === headerAccountId);
    form.setValue('headerAccountName', account?.accountName ?? '', {
      shouldValidate: false,
    });
  }, [form, headerAccountId, headerAccounts]);
  useEffect(() => {
    if (!readOnly && nextNumber)
      form.setValue('number', nextNumber, { shouldDirty: false });
  }, [form, nextNumber, readOnly]);
  useEffect(() => {
    if (type !== 'DEPOSIT_WITHDRAWAL' || readOnly) return;
    const accountOption = itemTypeCategoryOptions.find(
      option => option.value.trim().toUpperCase() === 'ACCOUNT'
    );
    if (!accountOption) return;
    const directions = ['DEBIT', 'CREDIT', 'DEBIT'] as const;
    const labels = [
      DEPOSIT_WITHDRAWAL_TEXT.depositedIn,
      DEPOSIT_WITHDRAWAL_TEXT.withdrawalFrom,
      DEPOSIT_WITHDRAWAL_TEXT.handlingFee,
    ];
    directions.forEach((direction, index) => {
      form.setValue(`items.${index}.itemTypeOptionId`, accountOption.id, {
        shouldDirty: false,
      });
      form.setValue(`items.${index}.itemTypeValue`, 'ACCOUNT', {
        shouldDirty: false,
      });
      form.setValue(`items.${index}.itemTypeName`, labels[index], {
        shouldDirty: false,
      });
      form.setValue(`items.${index}.direction`, direction, {
        shouldDirty: false,
      });
      if (index === 2) {
        form.setValue(
          `items.${index}.accountId`,
          handlingFeeControlAccountId || '',
          { shouldDirty: false }
        );
        form.setValue(`items.${index}.accountName`, handlingFeeAccountLabel, {
          shouldDirty: false,
        });
      }
    });
  }, [
    form,
    handlingFeeAccountLabel,
    handlingFeeControlAccountId,
    itemTypeCategoryOptions,
    readOnly,
    type,
  ]);
  useEffect(() => {
    const accountType = itemTypeOptions.find(
      option => option.label.toUpperCase() === 'ACCOUNT'
    );
    items.forEach((item, index) => {
      const itemTypeValue =
        item.itemTypeValue ||
        getVoucherItemTypeValueById(
          item.itemTypeOptionId,
          itemTypeCategoryOptions
        );
      if (itemTypeValue && item.itemTypeValue !== itemTypeValue) {
        form.setValue(`items.${index}.itemTypeValue`, itemTypeValue, {
          shouldDirty: false,
        });
      }
      if (
        !item.itemTypeOptionId &&
        accountType
      ) {
        form.setValue(
          `items.${index}.itemTypeOptionId`,
          String(accountType.value),
          { shouldDirty: false }
        );
        form.setValue(`items.${index}.itemTypeValue`, 'ACCOUNT', {
          shouldDirty: false,
        });
      }
      if (!isVoucherBillItemTypeValue(itemTypeValue)) {
        const account = accounts.find(value => value.id === item.accountId);
        if (account && item.accountName !== account.accountName) {
          form.setValue(`items.${index}.accountName`, account.accountName, {
            shouldDirty: false,
          });
        }
      }
      if (
        isVoucherBillItemTypeValue(itemTypeValue) &&
        partyProfileId &&
        item.subledgerPartyProfileId !== partyProfileId
      ) {
        form.setValue(
          `items.${index}.subledgerPartyProfileId`,
          partyProfileId,
          { shouldDirty: false }
        );
      }
    });
  }, [
    accounts,
    form,
    itemTypeCategoryOptions,
    itemTypeOptions,
    items,
    partyProfileId,
    type,
  ]);

  const selectedSettledTransactionIds = useMemo(
    () =>
      items
        .map(item => item.settledTransactionId)
        .filter((id): id is string => Boolean(id)),
    [items]
  );

  const outstandingModalItem =
    outstandingModalIndex === null ? null : items[outstandingModalIndex];
  const outstandingModalItemTypeValue = outstandingModalItem
    ? outstandingModalItem.itemTypeValue ||
      getVoucherItemTypeValueById(
        outstandingModalItem.itemTypeOptionId,
        itemTypeCategoryOptions
      )
    : '';
  const outstandingModalItemTypeLabel =
    itemTypeCategoryOptions.find(
      option => option.value.toUpperCase() === outstandingModalItemTypeValue
    )?.label ?? '';
  const outstandingModalCurrentId =
    outstandingModalItem?.settledTransactionId ?? undefined;

  const createEmptyVoucherItem = (): VoucherFormValues['items'][number] => ({
    itemTypeOptionId: '',
    itemTypeValue: '',
    subledgerPartyProfileId: '',
    accountId: '',
    accountName: '',
    direction: 'DEBIT',
    amount: '',
    settledTransactionId: '',
    settledTransactionNumber: '',
  });

  const handleRemoveItem = (index: number) => {
    if (fields.length === 1) {
      form.setValue(`items.${index}`, createEmptyVoucherItem(), {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }
    remove(index);
  };

  const handleItemTypeChange = (index: number, itemTypeOptionId: string) => {
    const itemTypeValue = getVoucherItemTypeValueById(
      itemTypeOptionId,
      itemTypeCategoryOptions
    );
    form.setValue(`items.${index}.itemTypeValue`, itemTypeValue, {
      shouldValidate: true,
    });
    form.setValue(`items.${index}.settledTransactionId`, '', {
      shouldValidate: true,
    });
    form.setValue(`items.${index}.settledTransactionNumber`, '', {
      shouldValidate: false,
    });
    form.setValue(`items.${index}.accountId`, '', { shouldValidate: true });
    form.setValue(`items.${index}.accountName`, '', { shouldValidate: false });

    if (isVoucherBillItemTypeValue(itemTypeValue)) {
      form.setValue(
        `items.${index}.subledgerPartyProfileId`,
        partyProfileId ?? '',
        { shouldValidate: true }
      );
      const direction = voucherBillDirection(itemTypeValue);
      if (direction) {
        form.setValue(`items.${index}.direction`, direction, {
          shouldValidate: true,
        });
      }
      return;
    }

    if (type === 'JOURNAL' && !isVoucherAccountItemTypeValue(itemTypeValue)) {
      toast.error('Journal vouchers only support Account item lines');
      form.setValue(`items.${index}.itemTypeOptionId`, '', {
        shouldValidate: true,
      });
      form.setValue(`items.${index}.itemTypeValue`, '', {
        shouldValidate: true,
      });
    }
  };

  const applyOutstandingBills = (
    rowIndex: number,
    bills: OutstandingBill[]
  ) => {
    if (!bills.length) {
      return;
    }

    const currentItem = form.getValues(`items.${rowIndex}`);
    const itemTypeOptionId = currentItem.itemTypeOptionId;
    const itemTypeValue =
      currentItem.itemTypeValue ||
      getVoucherItemTypeValueById(itemTypeOptionId, itemTypeCategoryOptions);
    const direction = voucherBillDirection(itemTypeValue) ?? 'DEBIT';

    bills.forEach((bill, billIndex) => {
      const row = {
        itemTypeOptionId,
        itemTypeValue,
        subledgerPartyProfileId: partyProfileId ?? '',
        accountId: '',
        accountName: '',
        direction,
        amount: bill.outstanding,
        settledTransactionId: bill.id,
        settledTransactionNumber: bill.number,
      };

      if (billIndex === 0) {
        form.setValue(`items.${rowIndex}`, row, {
          shouldDirty: true,
          shouldValidate: true,
        });
        return;
      }

      append(row);
    });
    setOutstandingModalIndex(null);
  };

  const totals = items.reduce(
    (value, item) => {
      value[item.direction === 'DEBIT' ? 'debit' : 'credit'] += toCents(
        item.amount
      );
      return value;
    },
    { debit: 0, credit: 0 }
  );
  const final =
    type === 'RECEIPT'
      ? totals.credit - totals.debit
      : type === 'PAYMENT'
        ? totals.debit - totals.credit
        : totals.credit - totals.debit;

  return (
    <div className="space-y-3 [&_div.max-w-\[350px\]]:!max-w-none">
      <CardSection heading="Transaction">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="md:col-span-2 lg:col-span-2 [&_.grid]:gap-3">
            <PurchaseWorkplaceFields readOnly={readOnly} />
          </div>
          <FormFieldDatePicker
            name="transactionDate"
            label="Transaction Date"
            dateFormat="dd/MM/yyyy"
            minDate={minDate}
            maxDate={maxDate}
            disabled={readOnly}
          />
          <FormFieldInput name="number" label="Transaction Number" disabled />
        </div>
        {isDepositWithdrawalType(type) ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <FormFieldInput
              name="chequeNumber"
              label="Cheque Number"
              disabled={readOnly}
            />
            <FormFieldDatePicker
              name="chequeDate"
              label="Cheque Date"
              dateFormat="dd/MM/yyyy"
              disabled={readOnly}
            />
          </div>
        ) : null}
      </CardSection>

      {isPartyVoucherType(type) ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <CardSection heading="Account">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {readOnly ? (
                <FormFieldInput
                  name="accountTypeName"
                  label="A/C Type"
                  disabled
                />
              ) : (
                <FormFieldCategoryOption
                  name="accountTypeOptionId"
                  label="A/C Type"
                  code={CategoryOptionCodeEnum.VoucherAccountType}
                  isCreatable={false}
                />
              )}
              {readOnly ? (
                <FormFieldInput
                  name="headerAccountCode"
                  label="A/C Code"
                  disabled
                />
              ) : (
                <FormFieldSelect
                  name="headerAccountId"
                  label="A/C Code"
                  loadOptions={optionFilter(headerAccountOptions)}
                  defaultOptions={headerAccountOptions}
                />
              )}
              <FormFieldInput
                name="headerAccountName"
                label="A/C Name"
                disabled
              />
            </div>
            {mode === 'BANK_CHEQUE' ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <FormFieldInput
                  name="chequeNumber"
                  label="Cheque Number"
                  disabled={readOnly}
                />
                <FormFieldDatePicker
                  name="chequeDate"
                  label="Cheque Date"
                  dateFormat="dd/MM/yyyy"
                  disabled={readOnly}
                />
                <FormFieldInput
                  name="chequeBranch"
                  label="Branch"
                  disabled={readOnly}
                />
                <FormFieldInput
                  name="drawnOn"
                  label="Drawn On"
                  disabled={readOnly}
                />
              </div>
            ) : null}
          </CardSection>

          <CardSection heading="Party">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {readOnly ? (
                <FormFieldInput
                  name="entityTypeName"
                  label="Party Type"
                  disabled
                />
              ) : (
                <FormFieldCategoryOption
                  name="entityTypeOptionId"
                  label="Party Type"
                  code={CategoryOptionCodeEnum.EntityType}
                  isCreatable={false}
                />
              )}
              {readOnly ? (
                <FormFieldInput name="partyCode" label="Party Code" disabled />
              ) : (
                <FormFieldSelect
                  name="partyProfileId"
                  label="Party Code"
                  loadOptions={optionFilter(partyOptions)}
                  defaultOptions={partyOptions}
                  disabled={!entityTypeOptionId}
                />
              )}
              <FormFieldInput name="partyName" label="Party Name" disabled />
            </div>
            {isIndividualSelection ? (
              <>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <FormFieldInput
                    name="panNumber"
                    label={VOUCHER_FORM_TEXT.panNumber}
                    placeholder={VOUCHER_FORM_TEXT.panNumberPlaceholder}
                    valueTransform="uppercase"
                    disabled={panFieldsDisabled || isVerifyingPan}
                    onKeyDown={handlePanKeyDown}
                  />
                  <FormFieldInput
                    name="panName"
                    label={VOUCHER_FORM_TEXT.panName}
                    placeholder={VOUCHER_FORM_TEXT.panNamePlaceholder}
                    disabled={panFieldsDisabled || isVerifyingPan}
                    onKeyDown={handlePanKeyDown}
                  />
                  <FormFieldDatePicker
                    name="panDob"
                    label={VOUCHER_FORM_TEXT.panDob}
                    placeholder={VOUCHER_FORM_TEXT.panDobPlaceholder}
                    dateFormat="dd/MM/yyyy"
                    maxDate={adultDobMaxDate}
                    disabled={panFieldsDisabled || isVerifyingPan}
                    onKeyDown={handlePanKeyDown}
                  />
                </div>
                {!panFieldsDisabled ? (
                  <p
                    className={`mt-1 text-xs ${
                      panVerificationStatus === 'checking'
                        ? 'text-info-700'
                        : panVerificationStatus === 'valid'
                          ? 'text-success-700'
                          : panVerificationStatus === 'invalid'
                            ? 'text-error-600'
                            : 'text-text-secondary'
                    }`}
                  >
                    {panVerificationMessage ||
                      VOUCHER_FORM_TEXT.panVerifyIncomplete}
                  </p>
                ) : null}
              </>
            ) : null}
          </CardSection>
        </div>
      ) : null}

      <CardSection heading="Narration">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {readOnly ? (
            <FormFieldInput name="remarkName" label="Remark" disabled />
          ) : (
            <FormFieldCategoryOption
              name="remarkOptionId"
              label="Remark"
              code={CategoryOptionCodeEnum.VoucherRemark}
              isCreatable
            />
          )}
          <FormFieldTextarea
            name="narration"
            label="Narration"
            disabled={readOnly}
            rows={2}
            wrapperClassName="max-w-none md:col-span-1 lg:col-span-3"
          />
        </div>
      </CardSection>

      <CardSection
        heading="Items"
        headerActions={
          !readOnly && !isDepositWithdrawalType(type) ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(createEmptyVoucherItem())}
            >
              Add Item
            </Button>
          ) : null
        }
      >
        <div className="overflow-x-auto">
          {isDepositWithdrawalType(type) ? (
            <div className="min-w-[52rem] space-y-1">
              <div className="grid grid-cols-[2rem_minmax(0,1.2fr)_minmax(0,1.35fr)_minmax(0,1.35fr)_minmax(7.5rem,0.9fr)_minmax(8.5rem,1fr)] gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                <div>#</div>
                <div>Line</div>
                <div>Account Code</div>
                <div>Account Name</div>
                <div>Sign</div>
                <div>Amount</div>
              </div>
              {fields.map((field, index) => {
                const rowLabel =
                  index === 0
                    ? DEPOSIT_WITHDRAWAL_TEXT.depositedIn
                    : index === 1
                      ? DEPOSIT_WITHDRAWAL_TEXT.withdrawalFrom
                      : DEPOSIT_WITHDRAWAL_TEXT.handlingFee;
                const isFeeRow = index === 2;
                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-[2rem_minmax(0,1.2fr)_minmax(0,1.35fr)_minmax(0,1.35fr)_minmax(7.5rem,0.9fr)_minmax(8.5rem,1fr)] items-center gap-2 rounded-md border border-border-secondary px-2 py-1.5 [&_.space-y-2]:space-y-0"
                  >
                    <div className="text-center text-xs text-text-tertiary">
                      {index + 1}
                    </div>
                    <div>
                      <FormFieldInput
                        name={`items.${index}.itemTypeName`}
                        disabled
                        value={rowLabel}
                        aria-label={`Line ${index + 1}`}
                      />
                    </div>
                    <div>
                      {isFeeRow ? (
                        <FormFieldInput
                          name={`items.${index}.accountName`}
                          disabled
                          value={handlingFeeAccountLabel}
                          aria-label="Account"
                        />
                      ) : readOnly ? (
                        <FormFieldInput
                          name={`items.${index}.accountCode`}
                          disabled
                          aria-label="Account Code"
                        />
                      ) : (
                        <FormFieldSelect
                          name={`items.${index}.accountId`}
                          loadOptions={optionFilter(accountOptions)}
                          defaultOptions={accountOptions}
                          isLoading={accountsLoading}
                          placeholder="Account Code"
                          aria-label="Account Code"
                        />
                      )}
                    </div>
                    <div>
                      {isFeeRow ? (
                        <span className="text-xs text-text-tertiary">—</span>
                      ) : (
                        <FormFieldInput
                          name={`items.${index}.accountName`}
                          disabled
                          aria-label="Account Name"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <FormFieldSelect
                        name={`items.${index}.direction`}
                        loadOptions={optionFilter([
                          { value: 'DEBIT', label: 'Debit' },
                          { value: 'CREDIT', label: 'Credit' },
                        ])}
                        defaultOptions={[
                          { value: 'DEBIT', label: 'Debit' },
                          { value: 'CREDIT', label: 'Credit' },
                        ]}
                        disabled
                        aria-label="Sign"
                      />
                    </div>
                    <div>
                      <FormFieldInput
                        name={`items.${index}.amount`}
                        type="number"
                        valueTransform="none"
                        disabled={readOnly}
                        placeholder={isFeeRow ? 'Optional' : 'Amount'}
                        aria-label="Amount"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="min-w-[64rem] space-y-1">
              <div className="grid grid-cols-[2rem_minmax(0,1.15fr)_minmax(0,1.15fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(7.5rem,0.9fr)_minmax(8.5rem,1fr)_2.25rem] gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                <div>#</div>
                <div>Type</div>
                <div>Sub Ledger</div>
                <div>Account / Bill</div>
                <div>Account Name</div>
                <div>Sign</div>
                <div>Amount</div>
                <div />
              </div>
              {fields.map((field, index) => {
                const itemTypeValue =
                  items[index]?.itemTypeValue ||
                  getVoucherItemTypeValueById(
                    items[index]?.itemTypeOptionId ?? '',
                    itemTypeCategoryOptions
                  );
                const isBillLine = isVoucherBillItemTypeValue(itemTypeValue);
                const isBillLineLocked =
                  isBillLine && Boolean(items[index]?.settledTransactionId);

                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-[2rem_minmax(0,1.15fr)_minmax(0,1.15fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(7.5rem,0.9fr)_minmax(8.5rem,1fr)_2.25rem] items-center gap-2 rounded-md border border-border-secondary px-2 py-1.5 [&_.space-y-2]:space-y-0"
                  >
                    <div className="text-center text-xs text-text-tertiary">
                      {index + 1}
                    </div>
                    <div>
                      {readOnly ? (
                        <FormFieldInput
                          name={`items.${index}.itemTypeName`}
                          disabled
                          aria-label="Type"
                        />
                      ) : type === 'JOURNAL' ? (
                        <FormFieldSelect
                          name={`items.${index}.itemTypeOptionId`}
                          loadOptions={optionFilter(journalItemTypeOptions)}
                          defaultOptions={journalItemTypeOptions}
                          placeholder="Type"
                          aria-label="Type"
                          onValueChange={value =>
                            handleItemTypeChange(
                              index,
                              Array.isArray(value)
                                ? String(value[0] ?? '')
                                : (value ?? '')
                            )
                          }
                        />
                      ) : (
                        <FormFieldCategoryOption
                          name={`items.${index}.itemTypeOptionId`}
                          code={CategoryOptionCodeEnum.VoucherItemType}
                          isCreatable={false}
                          placeholder="Type"
                          aria-label="Type"
                          onValueChange={value =>
                            handleItemTypeChange(
                              index,
                              Array.isArray(value)
                                ? String(value[0] ?? '')
                                : (value ?? '')
                            )
                          }
                        />
                      )}
                    </div>
                    <div>
                      {readOnly ? (
                        <FormFieldInput
                          name={`items.${index}.subledgerCode`}
                          disabled
                          aria-label="Sub Ledger"
                        />
                      ) : (
                        <FormFieldSelect
                          name={`items.${index}.subledgerPartyProfileId`}
                          loadOptions={optionFilter(subledgerOptions)}
                          defaultOptions={subledgerOptions}
                          placeholder="Sub Ledger"
                          aria-label="Sub Ledger"
                          disabled={
                            isBillLine ||
                            (type !== 'JOURNAL' && !partyProfileId)
                          }
                        />
                      )}
                    </div>
                    <div>
                      {isBillLine ? (
                        readOnly ? (
                          <FormFieldInput
                            name={`items.${index}.settledTransactionNumber`}
                            disabled
                            aria-label={OUTSTANDING_BILL_TEXT.settledBill}
                          />
                        ) : (
                          <div className="flex items-center gap-1">
                            <div className="min-w-0 flex-1">
                              <FormFieldInput
                                name={`items.${index}.settledTransactionNumber`}
                                disabled
                                placeholder="Bill"
                                aria-label={OUTSTANDING_BILL_TEXT.settledBill}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="shrink-0 px-2"
                              disabled={!isBillLine || !partyProfileId}
                              onClick={() => setOutstandingModalIndex(index)}
                            >
                              Select
                            </Button>
                          </div>
                        )
                      ) : readOnly ? (
                        <FormFieldInput
                          name={`items.${index}.accountCode`}
                          disabled
                          aria-label="Account Code"
                        />
                      ) : (
                        <FormFieldSelect
                          name={`items.${index}.accountId`}
                          loadOptions={optionFilter(accountOptions)}
                          defaultOptions={accountOptions}
                          placeholder="Account Code"
                          aria-label="Account Code"
                        />
                      )}
                    </div>
                    <div>
                      {isBillLine ? (
                        <span className="text-xs text-text-tertiary">—</span>
                      ) : (
                        <FormFieldInput
                          name={`items.${index}.accountName`}
                          disabled
                          aria-label="Account Name"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <FormFieldSelect
                        name={`items.${index}.direction`}
                        loadOptions={optionFilter([
                          { value: 'DEBIT', label: 'Debit' },
                          { value: 'CREDIT', label: 'Credit' },
                        ])}
                        defaultOptions={[
                          { value: 'DEBIT', label: 'Debit' },
                          { value: 'CREDIT', label: 'Credit' },
                        ]}
                        disabled={readOnly || isBillLine}
                        aria-label="Sign"
                      />
                    </div>
                    <div>
                      <FormFieldInput
                        name={`items.${index}.amount`}
                        type="number"
                        valueTransform="none"
                        disabled={readOnly || isBillLineLocked}
                        placeholder="0.00"
                        aria-label="Amount"
                      />
                    </div>
                    <div className="flex justify-end">
                      {!readOnly ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                          aria-label={`Remove item ${index + 1}`}
                        >
                          <TrashIcon className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-border-secondary pt-3 md:gap-4">
          <div className="min-w-[8rem] flex-1 sm:max-w-[11rem]">
            <FormFieldInput
              name="totalDebitDisplay"
              label="Total Debit"
              disabled
              value={(totals.debit / 100).toFixed(2)}
            />
          </div>
          <div className="min-w-[8rem] flex-1 sm:max-w-[11rem]">
            <FormFieldInput
              name="totalCreditDisplay"
              label="Total Credit"
              disabled
              value={(totals.credit / 100).toFixed(2)}
            />
          </div>
          <div className="min-w-[8rem] flex-1 sm:max-w-[11rem]">
            <FormFieldInput
              name="finalAmountDisplay"
              label={
                type === 'JOURNAL' || type === 'DEPOSIT_WITHDRAWAL'
                  ? 'Difference'
                  : 'Final Amount'
              }
              disabled
              value={(final / 100).toFixed(2)}
            />
          </div>
        </div>
      </CardSection>

      {outstandingModalIndex !== null &&
      (type === 'RECEIPT' || type === 'PAYMENT') ? (
        <SelectOutstandingBills
          open
          type={type}
          params={{
            partyProfileId: partyProfileId ?? '',
            slug: outstandingModalItemTypeValue,
            branchId: branchId ?? '',
            counterId: counterId ?? '',
            transactionDate: transactionDate ?? '',
          }}
          itemTypeLabel={outstandingModalItemTypeLabel}
          excludedTransactionIds={selectedSettledTransactionIds.filter(
            id => id !== outstandingModalCurrentId
          )}
          selectedTransactionIds={
            outstandingModalCurrentId ? [outstandingModalCurrentId] : []
          }
          onContinue={bills =>
            applyOutstandingBills(outstandingModalIndex, bills)
          }
          onClose={() => setOutstandingModalIndex(null)}
        />
      ) : null}
    </div>
  );
};

export const VoucherForm = ({
  type,
  defaultValues,
  readOnly = false,
  onSubmit,
  onBack,
  minDate,
  maxDate,
  policyTransactionDate,
  onBranchChange,
  submitDisabled = false,
}: Props) => (
  <Form<VoucherFormValues>
    id={`${type.toLowerCase()}-voucher-form`}
    defaultValues={defaultValues}
    resolver={yupResolver(voucherSchema(type)) as never}
    mode="onChange"
    onSubmit={onSubmit}
    onError={errors => {
      const itemMessage = (errors.items as { message?: string } | undefined)
        ?.message;
      const narrationMessage = errors.narration?.message;
      toast.error(
        String(
          itemMessage ??
            narrationMessage ??
            (type === 'JOURNAL'
              ? 'Journal Voucher difference must be 0.00 before saving.'
              : 'Please correct the highlighted voucher fields.')
        )
      );
    }}
    footer={{
      submitLabel: `Save ${VOUCHER_LABELS[type]}`,
      backLabel: 'Back',
      onBackClick: onBack,
      showSubmit: !readOnly,
      isSubmitDisabled: submitDisabled,
    }}
  >
    <VoucherFields
      type={type}
      readOnly={readOnly}
      minDate={minDate}
      maxDate={maxDate}
      policyTransactionDate={policyTransactionDate}
      onBranchChange={onBranchChange}
    />
  </Form>
);
