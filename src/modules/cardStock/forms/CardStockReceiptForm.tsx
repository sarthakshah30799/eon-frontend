import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Button, CardSection, Table, type TableColumnDef } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import { Form, FormFieldDatePicker, FormFieldInput, FormFieldSelect } from '@/components/forms';
import type { AsyncSelectOption, AsyncSelectResponse } from '@/components/ui';
import { useAuth } from '@/lib/AuthContext';
import { transactionPoliciesApi } from '@/api/transactionPolicies';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import type { IPartyProfile } from '@/modules/partyProfiles/types';
import { PartyProfileTypeEnum } from '@/modules/partyProfiles/types';
import { SelectPartyProfiles } from '@/modules/partyProfiles/components';
import type { IProductProfile } from '@/modules/productProfile/types';
import { createCardStockSchema } from '../schema';
import { resolveCardNumberLength } from '../utils/cardNumberValidation';
import type { CardStockFormProps, ICardStockFormCard, ICardStockFormValues } from '../types';
import { emptyCard, emptyItem, toReceiptPayload } from '../utils/cardStockUtils';
import { useCardStockReferences } from '../hooks';
import { CardStockUploadSection } from '../components/CardStockUploadSection';
import { yupResolver } from '@hookform/resolvers/yup';

const CardStockFormDebug = () => {
  const { formState } = useFormContext<ICardStockFormValues>();

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (Object.keys(formState.errors).length === 0) {
      console.info('[CARD STOCK] form validation is clear', {
        isValid: formState.isValid,
      });
      return;
    }
    console.groupCollapsed('[CARD STOCK] form validation errors');
    console.error(formState.errors);
    console.info('isValid:', formState.isValid);
    console.groupEnd();
  }, [formState.errors, formState.isValid]);

  return null;
};

const CardStockTransactionDateSync = ({
  transactionDate,
  readOnly,
}: {
  transactionDate: string;
  readOnly: boolean;
}) => {
  const form = useFormContext<ICardStockFormValues>();

  useEffect(() => {
    if (readOnly || !transactionDate) return;
    if (form.getValues('receiptDate') !== transactionDate) {
      form.setValue('receiptDate', transactionDate, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: true,
      });
    }
  }, [form, readOnly, transactionDate]);

  return null;
};

const loadStaticOptions = (options: AsyncSelectOption[]) => async (inputValue: string): Promise<AsyncSelectResponse> => ({
  options: inputValue
    ? options.filter(option => option.label.toLowerCase().includes(inputValue.toLowerCase()))
    : options,
});

const StaticFormFieldSelect = ({
  name,
  label,
  options,
  disabled,
  onValueChange,
}: {
  name: string;
  label: string;
  options: AsyncSelectOption[];
  disabled?: boolean;
  onValueChange?: (value: string | string[] | null) => void;
}) => {
  const loadOptions = useMemo(() => loadStaticOptions(options), [options]);
  return <FormFieldSelect name={name} label={label} loadOptions={loadOptions} defaultOptions={options} disabled={disabled} onValueChange={onValueChange} />;
};

