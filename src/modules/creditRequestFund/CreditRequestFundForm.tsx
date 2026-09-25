import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';
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
import { AccountProfileLedgerLabelEnum } from '@/modules/accountProfile';
import { useLoadBranchOptions } from '@/modules/branchProfile/hooks';
import { useListPartyProfiles } from '@/modules/partyProfiles/hooks';
import { PartyProfileTypeEnum } from '@/modules/partyProfiles/types/partyProfileTypes';
import { PurchaseWorkplaceFields } from '@/modules/purchase/components/PurchaseWorkplaceFields';
import { useCategoryOptions } from '@/hooks';
import { categoryOptionsApi } from '@/api/categoryOptions';
import { useQuery } from '@tanstack/react-query';
import {
  TransactionPaymentMethodEnum,
  getTransactionPaymentMethodOptions,
  isNonChequeBankPaymentMethod,
} from '@/modules/transactions';
import {
  isVoucherAccountItemTypeValue,
  isVoucherIndividualSelection,
  paymentMethodForVoucherAccountMode,
  formatVoucherDateInput,
  getVoucherItemTypeValueById,
} from '@/modules/vouchers/utils';
import type { VoucherAccountMode } from '@/modules/vouchers/types';
import { usePassengerAmlVerification } from '@/modules/passengers/hooks';
import {
  PassengerEntityTypeEnum,
  PassengerNationalityTypeEnum,
} from '@/modules/passengers/types/passengerTypes';
import {
  CREDIT_REQUEST_FUND_LABELS,
} from './constants';
import { useCreditRequestFundNextNumber } from './hooks';
import type { CreditRequestFundFormValues } from './types';
import { createEmptyCreditRequestFundItem } from './utils';
import type { IAccountProfile } from '@/modules/accountProfile/types/accountProfileTypes';

type SubledgerKind = 'NONE' | 'PARTY' | 'BRANCH';
type PanVerificationStatus = 'idle' | 'checking' | 'valid' | 'invalid';

const toLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const modeFromAccountTypeValue = (value: string): VoucherAccountMode => {
  const normalized = String(value ?? '')
    .toUpperCase()
    .replace(/[ /-]+/g, '_');
  if (
    normalized === 'BANK_CHEQUE' ||
    normalized.includes('BANK') ||
    normalized.includes('CHEQUE')
  )
    return 'BANK_CHEQUE';
  if (normalized === 'PETTY_CASH' || normalized.includes('PETTY'))
    return 'PETTY_CASH';
  if (normalized === 'CREDIT_CARD' || normalized.includes('CREDIT'))
    return 'CREDIT_CARD';
  return 'CASH';
};

const normalizeUpper = (value?: string | null) =>
  String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

