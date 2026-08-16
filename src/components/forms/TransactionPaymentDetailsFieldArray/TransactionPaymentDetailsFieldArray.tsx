import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { AsyncSelectResponse } from '@/components/ui';
import { Button, CardSection } from '@/components/ui';
import {
  FormFieldDatePicker,
  FormFieldInput,
  FormFieldSelect,
} from '@/components/forms';
import { accountProfileApi } from '@/api/accountProfile';
import { chequebookApi, type IChequeBookPageTracking } from '@/api';
import {
  AccountProfileLedgerLabelEnum,
  type IAccountProfileListQuery,
} from '@/modules/accountProfile';
import {
  TransactionPaymentMethodEnum,
  TransactionTypeEnum,
  type TransactionType,
} from '@/modules/transactions';
import { useAuth } from '@/lib/AuthContext';
import type { ITransactionPaymentDetailFormRow } from './transactionPaymentDetailsTypes';
import { useAvailableAdvances } from '@/modules/vouchers';
import {
  createEmptyPurchasePaymentRow,
  getPurchaseTransactionAccountFilter,
} from '@/modules/purchase/utils/purchaseUtils';

const ACCOUNT_PROFILE_OPTION_PAGE_SIZE = 30;

interface TransactionPaymentDetailsFieldArrayProps {
  name: string;
  title?: string;
  description?: string;
  maxAmount?: string | number;
  syncPrimaryRowAmount?: boolean;
  accountQuery?: IAccountProfileListQuery;
  transactionType?: TransactionType;
  branchId?: string;
  selectablePagesUserId?: string;
  allowCashPayment?: boolean;
  allowedPaymentMethods?: Array<'CASH' | 'CHEQUE'>;
  disabled?: boolean;
}

const formatAmount = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') {
    return '0.00';
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue)
    ? numericValue.toFixed(2)
    : String(value);
};

const normalizeAmount = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(2) : String(value);
};

const amountCents = (value?: string | number | null) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? Math.round(numeric * 100) : 0;
};

