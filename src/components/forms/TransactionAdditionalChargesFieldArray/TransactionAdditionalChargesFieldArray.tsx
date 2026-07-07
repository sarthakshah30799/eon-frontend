import { useCallback, useEffect, useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { AsyncSelectResponse } from '@/components/ui';
import { Button, CardSection } from '@/components/ui';
import { FormFieldInput, FormFieldSelect } from '@/components/forms';
import { accountProfileApi } from '@/api/accountProfile';
import type { IAccountProfileListQuery } from '@/modules/accountProfile/types/accountProfileTypes';
import type { ITransactionAdditionalChargeFormRow } from './transactionAdditionalChargesTypes';

interface TransactionAdditionalChargesFieldArrayProps {
  name: string;
  title?: string;
  description?: string;
  applyTax?: boolean;
  accountQuery?: IAccountProfileListQuery;
  disabled?: boolean;
}

const formatAmount = (value?: string | null) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(4) : value;
};

const AdditionalChargeRow = ({
  arrayName,
  index,
  applyTax,
  accountQuery,
  disabled = false,
  onRemove,
  canRemove,
}: {
  arrayName: string;
  index: number;
  applyTax?: boolean;
  accountQuery?: IAccountProfileListQuery;
  disabled?: boolean;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) => {
  const form = useFormContext();
  const amount = useWatch({
    control: form.control,
    name: `${arrayName}.${index}.amount`,
  });
  const gstRate = useWatch({
    control: form.control,
    name: `${arrayName}.${index}.gstRate`,
  });

  const gstAmount = useMemo(() => {
    const amountValue = Number(amount || '');
    const rateValue = Number(gstRate || '');

    if (!Number.isFinite(amountValue)) {
      return '';
    }

    if (!applyTax) {
      return '0.0000';
    }

    if (!Number.isFinite(rateValue)) {
      return '';
    }

    return ((amountValue * rateValue) / 100).toFixed(4);
  }, [amount, applyTax, gstRate]);

  const totalAmount = useMemo(() => {
    const amountValue = Number(amount || '');
    const gstAmountValue = Number(gstAmount || '');

    if (!Number.isFinite(amountValue)) {
      return '';
    }

    if (!Number.isFinite(gstAmountValue)) {
      return amountValue.toFixed(4);
    }

    return (amountValue + gstAmountValue).toFixed(4);
  }, [amount, gstAmount]);

  useEffect(() => {
    const gstRateField = `${arrayName}.${index}.gstRate` as const;
    const gstAmountField = `${arrayName}.${index}.gstAmount` as const;
    const totalAmountField = `${arrayName}.${index}.totalAmount` as const;

    if (!applyTax) {
      form.setValue(gstRateField, '0', {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }

    form.setValue(gstAmountField, gstAmount, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    form.setValue(totalAmountField, totalAmount, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [applyTax, arrayName, form, gstAmount, index, totalAmount]);

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
    <div className="grid gap-4 rounded-sm border border-border-secondary bg-surface-primary p-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldSelect
          name={`${arrayName}.${index}.accountId`}
          label="Account"
          placeholder="Select bulk purchase account"
          loadOptions={loadAccountOptions}
          disabled={disabled}
          isSearchable
        />
      </div>

      <FormFieldInput
        name={`${arrayName}.${index}.amount`}
        label="Amount"
        type="number"
        disabled={disabled}
      />

      <FormFieldInput
        name={`${arrayName}.${index}.gstRate`}
        label="GST Rate"
        type="number"
        disabled={disabled || !applyTax}
      />

      <FormFieldInput
        name={`${arrayName}.${index}.gstAmount`}
        label="GST Amount"
        disabled
      />

      <FormFieldInput
        name={`${arrayName}.${index}.totalAmount`}
        label="Total Amount"
        disabled
      />

      <div className="flex items-start justify-end pt-7">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          disabled={!canRemove || disabled}
          onClick={() => onRemove(index)}
          aria-label="Remove additional charge"
        >
          <TrashIcon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};

export const TransactionAdditionalChargesFieldArray = ({
  name,
  title = 'Additional Charges',
  description = 'Add optional charges linked to a bulk purchase account.',
  applyTax = true,
  accountQuery,
  disabled = false,
}: TransactionAdditionalChargesFieldArrayProps) => {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });

  const charges = useWatch({
    control: form.control,
    name,
  }) as ITransactionAdditionalChargeFormRow[] | undefined;

  const totalAmount = useMemo(() => {
    return (charges ?? []).reduce((sum, charge) => {
      const amountValue = Number(charge?.amount || 0);
      const totalValue = Number(charge?.totalAmount || 0);
      return sum + (Number.isFinite(totalValue) ? totalValue : amountValue);
    }, 0);
  }, [charges]);

  const canRemove = fields.length > 1;

  return (
    <CardSection
      heading={title}
    >
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">{description}</p>

        {fields.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border-secondary bg-surface-secondary/30 px-4 py-6 text-center text-sm text-text-secondary">
            No additional charges added yet.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="hidden xl:grid xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              <div>Account</div>
              <div>Amount</div>
              <div>GST Rate</div>
              <div>GST Amount</div>
              <div>Total Amount</div>
              <div></div>
            </div>

            {fields.map((field, index) => (
              <AdditionalChargeRow
                key={field.id}
                arrayName={name}
                index={index}
                applyTax={applyTax}
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
            Total additional charges: {formatAmount(String(totalAmount)) || '0.0000'}
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
                amount: '',
                gstRate: applyTax ? '' : '0',
                gstAmount: '',
                totalAmount: '',
              } satisfies ITransactionAdditionalChargeFormRow)
            }
          >
            <PlusIcon className="h-4 w-4" />
            Add Charge
          </Button>
        </div>
      </div>
    </CardSection>
  );
};

export default TransactionAdditionalChargesFieldArray;
