import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useController, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { AsyncSelectResponse } from '@/components/ui';
import { Button, CardSection, Label } from '@/components/ui';
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
import { SelectAvailableAdvances } from '@/modules/vouchers/components/SelectAvailableAdvances';
import { useAvailableAdvances } from '@/modules/vouchers/hooks';
import type { AvailableAdvance } from '@/modules/vouchers/types';
import { formatAdvanceAccountLabel } from '@/modules/vouchers/utils';
import {
  createEmptyPurchasePaymentRow,
  getPurchaseTransactionAccountFilter,
} from '@/modules/purchase/utils/purchaseUtils';
import {
  SETTLEMENT_SOURCE_OPTIONS,
  TRANSACTION_PAYMENT_TEXT,
} from './transactionPaymentDetailsConstants';

const ACCOUNT_PROFILE_OPTION_PAGE_SIZE = 30;
const EMPTY_AVAILABLE_ADVANCES: AvailableAdvance[] = [];

const loadSettlementSourceOptions = async (): Promise<AsyncSelectResponse> => ({
  options: SETTLEMENT_SOURCE_OPTIONS,
});

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

const buildAdvancePaymentRow = (
  base: ITransactionPaymentDetailFormRow,
  voucher: AvailableAdvance,
  appliedAmount: string,
  paymentMethod: string
): ITransactionPaymentDetailFormRow => ({
  ...base,
  settlementSource: 'ADVANCE',
  paymentMethod,
  advanceVoucherId: voucher.id,
  advanceVoucherNumber: voucher.number,
  advanceAvailableAmount: String(voucher.availableAmount),
  accountId: voucher.advanceControlAccountId ?? '',
  accountName:
    formatAdvanceAccountLabel(voucher.advanceControlAccountSnapshot) ||
    TRANSACTION_PAYMENT_TEXT.advanceControlAccount,
  isAdvanceRemainder: false,
  amountLocked: true,
  amount: appliedAmount,
  chequePageId: '',
  chequePageSnapshot: null,
  ...(paymentMethod === TransactionPaymentMethodEnum.CHEQUE
    ? {
        chequeNumber: voucher.chequeNumber ?? '',
        chequeDate: voucher.chequeDate ?? '',
        branchName: voucher.chequeBranch ?? '',
        drawnOn: voucher.drawnOn ?? '',
      }
    : {
        chequeNumber: '',
        chequeDate: '',
        branchName: '',
        drawnOn: '',
      }),
});

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
  onAdvancesSelected,
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
  onAdvancesSelected: (
    index: number,
    vouchers: AvailableAdvance[],
    paymentMethod: string
  ) => void;
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
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const previousPaymentMethodRef = useRef<string | undefined>(paymentMethod);
  const previousSelectionKeyRef = useRef<string | null>(null);
  const advanceType = isSale ? 'RECEIPT' : 'PAYMENT';
  const advancePaymentMethod: 'CASH' | 'CHEQUE' =
    paymentMethod === TransactionPaymentMethodEnum.CASH ? 'CASH' : 'CHEQUE';
  const advanceQueryParams = useMemo(
    () => ({
      partyProfileId: partyProfileId ?? '',
      branchId: resolvedBranchId ?? '',
      counterId: counterId ?? '',
      transactionDate: transactionDate ?? '',
      paymentMethod: advancePaymentMethod,
    }),
    [advancePaymentMethod, counterId, partyProfileId, resolvedBranchId, transactionDate]
  );
  const canLoadAdvances = Boolean(
    partyProfileId && resolvedBranchId && counterId && transactionDate && paymentMethod
  );
  const { data: availableAdvances = EMPTY_AVAILABLE_ADVANCES, isLoading: isLoadingAdvances } =
    useAvailableAdvances(
      advanceType,
      advanceQueryParams,
      (settlementSource === 'ADVANCE' || isAdvanceModalOpen) && canLoadAdvances
    );
  const {
    fieldState: { error: advanceVoucherError },
  } = useController({
    name: `${arrayName}.${index}.advanceVoucherId`,
    control: form.control,
  });
  const advanceVoucherNumber = useWatch({
    control: form.control,
    name: `${arrayName}.${index}.advanceVoucherNumber`,
  }) as string | undefined;
  const advanceAvailableAmount = useWatch({
    control: form.control,
    name: `${arrayName}.${index}.advanceAvailableAmount`,
  }) as string | undefined;
  const selectableAdvanceCount = useMemo(
    () =>
      availableAdvances.filter(
        voucher =>
          voucher.id === advanceVoucherId ||
          !selectedAdvanceVoucherIds.includes(voucher.id)
      ).length,
    [advanceVoucherId, availableAdvances, selectedAdvanceVoucherIds]
  );

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
    if (settlementSource === 'ADVANCE') {
      return;
    }

    const currentId = String(
      form.getValues(`${arrayName}.${index}.advanceVoucherId`) ?? ''
    );
    if (!currentId) {
      return;
    }

    form.setValue(`${arrayName}.${index}.advanceVoucherId`, '', {
      shouldValidate: false,
    });
    form.setValue(`${arrayName}.${index}.advanceVoucherNumber`, '', {
      shouldValidate: false,
    });
    form.setValue(`${arrayName}.${index}.advanceAvailableAmount`, '', {
      shouldValidate: false,
    });
    form.setValue(
      `${arrayName}.${index}.amountLocked`,
      Boolean(form.getValues(`${arrayName}.${index}.isAdvanceRemainder`)),
      { shouldValidate: false }
    );
  }, [arrayName, form, index, settlementSource]);

  const applySelectedAdvances = useCallback(
    (vouchers: AvailableAdvance[]) => {
      if (!vouchers.length) {
        return;
      }
      setIsAdvanceModalOpen(false);
      onAdvancesSelected(index, vouchers, paymentMethod ?? '');
    },
    [index, onAdvancesSelected, paymentMethod]
  );

  const closeAdvanceModal = useCallback(() => {
    setIsAdvanceModalOpen(false);
    const currentId = String(
      form.getValues(`${arrayName}.${index}.advanceVoucherId`) ?? ''
    );
    if (!currentId) {
      form.setValue(`${arrayName}.${index}.settlementSource`, 'NORMAL', {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  }, [arrayName, form, index]);

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

  const chequePageSnapshot = useWatch({
    control: form.control,
    name: `${arrayName}.${index}.chequePageSnapshot`,
  }) as IChequeBookPageTracking | null | undefined;

  const selectedChequePage = useMemo(
    () =>
      pageOptions.find(page => page.id === String(chequePageId || '')) ??
      chequePageSnapshot ??
      null,
    [chequePageId, chequePageSnapshot, pageOptions]
  );

  const selectedBookLabel = useMemo(() => {
    if (!selectedChequePage) return null;
    // label format is "BookNo | Page X" -> split by '|' -> 1st element is book
    const bookNo = selectedChequePage.checkBook?.no?.trim();
    return bookNo || 'Book';
  }, [selectedChequePage]);

  const chequePageDefaultOptions = useMemo(() => {
    if (!selectedChequePage?.id) return undefined;
    // If the selected page is already in selectable pages, no need for fallback
    if (pageOptions.some(page => String(page.id) === String(selectedChequePage.id))) {
      return undefined;
    }
    return [
      {
        value: String(selectedChequePage.id),
        label: `${selectedChequePage.checkBook?.no || 'Book'} | Page ${selectedChequePage.pageNo}`,
      },
    ];
  }, [pageOptions, selectedChequePage]);

  const isCash = paymentMethod === TransactionPaymentMethodEnum.CASH;
  const isCheque = paymentMethod === TransactionPaymentMethodEnum.CHEQUE;

  return (
    <>
    <div className="grid gap-4 rounded-sm border border-border-secondary bg-surface-primary p-4 md:grid-cols-2 xl:grid-cols-[1fr_1.3fr_1.5fr_1.25fr_1fr_1fr_1.25fr_auto]">
      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldSelect
          name={`${arrayName}.${index}.settlementSource`}
          label={TRANSACTION_PAYMENT_TEXT.settlementSource}
          loadOptions={loadSettlementSourceOptions}
          defaultOptions={SETTLEMENT_SOURCE_OPTIONS}
          disabled={disabled || Boolean(advanceVoucherId)}
          onValueChange={value => {
            if (String(value) === 'ADVANCE') {
              setIsAdvanceModalOpen(true);
            }
          }}
        />
      </div>
      {settlementSource === 'ADVANCE' ? (
        <div className="md:col-span-2 xl:col-span-1">
          <Label>{isSale ? TRANSACTION_PAYMENT_TEXT.receiptAdvance : TRANSACTION_PAYMENT_TEXT.paymentAdvance}</Label>
          <Button
            type="button"
            variant="outline"
            className="mt-1 h-8 w-full justify-between rounded-sm px-3 text-left font-normal"
            disabled={
              disabled || Boolean(advanceVoucherId) || !canLoadAdvances
            }
            onClick={() => setIsAdvanceModalOpen(true)}
          >
            <span className="truncate">
              {advanceVoucherId
                ? TRANSACTION_PAYMENT_TEXT.selectedAdvance(
                    advanceVoucherNumber || advanceVoucherId,
                    formatAmount(advanceAvailableAmount)
                  )
                : !canLoadAdvances
                  ? TRANSACTION_PAYMENT_TEXT.missingAdvanceContext
                  : isLoadingAdvances
                    ? TRANSACTION_PAYMENT_TEXT.loadingAdvances
                    : TRANSACTION_PAYMENT_TEXT.selectAdvance}
            </span>
          </Button>
          <p className="mt-1 text-xs text-text-secondary">
            {canLoadAdvances
              ? TRANSACTION_PAYMENT_TEXT.availableCount(selectableAdvanceCount)
              : TRANSACTION_PAYMENT_TEXT.missingAdvanceContext}
          </p>
          {advanceVoucherError?.message ? (
            <p className="mt-1 text-sm text-error-600">
              {advanceVoucherError.message}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldSelect
          key={`account-${paymentMethod || 'none'}`}
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
            key={`cheque-page-${accountId || 'empty'}-${pageOptions.length}-${String(chequePageId || 'empty')}`}
            name={`${arrayName}.${index}.chequePageId`}
            label="Cheque Page"
            placeholder="Select cheque page"
            loadOptions={async (
              inputValue: string
            ): Promise<AsyncSelectResponse> => {
              const normalized = inputValue.trim().toLowerCase();
              // In edit, selected page may not be in selectable pages (already used) - include snapshot for display/menu
              const allPages =
                selectedChequePage &&
                !pageOptions.some(page => String(page.id) === String(selectedChequePage.id))
                  ? [selectedChequePage, ...pageOptions]
                  : pageOptions;
              const options = allPages
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
            defaultOptions={chequePageDefaultOptions}
            // Show only 2nd element (Page ...) inside the input value; menu keeps full "Book | Page" label.
            formatOptionLabel={(option, meta) => {
              if (meta.context === 'value') {
                const parts = String(option.label).split('|');
                return parts[1]?.trim() || option.label;
              }
              return option.label;
            }}
            disabled={disabled || !accountId || isLoadingPages}
            isSearchable
            cacheOptions={false}
          />
          {selectedBookLabel ? (
            <p className="mt-1 text-xs text-text-secondary">
              Selected book: {selectedBookLabel}
            </p>
          ) : null}
        </div>
      ) : null}

      {!isPurchase && <div className="md:col-span-2 xl:col-span-1">
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
      </div>}

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
    {isAdvanceModalOpen ? (
      <SelectAvailableAdvances
        open={isAdvanceModalOpen}
        type={advanceType}
        params={advanceQueryParams}
        remainingAmount={availableAmount}
        excludedVoucherIds={selectedAdvanceVoucherIds}
        selectedVoucherIds={advanceVoucherId ? [advanceVoucherId] : []}
        onContinue={applySelectedAdvances}
        onClose={closeAdvanceModal}
      />
    ) : null}
    </>
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
  const { fields, append, remove, replace } = useFieldArray({
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

  const handleAdvancesSelected = useCallback((
    selectedIndex: number,
    vouchers: AvailableAdvance[],
    paymentMethod: string
  ) => {
    const rows = [...((form.getValues(name) ?? []) as ITransactionPaymentDetailFormRow[])];
    const current = rows[selectedIndex];
    if (!current) {
      return;
    }

    const usedVoucherIds = new Set(
      rows
        .filter((row, index) => index !== selectedIndex && row.settlementSource === 'ADVANCE' && Boolean(row.advanceVoucherId))
        .map(row => String(row.advanceVoucherId))
    );
    const uniqueVouchers = vouchers.filter(voucher => !usedVoucherIds.has(voucher.id));
    if (!uniqueVouchers.length) {
      form.setError(`${name}.${selectedIndex}.advanceVoucherId`, {
        type: 'duplicate',
        message: TRANSACTION_PAYMENT_TEXT.duplicateAdvance,
      });
      return;
    }

    const remainderIndex = rows.findIndex(row => row.isAdvanceRemainder);
    const rowsWithoutRemainder = remainderIndex >= 0
      ? rows.filter((_, index) => index !== remainderIndex)
      : rows;
    const startIndex = remainderIndex >= 0 && remainderIndex < selectedIndex
      ? selectedIndex - 1
      : selectedIndex;
    const baseRow = rowsWithoutRemainder[startIndex] ?? current;
    const usedByOthersCents = rowsWithoutRemainder.reduce((sum, row, index) => {
      if (index === startIndex) {
        return sum;
      }
      return sum + amountCents(row.amount);
    }, 0);
    let remainingCents = Math.max(amountCents(maxAmount) - usedByOthersCents, 0);
    const advanceRows: ITransactionPaymentDetailFormRow[] = [];

    uniqueVouchers.forEach(voucher => {
      if (remainingCents <= 0) {
        return;
      }
      const appliedCents = Math.min(remainingCents, amountCents(voucher.availableAmount));
      if (appliedCents <= 0) {
        return;
      }
      remainingCents -= appliedCents;
      advanceRows.push(
        buildAdvancePaymentRow(
          baseRow,
          voucher,
          (appliedCents / 100).toFixed(2),
          paymentMethod
        )
      );
    });

    if (!advanceRows.length) {
      return;
    }

    const nextRows = [
      ...rowsWithoutRemainder.slice(0, startIndex),
      ...advanceRows,
      ...rowsWithoutRemainder.slice(startIndex + 1),
    ];
    if (remainingCents > 0) {
      nextRows.push(createEmptyPurchasePaymentRow({
        settlementSource: 'NORMAL',
        paymentMethod,
        amount: (remainingCents / 100).toFixed(2),
        isAdvanceRemainder: true,
        amountLocked: true,
      }));
    }

    replace(nextRows);
    form.clearErrors(`${name}.${startIndex}.advanceVoucherId`);
  }, [form, maxAmount, name, replace]);

  useEffect(() => {
    const rows = (form.getValues(name) ?? []) as ITransactionPaymentDetailFormRow[];
    const remainderIndex = rows.findIndex(row => row.isAdvanceRemainder);
    if (remainderIndex < 0) return;
    const desiredCents = Math.max(amountCents(maxAmount) - rows.reduce((sum, row, index) => index === remainderIndex ? sum : sum + amountCents(row.amount), 0), 0);
    const currentCents = amountCents(rows[remainderIndex]?.amount);
    if (desiredCents === 0 && rows.length > 1) {
      remove(remainderIndex);
    } else if (currentCents !== desiredCents) {
      form.setValue(`${name}.${remainderIndex}.amount`, (desiredCents / 100).toFixed(2), { shouldDirty: true, shouldValidate: false });
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
                onAdvancesSelected={handleAdvancesSelected}
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