const PaymentDetailRow = ({
  arrayName,
  index,
  maxAmount,
  accountQuery,
  transactionType,
  branchId,
  selectablePagesUserId,
  allowCashPayment = true,
  canUseCheque = true,
  disabled = false,
  onRemove,
  canRemove,
  selectedAdvanceVoucherIds,
  onAdvanceSelected,
}: {
  arrayName: string;
  index: number;
  maxAmount?: string | number;
  accountQuery?: IAccountProfileListQuery;
  transactionType?: TransactionType;
  branchId?: string;
  selectablePagesUserId?: string;
  allowCashPayment?: boolean;
  canUseCheque?: boolean;
  disabled?: boolean;
  onRemove: (index: number) => void;
  canRemove: boolean;
  selectedAdvanceVoucherIds: string[];
  onAdvanceSelected: (index: number, voucherId: string, amount: string, paymentMethod: string) => void;
}) => {
  const form = useFormContext();
  const { activeBranchId } = useAuth();
  const resolvedBranchId = branchId?.trim() || activeBranchId || undefined;
  const isSale = transactionType === TransactionTypeEnum.SALE;
  const isPurchase = transactionType !== TransactionTypeEnum.SALE;
  const canUseCash = allowCashPayment !== false;
  const paymentMethod = useWatch({
    control: form.control,
    name: `${arrayName}.${index}.paymentMethod`,
  }) as string | undefined;
  const settlementSource = (useWatch({
    control: form.control,
    name: `${arrayName}.${index}.settlementSource`,
  }) as 'NORMAL' | 'ADVANCE' | undefined) ?? 'NORMAL';
  const advanceVoucherId = useWatch({
    control: form.control,
    name: `${arrayName}.${index}.advanceVoucherId`,
  }) as string | undefined;
  const partyProfileId = useWatch({ control: form.control, name: 'partyProfileId' }) as string | undefined;
  const transactionDate = useWatch({ control: form.control, name: 'transactionDate' }) as string | undefined;
  const counterId = useWatch({ control: form.control, name: 'counterId' }) as string | undefined;
  const isAdvanceRemainder = Boolean(useWatch({ control: form.control, name: `${arrayName}.${index}.isAdvanceRemainder` }));
  const amountLocked = Boolean(useWatch({ control: form.control, name: `${arrayName}.${index}.amountLocked` }));
  const paymentRows = useWatch({
    control: form.control,
    name: arrayName,
  }) as ITransactionPaymentDetailFormRow[] | undefined;

  const amount = useWatch({
    control: form.control,
    name: `${arrayName}.${index}.amount`,
  });
  const chequeNumber = useWatch({
    control: form.control,
    name: `${arrayName}.${index}.chequeNumber`,
  });
  const chequePageId = useWatch({
    control: form.control,
    name: `${arrayName}.${index}.chequePageId`,
  });
  const accountId = useWatch({
    control: form.control,
    name: `${arrayName}.${index}.accountId`,
  });

  const [pageOptions, setPageOptions] = useState<IChequeBookPageTracking[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const previousPaymentMethodRef = useRef<string | undefined>(paymentMethod);
  const previousSelectionKeyRef = useRef<string | null>(null);
  const appliedAdvanceSelectionRef = useRef<string>('');
  const advanceType = isSale ? 'RECEIPT' : 'PAYMENT';
  const { data: availableAdvances = [], isLoading: isLoadingAdvances } = useAvailableAdvances(
    advanceType,
    {
      partyProfileId: partyProfileId ?? '',
      branchId: resolvedBranchId ?? '',
      counterId: counterId ?? '',
      transactionDate: transactionDate ?? '',
      paymentMethod: paymentMethod === TransactionPaymentMethodEnum.CASH ? 'CASH' : 'CHEQUE',
    },
    settlementSource === 'ADVANCE' && Boolean(paymentMethod)
  );
  const advanceOptions = useMemo(() => availableAdvances.filter(voucher => voucher.id === advanceVoucherId || !selectedAdvanceVoucherIds.includes(voucher.id)).map(voucher => ({
    value: voucher.id,
    label: `${voucher.number} | ${voucher.transactionDate} | Available ${formatAmount(voucher.availableAmount)}`,
  })), [advanceVoucherId, availableAdvances, selectedAdvanceVoucherIds]);

  const priorAmount = useMemo(() => {
    return (paymentRows ?? [])
      .slice(0, index)
      .reduce((sum, row) => sum + Number(row?.amount || 0), 0);
  }, [index, paymentRows]);

  const availableAmount = useMemo(() => {
    const total = Number(maxAmount || 0);
    if (!Number.isFinite(total)) {
      return 0;
    }

    return Math.max(total - priorAmount, 0);
  }, [maxAmount, priorAmount]);

  useEffect(() => {
    if (settlementSource !== 'ADVANCE') {
      appliedAdvanceSelectionRef.current = '';
      form.setValue(`${arrayName}.${index}.advanceVoucherId`, '', { shouldValidate: false });
      form.setValue(`${arrayName}.${index}.amountLocked`, isAdvanceRemainder, { shouldValidate: false });
      return;
    }
    const voucher = availableAdvances.find(item => item.id === advanceVoucherId);
    if (!voucher) return;
    form.setValue(`${arrayName}.${index}.accountId`, voucher.advanceControlAccountId ?? '', { shouldDirty: true, shouldValidate: true });
    form.setValue(`${arrayName}.${index}.accountName`, voucher.advanceControlAccountSnapshot?.label ?? voucher.advanceControlAccountSnapshot?.name ?? 'Advance Control Account', { shouldDirty: true });
    form.setValue(`${arrayName}.${index}.advanceVoucherNumber`, voucher.number, { shouldDirty: true });
    form.setValue(`${arrayName}.${index}.advanceAvailableAmount`, voucher.availableAmount, { shouldDirty: true });
    const appliedAmount = Math.min(availableAmount, Number(voucher.availableAmount)).toFixed(2);
    form.setValue(`${arrayName}.${index}.amount`, appliedAmount, { shouldDirty: true, shouldValidate: true });
    form.setValue(`${arrayName}.${index}.isAdvanceRemainder`, false, { shouldDirty: true });
    form.setValue(`${arrayName}.${index}.amountLocked`, true, { shouldDirty: true });
    form.setValue(`${arrayName}.${index}.chequePageId`, '', { shouldDirty: true, shouldValidate: true });
    form.setValue(`${arrayName}.${index}.chequePageSnapshot`, null, { shouldDirty: true });
    if (paymentMethod === TransactionPaymentMethodEnum.CHEQUE) {
      form.setValue(`${arrayName}.${index}.chequeNumber`, voucher.chequeNumber ?? '', { shouldDirty: true });
      form.setValue(`${arrayName}.${index}.chequeDate`, voucher.chequeDate ?? '', { shouldDirty: true });
      form.setValue(`${arrayName}.${index}.branchName`, voucher.chequeBranch ?? '', { shouldDirty: true });
      form.setValue(`${arrayName}.${index}.drawnOn`, voucher.drawnOn ?? '', { shouldDirty: true });
    }
    if (appliedAdvanceSelectionRef.current !== voucher.id) {
      appliedAdvanceSelectionRef.current = voucher.id;
      onAdvanceSelected(index, voucher.id, appliedAmount, paymentMethod ?? '');
    }
  }, [advanceVoucherId, arrayName, availableAdvances, availableAmount, form, index, isAdvanceRemainder, onAdvanceSelected, paymentMethod, settlementSource]);

  const remainingAfterCurrent = useMemo(() => {
    const currentAmount = Number(amount || 0);
    if (!Number.isFinite(currentAmount)) {
      return availableAmount;
    }

    return Math.max(availableAmount - currentAmount, 0);
  }, [amount, availableAmount]);

  useEffect(() => {
    const amountField = `${arrayName}.${index}.amount` as const;
    const currentAmount = Number(amount || '');

    if (!amount || amount === '') {
      if (form.getFieldState(amountField).error?.type === 'payment-limit') {
        form.clearErrors(amountField);
      }
      return;
    }

    if (!Number.isFinite(currentAmount)) {
      form.setError(amountField, {
        type: 'payment-limit',
        message: 'Enter a valid amount',
      });
      return;
    }

    if (currentAmount > availableAmount) {
      form.setError(amountField, {
        type: 'payment-limit',
        message: `Amount cannot exceed ${formatAmount(availableAmount)}`,
      });
      return;
    }

    if (form.getFieldState(amountField).error?.type === 'payment-limit') {
      form.clearErrors(amountField);
    }
  }, [amount, arrayName, availableAmount, form, index]);

  useEffect(() => {
    if (!paymentMethod) {
      return;
    }

    if (!canUseCash && paymentMethod === TransactionPaymentMethodEnum.CASH) {
      form.setValue(`${arrayName}.${index}.paymentMethod`, TransactionPaymentMethodEnum.CHEQUE, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      return;
    }

    if (!canUseCheque && paymentMethod === TransactionPaymentMethodEnum.CHEQUE) {
      form.setValue(`${arrayName}.${index}.paymentMethod`, TransactionPaymentMethodEnum.CASH, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      return;
    }

    if (previousPaymentMethodRef.current === paymentMethod) {
      return;
    }

    const previousPaymentMethod = previousPaymentMethodRef.current;
    previousPaymentMethodRef.current = paymentMethod;

    if (paymentMethod === TransactionPaymentMethodEnum.CASH) {
      form.setValue(`${arrayName}.${index}.accountId`, '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      form.setValue(`${arrayName}.${index}.accountName`, '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });

      form.setValue(`${arrayName}.${index}.chequePageId`, '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      form.setValue(`${arrayName}.${index}.chequePageSnapshot`, null, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      form.setValue(`${arrayName}.${index}.chequeNumber`, '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      form.setValue(`${arrayName}.${index}.chequeDate`, '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      form.setValue(`${arrayName}.${index}.branchName`, '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      form.setValue(`${arrayName}.${index}.drawnOn`, '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      return;
    }

    if (previousPaymentMethod === TransactionPaymentMethodEnum.CASH) {
      form.setValue(`${arrayName}.${index}.accountId`, '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      form.setValue(`${arrayName}.${index}.accountName`, '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      form.setValue(`${arrayName}.${index}.chequePageId`, '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      form.setValue(`${arrayName}.${index}.chequePageSnapshot`, null, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      form.setValue(`${arrayName}.${index}.chequeNumber`, '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      form.setValue(`${arrayName}.${index}.chequeDate`, '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      form.setValue(`${arrayName}.${index}.branchName`, '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      form.setValue(`${arrayName}.${index}.drawnOn`, '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
    }
  }, [
    arrayName,
    canUseCash,
    canUseCheque,
    form,
    index,
    paymentMethod,
  ]);

  useEffect(() => {
    const loadPages = async () => {
      if (
        paymentMethod !== TransactionPaymentMethodEnum.CHEQUE ||
        settlementSource === 'ADVANCE' ||
        !isPurchase ||
        !accountId ||
        !resolvedBranchId
      ) {
        setPageOptions([]);
        return;
      }

      try {
        setIsLoadingPages(true);
        const pages = await chequebookApi.getSelectablePages({
          accountId: String(accountId),
          userId: selectablePagesUserId || undefined,
        });

        setPageOptions(pages);
      } catch (error) {
        setPageOptions([]);
        console.error('Failed to load selectable cheque pages:', error);
      } finally {
        setIsLoadingPages(false);
      }
    };

    void loadPages();
  }, [
    accountId,
    isPurchase,
    paymentMethod,
    settlementSource,
    resolvedBranchId,
    selectablePagesUserId,
  ]);

  useEffect(() => {
    const nextSelectionKey = `${resolvedBranchId || ''}:${accountId || ''}:${selectablePagesUserId || ''}:${paymentMethod || ''}`;

    if (previousSelectionKeyRef.current === null) {
      previousSelectionKeyRef.current = nextSelectionKey;
      return;
    }

    if (previousSelectionKeyRef.current === nextSelectionKey) {
      return;
    }

    previousSelectionKeyRef.current = nextSelectionKey;

    if (!accountId || paymentMethod !== TransactionPaymentMethodEnum.CHEQUE) {
      return;
    }

    form.setValue(`${arrayName}.${index}.chequePageId`, '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.setValue(`${arrayName}.${index}.chequeNumber`, '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue(`${arrayName}.${index}.chequePageSnapshot`, null, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  }, [
    accountId,
    arrayName,
    form,
    index,
    paymentMethod,
    resolvedBranchId,
    selectablePagesUserId,
  ]);

  useEffect(() => {
    const selectedPage = pageOptions.find(
      page => page.id === String(chequePageId || '')
    );
    if (!selectedPage) {
      return;
    }

    form.setValue(
      `${arrayName}.${index}.chequeNumber`,
      String(selectedPage.pageNo),
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      }
    );
    form.setValue(
      `${arrayName}.${index}.chequePageSnapshot`,
      {
        ...selectedPage,
      },
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      }
    );
  }, [accountId, arrayName, chequePageId, form, index, pageOptions]);

  const loadAccountOptions = useCallback(
    async (inputValue: string, page = 1): Promise<AsyncSelectResponse> => {
      const response = await accountProfileApi.getAccountProfiles({
        ...accountQuery,
        page,
        limit: ACCOUNT_PROFILE_OPTION_PAGE_SIZE,
        search: inputValue,
        active: true,
        accountType:
          paymentMethod === TransactionPaymentMethodEnum.CASH
            ? AccountProfileLedgerLabelEnum.CashLedger
            : AccountProfileLedgerLabelEnum.BankLedger,
        ...getPurchaseTransactionAccountFilter(
          transactionType ?? TransactionTypeEnum.PURCHASE
        ),
      });

      const accounts = response.data || [];

      return {
        options: accounts.map(account => ({
          value: account.id,
          label: `${account.accountCode} - ${account.accountName}`,
        })),
        hasMore: accounts.length === ACCOUNT_PROFILE_OPTION_PAGE_SIZE,
      };
    },
    [accountQuery, paymentMethod, transactionType]
  );

  const isCash = paymentMethod === TransactionPaymentMethodEnum.CASH;
  const isCheque = paymentMethod === TransactionPaymentMethodEnum.CHEQUE;

  return (
    <div className="grid gap-4 rounded-sm border border-border-secondary bg-surface-primary p-4 md:grid-cols-2 xl:grid-cols-[1fr_1.3fr_1fr_1fr_1fr_1fr_1fr_1fr_auto]">
      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldSelect
          name={`${arrayName}.${index}.settlementSource`}
          label="Settlement Source"
          loadOptions={async () => ({ options: [{ value: 'NORMAL', label: 'Normal' }, { value: 'ADVANCE', label: 'Advance' }] })}
          defaultOptions={[{ value: 'NORMAL', label: 'Normal' }, { value: 'ADVANCE', label: 'Advance' }]}
          disabled={disabled || Boolean(advanceVoucherId)}
        />
      </div>
      {settlementSource === 'ADVANCE' ? <div className="md:col-span-2 xl:col-span-1">
        <FormFieldSelect
          name={`${arrayName}.${index}.advanceVoucherId`}
          label={`${isSale ? 'Receipt' : 'Payment'} Advance`}
          placeholder="Select available advance"
          loadOptions={async input => ({ options: advanceOptions.filter(option => option.label.toLowerCase().includes(input.toLowerCase())) })}
          defaultOptions={advanceOptions}
          disabled={disabled || Boolean(advanceVoucherId) || isLoadingAdvances || !partyProfileId || !resolvedBranchId || !counterId || !transactionDate}
          cacheOptions={false}
        />
      </div> : null}
      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldSelect
          key={`account-${paymentMethod}-${accountId || 'empty'}`}
          name={`${arrayName}.${index}.accountId`}
          label="Account"
          placeholder={
            isCash
              ? 'Select cash ledger account'
              : isSale
              ? 'Select sell bank account'
                : 'Select purchase bank account'
          }
          loadOptions={loadAccountOptions}
          pagination
          pageSize={ACCOUNT_PROFILE_OPTION_PAGE_SIZE}
          disabled={disabled || settlementSource === 'ADVANCE'}
          isSearchable
          cacheOptions={false}
        />
      </div>

      {isCheque && isPurchase && settlementSource !== 'ADVANCE' ? (
        <div className="md:col-span-2 xl:col-span-1">
          <FormFieldSelect
            key={`cheque-page-${accountId || 'empty'}-${pageOptions.length}`}
            name={`${arrayName}.${index}.chequePageId`}
            label="Cheque Page"
            placeholder="Select cheque page"
            loadOptions={async (
              inputValue: string
            ): Promise<AsyncSelectResponse> => {
              const normalized = inputValue.trim().toLowerCase();
              const options = pageOptions
                .filter(page => {
                  if (!normalized) {
                    return true;
                  }

                  return [
                    String(page.pageNo),
                    page.checkBook?.no,
                    page.checkBook?.bankAccountCode,
                  ]
                    .filter(Boolean)
                    .some(value =>
                      String(value).toLowerCase().includes(normalized)
                    );
                })
                .map(page => ({
                  value: page.id,
                  label: `${page.checkBook?.no || 'Book'} | Page ${page.pageNo}`,
                }));

              return { options, hasMore: false };
            }}
            disabled={disabled || !accountId || isLoadingPages}
            isSearchable
            cacheOptions={false}
          />
        </div>
      ) : null}

      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldInput
          name={`${arrayName}.${index}.chequeNumber`}
          label="Cheque / Ref No"
          placeholder={
            isCash
              ? 'Not required'
              : isSale
                ? 'Enter customer cheque number'
                : 'Page no will fill here'
          }
          disabled={disabled || isCash || settlementSource === 'ADVANCE'}
        />
      </div>

      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldDatePicker
          name={`${arrayName}.${index}.chequeDate`}
          label="Cheque Date"
          disabled={disabled || !isCheque || settlementSource === 'ADVANCE'}
        />
      </div>

      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldInput
          name={`${arrayName}.${index}.branchName`}
          label="Branch Name"
          placeholder="Branch name"
          disabled={disabled || !isCheque || settlementSource === 'ADVANCE'}
        />
      </div>

      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldInput
          name={`${arrayName}.${index}.drawnOn`}
          label="Drawn On"
          placeholder="Drawn on"
          disabled={disabled || !isCheque || settlementSource === 'ADVANCE'}
        />
      </div>

      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldInput
          name={`${arrayName}.${index}.amount`}
          label="Amount"
          type="number"
          disabled={disabled || settlementSource === 'ADVANCE' || amountLocked}
        />
      </div>

      <div className="flex items-start justify-end pt-7">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          disabled={!canRemove || disabled}
          onClick={() => onRemove(index)}
          aria-label="Remove payment detail"
        >
          <TrashIcon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="md:col-span-2 xl:col-span-8">
        <p className="text-xs text-text-secondary">
          Available amount for this row: {formatAmount(availableAmount)}
          {maxAmount !== undefined
            ? ` | Remaining after this row: ${formatAmount(remainingAfterCurrent)}`
            : ''}
        </p>
        {paymentMethod === TransactionPaymentMethodEnum.CASH ? (
          <p className="mt-1 text-xs text-text-tertiary">
            Cash mode requires an active INR Cash Ledger account.
          </p>
        ) : isSale ? (
          <p className="mt-1 text-xs text-text-tertiary">
            Enter the customer-provided cheque number directly.
          </p>
        ) : chequeNumber ? null : (
          <p className="mt-1 text-xs text-text-tertiary">
            Select the cheque page from the list; the reference number will be
            filled automatically.
          </p>
        )}
      </div>
    </div>
  );
};

export const TransactionPaymentDetailsFieldArray = ({
  name,
  title = 'Payment Details',
  description = 'Store payment records before final submission.',
  maxAmount,
  syncPrimaryRowAmount = false,
  accountQuery,
  transactionType = TransactionTypeEnum.PURCHASE,
  branchId,
  selectablePagesUserId,
  allowCashPayment = true,
  allowedPaymentMethods,
  disabled = false,
}: TransactionPaymentDetailsFieldArrayProps) => {
  const form = useFormContext();
  const canUseCash = allowCashPayment !== false;
  const canUseCheque =
    !allowedPaymentMethods?.length ||
    allowedPaymentMethods.includes(TransactionPaymentMethodEnum.CHEQUE);
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });

  const paymentRows = useWatch({
    control: form.control,
    name,
  }) as ITransactionPaymentDetailFormRow[] | undefined;

  const totalApplied = useMemo(() => {
    return (paymentRows ?? []).reduce(
      (sum, row) => sum + Number(row?.amount || 0),
      0
    );
  }, [paymentRows]);

  const remainingAmount = useMemo(() => {
    const total = Number(maxAmount || 0);
    if (!Number.isFinite(total)) {
      return 0;
    }

    return Math.max(total - totalApplied, 0);
  }, [maxAmount, totalApplied]);

  const activePaymentMethod = useMemo(() => {
    return (
      (paymentRows ?? []).find(row => Boolean(row?.paymentMethod?.trim()))
        ?.paymentMethod || TransactionPaymentMethodEnum.CHEQUE
    );
  }, [paymentRows]);

  const selectedAdvanceVoucherIds = useMemo(() => (paymentRows ?? [])
    .filter(row => row.settlementSource === 'ADVANCE' && Boolean(row.advanceVoucherId))
    .map(row => String(row.advanceVoucherId)), [paymentRows]);

  const handleAdvanceSelected = useCallback((selectedIndex: number, voucherId: string, appliedAmount: string, paymentMethod: string) => {
    const rows = (form.getValues(name) ?? []) as ITransactionPaymentDetailFormRow[];
    if (rows.some((row, index) => index !== selectedIndex && row.advanceVoucherId === voucherId)) {
      form.setError(`${name}.${selectedIndex}.advanceVoucherId`, { type: 'duplicate', message: 'This advance is already selected in this transaction' });
      return;
    }

    const totalCents = amountCents(maxAmount);
    const remainderIndex = rows.findIndex((row, index) => index !== selectedIndex && row.isAdvanceRemainder);
    const usedCents = rows.reduce((sum, row, index) => {
      if (index === remainderIndex) return sum;
      return sum + (index === selectedIndex ? amountCents(appliedAmount) : amountCents(row.amount));
    }, 0);
    const remainderCents = Math.max(totalCents - usedCents, 0);

    if (remainderIndex >= 0) {
      if (remainderCents === 0 && rows.length > 1) {
        remove(remainderIndex);
      } else {
        form.setValue(`${name}.${remainderIndex}.amount`, (remainderCents / 100).toFixed(2), { shouldDirty: true, shouldValidate: true });
        form.setValue(`${name}.${remainderIndex}.paymentMethod`, paymentMethod, { shouldDirty: true, shouldValidate: true });
        form.setValue(`${name}.${remainderIndex}.amountLocked`, true, { shouldDirty: true });
      }
      return;
    }

    if (remainderCents > 0) {
      append(createEmptyPurchasePaymentRow({
        settlementSource: 'NORMAL',
        paymentMethod,
        amount: (remainderCents / 100).toFixed(2),
        isAdvanceRemainder: true,
        amountLocked: true,
      }), { shouldFocus: false });
    }
  }, [append, form, maxAmount, name, remove]);

  useEffect(() => {
    const rows = (paymentRows ?? []);
    const remainderIndex = rows.findIndex(row => row.isAdvanceRemainder);
    if (remainderIndex < 0) return;
    const desiredCents = Math.max(amountCents(maxAmount) - rows.reduce((sum, row, index) => index === remainderIndex ? sum : sum + amountCents(row.amount), 0), 0);
    const currentCents = amountCents(rows[remainderIndex]?.amount);
    if (desiredCents === 0 && rows.length > 1) {
      remove(remainderIndex);
    } else if (currentCents !== desiredCents) {
      form.setValue(`${name}.${remainderIndex}.amount`, (desiredCents / 100).toFixed(2), { shouldDirty: true, shouldValidate: true });
    }
  }, [form, maxAmount, name, paymentRows, remove]);

  useEffect(() => {
    const total = Number(maxAmount || 0);
    if (
      disabled ||
      !Number.isFinite(total) ||
      total <= 0 ||
      fields.length > 0
    ) {
      return;
    }

    append(
      createEmptyPurchasePaymentRow({
        paymentMethod: TransactionPaymentMethodEnum.CHEQUE,
        amount: normalizeAmount(maxAmount),
      }),
      { shouldFocus: false }
    );
  }, [append, disabled, fields.length, maxAmount]);

  useEffect(() => {
    if (!syncPrimaryRowAmount) {
      return;
    }

    const total = Number(maxAmount || 0);
    if (!Number.isFinite(total)) {
      return;
    }

    const currentRows = (form.getValues(name) ??
      []) as ITransactionPaymentDetailFormRow[];
    if (!currentRows.length) {
      return;
    }

    const primaryAmountField = `${name}.0.amount` as const;
    if (form.getFieldState(primaryAmountField).isDirty || currentRows[0]?.amountLocked || currentRows[0]?.settlementSource === 'ADVANCE') {
      return;
    }

    const otherRowsTotal = currentRows
      .slice(1)
      .reduce((sum, row) => sum + Number(row?.amount || 0), 0);
    const nextPrimaryAmount = Math.max(total - otherRowsTotal, 0);
    const currentPrimaryAmount = Number(currentRows[0]?.amount || 0);

    if (currentPrimaryAmount === nextPrimaryAmount) {
      return;
    }

    form.setValue(primaryAmountField, nextPrimaryAmount.toFixed(2), {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [form, maxAmount, name, syncPrimaryRowAmount]);

  const applyPaymentMethod = useCallback(
    (method: string) => {
      const currentRows = (form.getValues(name) ??
        []) as ITransactionPaymentDetailFormRow[];
      if (!currentRows.length) {
        append(
          createEmptyPurchasePaymentRow({
            paymentMethod: method,
            amount: normalizeAmount(maxAmount),
          }),
          { shouldFocus: false }
        );
        return;
      }

      currentRows.forEach((row, index) => {
        form.setValue(`${name}.${index}.settlementSource`, 'NORMAL', {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        form.setValue(`${name}.${index}.advanceVoucherId`, '', {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: false,
        });
        form.setValue(`${name}.${index}.isAdvanceRemainder`, false, { shouldDirty: true, shouldValidate: false });
        form.setValue(`${name}.${index}.amountLocked`, false, { shouldDirty: true, shouldValidate: false });
        form.setValue(`${name}.${index}.paymentMethod`, method, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });

        if (method === TransactionPaymentMethodEnum.CASH) {
          if (row.paymentMethod !== method) {
            form.setValue(`${name}.${index}.accountId`, '', {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
            form.setValue(`${name}.${index}.accountName`, '', {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: false,
            });
          }
          form.setValue(`${name}.${index}.chequePageId`, '', {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
          form.setValue(`${name}.${index}.chequePageSnapshot`, null, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: false,
          });
          form.setValue(`${name}.${index}.chequeNumber`, '', {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: false,
          });
          form.setValue(`${name}.${index}.chequeDate`, '', {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: false,
          });
          form.setValue(`${name}.${index}.branchName`, '', {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: false,
          });
          form.setValue(`${name}.${index}.drawnOn`, '', {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: false,
          });
          return;
        }

        if (row.paymentMethod !== method) {
          form.setValue(`${name}.${index}.accountId`, '', {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }
      });
    },
    [append, form, maxAmount, name]
  );

  return (
    <CardSection heading={title}>
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">{description}</p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Payment Mode
          </span>
          <Button
            type="button"
            size="sm"
            variant={
              activePaymentMethod === TransactionPaymentMethodEnum.CASH
                ? 'default'
                : 'outline'
            }
            disabled={disabled || !canUseCash}
            onClick={() =>
              canUseCash
                ? applyPaymentMethod(TransactionPaymentMethodEnum.CASH)
                : undefined
            }
          >
            Cash
          </Button>
          <Button
            type="button"
            size="sm"
            variant={
              activePaymentMethod === TransactionPaymentMethodEnum.CHEQUE
                ? 'default'
                : 'outline'
            }
            disabled={disabled || !canUseCheque}
            onClick={() =>
              canUseCheque
                ? applyPaymentMethod(TransactionPaymentMethodEnum.CHEQUE)
                : undefined
            }
          >
            Cheque
          </Button>
          {!canUseCash ? (
            <span className="text-xs text-error-600">
              Cash payment is not allowed for this transaction type.
            </span>
          ) : null}
        </div>

        {fields.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border-secondary bg-surface-secondary/30 px-4 py-6 text-center text-sm text-text-secondary">
            No payment details added yet.
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <PaymentDetailRow
                key={field.id}
                arrayName={name}
                index={index}
                maxAmount={maxAmount}
                accountQuery={accountQuery}
                transactionType={transactionType}
                branchId={branchId}
                selectablePagesUserId={selectablePagesUserId}
                allowCashPayment={allowCashPayment}
                canUseCheque={canUseCheque}
                disabled={disabled}
                onRemove={remove}
                canRemove={fields.length > 0}
                selectedAdvanceVoucherIds={selectedAdvanceVoucherIds}
                onAdvanceSelected={handleAdvanceSelected}
              />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-secondary pt-4">
          <div className="text-sm text-text-secondary">
            Total payment amount: {formatAmount(totalApplied)}
            {maxAmount !== undefined
              ? ` | Remaining amount: ${formatAmount(remainingAmount)}`
              : ''}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() =>
              append(
                createEmptyPurchasePaymentRow({
                  paymentMethod:
                    activePaymentMethod || TransactionPaymentMethodEnum.CHEQUE,
                  amount: normalizeAmount(remainingAmount || maxAmount),
                }),
                { shouldFocus: false }
              )
            }
          >
            <PlusIcon className="h-4 w-4" />
            Add Payment
          </Button>
        </div>
      </div>
    </CardSection>
  );
};

export default TransactionPaymentDetailsFieldArray;
