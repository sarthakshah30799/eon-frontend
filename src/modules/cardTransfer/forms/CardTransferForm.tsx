import { useCallback, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import {
  Button,
  CardSection,
  Table,
  type AsyncSelectOption,
  type AsyncSelectResponse,
  type TableColumnDef,
} from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import { FormFieldDatePicker, FormFieldInput, FormFieldSelect } from '@/components/forms';
import { branchProfileApi } from '@/api/branchProfile';
import { useLoadBranchOptions } from '@/modules/branchProfile/hooks';
import { formatDateTime } from '@/utils';
import type { CardTransferCard, CardTransferFormValues } from '../types';
import type { TransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import {
  calculateItemAmount,
  calculateTotalAmount,
  emptyTransferItem,
} from '../utils';
import { useListTransferCards } from '../hooks';
import { CARD_TRANSFER_COPY } from '../constants';
import { useCardStockReferences } from '@/modules/cardStock/hooks';
import type { IBranchProfile } from '@/modules/branchProfile/types/branchProfileTypes';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import type { IProductProfile } from '@/modules/productProfile/types';
import type { IPartyProfile } from '@/modules/partyProfiles/types';

interface Props {
  readOnly?: boolean;
  availableCards?: CardTransferCard[];
  transactionDatePolicy?: TransactionDatePolicy;
  onSourceBranchChange?: (branchId: string) => void;
  isTransactionDateLoading?: boolean;
  destinationBranchReadOnly?: boolean;
}

const staticLoader =
  (options: AsyncSelectOption[]) =>
  async (input: string): Promise<AsyncSelectResponse> => ({
    options: input
      ? options.filter(option =>
          option.label.toLowerCase().includes(input.toLowerCase())
        )
      : options,
  });

const optionsFrom = (
  items: Array<{ id: string; name?: string; code?: string; counterNo?: string }>
): AsyncSelectOption[] =>
  items.map(item => ({
    value: item.id,
    label: [item.code, item.counterNo, item.name].filter(Boolean).join(' - '),
  }));

type CardTransferSnapshot =
  | IBranchProfile
  | ICurrencyProfile
  | IProductProfile
  | IPartyProfile;

const snapshotOption = (
  id: string | undefined,
  snapshot: CardTransferSnapshot | null | undefined
): AsyncSelectOption | null => {
  if (!id || !snapshot) return null;
  if ('currencyCode' in snapshot) {
    return {
      value: id,
      label: `${snapshot.currencyCode} - ${snapshot.currencyName}`,
    };
  }
  if ('productCode' in snapshot) {
    return {
      value: id,
      label: `${snapshot.productCode} - ${snapshot.productDescription}`,
    };
  }
  return {
    value: id,
    label: `${snapshot.code} - ${snapshot.name}`,
  };
};

const withSnapshotOption = (
  options: AsyncSelectOption[],
  id: string | undefined,
  snapshot: CardTransferSnapshot | null | undefined
) => {
  if (!id || options.some(option => String(option.value) === id))
    return options;
  const fallback = snapshotOption(id, snapshot);
  return fallback ? [fallback, ...options] : options;
};

const CardPicker = ({
  itemIndex,
  readOnly,
  availableCards,
}: {
  itemIndex: number;
  readOnly: boolean;
  availableCards: CardTransferCard[];
}) => {
  const form = useFormContext<CardTransferFormValues>();
  const [open, setOpen] = useState(false);
  const selectedCards = (useWatch({
    control: form.control,
    name: `items.${itemIndex}.cards`,
  }) ?? []) as CardTransferCard[];
  const selectedIds = new Set(selectedCards.map(card => card.id));
  const selectableCards = availableCards.filter(
    card =>
      ![...form.getValues('items')].some(
        (item, index) =>
          index !== itemIndex &&
          item.cards.some(selected => selected.id === card.id)
      )
  );

  const toggleCard = (card: CardTransferCard) => {
    const nextCards = selectedIds.has(card.id)
      ? selectedCards.filter(selected => selected.id !== card.id)
      : [...selectedCards, card];
    form.setValue(`items.${itemIndex}.cards`, nextCards, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(
      `items.${itemIndex}.feAmount`,
      calculateItemAmount({
        ...form.getValues(`items.${itemIndex}`),
        cards: nextCards,
      }),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const columns: TableColumnDef<CardTransferCard>[] = [
    {
      id: 'select',
      header: '',
      cell: ({ row }) => (
        <Button
          type="button"
          size="sm"
          variant={selectedIds.has(row.original.id) ? 'default' : 'outline'}
          onClick={() => toggleCard(row.original)}
          disabled={readOnly}
        >
          {selectedIds.has(row.original.id) ? 'Selected' : 'Select'}
        </Button>
      ),
    },
    { accessorKey: 'series', header: 'Series' },
    { accessorKey: 'kitNumber', header: 'Kit Number' },
    { accessorKey: 'maskedCardNumber', header: 'Card Number' },
    { accessorKey: 'currencyCode', header: 'Currency' },
    { accessorKey: 'denomination', header: 'Denomination' },
    { accessorKey: 'amount', header: 'Amount' },
    {
      accessorKey: 'expirationDate',
      header: 'Expiration',
      cell: ({ row }) =>
        formatDateTime(`${row.original.expirationDate}T00:00:00`, 'DD/MM/YYYY'),
    },
  ];

  return (
    <div className="space-y-3 rounded-lg border border-border-secondary bg-surface-secondary p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-text-primary">
            Cards selected: {selectedCards.length}
          </p>
          <p className="text-xs text-text-secondary">
            Select cards from the source HO stock. Selected cards are reserved
            after submission.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(value => !value)}
          disabled={readOnly}
        >
          {open ? 'Hide Card Stock' : 'Select Cards'}
        </Button>
      </div>
      {selectedCards.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedCards.map(card => (
            <span
              key={card.id}
              className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs text-primary-700"
            >
              {card.maskedCardNumber} · {card.amount}
            </span>
          ))}
        </div>
      ) : null}
      {open ? (
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={selectableCards}
            enableSorting={false}
            enableFiltering={false}
            enablePagination={false}
            enableRowSelection={false}
            emptyMessage="No available cards found."
          />
        </div>
      ) : null}
    </div>
  );
};

const TransferItems = ({
  readOnly,
  availableCards,
}: {
  readOnly: boolean;
  availableCards: CardTransferCard[];
}) => {
  const form = useFormContext<CardTransferFormValues>();
  const references = useCardStockReferences();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  const items = (useWatch({ control: form.control, name: 'items' }) ??
    []) as CardTransferFormValues['items'];
  const total = calculateTotalAmount(items);
  const currencyOptions = references.currencies.map(currency => ({
    value: currency.id,
    label: `${currency.currencyCode} - ${currency.currencyName}`,
  }));
  const productOptions = references.products.map(product => ({
    value: product.id,
    label: `${product.productCode} - ${product.productDescription}`,
  }));
  const issuerOptions = references.issuers.map(issuer => ({
    value: issuer.id,
    label: `${issuer.code} - ${issuer.name}`,
  }));
  return (
    <CardSection heading="Transfer Items" className="space-y-5">
      {fields.map((field, index) => {
        const item = items[index];
        const itemCurrencyOptions = withSnapshotOption(
          currencyOptions,
          item?.currencyId,
          item?.currencySnapshot
        );
        const itemProductOptions = withSnapshotOption(
          productOptions,
          item?.productId,
          item?.productSnapshot
        );
        const itemIssuerOptions = withSnapshotOption(
          issuerOptions,
          item?.issuerPartyProfileId,
          item?.issuerPartyProfileSnapshot
        );
        return (
          <div
            key={field.id}
            className="space-y-4 rounded-lg border border-border-secondary p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">
                Item {index + 1}
              </h3>
              {!readOnly && fields.length > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => remove(index)}
                >
                  Remove Item
                </Button>
              ) : null}
            </div>
            <div className="grid gap-4 xl:grid-cols-5">
              <FormFieldSelect
                name={`items.${index}.currencyId`}
                label="Currency"
                placeholder="Select currency"
                loadOptions={staticLoader(itemCurrencyOptions)}
                defaultOptions={itemCurrencyOptions}
                isLoading={references.currenciesLoading}
                disabled={readOnly}
              />
              <FormFieldInput
                name={`items.${index}.per`}
                label="Per"
                type="number"
                disabled={readOnly}
              />
              <FormFieldSelect
                name={`items.${index}.productId`}
                label="Product Type"
                placeholder="Select product"
                loadOptions={staticLoader(itemProductOptions)}
                defaultOptions={itemProductOptions}
                isLoading={references.productsLoading}
                disabled={readOnly}
              />
              <FormFieldSelect
                name={`items.${index}.issuerPartyProfileId`}
                label="Card Issuer"
                placeholder="Select issuer"
                loadOptions={staticLoader(itemIssuerOptions)}
                defaultOptions={itemIssuerOptions}
                isLoading={references.issuersLoading}
                disabled={readOnly}
              />
              <FormFieldInput
                name={`items.${index}.feAmount`}
                label="FE Amount"
                readOnly
                disabled
              />
            </div>
            <CardPicker
              itemIndex={index}
              readOnly={readOnly}
              availableCards={availableCards}
            />
          </div>
        );
      })}
      {!readOnly ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => append(emptyTransferItem())}
        >
          Add Item
        </Button>
      ) : null}
      <div className="flex justify-end border-t border-border-secondary pt-4">
        <div className="text-right">
          <p className="text-sm text-text-secondary">Total FE Amount</p>
          <p className="text-xl font-semibold text-text-primary">{total}</p>
        </div>
      </div>
    </CardSection>
  );
};

