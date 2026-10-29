import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  useForm,
  FormProvider,
  useFormContext,
  useWatch,
  useFieldArray,
  type Resolver,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  CardSection,
  Badge,
  Checkbox,
  type AsyncSelectOption,
  type AsyncSelectResponse,
} from '@/components/ui';
import { Table, type TableColumnDef } from '@/components/ui/table';
import {
  FormFieldInput,
  FormFieldCheckbox,
  FormFieldSelect,
  FormFieldDatePicker,
  FormFieldCategoryOption,
} from '@/components/forms';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { useAuth } from '@/lib/AuthContext';
import {
  useGetPartyProfile,
  usePartyProfileFilterByEntityType,
} from '@/modules/partyProfiles/hooks';
import {
  PartyProfileStatusEnum,
  type IPartyProfile,
} from '@/modules/partyProfiles/types/partyProfileTypes';
import { SelectPartyProfiles } from '@/modules/partyProfiles/components';
import { EntityPickerField } from '@/modules/purchase/components/EntityPickerField';
import { PurchaseWorkplaceFields } from '@/modules/purchase/components/PurchaseWorkplaceFields';
import { isVoucherIndividualSelection } from '@/modules/vouchers/utils';
import { accountProfileApi } from '@/api/accountProfile';
import type { IAccountProfile } from '@/modules/accountProfile/types/accountProfileTypes';
import { transactionPoliciesApi } from '@/api/transactionPolicies';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import { toDisplayDate } from '@/utils';
import { useAvailableAdvances } from '../hooks';
import {
  AdvanceRefundPayoutSource,
  AdvanceRefundType,
  type AdvanceRefundFormValues,
  type AdvanceRefundItemFormValue,
  type AvailableAdvanceReceipt,
  type CreateAdvanceRefundPayload,
} from '../types';
import {
  ADVANCE_REFUND_PAYOUT_OPTIONS,
  ADVANCE_REFUND_TYPE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from '../constants';
import { toast } from 'react-hot-toast';

const EMPTY_ADVANCES: AvailableAdvanceReceipt[] = [];

const optionFilter =
  (options: AsyncSelectOption[]) =>
  async (search: string): Promise<AsyncSelectResponse> => ({
    options: search
      ? options.filter(opt =>
          opt.label.toLowerCase().includes(search.toLowerCase())
        )
      : options,
    hasMore: false,
  });

const schema = yup.object().shape({
  branchId: yup.string().required('Branch is required'),
  counterId: yup.string().required('Counter is required'),
  transactionDate: yup.string().required('Transaction date is required'),
  asOnDate: yup.string().required('As-on date is required'),
  partyTypeOptionId: yup.string().required('Party profile type is required'),
  partyProfileId: yup.string().required('Party Profile is required'),
  panNumber: yup
    .string()
    .trim()
    .required('PAN Card Number is required')
    .matches(
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i,
      'Invalid PAN format (expected 5 letters, 4 numbers, 1 letter, e.g. ABCDE1234F)'
    ),
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
  beneficiaryName: yup.string().optional(),
  beneficiaryAccountNumber: yup.string().optional(),
  beneficiaryIfscCode: yup.string().optional(),
  bankName: yup.string().optional(),
  chequeNumber: yup.string().optional(),
  chequeDate: yup.string().optional(),
  drawnOn: yup.string().optional(),
});

interface AdvanceRefundFormProps {
  onSubmit: (payload: CreateAdvanceRefundPayload) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

/**
 * Isolated Select-All Header to prevent re-rendering the parent table or columns.
 */
const SelectAllHeader: React.FC<{ count: number }> = ({ count }) => {
  const form = useFormContext<AdvanceRefundFormValues>();
  const items = useWatch({ control: form.control, name: 'items' }) || [];
  const allSelected =
    count > 0 && items.length === count && items.every(i => i.selected);

  const toggleSelectAll = (checked: boolean) => {
    const current = form.getValues('items') || [];
    current.forEach((item, idx) => {
      form.setValue(`items.${idx}.selected`, checked, { shouldDirty: true });
      if (checked && !parseFloat(item.refundAmount)) {
        form.setValue(
          `items.${idx}.refundAmount`,
          item.availableAmount,
          { shouldDirty: true }
        );
      }
    });
  };

  return (
    <div className="flex justify-center">
      <Checkbox
        checked={allSelected}
        onChange={toggleSelectAll}
        aria-label="Select all receipts"
      />
    </div>
  );
};

/**
 * Isolated row select checkbox cell to prevent re-rendering columns or table.
 */
const SelectRowCheckboxCell: React.FC<{
  index: number;
  availableAmount: string;
}> = ({ index, availableAmount }) => {
  const form = useFormContext<AdvanceRefundFormValues>();

  return (
    <div className="flex justify-center">
      <FormFieldCheckbox
        name={`items.${index}.selected`}
        onChange={checked => {
          if (
            checked &&
            !parseFloat(form.getValues(`items.${index}.refundAmount`))
          ) {
            form.setValue(
              `items.${index}.refundAmount`,
              availableAmount,
              { shouldDirty: true }
            );
          }
        }}
      />
    </div>
  );
};

/**
 * Isolated cell for refund amount input to preserve focus during typing.
 */
const RefundAmountCell: React.FC<{
  index: number;
  availableAmount: string;
}> = ({ index, availableAmount }) => {
  const form = useFormContext<AdvanceRefundFormValues>();
  const isSelected = useWatch({
    control: form.control,
    name: `items.${index}.selected`,
  });

  return (
    <div className="w-48 ml-auto">
      <FormFieldInput
        name={`items.${index}.refundAmount`}
        type="number"
        step="0.01"
        min="0.01"
        max={availableAmount}
        disabled={!isSelected}
        valueTransform="none"
        className="text-right"
      />
    </div>
  );
};

/**
 * Isolated summary card that reacts to items changes without re-rendering the table.
 */
const AdvanceRefundSummaryCard: React.FC<{ totalCount: number }> = ({
  totalCount,
}) => {
  const form = useFormContext<AdvanceRefundFormValues>();
  const watchedItems = useWatch({ control: form.control, name: 'items' });

  const selectedCount = (watchedItems || []).filter(i => i.selected).length;
  const totalRefundAmount = useMemo(() => {
    const items = watchedItems || [];
    return items
      .filter(i => i.selected)
      .reduce((acc, curr) => acc + (parseFloat(curr.refundAmount) || 0), 0);
  }, [watchedItems]);

  return (
    <div className="flex justify-between items-center p-4 bg-surface-secondary rounded-md border border-border-primary">
      <div className="text-sm text-text-secondary">
        Selected Receipts:{' '}
        <span className="font-semibold text-text-primary">
          {selectedCount}
        </span>{' '}
        of {totalCount}
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
  );
};

/**
 * Isolated Knock-off limit badge.
 */
const KnockOffLimitBadge: React.FC<{
  account?: IAccountProfile | null;
}> = ({ account }) => {
  const form = useFormContext<AdvanceRefundFormValues>();
  const watchedItems = useWatch({ control: form.control, name: 'items' });
  const total = useMemo(() => {
    const items = watchedItems || [];
    return items
      .filter(i => i.selected)
      .reduce((acc, curr) => acc + (parseFloat(curr.refundAmount) || 0), 0);
  }, [watchedItems]);

  if (!account) return null;

  const limitNum = account.refundLimit ? parseFloat(account.refundLimit) : null;
  const isExceeded = limitNum !== null && total > limitNum;

  return (
    <div className="flex items-center gap-3 pt-6">
      <Badge variant={isExceeded ? 'error' : 'success'}>
        Limit: ₹
        {account.refundLimit
          ? Number(account.refundLimit).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })
          : 'Unlimited'}
      </Badge>
      {isExceeded && (
        <span className="text-xs text-error-600 font-medium">
          Refund amount exceeds account limit!
        </span>
      )}
    </div>
  );
};