const CardRows = ({ itemIndex, readOnly, issuers }: { itemIndex: number; readOnly: boolean; issuers: IPartyProfile[] }) => {
  const form = useFormContext<ICardStockFormValues>();
  const { fields, append, remove } = useFieldArray({ control: form.control, name: `items.${itemIndex}.cards` as never });
  const cards = useWatch({ control: form.control, name: `items.${itemIndex}.cards` as never }) as ICardStockFormCard[] | undefined;
  const issuerId = useWatch({ control: form.control, name: `items.${itemIndex}.issuerPartyProfileId` as never }) as string;
  const selectedIssuer = issuers.find(issuer => issuer.id === issuerId);
  const issuerLength = resolveCardNumberLength(selectedIssuer?.cardNumberLength);
  const allowMasking = Boolean(selectedIssuer?.allowCardNumberMasking);
  const cardCalculationKey = (cards ?? []).map(card => card.denomination ?? '').join('|');

  useEffect(() => {
    const nextCards = (form.getValues(`items.${itemIndex}.cards` as never) as unknown as ICardStockFormCard[] | undefined) ?? [];
    nextCards.forEach((card, cardIndex) => {
      const amount = Number(card.denomination || 0).toFixed(2);
      const amountPath = `items.${itemIndex}.cards.${cardIndex}.amount`;
      if ((form.getValues(amountPath as never) as unknown as string) !== amount) form.setValue(amountPath as never, amount as never, { shouldValidate: true });
    });
    const total = nextCards.reduce((sum, card) => sum + Number(card.denomination || 0), 0).toFixed(2);
    const totalPath = `items.${itemIndex}.feAmount`;
    if ((form.getValues(totalPath as never) as unknown as string) !== total) form.setValue(totalPath as never, total as never, { shouldValidate: true });
  }, [cardCalculationKey, itemIndex, form]);

  const columns = useMemo<TableColumnDef<{ id: string }>[]>(() => [
    {
      id: 'series',
      header: 'Series',
      cell: ({ row }) => <FormFieldInput name={`items.${itemIndex}.cards.${row.index}.series`} label="" disabled={readOnly} maxLength={4} />,
    },
    {
      id: 'kitNumber',
      header: 'Kit Number',
      cell: ({ row }) => <FormFieldInput name={`items.${itemIndex}.cards.${row.index}.kitNumber`} label="" disabled={readOnly} />,
    },
    {
      id: 'cardNumber',
      header: 'Card Number',
      cell: ({ row }) => <FormFieldInput name={`items.${itemIndex}.cards.${row.index}.cardNumber`} label="" disabled={readOnly} placeholder={allowMasking ? `${issuerLength} digits or mask` : `${issuerLength} digits`} />,
    },
    {
      id: 'denomination',
      header: 'Denomination',
      cell: ({ row }) => <FormFieldInput name={`items.${itemIndex}.cards.${row.index}.denomination`} label="" type="number" disabled={readOnly} />,
    },
    {
      id: 'amount',
      header: 'Amount',
      cell: ({ row }) => <FormFieldInput name={`items.${itemIndex}.cards.${row.index}.amount`} label="" type="number" disabled />,
    },
    {
      id: 'expirationDate',
      header: 'Expiration',
      cell: ({ row }) => <FormFieldDatePicker name={`items.${itemIndex}.cards.${row.index}.expirationDate`} label="" dateFormat="dd/MM/yyyy" disabled={readOnly} minDate={new Date()} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => !readOnly && fields.length > 1 ? <Button type="button" variant="ghost" size="sm" onClick={() => remove(row.index)}>Remove</Button> : null,
    },
  ], [allowMasking, fields.length, itemIndex, issuerLength, readOnly, remove]);

 return <div className="space-y-3 rounded-md border border-border-secondary bg-surface-secondary/40 p-3">
    <div className="flex items-center justify-between"><p className="text-xs font-semibold text-text-primary">Cards for this item</p>{!readOnly && <Button type="button" variant="outline" size="sm" onClick={() => append(emptyCard() as never)}>Add Card</Button>}</div>
    <div className="overflow-x-auto"><Table columns={columns} data={fields} enableSorting={false} enableFiltering={false} enablePagination={false} enableRowSelection={false} enableColumnVisibility={false} loading={false} className="min-w-[1050px] table-fixed" emptyMessage="No cards added yet" getRowId={row => row.id} /></div>
  </div>;
};

