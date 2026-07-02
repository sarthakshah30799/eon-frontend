import { useCallback, useEffect, useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { AsyncSelectResponse } from '@/components/ui';
import { Button, CardSection } from '@/components/ui';
import { FormFieldDatePicker, FormFieldInput, FormFieldSelect } from '@/components/forms';
import { accountProfileApi } from '@/api/accountProfile';
import type { IAccountProfileListQuery } from '@/modules/accountProfile/types/accountProfileTypes';
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

  const loadAccountOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const response = await accountProfileApi.getAccountProfiles({
        page: 1,
        limit: 100,
        search: inputValue,
        ...accountQuery,
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
    <div className="grid gap-4 rounded-sm border border-border-secondary bg-surface-primary p-4 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_auto]">
      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldSelect
          name={`${arrayName}.${index}.accountId`}
          label="Account"
          placeholder="Select account code"
          loadOptions={loadAccountOptions}
          disabled={disabled}
          isSearchable
        />
      </div>

      <FormFieldInput
        name={`${arrayName}.${index}.chequeNumber`}
        label="Cheque / Book Ref"
        placeholder="Cheque number"
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

      <div className="md:col-span-2 xl:col-span-6">
        <p className="text-xs text-text-secondary">
          Available amount for this row: {formatAmount(availableAmount)}
          {maxAmount !== undefined ? ` | Remaining after this row: ${formatAmount(remainingAfterCurrent)}` : ''}
        </p>
        {chequeNumber ? null : (
          <p className="mt-1 text-xs text-text-tertiary">
            Use the cheque/book reference that matches your payment instrument.
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

  const canRemove = fields.length > 1;

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
            <div className="hidden xl:grid xl:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_auto] gap-4 px-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              <div>Account</div>
              <div>Cheque / Book Ref</div>
              <div>Cheque Date</div>
              <div>Branch Name</div>
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
                chequeNumber: '',
                chequeDate: '',
                branchName: '',
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
