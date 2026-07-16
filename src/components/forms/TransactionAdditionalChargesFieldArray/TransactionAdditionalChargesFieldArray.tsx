import { useCallback, useEffect, useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { AsyncSelectResponse } from '@/components/ui';
import { Button, CardSection } from '@/components/ui';
import { FormFieldInput, FormFieldSelect } from '@/components/forms';
import { accountProfileApi } from '@/api/accountProfile';
import {
  AccountProfileLedgerLabelEnum,
  type IAccountProfileListQuery,
} from '@/modules/accountProfile';
import {
  TransactionTypeEnum,
  type TransactionType,
} from '@/modules/transactions';
import { getPurchaseTransactionAccountFilter } from '@/modules/purchase/utils/purchaseUtils';

const ACCOUNT_PROFILE_OPTION_PAGE_SIZE = 30;
import type { ITransactionAdditionalChargeFormRow } from './transactionAdditionalChargesTypes';

interface TransactionAdditionalChargesFieldArrayProps {
  name: string;
  title?: string;
  description?: string;
  applyTax?: boolean;
  accountQuery?: IAccountProfileListQuery;
  disabled?: boolean;
  transactionType?: TransactionType;
}

const formatAmount = (value?: string | null) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : value;
};

const formatNegativeAmount = (value?: string | null) => {
  const formattedValue = formatAmount(value);
  if (!formattedValue) {
    return '0.00';
  }

  return formattedValue.startsWith('-') ? formattedValue : `-${formattedValue}`;
};

const AdditionalChargeRow = ({
  arrayName,
  index,
  applyTax,
  accountQuery,
  transactionType,
  disabled = false,
  onRemove,
}: {
  arrayName: string;
  index: number;
  applyTax?: boolean;
  accountQuery?: IAccountProfileListQuery;
  transactionType?: TransactionType;
  disabled?: boolean;
  onRemove: (index: number) => void;
}) => {
  const isSale = transactionType === TransactionTypeEnum.SALE;
  const chargeMultiplier = isSale ? 1 : -1;
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
      return '0.00';
    }

    if (!Number.isFinite(rateValue)) {
      return '';
    }

    return ((amountValue * rateValue) / 100).toFixed(2);
  }, [amount, applyTax, gstRate]);

  const totalAmount = useMemo(() => {
    const amountValue = Number(amount || '');
    const gstAmountValue = Number(gstAmount || '');

    if (!Number.isFinite(amountValue)) {
      return '';
    }

    if (!Number.isFinite(gstAmountValue)) {
      return (amountValue * chargeMultiplier).toFixed(2);
    }

    return ((amountValue + gstAmountValue) * chargeMultiplier).toFixed(2);
  }, [amount, chargeMultiplier, gstAmount]);

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
    async (inputValue: string, page = 1): Promise<AsyncSelectResponse> => {
      const derivedQuery: IAccountProfileListQuery = {
        ...accountQuery,
        page,
        limit: ACCOUNT_PROFILE_OPTION_PAGE_SIZE,
        search: inputValue,
        active: true,
        accountType: AccountProfileLedgerLabelEnum.GeneralLedger,
        ...getPurchaseTransactionAccountFilter(transactionType ?? TransactionTypeEnum.PURCHASE),
      };

      const response = await accountProfileApi.getAccountProfiles({
        ...derivedQuery,
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
    [accountQuery, isSale]
  );

  return (
    <div className="grid gap-4 rounded-sm border border-border-secondary bg-surface-primary p-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
      <div className="md:col-span-2 xl:col-span-1">
        <FormFieldSelect
          name={`${arrayName}.${index}.accountId`}
          label="Account"
          placeholder={
            isSale ? 'Select bulk sale account' : 'Select bulk purchase account'
          }
          loadOptions={loadAccountOptions}
          pagination
          pageSize={ACCOUNT_PROFILE_OPTION_PAGE_SIZE}
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
        label={isSale ? 'Total Amount (+)' : 'Total Amount (-)'}
        disabled
      />

      <div className="flex items-start justify-end pt-7">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          disabled={disabled}
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
  transactionType = TransactionTypeEnum.PURCHASE,
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

  const isSale = transactionType === TransactionTypeEnum.SALE;

  return (
    <CardSection heading={title}>
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
                transactionType={transactionType}
                disabled={disabled}
                onRemove={remove}
              />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-secondary pt-4">
          <div className="text-sm text-text-secondary">
            Total additional charges:{' '}
            {isSale
              ? formatAmount(String(totalAmount))
              : formatNegativeAmount(String(Math.abs(totalAmount)))}
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
