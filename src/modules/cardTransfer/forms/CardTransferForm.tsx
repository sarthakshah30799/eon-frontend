import { useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Button, CardSection, Table, type AsyncSelectOption, type AsyncSelectResponse, type TableColumnDef } from '@/components/ui';
import { FormFieldDatePicker, FormFieldInput, FormFieldSelect } from '@/components/forms';
import type { IBranchProfile } from '@/modules/branchProfile/types/branchProfileTypes';
import type { ICounterProfile } from '@/modules/counterProfile/types/counterProfileTypes';
import type { CardTransferCard, CardTransferFormValues } from '../types';
import type { TransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import { CARD_TRANSFER_TYPE_OPTIONS } from '../constants';
import { calculateItemAmount, calculateTotalAmount, demoCards, emptyTransferItem } from '../utils';

interface Props {
  readOnly?: boolean;
  branches: IBranchProfile[];
  counters: ICounterProfile[];
  transactionDatePolicy?: TransactionDatePolicy;
}

const staticLoader = (options: AsyncSelectOption[]) => async (input: string): Promise<AsyncSelectResponse> => ({
  options: input ? options.filter(option => option.label.toLowerCase().includes(input.toLowerCase())) : options,
});

const optionsFrom = (items: Array<{ id: string; name?: string; code?: string; counterNo?: string }>): AsyncSelectOption[] => items.map(item => ({
  value: item.id,
  label: [item.code, item.counterNo, item.name].filter(Boolean).join(' - '),
}));

const CardPicker = ({ itemIndex, readOnly }: { itemIndex: number; readOnly: boolean }) => {
  const form = useFormContext<CardTransferFormValues>();
  const [open, setOpen] = useState(false);
  const selectedCards = (useWatch({ control: form.control, name: `items.${itemIndex}.cards` }) ?? []) as CardTransferCard[];
  const selectedIds = new Set(selectedCards.map(card => card.id));
  const availableCards = demoCards.filter(card => ![...form.getValues('items')].some((item, index) => index !== itemIndex && item.cards.some(selected => selected.id === card.id)));

  const toggleCard = (card: CardTransferCard) => {
    const nextCards = selectedIds.has(card.id)
      ? selectedCards.filter(selected => selected.id !== card.id)
      : [...selectedCards, card];
    form.setValue(`items.${itemIndex}.cards`, nextCards, { shouldDirty: true, shouldValidate: true });
    form.setValue(`items.${itemIndex}.feAmount`, calculateItemAmount({ ...form.getValues(`items.${itemIndex}`), cards: nextCards }), { shouldDirty: true, shouldValidate: true });
  };

  const columns: TableColumnDef<CardTransferCard>[] = [
    { id: 'select', header: '', cell: ({ row }) => <Button type="button" size="sm" variant={selectedIds.has(row.original.id) ? 'default' : 'outline'} onClick={() => toggleCard(row.original)} disabled={readOnly}>{selectedIds.has(row.original.id) ? 'Selected' : 'Select'}</Button> },
    { accessorKey: 'series', header: 'Series' },
    { accessorKey: 'kitNumber', header: 'Kit Number' },
    { accessorKey: 'maskedCardNumber', header: 'Card Number' },
    { accessorKey: 'currencyCode', header: 'Currency' },
    { accessorKey: 'denomination', header: 'Denomination' },
    { accessorKey: 'amount', header: 'Amount' },
    { accessorKey: 'expirationDate', header: 'Expiration' },
  ];

  return <div className="space-y-3 rounded-lg border border-border-secondary bg-surface-secondary p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="font-medium text-text-primary">Cards selected: {selectedCards.length}</p><p className="text-xs text-text-secondary">Select cards from the source HO stock. Selected cards are reserved after submission.</p></div>
      <Button type="button" variant="outline" onClick={() => setOpen(value => !value)} disabled={readOnly}>{open ? 'Hide Card Stock' : 'Select Cards'}</Button>
    </div>
    {selectedCards.length > 0 ? <div className="flex flex-wrap gap-2">{selectedCards.map(card => <span key={card.id} className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs text-primary-700">{card.maskedCardNumber} · {card.amount}</span>)}</div> : null}
    {open ? <div className="overflow-x-auto"><Table columns={columns} data={availableCards} enableSorting={false} enableFiltering={false} enablePagination={false} enableRowSelection={false} emptyMessage="No available cards found." /></div> : null}
  </div>;
};

const TransferItems = ({ readOnly }: { readOnly: boolean }) => {
  const form = useFormContext<CardTransferFormValues>();
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });
  const items = (useWatch({ control: form.control, name: 'items' }) ?? []) as CardTransferFormValues['items'];
  const total = calculateTotalAmount(items);
  const options = {
    currencies: [{ value: 'USD', label: 'USD - US Dollar' }, { value: 'EUR', label: 'EUR - Euro' }],
    products: [{ value: 'CC', label: 'CC - Card' }],
    issuers: [{ value: 'issuer-demo', label: 'Demo Card Issuer' }],
  };
  return <CardSection heading="Transfer Items" className="space-y-5">
    {fields.map((field, index) => <div key={field.id} className="space-y-4 rounded-lg border border-border-secondary p-4">
      <div className="flex items-center justify-between"><h3 className="font-semibold text-text-primary">Item {index + 1}</h3>{!readOnly && fields.length > 1 ? <Button type="button" variant="outline" onClick={() => remove(index)}>Remove Item</Button> : null}</div>
      <div className="grid gap-4 xl:grid-cols-5">
        <FormFieldSelect name={`items.${index}.currencyId`} label="Currency" placeholder="Select currency" loadOptions={staticLoader(options.currencies)} defaultOptions={options.currencies} disabled={readOnly} />
        <FormFieldInput name={`items.${index}.per`} label="Per" type="number" disabled={readOnly} />
        <FormFieldSelect name={`items.${index}.productId`} label="Product Type" placeholder="Select product" loadOptions={staticLoader(options.products)} defaultOptions={options.products} disabled={readOnly} />
        <FormFieldSelect name={`items.${index}.issuerPartyProfileId`} label="Card Issuer" placeholder="Select issuer" loadOptions={staticLoader(options.issuers)} defaultOptions={options.issuers} disabled={readOnly} />
        <FormFieldInput name={`items.${index}.feAmount`} label="FE Amount" readOnly disabled />
      </div>
      <CardPicker itemIndex={index} readOnly={readOnly} />
    </div>)}
    {!readOnly ? <Button type="button" variant="outline" onClick={() => append(emptyTransferItem())}>Add Item</Button> : null}
    <div className="flex justify-end border-t border-border-secondary pt-4"><div className="text-right"><p className="text-sm text-text-secondary">Total FE Amount</p><p className="text-xl font-semibold text-text-primary">{total}</p></div></div>
  </CardSection>;
};

export const CardTransferForm = ({ readOnly = false, branches, counters, transactionDatePolicy }: Props) => {
  const form = useFormContext<CardTransferFormValues>();
  const sourceBranchId = useWatch({ control: form.control, name: 'sourceBranchId' });
  const branchOptions = optionsFrom(branches.filter(branch => branch.isActive !== false && branch.isHeadOffice));
  const counterOptions = optionsFrom(counters.filter(counter => counter.isActive !== false && (!sourceBranchId || counter.branchId === sourceBranchId)));
  const typeOptions = CARD_TRANSFER_TYPE_OPTIONS;

  return <div className="space-y-6">
    <CardSection heading="Transfer Details" className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-4">
        <FormFieldSelect name="transferType" label="Transfer Type" loadOptions={staticLoader(typeOptions)} defaultOptions={typeOptions} disabled={readOnly} isSearchable={false} />
        <FormFieldSelect name="sourceBranchId" label="Source HO Branch" placeholder="Select HO branch" loadOptions={staticLoader(branchOptions)} defaultOptions={branchOptions} disabled={readOnly} />
        <FormFieldSelect name="sourceCounterId" label="Source Counter" placeholder="Select source counter" loadOptions={staticLoader(counterOptions)} defaultOptions={counterOptions} disabled={readOnly || !sourceBranchId} />
        <FormFieldSelect name="destinationBranchId" label="Destination Branch" placeholder="Select destination branch" loadOptions={staticLoader(branchOptions.filter(option => option.value !== sourceBranchId))} defaultOptions={branchOptions.filter(option => option.value !== sourceBranchId)} disabled={readOnly || !sourceBranchId} />
        <FormFieldDatePicker name="transactionDate" label="Transaction Date" placeholder="Select transaction date" disabled={readOnly || transactionDatePolicy?.canPunchTransactions === false} minDate={transactionDatePolicy?.minDate} maxDate={transactionDatePolicy?.maxDate} />
        <FormFieldInput name="sellTransactionNumber" label="Sell Transaction Number" readOnly disabled />
        <FormFieldInput name="purchaseTransactionNumber" label="Purchase Transaction Number" placeholder="Generated on acceptance" readOnly disabled />
        <FormFieldInput name="remarks" label="Remarks" placeholder="Enter remarks" disabled={readOnly} />
      </div>
    </CardSection>
    <TransferItems readOnly={readOnly} />
  </div>;
};

export default CardTransferForm;