const ReceiptItems = ({ readOnly, currencies, products, issuers }: { readOnly: boolean; currencies: ICurrencyProfile[]; products: IProductProfile[]; issuers: IPartyProfile[] }) => {
  const form = useFormContext<ICardStockFormValues>();
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });
  const items = useWatch({ control: form.control, name: 'items' });
  const total = (items ?? []).reduce((sum, item) => sum + Number(item.feAmount || 0), 0).toFixed(2);
  useEffect(() => {
    if (form.getValues('totalFeAmount') !== total) form.setValue('totalFeAmount', total, { shouldValidate: true });
  }, [form, total]);

  return <CardSection heading="Transaction Items" className="space-y-4"><div className="space-y-5">{fields.map((field, itemIndex) => { const item = items?.[itemIndex]; const product = products.find(productRecord => productRecord.id === item?.productId); const issuerOptions = (product ? issuers.filter(issuer => product.cardIssuerProfileIds?.includes(issuer.id)) : issuers).map(issuer => ({ value: issuer.id, label: `${issuer.code} - ${issuer.name}` })); const currencyOptions = currencies.map(currency => ({ value: currency.id, label: `${currency.currencyCode} - ${currency.currencyName}` })); const productOptions = products.map(productRecord => ({ value: productRecord.id, label: `${productRecord.productCode} - ${productRecord.productDescription}` })); return <div key={field.id} className="space-y-4 rounded-md border border-border-primary p-3"><div className="overflow-x-auto"><div className="grid min-w-[1100px] grid-cols-5 gap-3"><StaticFormFieldSelect name={`items.${itemIndex}.currencyId`} label="Currency" options={currencyOptions} disabled={readOnly} /><FormFieldInput name={`items.${itemIndex}.per`} label="Per" type="number" disabled={readOnly} /><StaticFormFieldSelect name={`items.${itemIndex}.productId`} label="Product Type" options={productOptions} disabled={readOnly} onValueChange={() => form.setValue(`items.${itemIndex}.issuerPartyProfileId` as never, '' as never, { shouldValidate: true })} /><StaticFormFieldSelect name={`items.${itemIndex}.issuerPartyProfileId`} label="Issuer" options={issuerOptions} disabled={readOnly} /><FormFieldInput name={`items.${itemIndex}.feAmount`} label="FE Amount" type="number" disabled /></div></div>{!readOnly ? <CardStockUploadSection itemIndex={itemIndex} readOnly={readOnly} issuer={issuers.find(issuer => issuer.id === item?.issuerPartyProfileId)} /> : null}<CardRows itemIndex={itemIndex} readOnly={readOnly} issuers={issuers} />{!readOnly && fields.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => remove(itemIndex)}>Remove Item</Button>}</div>; })}</div>{!readOnly && <Button type="button" variant="outline" onClick={() => append(emptyItem())}>Add Item</Button>}<div className="flex justify-end border-t border-border-primary pt-3"><div className="text-sm font-semibold text-text-primary">Total FE Amount: {total}</div></div></CardSection>;
};

