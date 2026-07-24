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
  defaultAccountId?: string;
  lockedRow?: {
    key: string;
    accountId: string;
    accountName: string;
    amount: string;
  } | null;
}

const formatAmount = (value?: string | null) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : value;
};

const AdditionalChargeRow = ({
  arrayName,
  index,
  accountQuery,
  transactionType,
  disabled = false,
  isLocked = false,
  onRemove,
}: {
  arrayName: string;
  index: number;
  accountQuery?: IAccountProfileListQuery;
  transactionType?: TransactionType;
  disabled?: boolean;
  isLocked?: boolean;
  onRemove: (index: number) => void;
}) => {
  const isSale = transactionType === TransactionTypeEnum.SALE;

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
    [accountQuery, transactionType]
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
        disabled={disabled || isLocked}
        isSearchable
      />
    </div>

    <FormFieldInput
      name={`${arrayName}.${index}.amount`}
      label="Amount"
      type="number"
      disabled={disabled || isLocked}
    />

      <FormFieldInput
        name={`${arrayName}.${index}.gstRate`}
        label="GST Rate"
        type="number"
        disabled
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
        {isLocked ? (
          <div className="rounded-full border border-border-secondary px-3 py-1 text-xs font-medium text-text-secondary">
            Locked
          </div>
        ) : (
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
        )}
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
  defaultAccountId = '',
  lockedRow = null,
}: TransactionAdditionalChargesFieldArrayProps) => {
  const form = useFormContext();
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name,
  });

  const charges = useWatch({
    control: form.control,
    name,
  }) as ITransactionAdditionalChargeFormRow[] | undefined;

  useEffect(() => {
    const currentRows = Array.isArray(charges) ? charges : [];
    const autoRowIndex = currentRows.findIndex(
      row => row?.chargeSource === 'CORPORATE_HANDLING_FEE'
    );

    const hasAutoRow = autoRowIndex >= 0;
    const nextRows = currentRows.filter(
      row => row?.chargeSource !== 'CORPORATE_HANDLING_FEE'
    );

    if (!lockedRow) {
      if (hasAutoRow) {
        replace(nextRows);
      }
      return;
    }

    const nextAutoRow: ITransactionAdditionalChargeFormRow = {
      accountId: lockedRow.accountId,
      accountName: lockedRow.accountName,
      amount: lockedRow.amount,
      gstRate: '0',
      gstAmount: '0',
      totalAmount: lockedRow.amount,
      chargeSource: 'CORPORATE_HANDLING_FEE',
    };

    if (hasAutoRow) {
      const existingAutoRow = currentRows[autoRowIndex];
      const isSameAutoRow =
        String(existingAutoRow?.accountId ?? '') === String(nextAutoRow.accountId ?? '') &&
        String(existingAutoRow?.amount ?? '') === String(nextAutoRow.amount ?? '') &&
        String(existingAutoRow?.chargeSource ?? '') === String(nextAutoRow.chargeSource ?? '');

      if (isSameAutoRow) {
        return;
      }

      nextRows.splice(autoRowIndex, 0, nextAutoRow);
      replace(nextRows);
      return;
    }

    const matchingExistingIndex = nextRows.findIndex(row => {
      const rowAmount = Number(row?.amount ?? 0);
      const lockedAmount = Number(lockedRow.amount ?? 0);
      return (
        String(row?.accountId ?? '') === String(lockedRow.accountId ?? '') &&
        Number.isFinite(rowAmount) &&
        Number.isFinite(lockedAmount) &&
        rowAmount === lockedAmount
      );
    });

    if (matchingExistingIndex >= 0) {
      nextRows[matchingExistingIndex] = {
        ...nextRows[matchingExistingIndex],
        accountId: lockedRow.accountId,
        accountName: lockedRow.accountName,
        amount: lockedRow.amount,
        gstRate: '0',
        gstAmount: '0',
        totalAmount: lockedRow.amount,
        chargeSource: 'CORPORATE_HANDLING_FEE',
      };
      replace(nextRows);
      return;
    }

    replace([
      nextAutoRow,
      ...nextRows,
    ]);
  }, [charges, lockedRow, replace]);

  const totalAmount = useMemo(() => {
    return (charges ?? []).reduce((sum, charge) => {
      const amountValue = Number(charge?.amount || 0);
      const totalValue = Number(charge?.totalAmount || 0);
      return sum + (Number.isFinite(totalValue) ? totalValue : amountValue);
    }, 0);
  }, [charges]);

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
                accountQuery={accountQuery}
                transactionType={transactionType}
                disabled={disabled}
                isLocked={String((charges?.[index] as ITransactionAdditionalChargeFormRow | undefined)?.chargeSource ?? '') === 'CORPORATE_HANDLING_FEE'}
                onRemove={remove}
              />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-secondary pt-4">
          <div className="text-sm text-text-secondary">
            Total additional charges: {formatAmount(String(totalAmount))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() =>
              append({
                accountId: defaultAccountId,
                accountName: '',
                amount: '',
                gstRate: applyTax ? '' : '0',
                gstAmount: '',
                totalAmount: '',
                chargeSource: '',
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