export const CardTransferForm = ({
  readOnly = false,
  availableCards,
  transactionDatePolicy,
  onSourceBranchChange,
  isTransactionDateLoading = false,
  destinationBranchReadOnly = false,
}: Props) => {
  const form = useFormContext<CardTransferFormValues>();
  const { data: branches = [], isLoading: branchesLoading } = useQuery({
    queryKey: ['branch-profiles-all', { activeOnly: true }],
    queryFn: () => branchProfileApi.getAllBranchProfiles({ activeOnly: true }),
  });
  const loadBranchOptions = useLoadBranchOptions({ activeOnly: true });
  const sourceBranchId = useWatch({
    control: form.control,
    name: 'sourceBranchId',
  });
  const { data: sourceCards = [] } = useListTransferCards(
    sourceBranchId ?? '',
    !readOnly && availableCards === undefined
  );
  const cardOptions = availableCards ?? sourceCards;
  const hoBranchOptions = optionsFrom(
    branches.filter(branch => branch.isActive !== false && branch.isHeadOffice)
  );
  const sourceBranchSnapshot = useWatch({
    control: form.control,
    name: 'sourceBranchSnapshot',
  });
  const destinationBranchSnapshot = useWatch({
    control: form.control,
    name: 'destinationBranchSnapshot',
  });
  const sourceBranchOptions = withSnapshotOption(
    hoBranchOptions,
    sourceBranchId,
    sourceBranchSnapshot
  );
  const destinationBranchId = useWatch({
    control: form.control,
    name: 'destinationBranchId',
  });
  const loadDestinationBranchOptions = useCallback(
    async (inputValue: string, page = 1) => {
      const result = await loadBranchOptions(inputValue, page);
      const options = result.options.filter(
        option => option.value !== sourceBranchId
      );
      if (page === 1) {
        const snapshot = snapshotOption(
          destinationBranchId,
          destinationBranchSnapshot
        );
        if (
          snapshot &&
          snapshot.value !== sourceBranchId &&
          !options.some(option => option.value === snapshot.value)
        ) {
          options.unshift(snapshot);
        }
      }
      return { options, hasMore: result.hasMore };
    },
    [
      destinationBranchId,
      destinationBranchSnapshot,
      loadBranchOptions,
      sourceBranchId,
    ]
  );

  return (
    <div className="space-y-6">
      <CardSection heading="Transfer Details" className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-4">
          <FormFieldSelect
            name="sourceBranchId"
            label="Source HO Branch"
            placeholder="Select HO branch"
            loadOptions={staticLoader(sourceBranchOptions)}
            defaultOptions={sourceBranchOptions}
            isLoading={branchesLoading}
            disabled={readOnly}
            onValueChange={value => {
              const branchId = typeof value === 'string' ? value : '';
              form.setValue('transactionDate', '', {
                shouldDirty: false,
                shouldTouch: false,
                shouldValidate: true,
              });
              onSourceBranchChange?.(branchId);
            }}
          />
          <FormFieldSelect
            name="destinationBranchId"
            label="Destination Branch"
            placeholder="Select destination branch"
            loadOptions={loadDestinationBranchOptions}
            defaultOptions={true}
            pagination
            disabled={readOnly || destinationBranchReadOnly || !sourceBranchId}
          />
          <div className="space-y-2">
            <FormFieldDatePicker
              name="transactionDate"
              label="Transaction Date"
              dateFormat="dd/MM/yyyy"
              placeholder="Select transaction date"
              disabled={
                readOnly ||
                isTransactionDateLoading ||
                transactionDatePolicy?.canPunchTransactions === false
              }
              minDate={transactionDatePolicy?.minDate}
              maxDate={transactionDatePolicy?.maxDate}
            />
            {isTransactionDateLoading ? (
              <p className="text-xs text-text-secondary" role="status">
                {CARD_TRANSFER_COPY.loadingTransactionDate}
              </p>
            ) : null}
          </div>
          <FormFieldInput
            name="transactionNumber"
            label="Transaction Number"
            placeholder="Generated by account numbering"
            readOnly
            disabled
          />
          <FormFieldInput
            name="remarks"
            label="Remarks"
            placeholder="Enter remarks"
            disabled={readOnly}
          />
        </div>
      </CardSection>
      <TransferItems readOnly={readOnly} availableCards={cardOptions} />
    </div>
  );
};

export default CardTransferForm;
