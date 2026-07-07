import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { AsyncSelectResponse } from '@/components/ui';
import { Button, CardSection } from '@/components/ui';
import { FormFieldDatePicker, FormFieldInput, FormFieldSelect } from '@/components/forms';
import { accountProfileApi } from '@/api/accountProfile';
import { chequebookApi, type IChequeBookPageTracking } from '@/api';
import type { IAccountProfileListQuery } from '@/modules/accountProfile/types/accountProfileTypes';
import { useAuth } from '@/lib/AuthContext';
import type { ITransactionPaymentDetailFormRow } from './transactionPaymentDetailsTypes';

interface TransactionPaymentDetailsFieldArrayProps {
  name: string;
  title?: string;
  description?: string;
  maxAmount?: string | number;
  accountQuery?: IAccountProfileListQuery;
  disabled?: boolean;
}

const formatAmount = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') {
    return '0.0000';
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(4) : String(value);
};

const PaymentDetailRow = ({
  arrayName,
  index,
  maxAmount,
  accountQuery,
  disabled = false,
  onRemove,
  canRemove,
}: {
  arrayName: string;
  index: number;
  maxAmount?: string | number;
  accountQuery?: IAccountProfileListQuery;
  disabled?: boolean;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) => {
  const form = useFormContext();
  const { activeBranchId } = useAuth();
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

    const loadPages = async () => {
      if (!accountId || !activeBranchId) {
        setPageOptions([]);
        return;
      }

      try {
        setIsLoadingPages(true);
        const pages = await chequebookApi.getSelectablePages({
          accountId: String(accountId),
        });

        if (isActive) {
          setPageOptions(pages);
        }
      } catch (error) {
        if (isActive) {
          setPageOptions([]);
        }
        console.error('Failed to load selectable cheque pages:', error);
      } finally {
        if (isActive) {
          setIsLoadingPages(false);
        }
      }
    };

    void loadPages();

    return () => {
      isActive = false;
    };
  }, [accountId, activeBranchId]);

  useEffect(() => {
    const selectedPage = pageOptions.find(page => page.id === String(chequePageId || ''));
    if (!selectedPage) {
      return;
    }

    form.setValue(`${arrayName}.${index}.chequeNumber`, String(selectedPage.pageNo), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue(`${arrayName}.${index}.chequePageSnapshot`, {
      ...selectedPage,
    }, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  }, [accountId, arrayName, chequePageId, form, index, pageOptions]);

  const loadAccountOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const response = await accountProfileApi.getAccountProfiles({
        page: 1,
        limit: 100,
        search: inputValue,
        ...accountQuery,
        active: true,
      });

      const accounts = response.data || [];

      return {
        options: accounts.map(account => ({
          value: account.id,
          label: `${account.accountCode} - ${account.accountName}`,
        })),
      };
    },
    [accountQuery]
  );

  return (
    <div className="grid gap-4 rounded-sm border border-border-secondary bg-surface-primary p-4 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_1fr_1fr_auto]">
      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldSelect
          name={`${arrayName}.${index}.accountId`}
          label="Account"
          placeholder="Select account code"
          loadOptions={loadAccountOptions}
          disabled={disabled}
          isSearchable
          cacheOptions={false}
        />
      </div>

      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldSelect
          key={`cheque-page-${accountId || 'empty'}-${pageOptions.length}`}
          name={`${arrayName}.${index}.chequePageId`}
          label="Cheque Page"
          placeholder="Select cheque page"
          loadOptions={async (inputValue: string): Promise<AsyncSelectResponse> => {
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
                  .some(value => String(value).toLowerCase().includes(normalized));
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

      <FormFieldInput
        name={`${arrayName}.${index}.chequeNumber`}
        label="Cheque / Book Ref"
        placeholder="Page no will fill here"
        disabled={disabled}
      />

      <FormFieldDatePicker
        name={`${arrayName}.${index}.chequeDate`}
        label="Cheque Date"
        disabled={disabled}
      />

      <FormFieldInput
        name={`${arrayName}.${index}.branchName`}
        label="Branch Name"
        placeholder="Branch name"
        disabled={disabled}
      />

      <FormFieldInput
        name={`${arrayName}.${index}.drawnOn`}
        label="Drawn On"
        placeholder="Drawn on"
        disabled={disabled}
      />

      <FormFieldInput
        name={`${arrayName}.${index}.amount`}
        label="Amount"
        type="number"
        disabled={disabled}
      />

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
          {maxAmount !== undefined ? ` | Remaining after this row: ${formatAmount(remainingAfterCurrent)}` : ''}
        </p>
        {chequeNumber ? null : (
          <p className="mt-1 text-xs text-text-tertiary">
            Select the cheque page from the list; the reference number will be filled automatically.
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
  accountQuery,
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
    return (paymentRows ?? []).reduce((sum, row) => sum + Number(row?.amount || 0), 0);
  }, [paymentRows]);

  const remainingAmount = useMemo(() => {
    const total = Number(maxAmount || 0);
    if (!Number.isFinite(total)) {
      return 0;
    }

    return Math.max(total - totalApplied, 0);
  }, [maxAmount, totalApplied]);

  const canRemove = fields.length > 0;

  return (
    <CardSection heading={title}>
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">{description}</p>

        {fields.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border-secondary bg-surface-secondary/30 px-4 py-6 text-center text-sm text-text-secondary">
            No payment details added yet.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="hidden xl:grid xl:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              <div>Account</div>
              <div>Cheque Page</div>
              <div>Cheque / Book Ref</div>
              <div>Cheque Date</div>
              <div>Branch Name</div>
              <div>Drawn On</div>
              <div>Amount</div>
              <div></div>
            </div>

            {fields.map((field, index) => (
              <PaymentDetailRow
                key={field.id}
                arrayName={name}
                index={index}
                maxAmount={maxAmount}
                accountQuery={accountQuery}
                disabled={disabled}
                onRemove={remove}
                canRemove={canRemove}
              />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-secondary pt-4">
          <div className="text-sm text-text-secondary">
            Total payment amount: {formatAmount(totalApplied)}
            {maxAmount !== undefined ? ` | Remaining amount: ${formatAmount(remainingAmount)}` : ''}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() =>
              append({
                accountId: '',
                accountName: '',
                chequePageId: '',
                chequePageSnapshot: null,
                chequeNumber: '',
                chequeDate: '',
                branchName: '',
                drawnOn: '',
                amount: '',
              } satisfies ITransactionPaymentDetailFormRow)
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
