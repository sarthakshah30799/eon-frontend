import { useMemo, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import {
  Button,
  CardSection,
  type AsyncSelectOption,
  type AsyncSelectResponse,
} from '@/components/ui';
import {
  FormFieldDatePicker,
  FormFieldInput,
  FormFieldSelect,
} from '@/components/forms';
import { CardStockSettlementDocumentKind } from '@/api/cardSettlement';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import { useCardStockReferences } from '@/modules/cardStock/hooks';
import type { TransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import { CARD_SETTLEMENT_TEXT } from '../constants/cardSettlementConstants';
import { useUnsettledCardSettlements } from '../hooks';
import type { CardSettlementFormValues } from '../types/cardSettlementTypes';
import { settlementAmountFrom, toFormItem } from '../utils/cardSettlementUtils';
import { CardSettlementItemPicker } from '../components';

interface Props {
  readOnly?: boolean;
  isHo?: boolean;
  transactionDatePolicy?: TransactionDatePolicy;
  isTransactionDateLoading?: boolean;
  onHoBranchChange?: (branchId: string) => void;
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

const snapshotLabel = (
  snapshot: CardSettlementFormValues['issuerPartyProfileSnapshot']
) => {
  if (!snapshot || typeof snapshot !== 'object') return null;
  if (typeof snapshot.label === 'string' && snapshot.label.trim()) {
    return snapshot.label.trim();
  }
  const code = [snapshot.code, snapshot.currencyCode].find(
    value => typeof value === 'string' && value.trim()
  );
  const name = [snapshot.name, snapshot.currencyName].find(
    value => typeof value === 'string' && value.trim()
  );
  const label = [code, name].filter(Boolean).join(' - ');
  return label || null;
};

const snapshotOption = (
  id: string | undefined,
  snapshot: CardSettlementFormValues['issuerPartyProfileSnapshot']
): AsyncSelectOption | null => {
  if (!id) return null;
  const label = snapshotLabel(snapshot);
  return label ? { value: id, label } : null;
};

const withSnapshotOption = (
  options: AsyncSelectOption[],
  id: string | undefined,
  snapshot: CardSettlementFormValues['issuerPartyProfileSnapshot']
) => {
  if (!id || options.some(option => String(option.value) === id)) return options;
  const fallback = snapshotOption(id, snapshot);
  return fallback ? [fallback, ...options] : options;
};

export const CardSettlementForm = ({
  readOnly = false,
  isHo = false,
  transactionDatePolicy,
  isTransactionDateLoading = false,
  onHoBranchChange,
}: Props) => {
  const form = useFormContext<CardSettlementFormValues>();
  const { fields, replace } = useFieldArray({ control: form.control, name: 'items' });
  const [pickerOpen, setPickerOpen] = useState(false);
  const kind = useWatch({ control: form.control, name: 'kind' });
  const issuerPartyProfileId = useWatch({ control: form.control, name: 'issuerPartyProfileId' });
  const currencyId = useWatch({ control: form.control, name: 'currencyId' });
  const hoBranchId = useWatch({ control: form.control, name: 'hoBranchId' });
  const issuerPartyProfileSnapshot = useWatch({
    control: form.control,
    name: 'issuerPartyProfileSnapshot',
  });
  const currencySnapshot = useWatch({ control: form.control, name: 'currencySnapshot' });
  const hoBranchSnapshot = useWatch({ control: form.control, name: 'hoBranchSnapshot' });
  const items = useWatch({ control: form.control, name: 'items' }) ?? [];
  const isIssuerKind = isHo || kind === CardStockSettlementDocumentKind.HO_ISSUER;
  const references = useCardStockReferences();
  const branchesQuery = useListBranchProfiles({ activeOnly: true }, isIssuerKind);
  const canLoadUnsettled =
    Boolean(issuerPartyProfileId && currencyId) &&
    (!isIssuerKind || Boolean(hoBranchId)) &&
    !readOnly;
  const unsettled = useUnsettledCardSettlements(
    {
      kind: isIssuerKind
        ? CardStockSettlementDocumentKind.HO_ISSUER
        : CardStockSettlementDocumentKind.BRANCH_HO,
      issuerPartyProfileId,
      currencyId,
      hoBranchId: isIssuerKind ? hoBranchId || undefined : undefined,
    },
    canLoadUnsettled && pickerOpen
  );
  const issuerOptions = withSnapshotOption(
    references.issuers.map(item => ({
      value: item.id,
      label: `${item.code} - ${item.name}`,
    })),
    issuerPartyProfileId,
    issuerPartyProfileSnapshot
  );
  const currencyOptions = withSnapshotOption(
    references.currencies.map(item => ({
      value: item.id,
      label: `${item.currencyCode} - ${item.currencyName}`,
    })),
    currencyId,
    currencySnapshot
  );
  const hoBranchOptions = withSnapshotOption(
    (branchesQuery.data ?? [])
      .filter(branch => branch.isHeadOffice)
      .map(item => ({
        value: item.id,
        label: `${item.code} - ${item.name}`,
      })),
    hoBranchId,
    hoBranchSnapshot
  );
  const loadIssuerOptions = useMemo(() => staticLoader(issuerOptions), [issuerOptions]);
  const loadCurrencyOptions = useMemo(() => staticLoader(currencyOptions), [currencyOptions]);
  const loadHoBranchOptions = useMemo(() => staticLoader(hoBranchOptions), [hoBranchOptions]);
  const clearItems = () => form.setValue('items', [], { shouldDirty: true, shouldValidate: true });

  return (
    <div className="space-y-6">
      <CardSection heading={CARD_SETTLEMENT_TEXT.detailsHeading} className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-4">
          <div>
            <div className="mb-1 text-sm font-medium text-text-secondary">
              {CARD_SETTLEMENT_TEXT.type}
            </div>
            <div className="rounded-sm border border-border-primary bg-surface-secondary px-3 py-2 text-sm text-text-primary">
              {isHo ? CARD_SETTLEMENT_TEXT.kindIssuer : CARD_SETTLEMENT_TEXT.kindBranch}
            </div>
          </div>
          <FormFieldSelect
            name="issuerPartyProfileId"
            label={CARD_SETTLEMENT_TEXT.issuer}
            placeholder={CARD_SETTLEMENT_TEXT.selectIssuer}
            loadOptions={loadIssuerOptions}
            defaultOptions={issuerOptions}
            isLoading={references.issuersLoading}
            disabled={readOnly}
            onValueChange={clearItems}
          />
          <FormFieldSelect
            name="currencyId"
            label={CARD_SETTLEMENT_TEXT.currency}
            placeholder={CARD_SETTLEMENT_TEXT.selectCurrency}
            loadOptions={loadCurrencyOptions}
            defaultOptions={currencyOptions}
            isLoading={references.currenciesLoading}
            disabled={readOnly}
            onValueChange={clearItems}
          />
          {isIssuerKind ? (
            <FormFieldSelect
              name="hoBranchId"
              label={CARD_SETTLEMENT_TEXT.hoBranch}
              placeholder={CARD_SETTLEMENT_TEXT.selectHoBranch}
              loadOptions={loadHoBranchOptions}
              defaultOptions={hoBranchOptions}
              isLoading={branchesQuery.isLoading}
              disabled={readOnly}
              onValueChange={value => {
                clearItems();
                onHoBranchChange?.(typeof value === 'string' ? value : '');
              }}
            />
          ) : null}
          <FormFieldDatePicker
            name="transactionDate"
            label={CARD_SETTLEMENT_TEXT.transactionDate}
            dateFormat="dd/MM/yyyy"
            disabled={
              readOnly ||
              isTransactionDateLoading ||
              transactionDatePolicy?.canPunchTransactions === false
            }
            minDate={transactionDatePolicy?.minDate}
            maxDate={transactionDatePolicy?.maxDate}
          />
          <FormFieldInput
            name="transactionNumber"
            label={CARD_SETTLEMENT_TEXT.transactionNumber}
            placeholder={CARD_SETTLEMENT_TEXT.transactionNumberPlaceholder}
            readOnly
            disabled
          />
          <FormFieldInput
            name="reference"
            label={CARD_SETTLEMENT_TEXT.reference}
            valueTransform="none"
            disabled={readOnly}
          />
          <FormFieldInput
            name="remarks"
            label={CARD_SETTLEMENT_TEXT.remarks}
            valueTransform="none"
            disabled={readOnly}
          />
        </div>
      </CardSection>
      <CardSection heading={CARD_SETTLEMENT_TEXT.itemsHeading} className="space-y-4">
        {!readOnly ? (
          <Button
            type="button"
            variant="outline"
            disabled={!issuerPartyProfileId || !currencyId || (isIssuerKind && !hoBranchId)}
            onClick={() => setPickerOpen(true)}
          >
            {CARD_SETTLEMENT_TEXT.selectCards}
          </Button>
        ) : null}
        {fields.map((field, index) => {
          const item = items[index];
          return (
            <div
              key={field.id}
              className="grid gap-4 rounded-lg border border-border-secondary p-4 xl:grid-cols-6"
            >
              <FormFieldInput
                name={`items.${index}.maskedCardNumber`}
                label={CARD_SETTLEMENT_TEXT.cardNumber}
                readOnly
                disabled
              />
              <FormFieldInput
                name={`items.${index}.series`}
                label={CARD_SETTLEMENT_TEXT.series}
                readOnly
                disabled
              />
              <FormFieldInput
                name={`items.${index}.kitNumber`}
                label={CARD_SETTLEMENT_TEXT.kitNumber}
                readOnly
                disabled
              />
              <FormFieldInput
                name={`items.${index}.saleKind`}
                label={CARD_SETTLEMENT_TEXT.saleKind}
                readOnly
                disabled
              />
              <FormFieldInput
                name={`items.${index}.denomination`}
                label={CARD_SETTLEMENT_TEXT.denomination}
                readOnly
                disabled
              />
              <FormFieldInput
                name={`items.${index}.rate`}
                label={CARD_SETTLEMENT_TEXT.rate}
                valueTransform="none"
                disabled={readOnly}
                onChange={event => {
                  const rate = event.target.value;
                  form.setValue(
                    `items.${index}.amount`,
                    settlementAmountFrom(item?.denomination ?? '0', rate),
                    { shouldDirty: true, shouldValidate: true }
                  );
                }}
              />
              <FormFieldInput
                name={`items.${index}.amount`}
                label={CARD_SETTLEMENT_TEXT.amount}
                readOnly
                disabled
              />
            </div>
          );
        })}
      </CardSection>
      <CardSettlementItemPicker
        open={pickerOpen}
        items={unsettled.data ?? []}
        selectedIds={items.map(item => item.id)}
        loading={unsettled.isLoading}
        showBranch={isHo}
        onClose={() => setPickerOpen(false)}
        onApply={selected => replace(selected.map(item => toFormItem(item, kind)))}
      />
    </div>
  );
};

export default CardSettlementForm;