const CardIssuerProfileField = ({ readOnly, issuers }: { readOnly: boolean; issuers: IPartyProfile[] }) => {
  const form = useFormContext<ICardStockFormValues>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const selectedIssuerId = useWatch({ control: form.control, name: 'issuerPartyProfileId' });
  const selectedIssuer = issuers.find(issuer => issuer.id === selectedIssuerId);

  return <>
    <div className="min-w-0">
      <label className="mb-1 block text-sm font-medium text-text-primary">Card Issuer Profile</label>
      <Button type="button" variant="outline" className="w-full justify-start truncate" disabled={readOnly} onClick={() => setIsModalOpen(true)}>
        {selectedIssuer ? `${selectedIssuer.code} - ${selectedIssuer.name}` : 'Select card issuer profile'}
      </Button>
    </div>
    <SelectPartyProfiles
      open={isModalOpen}
      types={PartyProfileTypeEnum.CARD_ISSUER_PROFILE}
      selectable
      title="Select Card Issuer Profile"
      description="Select an active and approved card issuer profile."
      initialSelectedProfiles={selectedIssuer ? [selectedIssuer] : []}
      onContinue={profiles => {
        form.setValue('issuerPartyProfileId', profiles[0]?.id ?? '', {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setIsModalOpen(false);
      }}
      onClose={() => setIsModalOpen(false)}
    />
  </>;
};

const ReceiptHeader = ({ readOnly, issuers, branches, canSelectBranch, transactionDatePolicy, onBranchChange }: { readOnly: boolean; issuers: IPartyProfile[]; branches: Array<{ id: string; code: string; name: string }>; canSelectBranch: boolean; transactionDatePolicy: ReturnType<typeof getTransactionDatePolicy>; onBranchChange: (value: string | string[] | null) => void }) => {
  const branchOptions = useMemo(() => branches.map(branch => ({ value: branch.id, label: `${branch.code} - ${branch.name}` })), [branches]);

  return <CardSection heading="Receipt Stock" className="space-y-4"><div className="grid gap-3 md:grid-cols-4"><StaticFormFieldSelect name="branchId" label="Branch" options={branchOptions} disabled={readOnly || !canSelectBranch || branches.length <= 1} onValueChange={onBranchChange} /><FormFieldDatePicker name="receiptDate" label="Transaction Date" dateFormat="dd/MM/yyyy" disabled={readOnly || !transactionDatePolicy.canPunchTransactions} minDate={transactionDatePolicy.minDate} maxDate={transactionDatePolicy.maxDate} /><FormFieldInput name="transactionNumber" label="Transaction Number" disabled placeholder="Generated by account numbering" /><CardIssuerProfileField readOnly={readOnly} issuers={issuers} /></div><p className="text-xs text-text-secondary">CARD product rows are filtered to Product Profile code CC. Each card row represents one card.</p></CardSection>;
};

export const CardStockReceiptForm = ({ initialValues, readOnly = false, onSubmit }: CardStockFormProps) => {
  const references = useCardStockReferences();
  const { user, policyContext, activeBranchId } = useAuth();
  const canSelectBranch = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const [selectedBranchId, setSelectedBranchId] = useState(initialValues.branchId);
  const { data: branches = [], isLoading: branchesLoading } = useListBranchProfiles({ activeOnly: true });
  const availableBranches = useMemo(() => branches.filter(branch => canSelectBranch || branch.id === activeBranchId).map(branch => ({ id: branch.id, code: branch.code, name: branch.name })), [activeBranchId, branches, canSelectBranch]);
  const selectedBranchPolicy = useQuery({
    queryKey: ['card-stock', 'transaction-date-policy', selectedBranchId],
    queryFn: () => transactionPoliciesApi.getPolicyContext(selectedBranchId),
    enabled: Boolean(selectedBranchId),
  });
  const selectedPolicyContext = selectedBranchPolicy.data ?? (selectedBranchId === activeBranchId ? policyContext : null);
  const transactionDatePolicy = useMemo(() => getTransactionDatePolicy(selectedPolicyContext), [selectedPolicyContext]);
  const defaultValues = useMemo(() => ({
    ...initialValues,
    receiptDate: readOnly
      ? initialValues.receiptDate
      : transactionDatePolicy.defaultTransactionDate,
  }), [initialValues, readOnly, transactionDatePolicy.defaultTransactionDate]);
  const cardStockSchema = useMemo(() => createCardStockSchema(references.issuers), [references.issuers]);
  const formSubmit = async (values: ICardStockFormValues) => onSubmit(toReceiptPayload(values));
  useEffect(() => {
    if (!import.meta.env.DEV || readOnly) return;
    console.info('[CARD STOCK] transaction date policy', transactionDatePolicy);
  }, [readOnly, transactionDatePolicy]);

  if (references.isLoading || branchesLoading) return <Loader />;

  return <Form<ICardStockFormValues> id="card-stock-receipt-form" defaultValues={defaultValues} resolver={yupResolver(cardStockSchema) as never} mode="onChange" onSubmit={formSubmit} onError={errors => { if (import.meta.env.DEV) console.error('[CARD STOCK] submit blocked by validation errors', errors); }} footer={{ submitLabel: 'Submit Receipt Stock', showSubmit: !readOnly, isSubmitDisabled: !readOnly && (!transactionDatePolicy.canPunchTransactions || selectedBranchPolicy.isFetching || !selectedBranchId), onCancel: () => window.history.back() }}><CardStockFormDebug /><CardStockTransactionDateSync readOnly={readOnly} transactionDate={transactionDatePolicy.defaultTransactionDate} /><ReceiptHeader readOnly={readOnly} issuers={references.issuers} branches={availableBranches} canSelectBranch={canSelectBranch} transactionDatePolicy={transactionDatePolicy} onBranchChange={value => { const nextBranch = typeof value === 'string' ? value : ''; setSelectedBranchId(nextBranch); }} /><ReceiptItems readOnly={readOnly} currencies={references.currencies} products={references.products} issuers={references.issuers} /></Form>;
};

export default CardStockReceiptForm;
