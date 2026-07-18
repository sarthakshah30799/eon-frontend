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
import {
  createEmptyPurchasePaymentRow,
  formatPurchaseEntityLabel,
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
  cashControlAccountId?: string;
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

  return String(value);
};

const PaymentDetailRow = ({
  arrayName,
  index,
  maxAmount,
  accountQuery,
  transactionType,
  branchId,
  selectablePagesUserId,
  cashControlAccountId,
  disabled = false,
  onRemove,
  canRemove,
}: {
  arrayName: string;
  index: number;
  maxAmount?: string | number;
  accountQuery?: IAccountProfileListQuery;
  transactionType?: TransactionType;
  branchId?: string;
  selectablePagesUserId?: string;
  cashControlAccountId?: string;
  disabled?: boolean;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) => {
  const form = useFormContext();
  const { activeBranchId } = useAuth();
  const resolvedBranchId = branchId?.trim() || activeBranchId || undefined;
  const isSale = transactionType === TransactionTypeEnum.SALE;
  const isPurchase = transactionType !== TransactionTypeEnum.SALE;
  const paymentMethod = useWatch({
    control: form.control,
    name: `${arrayName}.${index}.paymentMethod`,
  }) as string | undefined;
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
  const [cashAccountLabel, setCashAccountLabel] = useState<string>('');
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [isLoadingCashAccount, setIsLoadingCashAccount] = useState(false);
  const previousPaymentMethodRef = useRef<string | undefined>(paymentMethod);
  const previousSelectionKeyRef = useRef<string | null>(null);

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
    let isActive = true;

    const loadCashAccount = async () => {
      if (
        !cashControlAccountId ||
        paymentMethod !== TransactionPaymentMethodEnum.CASH
      ) {
        setCashAccountLabel('');
        return;
      }

      try {
        setIsLoadingCashAccount(true);
        const account =
          await accountProfileApi.getAccountProfileById(cashControlAccountId);
        if (!isActive || !account) {
          return;
        }

        const label = formatPurchaseEntityLabel(
          account.accountCode,
          account.accountName
        );
        setCashAccountLabel(label);

        if (
          paymentMethod === TransactionPaymentMethodEnum.CASH &&
          String(accountId || '') === String(cashControlAccountId)
        ) {
          form.setValue(`${arrayName}.${index}.accountName`, label, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: false,
          });
        }
      } catch (error) {
        if (isActive) {
          setCashAccountLabel('');
        }
        console.error('Failed to load cash control account:', error);
      } finally {
        if (isActive) {
          setIsLoadingCashAccount(false);
        }
      }
    };

    void loadCashAccount();

    return () => {
      isActive = false;
    };
  }, [accountId, arrayName, cashControlAccountId, form, index, paymentMethod]);

  useEffect(() => {
    if (!paymentMethod) {
      return;
    }

    if (previousPaymentMethodRef.current === paymentMethod) {
      return;
    }

    const previousPaymentMethod = previousPaymentMethodRef.current;
    previousPaymentMethodRef.current = paymentMethod;

    if (paymentMethod === TransactionPaymentMethodEnum.CASH) {
      if (cashControlAccountId) {
        form.setValue(`${arrayName}.${index}.accountId`, cashControlAccountId, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        if (cashAccountLabel) {
          form.setValue(`${arrayName}.${index}.accountName`, cashAccountLabel, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: false,
          });
        }
      }

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
    cashAccountLabel,
    cashControlAccountId,
    form,
    index,
    paymentMethod,
  ]);

  useEffect(() => {
    const loadPages = async () => {
      if (
        paymentMethod !== TransactionPaymentMethodEnum.CHEQUE ||
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
      if (
        paymentMethod === TransactionPaymentMethodEnum.CASH &&
        cashControlAccountId
      ) {
        return {
          options: cashAccountLabel
            ? [
                {
                  value: cashControlAccountId,
                  label: cashAccountLabel,
                },
              ]
            : [],
          hasMore: false,
        };
      }

      const response = await accountProfileApi.getAccountProfiles({
        ...accountQuery,
        page,
        limit: ACCOUNT_PROFILE_OPTION_PAGE_SIZE,
        search: inputValue,
        active: true,
        accountType: AccountProfileLedgerLabelEnum.BankLedger,
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
    [
      accountQuery,
      cashAccountLabel,
      cashControlAccountId,
      paymentMethod,
      transactionType,
    ]
  );

  const isCash = paymentMethod === TransactionPaymentMethodEnum.CASH;
  const isCheque = paymentMethod === TransactionPaymentMethodEnum.CHEQUE;

  return (
    <div className="grid gap-4 rounded-sm border border-border-secondary bg-surface-primary p-4 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_1fr_1fr_auto]">
      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldSelect
          key={`account-${paymentMethod}-${cashControlAccountId || 'none'}-${accountId || 'empty'}`}
          name={`${arrayName}.${index}.accountId`}
          label="Account"
          placeholder={
            isCash
              ? 'Cash control account'
              : isSale
                ? 'Select sale bank account'
                : 'Select purchase bank account'
          }
          loadOptions={loadAccountOptions}
          pagination={!isCash}
          pageSize={ACCOUNT_PROFILE_OPTION_PAGE_SIZE}
          disabled={disabled || isCash}
          isSearchable
          cacheOptions={false}
        />
      </div>

      {isCheque && isPurchase ? (
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
          disabled={disabled || isCash}
        />
      </div>

      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldDatePicker
          name={`${arrayName}.${index}.chequeDate`}
          label="Cheque Date"
          disabled={disabled || !isCheque}
        />
      </div>

      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldInput
          name={`${arrayName}.${index}.branchName`}
          label="Branch Name"
          placeholder="Branch name"
          disabled={disabled || !isCheque}
        />
      </div>

      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldInput
          name={`${arrayName}.${index}.drawnOn`}
          label="Drawn On"
          placeholder="Drawn on"
          disabled={disabled || !isCheque}
        />
      </div>

      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldInput
          name={`${arrayName}.${index}.amount`}
          label="Amount"
          type="number"
          disabled={disabled}
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

      <div className="md:col-span-2 xl:col-span-7">
        <p className="text-xs text-text-secondary">
          Available amount for this row: {formatAmount(availableAmount)}
          {maxAmount !== undefined
            ? ` | Remaining after this row: ${formatAmount(remainingAfterCurrent)}`
            : ''}
        </p>
        {paymentMethod === TransactionPaymentMethodEnum.CASH ? (
          <p className="mt-1 text-xs text-text-tertiary">
            Cash mode uses the configured cash control account.
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
        {isLoadingCashAccount ? (
          <p className="mt-1 text-xs text-text-tertiary">
            Loading cash control account...
          </p>
        ) : null}
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
  cashControlAccountId,
  disabled = false,
}: TransactionPaymentDetailsFieldArrayProps) => {
  const form = useFormContext();
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

  const syncedPayableTotalRef = useRef<string>('');

  const activePaymentMethod = useMemo(() => {
    return (
      (paymentRows ?? []).find(row => Boolean(row?.paymentMethod?.trim()))
        ?.paymentMethod || TransactionPaymentMethodEnum.CHEQUE
    );
  }, [paymentRows]);

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

    const normalizedTotal = normalizeAmount(maxAmount);
    if (syncedPayableTotalRef.current === normalizedTotal) {
      return;
    }

    syncedPayableTotalRef.current = normalizedTotal;

    const currentRows = (form.getValues(name) ??
      []) as ITransactionPaymentDetailFormRow[];
    if (!currentRows.length) {
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

    form.setValue(`${name}.0.amount`, nextPrimaryAmount.toFixed(2), {
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
        form.setValue(`${name}.${index}.paymentMethod`, method, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });

        if (method === TransactionPaymentMethodEnum.CASH) {
          if (cashControlAccountId) {
            form.setValue(`${name}.${index}.accountId`, cashControlAccountId, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
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

        if (row.accountId === cashControlAccountId) {
          form.setValue(`${name}.${index}.accountId`, '', {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }
      });
    },
    [append, cashControlAccountId, form, maxAmount, name]
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
            disabled={disabled || !cashControlAccountId}
            onClick={() =>
              applyPaymentMethod(TransactionPaymentMethodEnum.CASH)
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
            disabled={disabled}
            onClick={() =>
              applyPaymentMethod(TransactionPaymentMethodEnum.CHEQUE)
            }
          >
            Cheque
          </Button>
          {!cashControlAccountId ? (
            <span className="text-xs text-error-600">
              Cash control account is not configured.
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
                cashControlAccountId={cashControlAccountId}
                disabled={disabled}
                onRemove={remove}
                canRemove={fields.length > 0}
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