const resolveSubledgerKind = (account?: IAccountProfile | null): SubledgerKind => {
  if (!account) return 'PARTY';
  const accountType = normalizeUpper(
    account.accountType?.value ?? account.accountType?.label
  );
  const subNature = normalizeUpper(
    account.subLedger?.value ?? account.subLedger?.label
  );
  if (
    accountType.includes('GENERAL') ||
    (!account.subLedger && accountType.includes('GENERAL_LEDGER'))
  ) {
    if (!account.subLedger) return 'NONE';
  }
  if (!account.subLedger) return 'PARTY';
  if (subNature === 'B' || subNature.includes('BRANCH')) return 'BRANCH';
  return 'PARTY';
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

const collectFormErrorMessages = (value: unknown, messages: string[] = []) => {
  if (!value || typeof value !== 'object') {
    return messages;
  }
  if (
    'message' in value &&
    typeof (value as { message?: unknown }).message === 'string' &&
    (value as { message: string }).message.trim()
  ) {
    messages.push((value as { message: string }).message.trim());
  }
  Object.values(value as Record<string, unknown>).forEach(child => {
    collectFormErrorMessages(child, messages);
  });
  return messages;
};

const creditRequestFundSchema = yup.object({
  transactionDate: yup.string().required('Transaction date is required'),
  branchId: yup.string().required('Branch is required'),
  counterId: yup.string().required('Counter is required'),
  destinationBranchId: yup
    .string()
    .required('Destination branch is required')
    .test(
      'different-branch',
      CREDIT_REQUEST_FUND_LABELS.destinationDiffers,
      function validateDestination(value) {
        return !value || value !== this.parent.branchId;
      }
    ),
  accountTypeOptionId: yup.string().required('A/C Type is required'),
  headerAccountId: yup.string().required('A/C Code is required'),
  entityTypeOptionId: yup.string().required('Entity Type is required'),
  partyProfileId: yup.string().required('Party Code is required'),
  paidByPanNumber: yup
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
  travelerPanNumber: yup
    .string()
    .trim()
    .optional()
    .nullable()
    .test(
      'traveler-pan-format',
      'Traveler PAN must be a valid 10-character Indian PAN',
      value => {
        if (!value) return true;
        return /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(value);
      }
    ),
  chequeNumber: yup.string().when(['accountMode', 'paymentMethod'], {
    is: (accountMode: string, paymentMethod: string) =>
      accountMode === 'BANK_CHEQUE' &&
      (!paymentMethod ||
        paymentMethod === TransactionPaymentMethodEnum.CHEQUE),
    then: schema => schema.required('Cheque number is required'),
  }),
  chequeDate: yup.string().when(['accountMode', 'paymentMethod'], {
    is: (accountMode: string, paymentMethod: string) =>
      accountMode === 'BANK_CHEQUE' &&
      paymentMethod !== TransactionPaymentMethodEnum.CASH,
    then: schema => schema.required('Cheque date is required'),
  }),
  chequeBranch: yup.string().when(['accountMode', 'paymentMethod'], {
    is: (accountMode: string, paymentMethod: string) =>
      accountMode === 'BANK_CHEQUE' &&
      (!paymentMethod ||
        paymentMethod === TransactionPaymentMethodEnum.CHEQUE),
    then: schema => schema.required('Branch is required'),
  }),
  drawnOn: yup.string().when(['accountMode', 'paymentMethod'], {
    is: (accountMode: string, paymentMethod: string) =>
      accountMode === 'BANK_CHEQUE' &&
      (!paymentMethod ||
        paymentMethod === TransactionPaymentMethodEnum.CHEQUE),
    then: schema => schema.required('Drawn on is required'),
  }),
  paymentMethod: yup
    .string()
    .required('Payment mode is required')
    .oneOf(
      Object.values(TransactionPaymentMethodEnum),
      'Payment mode is required'
    ),
  narration: yup.string().trim().required('Narration is required'),
  items: yup
    .array()
    .of(
      yup.object({
        itemTypeOptionId: yup.string().required('Type is required'),
        itemTypeValue: yup.string().optional(),
        subledgerPartyProfileId: yup.string().optional().nullable(),
        subledgerBranchId: yup.string().optional().nullable(),
        accountId: yup.string().required('Account is required'),
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
    )
    .min(1, 'At least one item is required')
    .required()
    .test(
      'crf-totals',
      'Final amount must be positive (credit − debit)',
      rows => {
        const totals = (rows ?? []).reduce(
          (value, row) => {
            value[row?.direction === 'CREDIT' ? 'credit' : 'debit'] += toCents(
              row?.amount
            );
            return value;
          },
          { debit: 0, credit: 0 }
        );
        return totals.credit - totals.debit > 0;
      }
    ),
});

const useCrfPanVerification = (
  enabled: boolean,
  fields: {
    number: keyof CreditRequestFundFormValues;
    name: keyof CreditRequestFundFormValues;
    dob: keyof CreditRequestFundFormValues;
  }
) => {
  const form = useFormContext<CreditRequestFundFormValues>();
  const { verifyPan, isVerifyingPan } = usePassengerAmlVerification();
  const [status, setStatus] = useState<PanVerificationStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const verifiedSnapshotRef = useRef('');
  const runIdRef = useRef(0);

  const verify = useCallback(async () => {
    if (!enabled) return false;

    const values = form.getValues();
    const panNumber = String(values[fields.number] ?? '').trim();
    const panName = String(values[fields.name] ?? '').trim();
    const panDob = String(values[fields.dob] ?? '').trim();
    const snapshot = `${panNumber.toUpperCase()}|${panName}|${panDob}`;

    if (!panNumber || !panName || !panDob) {
      setStatus('invalid');
      setMessage(CREDIT_REQUEST_FUND_LABELS.panVerifyIncomplete);
      return false;
    }

    if (status === 'valid' && verifiedSnapshotRef.current === snapshot) {
      return true;
    }

    const runId = ++runIdRef.current;
    setStatus('checking');
    setMessage(CREDIT_REQUEST_FUND_LABELS.panVerifyChecking);

    try {
      const result = await verifyPan({
        entityType: PassengerEntityTypeEnum.INDIVIDUAL,
        nationalityType: PassengerNationalityTypeEnum.INDIAN,
        panNumber,
        panHolderName: panName,
        panDob,
      });

      if (runId !== runIdRef.current) return false;

      if (!result.verified) {
        verifiedSnapshotRef.current = '';
        setStatus('invalid');
        setMessage(
          result.message || CREDIT_REQUEST_FUND_LABELS.panVerifyFailed
        );
        toast.error(
          result.message || CREDIT_REQUEST_FUND_LABELS.panVerifyFailed
        );
        return false;
      }

      verifiedSnapshotRef.current = snapshot;
      setStatus('valid');
      setMessage(
        result.message || CREDIT_REQUEST_FUND_LABELS.panVerifySuccess
      );
      toast.success(
        result.message || CREDIT_REQUEST_FUND_LABELS.panVerifySuccess
      );
      return true;
    } catch (error) {
      if (runId !== runIdRef.current) return false;
      const nextMessage =
        error instanceof Error
          ? error.message
          : CREDIT_REQUEST_FUND_LABELS.panVerifyFailed;
      verifiedSnapshotRef.current = '';
      setStatus('invalid');
      setMessage(nextMessage);
      toast.error(nextMessage);
      return false;
    }
  }, [enabled, fields.dob, fields.name, fields.number, form, status, verifyPan]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      event.stopPropagation();
      void verify();
    },
    [verify]
  );

  const reset = useCallback(() => {
    runIdRef.current += 1;
    verifiedSnapshotRef.current = '';
    setStatus('idle');
    setMessage(null);
  }, []);

  return {
    status,
    message,
    isVerifyingPan,
    handleKeyDown,
    reset,
  };
};

interface Props {
  defaultValues: CreditRequestFundFormValues;
  onSubmit: (values: CreditRequestFundFormValues) => Promise<void>;
  onBack: () => void;
  readOnly?: boolean;
  minDate?: Date;
  maxDate?: Date;
  policyTransactionDate?: string;
  onBranchChange?: (branchId: string) => void;
  submitDisabled?: boolean;
  submitLabel?: string;
  showSubmit?: boolean;
  statusActions?: ReactNode;
  linkedVouchers?: ReactNode;
}

const CreditRequestFundFields = ({
  readOnly,
  minDate,
  maxDate,
  policyTransactionDate,
  onBranchChange,
  linkedVouchers,
}: Pick<
  Props,
  | 'readOnly'
  | 'minDate'
  | 'maxDate'
  | 'policyTransactionDate'
  | 'onBranchChange'
  | 'linkedVouchers'
>) => {
  const form = useFormContext<CreditRequestFundFormValues>();
  const mode = useWatch({ control: form.control, name: 'accountMode' });
  const paymentMethod = useWatch({
    control: form.control,
    name: 'paymentMethod',
  });
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
  const branchId = useWatch({ control: form.control, name: 'branchId' });
  const panHolderRelationOptionId = useWatch({
    control: form.control,
    name: 'panHolderRelationOptionId',
  });
  const paidByPanNumber = useWatch({
    control: form.control,
    name: 'paidByPanNumber',
  });
  const paidByPanName = useWatch({
    control: form.control,
    name: 'paidByPanName',
  });
  const paidByPanDob = useWatch({
    control: form.control,
    name: 'paidByPanDob',
  });
  const watchedItems = useWatch({ control: form.control, name: 'items' });
  const items = useMemo(() => watchedItems ?? [], [watchedItems]);

  const loadBranchOptions = useLoadBranchOptions({ activeOnly: true });
  const loadDestinationBranchOptions = useCallback(
    async (inputValue: string, page = 1) => {
      const result = await loadBranchOptions(inputValue, page);
      return {
        ...result,
        options: result.options.filter(option => option.value !== branchId),
      };
    },
    [branchId, loadBranchOptions]
  );

  const { data: nextNumber } = useCreditRequestFundNextNumber(branchId);
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const { data: itemTypeCategoryOptions = [] } = useQuery({
    queryKey: ['category-options', 'voucher_item_type'],
    queryFn: () =>
      categoryOptionsApi.getCategoryOptionsByCode(
        CategoryOptionCodeEnum.VoucherItemType
      ),
    staleTime: 5 * 60 * 1000,
  });
  const { data: accountTypeCategoryOptions = [] } = useQuery({
    queryKey: ['category-options', 'voucher_account_type'],
    queryFn: () =>
      categoryOptionsApi.getCategoryOptionsByCode(
        CategoryOptionCodeEnum.VoucherAccountType
      ),
    staleTime: 5 * 60 * 1000,
  });
  const { data: relationOptions = [] } = useQuery({
    queryKey: ['category-options', 'relation'],
    queryFn: () =>
      categoryOptionsApi.getCategoryOptionsByCode(
        CategoryOptionCodeEnum.PassengerPanHolderRelation
      ),
    staleTime: 5 * 60 * 1000,
  });

  const accountItemTypeOptions = useMemo(
    () =>
      itemTypeCategoryOptions
        .filter(option => isVoucherAccountItemTypeValue(option.value))
        .map(option => ({
          value: option.id,
          label: option.label,
        })),
    [itemTypeCategoryOptions]
  );

  const paymentMethodOptions = useMemo(
    () =>
      getTransactionPaymentMethodOptions().filter(
        option => option.value !== TransactionPaymentMethodEnum.CASH
      ),
    []
  );
  const loadPaymentModeOptions = useCallback(
    async (inputValue: string) => {
      const normalized = inputValue.trim().toLowerCase();
      return {
        options: paymentMethodOptions.filter(option => {
          if (!normalized) return true;
          return (
            option.label.toLowerCase().includes(normalized) ||
            option.value.toLowerCase().includes(normalized)
          );
        }),
        hasMore: false,
      };
    },
    [paymentMethodOptions]
  );

  const isBankNonCheque = isNonChequeBankPaymentMethod(paymentMethod);
  const isCashPaymentMode =
    paymentMethod === TransactionPaymentMethodEnum.CASH;
  const entityTypeOptions = useCategoryOptions(
    CategoryOptionCodeEnum.EntityType
  ).defaultOptions;
  const previousElectronicRef = useRef(false);
  const lastPartyIdRef = useRef(form.getValues('partyProfileId') || '');
  const lastBranchIdRef = useRef(form.getValues('branchId') || '');
  const adultDobMaxDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
  }, []);

  const { data: accountResponse, isLoading: accountsLoading } =
    useListAccountProfiles({
      active: true,
      limit: 100,
      receipt: true,
    });
  const { data: headerAccountResponse, isLoading: headerAccountsLoading } =
    useListAccountProfiles({
      active: true,
      limit: 100,
    });

  const allPartyTypes = Object.values(PartyProfileTypeEnum);
  const { data: partyResponse, isLoading: partiesLoading } =
    useListPartyProfiles(
      {
        limit: 100,
        activeOnly: true,
        status: 'APPROVE',
        entityTypeId: entityTypeOptionId || undefined,
        branchId: branchId || undefined,
      },
      allPartyTypes,
      Boolean(branchId)
    );
  const parties = useMemo(() => partyResponse?.data ?? [], [partyResponse]);
  const selectedParty = parties.find(party => party.id === partyProfileId);

  const { data: subledgerResponse, isLoading: subledgerPartiesLoading } =
    useListPartyProfiles(
      {
        limit: 100,
        activeOnly: true,
        status: 'APPROVE',
        entityTypeId: entityTypeOptionId || undefined,
        groupId: selectedParty?.group?.id,
        branchId: branchId || undefined,
      },
      allPartyTypes,
      Boolean(selectedParty) && Boolean(branchId)
    );

  const accounts = useMemo(
    () =>
      (accountResponse?.data ?? []).filter(
        account =>
          String(account.currencyCode ?? account.currency?.currencyCode ?? '')
            .trim()
            .toUpperCase() === 'INR'
      ),
    [accountResponse]
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
  const subledgerParties = selectedParty?.group
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

  const selfRelationOption = useMemo(
    () =>
      relationOptions.find(option => {
        const normalizedValue = normalizeUpper(option.value);
        const normalizedLabel = normalizeUpper(option.label);
        return normalizedValue === 'SELF' || normalizedLabel === 'SELF';
      }) ?? null,
    [relationOptions]
  );
  const isSelfRelationSelected = useMemo(() => {
    if (!selfRelationOption) {
      return normalizeUpper(String(panHolderRelationOptionId ?? '')) === 'SELF';
    }
    return (
      String(panHolderRelationOptionId ?? '') ===
      String(selfRelationOption.id ?? '')
    );
  }, [panHolderRelationOptionId, selfRelationOption]);

  const paidByPan = useCrfPanVerification(!panFieldsDisabled, {
    number: 'paidByPanNumber',
    name: 'paidByPanName',
    dob: 'paidByPanDob',
  });
  const travelerPan = useCrfPanVerification(
    !panFieldsDisabled && !isSelfRelationSelected,
    {
      number: 'travelerPanNumber',
      name: 'travelerPanName',
      dob: 'travelerPanDob',
    }
  );
  const resetPaidByPan = paidByPan.reset;
  const resetTravelerPan = travelerPan.reset;

  useEffect(() => {
    onBranchChange?.(branchId ?? '');
  }, [branchId, onBranchChange]);

  useEffect(() => {
    if (readOnly) return;
    const previousBranchId = lastBranchIdRef.current;
    lastBranchIdRef.current = branchId ?? '';
    if (!previousBranchId || previousBranchId === (branchId ?? '')) return;
    form.setValue('partyProfileId', '', {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue('partyName', '', { shouldDirty: true, shouldValidate: false });
  }, [branchId, form, readOnly]);

  useEffect(() => {
    if (!readOnly && policyTransactionDate) {
      form.setValue('transactionDate', policyTransactionDate, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [form, policyTransactionDate, readOnly]);

  useEffect(() => {
    if (!readOnly && nextNumber) {
      form.setValue('number', nextNumber, { shouldDirty: false });
    }
  }, [form, nextNumber, readOnly]);

  useEffect(() => {
    const destination = form.getValues('destinationBranchId');
    if (!readOnly && destination && destination === branchId) {
      form.setValue('destinationBranchId', '', { shouldValidate: true });
    }
  }, [branchId, form, readOnly]);

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

    if (isVoucherIndividualSelection({
      entityType: selectedParty?.entityType,
      isIndividual: selectedParty?.isIndividual,
    })) {
      form.setValue('paidByPanNumber', selectedParty?.panNo ?? '', {
        shouldValidate: false,
      });
      form.setValue('paidByPanName', selectedParty?.panName ?? '', {
        shouldValidate: false,
      });
      form.setValue(
        'paidByPanDob',
        formatVoucherDateInput(selectedParty?.panDob),
        { shouldValidate: false }
      );
    } else {
      form.setValue('paidByPanNumber', '', { shouldValidate: false });
      form.setValue('paidByPanName', '', { shouldValidate: false });
      form.setValue('paidByPanDob', '', { shouldValidate: false });
      form.setValue('panHolderRelationOptionId', '', { shouldValidate: false });
      form.setValue('travelerPanNumber', '', { shouldValidate: false });
      form.setValue('travelerPanName', '', { shouldValidate: false });
      form.setValue('travelerPanDob', '', { shouldValidate: false });
    }

    if (readOnly) return;

    const currentItems = form.getValues('items') ?? [];
    currentItems.forEach((_item, index) => {
      form.setValue(`items.${index}.subledgerPartyProfileId`, '', {
        shouldValidate: true,
      });
      form.setValue(`items.${index}.subledgerBranchId`, '', {
        shouldValidate: true,
      });
      form.setValue(`items.${index}.subledgerCode`, '', {
        shouldValidate: false,
      });
    });
    resetPaidByPan();
    resetTravelerPan();
  }, [form, readOnly, resetPaidByPan, resetTravelerPan, selectedParty]);

  useEffect(() => {
    const selected = accountTypeCategoryOptions.find(
      option => option.id === accountTypeOptionId
    );
    if (!selected) return;
    const nextMode = modeFromAccountTypeValue(String(selected.value ?? ''));
    if (nextMode === mode) return;
    form.setValue('accountMode', nextMode);
    form.setValue('headerAccountId', '');
    form.setValue('headerAccountName', '');
    form.setValue(
      'paymentMethod',
      paymentMethodForVoucherAccountMode(nextMode),
      { shouldDirty: true, shouldValidate: true }
    );
    if (nextMode !== 'BANK_CHEQUE') {
      form.setValue('chequeNumber', '');
      form.setValue('chequeDate', '');
      form.setValue('chequeBranch', '');
      form.setValue('drawnOn', '');
    }
  }, [accountTypeCategoryOptions, accountTypeOptionId, form, mode]);

  useEffect(() => {
    if (readOnly || !mode) return;
    if (mode === 'BANK_CHEQUE') {
      if (
        !paymentMethod ||
        paymentMethod === TransactionPaymentMethodEnum.CASH
      ) {
        form.setValue(
          'paymentMethod',
          TransactionPaymentMethodEnum.CHEQUE,
          { shouldValidate: true }
        );
      }
      return;
    }
    const implied = paymentMethodForVoucherAccountMode(mode);
    if (implied && paymentMethod !== implied) {
      form.setValue('paymentMethod', implied, { shouldValidate: true });
    }
  }, [form, mode, paymentMethod, readOnly]);

  useEffect(() => {
    if (readOnly || mode !== 'BANK_CHEQUE') {
      previousElectronicRef.current = isBankNonCheque;
      return;
    }
    if (!previousElectronicRef.current && isBankNonCheque) {
      form.setValue('chequeNumber', '', { shouldValidate: true });
      form.setValue('chequeDate', toLocalDateString(), { shouldValidate: true });
    }
    if (isCashPaymentMode) {
      form.setValue('chequeNumber', '', { shouldValidate: true });
      form.setValue('chequeDate', '', { shouldValidate: true });
      form.setValue('chequeBranch', '', { shouldValidate: true });
      form.setValue('drawnOn', '', { shouldValidate: true });
    }
    previousElectronicRef.current = isBankNonCheque;
  }, [form, isBankNonCheque, isCashPaymentMode, mode, readOnly]);

  useEffect(() => {
    const account = headerAccounts.find(item => item.id === headerAccountId);
    form.setValue('headerAccountName', account?.accountName ?? '', {
      shouldValidate: false,
    });
  }, [form, headerAccountId, headerAccounts]);

  useEffect(() => {
    if (!isSelfRelationSelected || panFieldsDisabled) return;
    form.setValue('travelerPanNumber', String(paidByPanNumber ?? ''), {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue('travelerPanName', String(paidByPanName ?? ''), {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue('travelerPanDob', String(paidByPanDob ?? ''), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [
    form,
    isSelfRelationSelected,
    paidByPanDob,
    paidByPanName,
    paidByPanNumber,
    panFieldsDisabled,
  ]);

  useEffect(() => {
    const accountType = accountItemTypeOptions[0];
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
      if (!item.itemTypeOptionId && accountType) {
        form.setValue(
          `items.${index}.itemTypeOptionId`,
          String(accountType.value),
          { shouldDirty: false }
        );
        form.setValue(`items.${index}.itemTypeValue`, 'ACCOUNT', {
          shouldDirty: false,
        });
      }
      const account = accounts.find(value => value.id === item.accountId);
      if (account && item.accountName !== account.accountName) {
        form.setValue(`items.${index}.accountName`, account.accountName, {
          shouldDirty: false,
        });
        form.setValue(`items.${index}.accountCode`, account.accountCode, {
          shouldDirty: false,
        });
      }
    });
  }, [
    accountItemTypeOptions,
    accounts,
    form,
    itemTypeCategoryOptions,
    items,
  ]);

  const handleRemoveItem = (index: number) => {
    if (fields.length === 1) {
      form.setValue(`items.${index}`, createEmptyCreditRequestFundItem(), {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }
    remove(index);
  };

  const handleAccountChange = (index: number, accountId: string) => {
    const account = accounts.find(item => item.id === accountId);
    form.setValue(`items.${index}.accountName`, account?.accountName ?? '', {
      shouldValidate: false,
    });
    form.setValue(`items.${index}.accountCode`, account?.accountCode ?? '', {
      shouldValidate: false,
    });
    form.setValue(`items.${index}.subledgerPartyProfileId`, '', {
      shouldValidate: true,
    });
    form.setValue(`items.${index}.subledgerBranchId`, '', {
      shouldValidate: true,
    });
    form.setValue(`items.${index}.subledgerCode`, '', {
      shouldValidate: false,
    });
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
  const final = totals.credit - totals.debit;

  const panStatusClass = (status: PanVerificationStatus) =>
    status === 'checking'
      ? 'text-info-700'
      : status === 'valid'
        ? 'text-success-700'
        : status === 'invalid'
          ? 'text-error-600'
          : 'text-text-secondary';

  return (
    <div className="space-y-3 [&_div.max-w-\[350px\]]:!max-w-none">
      <CardSection heading="Transaction">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="md:col-span-2 lg:col-span-2 [&_.grid]:gap-3">
            <PurchaseWorkplaceFields readOnly={readOnly} />
          </div>
          <FormFieldDatePicker
            name="transactionDate"
            label={CREDIT_REQUEST_FUND_LABELS.transactionDate}
            dateFormat="dd/MM/yyyy"
            minDate={minDate}
            maxDate={maxDate}
            disabled={readOnly}
          />
          <FormFieldInput
            name="number"
            label={CREDIT_REQUEST_FUND_LABELS.transactionNumber}
            disabled
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldSelect
            name="destinationBranchId"
            label={CREDIT_REQUEST_FUND_LABELS.destinationBranch}
            loadOptions={loadDestinationBranchOptions}
            defaultOptions={true}
            pagination
            disabled={readOnly}
          />
        </div>
      </CardSection>

      <div className="grid gap-3 lg:grid-cols-2">
        <CardSection heading="Account">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {readOnly ? (
              <FormFieldInput
                name="accountTypeOptionId"
                label={CREDIT_REQUEST_FUND_LABELS.accountType}
                disabled
                value={
                  accountTypeCategoryOptions.find(
                    option => option.id === accountTypeOptionId
                  )?.label ?? ''
                }
              />
            ) : (
              <FormFieldCategoryOption
                name="accountTypeOptionId"
                label={CREDIT_REQUEST_FUND_LABELS.accountType}
                code={CategoryOptionCodeEnum.VoucherAccountType}
                isCreatable={false}
              />
            )}
            <FormFieldSelect
              name="headerAccountId"
              label={CREDIT_REQUEST_FUND_LABELS.accountCode}
              loadOptions={optionFilter(headerAccountOptions)}
              defaultOptions={headerAccountOptions}
              isLoading={headerAccountsLoading}
              disabled={readOnly}
            />
            <FormFieldInput
              name="headerAccountName"
              label={CREDIT_REQUEST_FUND_LABELS.accountName}
              disabled
            />
          </div>
          {mode === 'BANK_CHEQUE' ? (
            <>
              <div className="mt-3 w-full max-w-xs">
                <FormFieldSelect
                  key={`crf-payment-mode-${paymentMethodOptions.map(option => option.value).join('-') || 'empty'}`}
                  name="paymentMethod"
                  label={CREDIT_REQUEST_FUND_LABELS.paymentMode}
                  loadOptions={loadPaymentModeOptions}
                  defaultOptions={paymentMethodOptions}
                  isClearable={false}
                  disabled={readOnly}
                  onValueChange={value => {
                    form.setValue(
                      'paymentMethod',
                      String(value ?? '').trim() ||
                        TransactionPaymentMethodEnum.CHEQUE,
                      { shouldDirty: true, shouldValidate: true }
                    );
                  }}
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <FormFieldInput
                  name="chequeNumber"
                  label={CREDIT_REQUEST_FUND_LABELS.chequeNumber}
                  disabled={readOnly || isBankNonCheque || isCashPaymentMode}
                />
                <FormFieldDatePicker
                  name="chequeDate"
                  label={CREDIT_REQUEST_FUND_LABELS.chequeDate}
                  dateFormat="dd/MM/yyyy"
                  disabled={readOnly || isBankNonCheque || isCashPaymentMode}
                />
                <FormFieldInput
                  name="chequeBranch"
                  label={CREDIT_REQUEST_FUND_LABELS.chequeBranch}
                  disabled={readOnly || isCashPaymentMode}
                />
                <FormFieldInput
                  name="drawnOn"
                  label={CREDIT_REQUEST_FUND_LABELS.drawnOn}
                  disabled={readOnly || isCashPaymentMode}
                />
              </div>
              {isBankNonCheque ? (
                <p className="mt-2 text-xs text-text-tertiary">
                  {CREDIT_REQUEST_FUND_LABELS.electronicPaymentHint}
                </p>
              ) : null}
            </>
          ) : null}
        </CardSection>

        <CardSection heading="Party">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {readOnly ? (
              <FormFieldInput
                name="entityTypeOptionId"
                label={CREDIT_REQUEST_FUND_LABELS.entityType}
                disabled
                value={
                  entityTypeOptions.find(
                    option => String(option.value) === String(entityTypeOptionId)
                  )?.label ?? ''
                }
              />
            ) : (
              <FormFieldCategoryOption
                name="entityTypeOptionId"
                label={CREDIT_REQUEST_FUND_LABELS.entityType}
                code={CategoryOptionCodeEnum.EntityType}
                isCreatable={false}
              />
            )}
            <FormFieldSelect
              name="partyProfileId"
              label={CREDIT_REQUEST_FUND_LABELS.partyCode}
              loadOptions={optionFilter(partyOptions)}
              defaultOptions={partyOptions}
              isLoading={partiesLoading}
              disabled={readOnly || !entityTypeOptionId}
            />
            <FormFieldInput
              name="partyName"
              label={CREDIT_REQUEST_FUND_LABELS.partyName}
              disabled
            />
          </div>

          {isIndividualSelection ? (
            <>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <FormFieldInput
                  name="paidByPanNumber"
                  label={CREDIT_REQUEST_FUND_LABELS.paidByPanNumber}
                  valueTransform="uppercase"
                  disabled={panFieldsDisabled || paidByPan.isVerifyingPan}
                  onKeyDown={paidByPan.handleKeyDown}
                />
                <FormFieldInput
                  name="paidByPanName"
                  label={CREDIT_REQUEST_FUND_LABELS.paidByPanName}
                  disabled={panFieldsDisabled || paidByPan.isVerifyingPan}
                  onKeyDown={paidByPan.handleKeyDown}
                />
                <FormFieldDatePicker
                  name="paidByPanDob"
                  label={CREDIT_REQUEST_FUND_LABELS.paidByPanDob}
                  dateFormat="dd/MM/yyyy"
                  maxDate={adultDobMaxDate}
                  disabled={panFieldsDisabled || paidByPan.isVerifyingPan}
                  onKeyDown={paidByPan.handleKeyDown}
                />
              </div>
              {!panFieldsDisabled ? (
                <p className={`mt-1 text-xs ${panStatusClass(paidByPan.status)}`}>
                  {paidByPan.message ||
                    CREDIT_REQUEST_FUND_LABELS.panVerifyIncomplete}
                </p>
              ) : null}

              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <FormFieldCategoryOption
                  name="panHolderRelationOptionId"
                  label={CREDIT_REQUEST_FUND_LABELS.panHolderRelation}
                  code={CategoryOptionCodeEnum.PassengerPanHolderRelation}
                  isCreatable={false}
                  disabled={panFieldsDisabled}
                />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <FormFieldInput
                  name="travelerPanNumber"
                  label={CREDIT_REQUEST_FUND_LABELS.travelerPanNumber}
                  valueTransform="uppercase"
                  disabled={
                    panFieldsDisabled ||
                    isSelfRelationSelected ||
                    travelerPan.isVerifyingPan
                  }
                  onKeyDown={travelerPan.handleKeyDown}
                />
                <FormFieldInput
                  name="travelerPanName"
                  label={CREDIT_REQUEST_FUND_LABELS.travelerPanName}
                  disabled={
                    panFieldsDisabled ||
                    isSelfRelationSelected ||
                    travelerPan.isVerifyingPan
                  }
                  onKeyDown={travelerPan.handleKeyDown}
                />
                <FormFieldDatePicker
                  name="travelerPanDob"
                  label={CREDIT_REQUEST_FUND_LABELS.travelerPanDob}
                  dateFormat="dd/MM/yyyy"
                  maxDate={adultDobMaxDate}
                  disabled={
                    panFieldsDisabled ||
                    isSelfRelationSelected ||
                    travelerPan.isVerifyingPan
                  }
                  onKeyDown={travelerPan.handleKeyDown}
                />
              </div>
              {!panFieldsDisabled && !isSelfRelationSelected ? (
                <p
                  className={`mt-1 text-xs ${panStatusClass(travelerPan.status)}`}
                >
                  {travelerPan.message ||
                    CREDIT_REQUEST_FUND_LABELS.panVerifyIncomplete}
                </p>
              ) : null}
            </>
          ) : null}
        </CardSection>
      </div>

      <CardSection heading="Narration">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {readOnly ? (
            <FormFieldInput name="remarkOptionId" label={CREDIT_REQUEST_FUND_LABELS.remark} disabled />
          ) : (
            <FormFieldCategoryOption
              name="remarkOptionId"
              label={CREDIT_REQUEST_FUND_LABELS.remark}
              code={CategoryOptionCodeEnum.VoucherRemark}
              isCreatable
            />
          )}
          <FormFieldTextarea
            name="narration"
            label={CREDIT_REQUEST_FUND_LABELS.narration}
            disabled={readOnly}
            rows={2}
            wrapperClassName="max-w-none md:col-span-1 lg:col-span-3"
          />
        </div>
      </CardSection>

      <CardSection
        heading="Items"
        headerActions={
          !readOnly ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(createEmptyCreditRequestFundItem())}
            >
              {CREDIT_REQUEST_FUND_LABELS.addItem}
            </Button>
          ) : null
        }
      >
        <div className="overflow-x-auto">
          <div className="min-w-[64rem] space-y-1">
            <div className="grid grid-cols-[2rem_minmax(0,1.15fr)_minmax(0,1.15fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(7.5rem,0.9fr)_minmax(8.5rem,1fr)_2.25rem] gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              <div>#</div>
              <div>Type</div>
              <div>Sub Ledger</div>
              <div>Account</div>
              <div>Account Name</div>
              <div>Sign</div>
              <div>Amount</div>
              <div />
            </div>
            {fields.map((field, index) => {
              const account = accounts.find(
                item => item.id === items[index]?.accountId
              );
              const subledgerKind = resolveSubledgerKind(account);

              return (
                <div
                  key={field.id}
                  className="grid grid-cols-[2rem_minmax(0,1.15fr)_minmax(0,1.15fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(7.5rem,0.9fr)_minmax(8.5rem,1fr)_2.25rem] items-center gap-2 rounded-md border border-border-secondary px-2 py-1.5 [&_.space-y-2]:space-y-0"
                >
                  <div className="text-center text-xs text-text-tertiary">
                    {index + 1}
                  </div>
                  <div>
                    <FormFieldSelect
                      name={`items.${index}.itemTypeOptionId`}
                      loadOptions={optionFilter(accountItemTypeOptions)}
                      defaultOptions={accountItemTypeOptions}
                      placeholder="Type"
                      aria-label="Type"
                      disabled={readOnly}
                      onValueChange={value => {
                        const optionId = Array.isArray(value)
                          ? String(value[0] ?? '')
                          : (value ?? '');
                        form.setValue(
                          `items.${index}.itemTypeValue`,
                          getVoucherItemTypeValueById(
                            optionId,
                            itemTypeCategoryOptions
                          ) || 'ACCOUNT',
                          { shouldValidate: true }
                        );
                      }}
                    />
                  </div>
                  <div>
                    {readOnly ? (
                      <FormFieldInput
                        name={`items.${index}.subledgerCode`}
                        disabled
                        aria-label="Sub Ledger"
                      />
                    ) : subledgerKind === 'NONE' ? (
                      <FormFieldInput
                        name={`items.${index}.subledgerCode`}
                        disabled
                        value="—"
                        aria-label="Sub Ledger"
                      />
                    ) : subledgerKind === 'BRANCH' ? (
                      <FormFieldSelect
                        name={`items.${index}.subledgerBranchId`}
                        loadOptions={loadBranchOptions}
                        defaultOptions={true}
                        pagination
                        placeholder="Branch"
                        aria-label="Sub Ledger Branch"
                        onValueChange={() => {
                          form.setValue(
                            `items.${index}.subledgerPartyProfileId`,
                            '',
                            { shouldValidate: true }
                          );
                        }}
                      />
                    ) : (
                      <FormFieldSelect
                        name={`items.${index}.subledgerPartyProfileId`}
                        loadOptions={optionFilter(subledgerOptions)}
                        defaultOptions={subledgerOptions}
                        isLoading={subledgerPartiesLoading}
                        placeholder="Sub Ledger"
                        aria-label="Sub Ledger"
                        disabled={!partyProfileId}
                        onValueChange={() => {
                          form.setValue(
                            `items.${index}.subledgerBranchId`,
                            '',
                            { shouldValidate: true }
                          );
                        }}
                      />
                    )}
                  </div>
                  <div>
                    {readOnly ? (
                      <FormFieldInput
                        name={`items.${index}.accountCode`}
                        disabled
                        aria-label="Account"
                      />
                    ) : (
                      <FormFieldSelect
                        name={`items.${index}.accountId`}
                        loadOptions={optionFilter(accountOptions)}
                        defaultOptions={accountOptions}
                        isLoading={accountsLoading}
                        placeholder="Account"
                        aria-label="Account"
                        onValueChange={value =>
                          handleAccountChange(
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
                    <FormFieldInput
                      name={`items.${index}.accountName`}
                      disabled
                      aria-label="Account Name"
                    />
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
                      disabled={readOnly}
                      aria-label="Sign"
                    />
                  </div>
                  <div>
                    <FormFieldInput
                      name={`items.${index}.amount`}
                      type="number"
                      valueTransform="none"
                      disabled={readOnly}
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
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-border-secondary pt-3 md:gap-4">
          <div className="min-w-[8rem] flex-1 sm:max-w-[11rem]">
            <FormFieldInput
              name="totalDebitDisplay"
              label={CREDIT_REQUEST_FUND_LABELS.totalDebit}
              disabled
              value={(totals.debit / 100).toFixed(2)}
            />
          </div>
          <div className="min-w-[8rem] flex-1 sm:max-w-[11rem]">
            <FormFieldInput
              name="totalCreditDisplay"
              label={CREDIT_REQUEST_FUND_LABELS.totalCredit}
              disabled
              value={(totals.credit / 100).toFixed(2)}
            />
          </div>
          <div className="min-w-[8rem] flex-1 sm:max-w-[11rem]">
            <FormFieldInput
              name="finalAmountDisplay"
              label={CREDIT_REQUEST_FUND_LABELS.finalAmount}
              disabled
              value={(final / 100).toFixed(2)}
            />
          </div>
        </div>
      </CardSection>

      {linkedVouchers}
    </div>
  );
};

export const CreditRequestFundForm = ({
  defaultValues,
  onSubmit,
  onBack,
  readOnly = false,
  minDate,
  maxDate,
  policyTransactionDate,
  onBranchChange,
  submitDisabled = false,
  submitLabel,
  showSubmit,
  statusActions,
  linkedVouchers,
}: Props) => (
  <Form<CreditRequestFundFormValues>
    id="credit-request-fund-form"
    defaultValues={defaultValues}
    resolver={readOnly ? undefined : (yupResolver(creditRequestFundSchema) as never)}
    mode="onChange"
    onSubmit={onSubmit}
    onError={errors => {
      const messages = collectFormErrorMessages(errors);
      toast.error(
        messages[0] ?? CREDIT_REQUEST_FUND_LABELS.formValidationError
      );
    }}
    footer={{
      submitLabel: submitLabel ?? CREDIT_REQUEST_FUND_LABELS.save,
      backLabel: CREDIT_REQUEST_FUND_LABELS.back,
      onBackClick: onBack,
      showSubmit: showSubmit ?? !readOnly,
      isSubmitDisabled: submitDisabled,
      actions: statusActions,
    }}
  >
    <CreditRequestFundFields
      readOnly={readOnly}
      minDate={minDate}
      maxDate={maxDate}
      policyTransactionDate={policyTransactionDate}
      onBranchChange={onBranchChange}
      linkedVouchers={linkedVouchers}
    />
  </Form>
);
