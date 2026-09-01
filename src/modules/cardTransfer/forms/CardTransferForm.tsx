import { useCallback, useMemo, useState } from 'react';
import {
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import {
  Button,
  CardSection,
  Table,
  type AsyncSelectOption,
  type AsyncSelectResponse,
  type TableColumnDef,
} from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import {
  FormFieldDatePicker,
  FormFieldInput,
  FormFieldSelect,
} from '@/components/forms';
import { branchProfileApi } from '@/api/branchProfile';
import { useLoadBranchOptions } from '@/modules/branchProfile/hooks';
import { formatDateTime } from '@/utils';
import type { CardTransferCard, CardTransferFormValues } from '../types';
import type { TransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import {
  calculateItemAmount,
  calculateTotalAmount,
  emptyTransferItem,
  filterTransferCardsForItem,
  filterTransferIssuerOptions,
  getTransferItemCurrencies,
  isTransferItemContextComplete,
  pruneInvalidItemCards,
} from '../utils';
import { useListTransferCards } from '../hooks';
import { CARD_TRANSFER_COPY } from '../constants';
import { useCardStockReferences } from '@/modules/cardStock/hooks';
import { toCardStockCurrencyOptions } from '@/modules/cardStock/utils/cardStockCurrencyUtils';
import { isMultiCurrencyCardProduct } from '@/modules/purchase/utils/purchaseUtils';
import type { IBranchProfile } from '@/modules/branchProfile/types/branchProfileTypes';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import type { IProductProfile } from '@/modules/productProfile/types';
import type { IPartyProfile } from '@/modules/partyProfiles/types';

interface Props {
  readOnly?: boolean;
  availableCards?: CardTransferCard[];
  cardsLoading?: boolean;
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

const StaticFormFieldSelect = ({
  name,
  label,
  placeholder,
  options,
  disabled,
  isLoading,
  onValueChange,
  selectKey,
}: {
  name: string;
  label: string;
  placeholder?: string;
  options: AsyncSelectOption[];
  disabled?: boolean;
  isLoading?: boolean;
  onValueChange?: (value: string | string[] | null) => void;
  selectKey?: string;
}) => {
  const loadOptions = useMemo(() => staticLoader(options), [options]);
  return (
    <FormFieldSelect
      key={
        selectKey
          ? `${selectKey}-${options.length}`
          : `${name}-${options.length}`
      }
      name={name}
      label={label}
      placeholder={placeholder}
      loadOptions={loadOptions}
      defaultOptions={true}
      isLoading={isLoading}
      disabled={disabled || isLoading}
      onValueChange={onValueChange}
    />
  );
};

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
  cardsLoading,
}: {
  itemIndex: number;
  readOnly: boolean;
  availableCards: CardTransferCard[];
  cardsLoading: boolean;
}) => {
  const form = useFormContext<CardTransferFormValues>();
  const { errors } = useFormState({ control: form.control });
  const [open, setOpen] = useState(false);
  const item = useWatch({
    control: form.control,
    name: `items.${itemIndex}`,
  });
  const allItems = useWatch({ control: form.control, name: 'items' }) ?? [];
  const selectedCards = (item?.cards ?? []) as CardTransferCard[];
  const selectedIds = new Set(selectedCards.map(card => card.id));
  const contextComplete = isTransferItemContextComplete(item ?? emptyTransferItem());
  const excludedCardIds = allItems.flatMap((entry, index) =>
    index === itemIndex ? [] : entry.cards.map(card => card.id)
  );
  const selectableCards = filterTransferCardsForItem(
    availableCards,
    item ?? emptyTransferItem(),
    excludedCardIds
  );
  const cardsError = errors.items?.[itemIndex]?.cards;
  const cardsErrorMessage =
    cardsError && typeof cardsError === 'object' && 'message' in cardsError
      ? String(cardsError.message ?? '')
      : '';

  const syncItemCards = (nextCards: CardTransferCard[]) => {
    form.setValue(`items.${itemIndex}.cards`, nextCards, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(
      `items.${itemIndex}.feAmount`,
      calculateItemAmount({
        ...(item ?? emptyTransferItem()),
        cards: nextCards,
      }),
      { shouldDirty: true, shouldValidate: true }
    );
    void form.trigger([
      `items.${itemIndex}.cards` as never,
      `items.${itemIndex}.feAmount` as never,
      `items.${itemIndex}.currencyId` as never,
      `items.${itemIndex}.productId` as never,
    ]);
  };

  const toggleCard = (card: CardTransferCard) => {
    const nextCards = selectedIds.has(card.id)
      ? selectedCards.filter(selected => selected.id !== card.id)
      : [...selectedCards, card];
    syncItemCards(nextCards);
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
          disabled={readOnly || !contextComplete}
        >
          {selectedIds.has(row.original.id) ? 'Selected' : 'Select'}
        </Button>
      ),
    },
    { accessorKey: 'series', header: 'Series' },
    { accessorKey: 'kitNumber', header: 'Kit Number' },
    { accessorKey: 'maskedCardNumber', header: 'Card Number' },
    { accessorKey: 'productCode', header: 'Product' },
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
    <div
      className={`space-y-3 rounded-lg border bg-surface-secondary p-4 ${
        cardsErrorMessage
          ? 'border-error-500'
          : 'border-border-secondary'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-text-primary">
            Cards selected: {selectedCards.length}
          </p>
          <p className="text-xs text-text-secondary">
            {contextComplete
              ? 'Select cards that match this item product, currency, and issuer.'
              : CARD_TRANSFER_COPY.selectItemContextFirst}
          </p>
          {cardsErrorMessage ? (
            <p className="mt-1 text-sm text-error-600" role="alert">
              {cardsErrorMessage}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(value => !value)}
          disabled={readOnly || !contextComplete || cardsLoading}
        >
          {open ? 'Hide Card Stock' : 'Select Cards'}
        </Button>
      </div>
      {cardsLoading ? (
        <p className="text-xs text-text-secondary" role="status">
          {CARD_TRANSFER_COPY.loadingCards}
        </p>
      ) : null}
      {selectedCards.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedCards.map(card => (
            <span
              key={card.id}
              className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs text-primary-700"
            >
              {card.productCode} · {card.currencyCode} · {card.maskedCardNumber}{' '}
              · {card.amount}
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
            loading={cardsLoading}
            emptyMessage={
              contextComplete
                ? CARD_TRANSFER_COPY.noMatchingCards
                : CARD_TRANSFER_COPY.selectItemContextFirst
            }
          />
        </div>
      ) : null}
    </div>
  );
};

const TransferItems = ({
  readOnly,
  availableCards,
  cardsLoading,
  currencies,
  products,
  issuers,
  currenciesLoading,
  productsLoading,
  issuersLoading,
}: {
  readOnly: boolean;
  availableCards: CardTransferCard[];
  cardsLoading: boolean;
  currencies: ICurrencyProfile[];
  products: IProductProfile[];
  issuers: IPartyProfile[];
  currenciesLoading: boolean;
  productsLoading: boolean;
  issuersLoading: boolean;
}) => {
  const form = useFormContext<CardTransferFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  const items = (useWatch({ control: form.control, name: 'items' }) ??
    []) as CardTransferFormValues['items'];
  const total = calculateTotalAmount(items);
  const productOptions = products.map(product => ({
    value: product.id,
    label: `${product.productCode} - ${product.productDescription}`,
  }));

  const revalidateItem = (index: number) => {
    void form.trigger([
      `items.${index}.currencyId` as never,
      `items.${index}.productId` as never,
      `items.${index}.issuerPartyProfileId` as never,
      `items.${index}.cards` as never,
      `items.${index}.feAmount` as never,
    ]);
  };

  const handleItemContextChange = (index: number) => {
    const currentItem = form.getValues(`items.${index}`);
    const pruned = pruneInvalidItemCards(currentItem);
    form.setValue(`items.${index}.cards`, pruned.cards, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`items.${index}.feAmount`, pruned.feAmount, {
      shouldDirty: true,
      shouldValidate: true,
    });
    revalidateItem(index);
  };

  return (
    <CardSection heading="Transfer Items" className="space-y-5">
      {fields.map((field, index) => {
        const item = items[index];
        const product = products.find(
          productRecord => productRecord.id === item?.productId
        );
        const isMultiCurrency = isMultiCurrencyCardProduct(product?.productCode);
        const itemCurrencies = getTransferItemCurrencies(currencies, product);
        const currencyOptions = withSnapshotOption(
          toCardStockCurrencyOptions(itemCurrencies),
          item?.currencyId,
          item?.currencySnapshot
        );
        const itemProductOptions = withSnapshotOption(
          productOptions,
          item?.productId,
          item?.productSnapshot
        );
        const issuerOptions = withSnapshotOption(
          filterTransferIssuerOptions(issuers, product).map(issuer => ({
            value: issuer.id,
            label: `${issuer.code} - ${issuer.name}`,
          })),
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
              <StaticFormFieldSelect
                name={`items.${index}.productId`}
                label="Product Type"
                placeholder="Select product"
                options={itemProductOptions}
                isLoading={productsLoading}
                disabled={readOnly}
                selectKey={`product-${index}-${product?.id ?? 'none'}`}
                onValueChange={() => {
                  form.setValue(`items.${index}.issuerPartyProfileId`, '', {
                    shouldValidate: true,
                  });
                  handleItemContextChange(index);
                }}
              />
              <StaticFormFieldSelect
                name={`items.${index}.currencyId`}
                label="Currency"
                placeholder="Select currency"
                options={currencyOptions}
                isLoading={currenciesLoading}
                disabled={readOnly || !product}
                selectKey={`currency-${index}-${product?.id ?? 'none'}-${isMultiCurrency ? 'cm' : 'cc'}-${currencyOptions.length}`}
                onValueChange={() => handleItemContextChange(index)}
              />
              <FormFieldInput
                name={`items.${index}.per`}
                label="Per"
                type="number"
                disabled={readOnly}
              />
              <StaticFormFieldSelect
                name={`items.${index}.issuerPartyProfileId`}
                label="Card Issuer"
                placeholder="Select issuer"
                options={issuerOptions}
                isLoading={issuersLoading}
                disabled={readOnly || !product}
                selectKey={`issuer-${index}-${product?.id ?? 'none'}`}
                onValueChange={() => handleItemContextChange(index)}
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
              cardsLoading={cardsLoading}
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
  cardsLoading: cardsLoadingProp,
  transactionDatePolicy,
  onSourceBranchChange,
  isTransactionDateLoading = false,
  destinationBranchReadOnly = false,
}: Props) => {
  const form = useFormContext<CardTransferFormValues>();
  const references = useCardStockReferences();
  const { data: branches = [], isLoading: branchesLoading } = useQuery({
    queryKey: ['branch-profiles-all', { activeOnly: true }],
    queryFn: () => branchProfileApi.getAllBranchProfiles({ activeOnly: true }),
  });
  const loadBranchOptions = useLoadBranchOptions({ activeOnly: true });
  const sourceBranchId = useWatch({
    control: form.control,
    name: 'sourceBranchId',
  });
  const {
    data: sourceCards = [],
    isLoading: sourceCardsLoading,
    isFetching: sourceCardsFetching,
  } = useListTransferCards(
    sourceBranchId ?? '',
    !readOnly && availableCards === undefined
  );
  const cardOptions = availableCards ?? sourceCards;
  const cardsLoading =
    cardsLoadingProp ?? (sourceCardsLoading || sourceCardsFetching);
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

  const resetItemsForSourceBranch = () => {
    form.setValue('items', [emptyTransferItem()], {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue('destinationBranchId', '', {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-6">
      <CardSection heading="Transfer Details" className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-4">
          <StaticFormFieldSelect
            name="sourceBranchId"
            label="Source HO Branch"
            placeholder="Select HO branch"
            options={sourceBranchOptions}
            isLoading={branchesLoading}
            disabled={readOnly}
            selectKey="source-ho-branch"
            onValueChange={value => {
              const branchId = typeof value === 'string' ? value : '';
              form.setValue('transactionDate', '', {
                shouldDirty: false,
                shouldTouch: false,
                shouldValidate: true,
              });
              resetItemsForSourceBranch();
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
      <TransferItems
        readOnly={readOnly}
        availableCards={cardOptions}
        cardsLoading={cardsLoading}
        currencies={references.currencies}
        products={references.products}
        issuers={references.issuers}
        currenciesLoading={references.currenciesLoading}
        productsLoading={references.productsLoading}
        issuersLoading={references.issuersLoading}
      />
    </div>
  );
};

export default CardTransferForm;