/**
 * Isolated submit button that reacts to total refund amount.
 */
const AdvanceRefundSubmitButton: React.FC<{
  isSubmitting?: boolean;
  onCancel?: () => void;
}> = ({ isSubmitting, onCancel }) => {
  const form = useFormContext<AdvanceRefundFormValues>();
  const watchedItems = useWatch({ control: form.control, name: 'items' });
  const totalRefundAmount = useMemo(() => {
    const items = watchedItems || [];
    return items
      .filter(i => i.selected)
      .reduce((acc, curr) => acc + (parseFloat(curr.refundAmount) || 0), 0);
  }, [watchedItems]);

  return (
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
  );
};

export const AdvanceRefundForm: React.FC<AdvanceRefundFormProps> = ({
  onSubmit,
  isSubmitting,
  onCancel,
}) => {
  const { activeBranchId, activeCounterId, policyContext } = useAuth();
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [selectedPartyProfile, setSelectedPartyProfile] =
    useState<IPartyProfile | null>(null);

  const initialTransactionDate =
    policyContext?.transactionDate || new Date().toISOString().slice(0, 10);

  const form = useForm<AdvanceRefundFormValues>({
    resolver: yupResolver(schema) as unknown as Resolver<AdvanceRefundFormValues>,
    defaultValues: {
      branchId: activeBranchId || '',
      counterId: activeCounterId || '',
      transactionDate: initialTransactionDate,
      asOnDate: initialTransactionDate,
      partyTypeOptionId: '',
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

  const { setValue, handleSubmit, getValues, control } = form;

  const watchedBranchId = useWatch({ control, name: 'branchId' });
  const watchedPartyTypeOptionId = useWatch({ control, name: 'partyTypeOptionId' });
  const watchedPartyId = useWatch({ control, name: 'partyProfileId' });
  const watchedPanNumber = useWatch({ control, name: 'panNumber' });
  const watchedAsOnDate = useWatch({ control, name: 'asOnDate' });
  const watchedRefundType = useWatch({ control, name: 'refundType' });
  const watchedPayoutSource = useWatch({ control, name: 'payoutSource' });
  const watchedKnockOffAccountId = useWatch({ control, name: 'knockOffAccountId' });

  // Policy context for selected branch
  const { data: branchPolicyContext } = useQuery({
    queryKey: ['policy-context', watchedBranchId],
    queryFn: () => transactionPoliciesApi.getPolicyContext(watchedBranchId),
    enabled: Boolean(watchedBranchId),
  });

  const effectivePolicyContext = branchPolicyContext ?? policyContext;
  const datePolicy = useMemo(
    () => getTransactionDatePolicy(effectivePolicyContext),
    [effectivePolicyContext]
  );

  // Update default dates from policy context when available
  useEffect(() => {
    if (datePolicy.defaultTransactionDate) {
      setValue('transactionDate', datePolicy.defaultTransactionDate, {
        shouldValidate: true,
      });
      setValue('asOnDate', datePolicy.defaultTransactionDate, {
        shouldValidate: true,
      });
    }
  }, [datePolicy.defaultTransactionDate, setValue]);

  // Debounced PAN input
  const [debouncedPanNumber, setDebouncedPanNumber] = useState(
    (watchedPanNumber || '').trim().toUpperCase()
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPanNumber((watchedPanNumber || '').trim().toUpperCase());
    }, 400);
    return () => clearTimeout(handler);
  }, [watchedPanNumber]);

  const isPanComplete = debouncedPanNumber.length === 10;
  const isPanFormatValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(debouncedPanNumber);

  // Clear party selection when branch changes
  const lastBranchIdRef = useRef(watchedBranchId || '');
  useEffect(() => {
    if (lastBranchIdRef.current && lastBranchIdRef.current !== watchedBranchId) {
      setValue('partyProfileId', '', { shouldDirty: true, shouldValidate: true });
      setSelectedPartyProfile(null);
    }
    lastBranchIdRef.current = watchedBranchId || '';
  }, [watchedBranchId, setValue]);

  // Clear party selection when party profile type changes
  const lastPartyTypeOptionIdRef = useRef(watchedPartyTypeOptionId || '');
  useEffect(() => {
    if (
      lastPartyTypeOptionIdRef.current &&
      lastPartyTypeOptionIdRef.current !== watchedPartyTypeOptionId
    ) {
      setValue('partyProfileId', '', { shouldDirty: true, shouldValidate: true });
      setSelectedPartyProfile(null);
    }
    lastPartyTypeOptionIdRef.current = watchedPartyTypeOptionId || '';
  }, [watchedPartyTypeOptionId, setValue]);

  // Resolve party profile filter by selected entity type category option
  const {
    targetPartyTypes,
    isIndividualFilter,
    entityTypeIdFilter,
    isIndividualSelection,
  } = usePartyProfileFilterByEntityType(watchedPartyTypeOptionId);

  // Fetch party profile if not already in state
  const { data: fetchedPartyProfile } = useGetPartyProfile(
    watchedPartyId || '',
    undefined,
    Boolean(watchedPartyId)
  );

  const activeParty = useMemo(
    () => selectedPartyProfile || fetchedPartyProfile || null,
    [selectedPartyProfile, fetchedPartyProfile]
  );

  // Check if selected party is individual using standard helper
  const isIndividual = Boolean(
    isIndividualSelection ||
      isVoucherIndividualSelection({
        entityType: activeParty?.entityType,
        isIndividual: activeParty?.isIndividual,
      })
  );

  // Non-individual with existing panNo in master is disabled; individual or non-individual without panNo is editable
  const isPanDisabled = !isIndividual && Boolean(activeParty?.panNo?.trim());

  // Sync PAN fields based on individual status & party profile
  useEffect(() => {
    if (!activeParty) {
      setValue('panNumber', '');
      setValue('panName', '');
      setValue('panDob', '');
      return;
    }

    if (!isIndividual) {
      if (activeParty.panNo) {
        setValue('panNumber', activeParty.panNo.toUpperCase(), {
          shouldValidate: true,
        });
      }
      setValue('panName', activeParty.panName || activeParty.name || '');
      setValue(
        'panDob',
        activeParty.panDob ? String(activeParty.panDob).slice(0, 10) : ''
      );
    }
  }, [activeParty, isIndividual, setValue]);

  // Load Available Advances for PAN
  const {
    data: availableAdvancesData,
    isLoading: isAdvancesLoading,
  } = useAvailableAdvances({
    panNumber: debouncedPanNumber,
    branchId: watchedBranchId,
    asOnDate: watchedAsOnDate,
    partyProfileId: watchedPartyId || undefined,
    enabled: Boolean(
      watchedBranchId &&
      watchedAsOnDate &&
      isPanComplete &&
      isPanFormatValid
    ),
  });

  const availableAdvances = availableAdvancesData ?? EMPTY_ADVANCES;

  // Auto-fill panName and panDob from matching advances if currently blank
  const lastSyncedPanMetaRef = useRef<string>('');
  useEffect(() => {
    if (!availableAdvances || availableAdvances.length === 0) return;

    const signature = availableAdvances.map(a => a.id).join('|');
    if (signature === lastSyncedPanMetaRef.current) return;
    lastSyncedPanMetaRef.current = signature;

    const currentName = getValues('panName');
    if (!currentName || !currentName.trim()) {
      const advWithName = availableAdvances.find(a => a.panName?.trim());
      if (advWithName?.panName) {
        setValue('panName', advWithName.panName.trim(), { shouldDirty: true });
      }
    }

    const currentDob = getValues('panDob');
    if (!currentDob || !currentDob.trim()) {
      const advWithDob = availableAdvances.find(a => a.panDob);
      if (advWithDob?.panDob) {
        setValue('panDob', String(advWithDob.panDob).slice(0, 10), {
          shouldDirty: true,
        });
      }
    }
  }, [availableAdvances, getValues, setValue]);

  // Use field array to ensure stable row instances and prevent focus loss during typing
  const { fields, replace } = useFieldArray({
    control,
    name: 'items',
  });

  // Keep field array synced with loaded advances without re-triggering during typing
  const lastSyncedSignatureRef = useRef<string>('');

  useEffect(() => {
    const signature = (availableAdvances || [])
      .map(a => `${a.id}:${a.availableAmount}:${a.number}`)
      .join('|');

    if (signature === lastSyncedSignatureRef.current) {
      return;
    }

    lastSyncedSignatureRef.current = signature;

    if (!availableAdvances || availableAdvances.length === 0) {
      replace([]);
      return;
    }

    const currentItems = getValues('items') || [];
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

    replace(updated);
  }, [availableAdvances, replace, getValues]);

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

  const knockOffAccountOptions = useMemo<AsyncSelectOption[]>(
    () =>
      knockOffAccounts.map(a => ({
        value: a.id,
        label: `${a.accountCode} - ${a.accountName}`,
      })),
    [knockOffAccounts]
  );

  // Load Local Paying Bank Accounts
  const { data: payingBankAccountsRes, isLoading: isPayingBanksLoading } = useQuery({
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

  const payingBankAccountOptions = useMemo<AsyncSelectOption[]>(
    () =>
      payingBankAccounts.map(a => ({
        value: a.id,
        label: `${a.accountCode} - ${a.accountName}`,
      })),
    [payingBankAccounts]
  );

  // Stable Columns definition using reusable TableColumnDef
  const columns = useMemo<
    TableColumnDef<AdvanceRefundItemFormValue & { id: string }>[]
  >(
    () => [
      {
        id: 'select',
        header: () => <SelectAllHeader count={fields.length} />,
        cell: ({ row }) => (
          <SelectRowCheckboxCell
            index={row.index}
            availableAmount={row.original.availableAmount}
          />
        ),
        enableSorting: false,
        meta: {
          headerClassName: 'w-12 text-center',
          cellClassName: 'w-12 text-center',
        },
      },
      {
        id: 'receiptNumber',
        accessorKey: 'receiptNumber',
        header: 'Receipt No',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.receiptNumber}
          </span>
        ),
      },
      {
        id: 'receiptDate',
        accessorKey: 'receiptDate',
        header: 'Receipt Date',
        cell: ({ row }) =>
          toDisplayDate(row.original.receiptDate) || '-',
      },
      {
        id: 'originalAmount',
        accessorKey: 'originalAmount',
        header: () => <div className="text-right">Original Amount (₹)</div>,
        cell: ({ row }) => (
          <div className="text-right">
            {Number(row.original.originalAmount).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </div>
        ),
      },
      {
        id: 'availableAmount',
        accessorKey: 'availableAmount',
        header: () => <div className="text-right">Available Balance (₹)</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium text-emerald-600">
            {Number(row.original.availableAmount).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </div>
        ),
      },
      {
        id: 'refundAmount',
        header: () => <div className="text-right">Refund Amount (₹)</div>,
        cell: ({ row }) => (
          <RefundAmountCell
            index={row.index}
            availableAmount={row.original.availableAmount}
          />
        ),
        meta: {
          headerClassName: 'w-52 text-right',
          cellClassName: 'w-52 text-right',
        },
      },
    ],
    [fields.length]
  );

  // Submit Handler
  const onFormSubmit = async (values: AdvanceRefundFormValues) => {
    const selectedRows = (values.items || []).filter(i => i.selected);
    if (selectedRows.length === 0) {
      toast.error('Please select at least one advance receipt to refund');
      return;
    }

    const totalRefundAmount = selectedRows.reduce(
      (acc, curr) => acc + (parseFloat(curr.refundAmount) || 0),
      0
    );

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
      panNumber: values.panNumber
        ? values.panNumber.trim().toUpperCase()
        : undefined,
      panName: values.panName?.trim() || undefined,
      panDob: values.panDob?.trim() || undefined,
      refundType: values.refundType,
      narration: values.narration.trim(),
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
          ? values.beneficiaryAccountNumber?.trim() || undefined
          : undefined,
      beneficiaryIfscCode:
        values.refundType === AdvanceRefundType.REFUND
          ? values.beneficiaryIfscCode?.trim() || undefined
          : undefined,
      beneficiaryName:
        values.refundType === AdvanceRefundType.REFUND
          ? values.beneficiaryName?.trim() || undefined
          : undefined,
      bankName:
        values.refundType === AdvanceRefundType.REFUND
          ? values.bankName?.trim() || undefined
          : undefined,
      chequeNumber:
        values.refundType === AdvanceRefundType.REFUND
          ? values.chequeNumber?.trim() || undefined
          : undefined,
      chequeDate:
        values.refundType === AdvanceRefundType.REFUND
          ? values.chequeDate?.trim() || undefined
          : undefined,
      drawnOn:
        values.refundType === AdvanceRefundType.REFUND
          ? values.drawnOn?.trim() || undefined
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
          <div className="grid gap-4 lg:grid-cols-2">
            <PurchaseWorkplaceFields />
            <div className="grid gap-4 grid-cols-2">
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
          </div>
        </CardSection>

        {/* 2. Party Profile & Identification */}
        <CardSection heading="Party & Identification">
          <div className="grid gap-4 md:grid-cols-2">
            <FormFieldCategoryOption
              name="partyTypeOptionId"
              label="Party Profile Type"
              placeholder="Select Party Type"
              code={CategoryOptionCodeEnum.EntityType}
              isCreatable={false}
              disabled={!watchedBranchId}
            />
            <div>
              <EntityPickerField
                label="Party Profile"
                value={
                  activeParty
                    ? `${activeParty.code} - ${activeParty.name}`
                    : ''
                }
                placeholder={
                  !watchedBranchId
                    ? 'Select branch first'
                    : !watchedPartyTypeOptionId
                      ? 'Select party profile type first'
                      : 'Click to select party profile'
                }
                disabled={!watchedBranchId || !watchedPartyTypeOptionId}
                onClick={() => setIsPartyModalOpen(true)}
                helperText={
                  !watchedBranchId
                    ? 'Select a branch first.'
                    : !watchedPartyTypeOptionId
                      ? 'Select a party profile type to enable party selection.'
                      : undefined
                }
              />
              {form.formState.errors.partyProfileId && (
                <p className="mt-1 text-xs text-error-600">
                  {form.formState.errors.partyProfileId.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <div>
              <FormFieldInput
                name="panNumber"
                label="PAN Card Number"
                placeholder="e.g. ABCDE1234F"
                disabled={isPanDisabled || !activeParty}
              />
              <p className="text-xs text-text-secondary mt-1">
                {isIndividual
                  ? 'Editable for individual party'
                  : activeParty?.panNo?.trim()
                    ? 'Auto-filled from party profile'
                    : 'Enter PAN card number manually'}
              </p>
            </div>
            <FormFieldInput
              name="panName"
              label="PAN Holder Name"
              placeholder="Full Name as per PAN"
              disabled={!isIndividual && Boolean(activeParty?.panName || activeParty?.name)}
            />
            <FormFieldDatePicker
              name="panDob"
              label="PAN DOB / Inc. Date"
              placeholder="DD/MM/YYYY"
              disabled={!isIndividual && Boolean(activeParty?.panDob)}
            />
          </div>
        </CardSection>

        <SelectPartyProfiles
          open={isPartyModalOpen}
          types={targetPartyTypes}
          queryParams={{
            branchId: watchedBranchId || undefined,
            entityTypeId: entityTypeIdFilter,
            isIndividual: isIndividualFilter,
            activeOnly: true,
            status: PartyProfileStatusEnum.APPROVE,
          }}
          selectable
          multiple={false}
          title="Select Party Profile"
          description="Search and choose an approved party profile."
          initialSelectedProfiles={activeParty ? [activeParty] : []}
          onContinue={profiles => {
            const profile = profiles[0];
            if (profile) {
              setSelectedPartyProfile(profile);
              setValue('partyProfileId', profile.id, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }
            setIsPartyModalOpen(false);
          }}
          onClose={() => setIsPartyModalOpen(false)}
        />

        {/* 3. Refund Type & Narration */}
        <CardSection heading="Refund Configuration">
          <div className="grid gap-4 md:grid-cols-3">
            <FormFieldSelect
              name="refundType"
              label="Refund Type"
              loadOptions={optionFilter([...ADVANCE_REFUND_TYPE_OPTIONS])}
              defaultOptions={[...ADVANCE_REFUND_TYPE_OPTIONS]}
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
              <FormFieldSelect
                name="knockOffAccountId"
                label="Knock Off Account (Income / Round-off)"
                placeholder="Select Account"
                loadOptions={optionFilter(knockOffAccountOptions)}
                defaultOptions={knockOffAccountOptions}
                isLoading={isAccountsLoading}
              />
              <KnockOffLimitBadge account={selectedKnockOffAccount} />
            </div>
          </CardSection>
        )}

        {watchedRefundType === AdvanceRefundType.REFUND && (
          <CardSection heading="Bank Payout & Beneficiary Details">
            <div className="grid gap-4 md:grid-cols-3">
              <FormFieldSelect
                name="payoutSource"
                label="Payout Source"
                loadOptions={optionFilter([...ADVANCE_REFUND_PAYOUT_OPTIONS])}
                defaultOptions={[...ADVANCE_REFUND_PAYOUT_OPTIONS]}
              />
              {watchedPayoutSource === AdvanceRefundPayoutSource.LOCAL_BANK && (
                <FormFieldSelect
                  name="payingBankAccountId"
                  label="Local Paying Bank Account"
                  placeholder="Select Paying Bank"
                  loadOptions={optionFilter(payingBankAccountOptions)}
                  defaultOptions={payingBankAccountOptions}
                  isLoading={isPayingBanksLoading}
                />
              )}
              <FormFieldSelect
                name="paymentMethod"
                label="Payment Method"
                loadOptions={optionFilter([...PAYMENT_METHOD_OPTIONS])}
                defaultOptions={[...PAYMENT_METHOD_OPTIONS]}
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
          ) : !debouncedPanNumber ? (
            <div className="py-8 text-center text-text-secondary text-sm">
              Please enter a 10-character PAN Card Number to display available advance receipts.
            </div>
          ) : debouncedPanNumber.length < 10 ? (
            <div className="py-8 text-center text-text-secondary text-sm">
              Enter complete 10-character PAN Card Number to search for advances...
            </div>
          ) : !isPanFormatValid ? (
            <div className="py-8 text-center text-error-600 text-sm">
              Invalid PAN format. Please enter 5 letters, 4 numbers, and 1 letter (e.g. ABCDE1234F).
            </div>
          ) : isAdvancesLoading ? (
            <div className="py-8 text-center text-text-secondary text-sm">
              Loading available advance receipts for PAN {debouncedPanNumber}...
            </div>
          ) : fields.length === 0 ? (
            <div className="py-8 text-center text-text-secondary text-sm">
              No outstanding advance receipts found for PAN {debouncedPanNumber} as of{' '}
              {watchedAsOnDate}.
            </div>
          ) : (
            <div className="space-y-4">
              <Table
                columns={columns}
                data={fields}
                enablePagination={false}
                enableSorting={false}
                getRowId={row => row.id}
              />
              <AdvanceRefundSummaryCard totalCount={fields.length} />
            </div>
          )}
        </CardSection>

        {/* Form Actions */}
        <AdvanceRefundSubmitButton
          isSubmitting={isSubmitting}
          onCancel={onCancel}
        />
      </form>
    </FormProvider>
  );
};

export default AdvanceRefundForm;
