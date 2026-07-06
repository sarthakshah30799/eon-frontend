import { useEffect, useMemo, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';
import { FormFieldAsyncSelect, FormFieldInput } from '@/components/forms';
import type {
  IPurchaseFormValues,
  IPurchasePricingData,
} from '../types/purchaseTypes';
import {
  calculateRoundedTransactionAmount,
  calculatePurchaseTransactionCommission,
  calculateTransactionRoundOff,
  calculateTransactionTotal,
  resolveAgentCommissionRule,
  resolvePurchaseTransactionPreview,
} from '../utils/purchaseUtils';
import { EntityPickerField } from './EntityPickerField';
import type { AsyncSelectResponse } from '@/components/ui';
import type { IPartyProfileCommissionRule } from '@/modules/partyProfiles/types';

interface PurchaseTransactionRowCellProps {
  rowIndex: number;
  pricingData: IPurchasePricingData;
  agentCommissionRules?: IPartyProfileCommissionRule[];
  onOpenCurrencyPicker: (rowIndex: number) => void;
  onRemove: (rowIndex: number) => void;
  canRemove: boolean;
  disabled?: boolean;
}

const loadProductOptions = async (
  inputValue: string,
  products: IPurchasePricingData['products']
): Promise<AsyncSelectResponse> => {
  const search = inputValue.trim().toLowerCase();

  return {
    options: products
      .filter(product => {
        if (!search) {
          return true;
        }

        return [product.productCode, product.productDescription]
          .join(' ')
          .toLowerCase()
          .includes(search);
      })
      .map(product => ({
        value: product.id,
        label: `${product.productCode} - ${product.productDescription}`,
      })),
  };
};

const rangeErrorType = 'buy-rate-range';

const formatRangeValue = (value?: string | null) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(4) : value;
};

export const PurchaseTransactionRowCell = ({
  rowIndex,
  pricingData,
  agentCommissionRules = [],
  onOpenCurrencyPicker,
  onRemove,
  canRemove,
  disabled = false,
}: PurchaseTransactionRowCellProps) => {
  const form = useFormContext<IPurchaseFormValues>();
  const currencyId = useWatch({
    control: form.control,
    name: `transactions.${rowIndex}.currencyId`,
  });
  const currencyCode = useWatch({
    control: form.control,
    name: `transactions.${rowIndex}.currencyCode`,
  });
  const currencyName = useWatch({
    control: form.control,
    name: `transactions.${rowIndex}.currencyName`,
  });
  const productId = useWatch({
    control: form.control,
    name: `transactions.${rowIndex}.productId`,
  });
  const quantity = useWatch({
    control: form.control,
    name: `transactions.${rowIndex}.quantity`,
  });
  const rateValue = useWatch({
    control: form.control,
    name: `transactions.${rowIndex}.rate`,
  });
  const finalAmountValue = useWatch({
    control: form.control,
    name: `transactions.${rowIndex}.finalAmount`,
  });

  const selectedProduct = useMemo(
    () =>
      (pricingData.products ?? []).find(
        product => product.id === String(productId || '')
      ) ?? null,
    [pricingData.products, productId]
  );

  const selectedProductCurrencyRule = useMemo(
    () =>
      (pricingData.productCurrencyRates ?? []).find(
        rule =>
          rule.currencyId === String(currencyId || '') &&
          rule.productId === String(productId || '')
      ) ?? null,
    [currencyId, pricingData.productCurrencyRates, productId]
  );

  const preview = useMemo(
    () =>
      resolvePurchaseTransactionPreview(
        pricingData,
        String(currencyId || ''),
        String(productId || '')
      ),
    [currencyId, pricingData, productId]
  );

  const effectiveGroupCode = preview?.effectiveGroupCode ?? '';
  const calculatedRate = preview?.buy.appliedFinalRate ?? '';
  const selectedCurrencyProfile = useMemo(
    () =>
      (pricingData.currencies ?? []).find(
        currency => currency.id === String(currencyId || '')
      ) ?? null,
    [currencyId, pricingData.currencies]
  );
  const agentCommissionRule = useMemo(
    () =>
      resolveAgentCommissionRule(
        agentCommissionRules,
        String(selectedCurrencyProfile?.currencyCode || ''),
        String(selectedProduct?.productCode || '')
      ),
    [agentCommissionRules, selectedProduct?.productCode, selectedCurrencyProfile?.currencyCode]
  );
  const total = useMemo(
    () => calculateTransactionTotal(String(quantity || ''), String(rateValue || '')),
    [quantity, rateValue]
  );
  const roundedTotal = useMemo(
    () => calculateRoundedTransactionAmount(total),
    [total]
  );
  const roundOffAmount = useMemo(
    () => calculateTransactionRoundOff(total),
    [total]
  );
  const commissionAmount = useMemo(
    () =>
      calculatePurchaseTransactionCommission(
        String(finalAmountValue || roundedTotal || total || ''),
        selectedCurrencyProfile?.ratePer || 1,
        agentCommissionRule
      ),
    [
      agentCommissionRule,
      finalAmountValue,
      roundedTotal,
      selectedCurrencyProfile?.ratePer,
      total,
    ]
  );
  const commissionSnapshot = useMemo(
    () =>
      agentCommissionRule
        ? {
            currencyCode: selectedCurrencyProfile?.currencyCode || '',
            productCode: selectedProduct?.productCode || '',
            commissionType: agentCommissionRule.commissionType,
            commissionValue: agentCommissionRule.commissionValue,
            ratePer: selectedCurrencyProfile?.ratePer || '1',
          }
        : null,
    [
      agentCommissionRule,
      selectedCurrencyProfile?.currencyCode,
      selectedCurrencyProfile?.ratePer,
      selectedProduct?.productCode,
    ]
  );
  const hasCurrencyProductSelection = Boolean(currencyId && productId);
  const rateHelperText = !hasCurrencyProductSelection
    ? ''
    : preview?.effectiveSource === 'product-override'
      ? 'Using product-currency override'
      : preview?.effectiveSource === 'group-default'
        ? `Using group default${effectiveGroupCode ? ` (${effectiveGroupCode})` : ''}`
        : 'No matching rate found';
  const buyMinRate = selectedProductCurrencyRule?.buy.minRate ?? '';
  const buyMaxRate = selectedProductCurrencyRule?.buy.maxRate ?? '';
  const hasBuyRange = Boolean(buyMinRate || buyMaxRate);
  const lastAutoFilledRateRef = useRef({
    selectionKey: '',
    value: '',
  });
  const selectionKey = `${currencyId || ''}:${productId || ''}`;

  useEffect(() => {
    const fieldName = `transactions.${rowIndex}.rate` as const;
    const currentRate = String(rateValue ?? '').trim();

    if (!hasCurrencyProductSelection || !calculatedRate) {
      return;
    }

    const shouldResetToCalculatedRate =
      lastAutoFilledRateRef.current.selectionKey !== selectionKey ||
      !currentRate ||
      currentRate === lastAutoFilledRateRef.current.value;

    if (!shouldResetToCalculatedRate) {
      return;
    }

    form.setValue(fieldName, calculatedRate, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    lastAutoFilledRateRef.current = {
      selectionKey,
      value: calculatedRate,
    };
  }, [
    calculatedRate,
    form,
    hasCurrencyProductSelection,
    rowIndex,
    rateValue,
    selectionKey,
  ]);

  useEffect(() => {
    form.setValue(
      `transactions.${rowIndex}.productCode`,
      selectedProduct?.productCode ?? '',
      {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      }
    );
    form.setValue(
      `transactions.${rowIndex}.productDescription`,
      selectedProduct?.productDescription ?? '',
      {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      }
    );
  }, [form, rowIndex, selectedProduct]);

  useEffect(() => {
    const fieldName = `transactions.${rowIndex}.rate` as const;
    if (!hasCurrencyProductSelection) {
      if (form.getFieldState(fieldName).error?.type === rangeErrorType) {
        form.clearErrors(fieldName);
      }
      return;
    }

    const currentRate = String(rateValue ?? '').trim();

    if (!currentRate) {
      if (form.getFieldState(fieldName).error?.type === rangeErrorType) {
        form.clearErrors(fieldName);
      }
      return;
    }

    const parsedRate = Number(currentRate);
    const parsedMinRate = buyMinRate ? Number(buyMinRate) : null;
    const parsedMaxRate = buyMaxRate ? Number(buyMaxRate) : null;

    if (!Number.isFinite(parsedRate)) {
      form.setError(fieldName, {
        type: rangeErrorType,
        message: 'Enter a valid rate',
      });
      return;
    }

    if (
      parsedMinRate !== null &&
      Number.isFinite(parsedMinRate) &&
      parsedRate < parsedMinRate
    ) {
      form.setError(fieldName, {
        type: rangeErrorType,
        message: `Buy rate cannot be lower than ${formatRangeValue(buyMinRate)}`,
      });
      return;
    }

    if (
      parsedMaxRate !== null &&
      Number.isFinite(parsedMaxRate) &&
      parsedRate > parsedMaxRate
    ) {
      form.setError(fieldName, {
        type: rangeErrorType,
        message: `Buy rate cannot be higher than ${formatRangeValue(buyMaxRate)}`,
      });
      return;
    }

    if (form.getFieldState(fieldName).error?.type === rangeErrorType) {
      form.clearErrors(fieldName);
    }
  }, [buyMaxRate, buyMinRate, form, hasCurrencyProductSelection, rowIndex, rateValue]);

  useEffect(() => {
    form.setValue(`transactions.${rowIndex}.total`, total, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [form, rowIndex, total]);

  useEffect(() => {
    form.setValue(`transactions.${rowIndex}.roundOff`, roundOffAmount, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    form.setValue(`transactions.${rowIndex}.finalAmount`, roundedTotal, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [form, rowIndex, roundedTotal, roundOffAmount]);

  useEffect(() => {
    form.setValue(`transactions.${rowIndex}.commission`, commissionAmount, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [commissionAmount, form, rowIndex]);

  useEffect(() => {
    form.setValue(
      `transactions.${rowIndex}.commissionSnapshot`,
      commissionSnapshot,
      {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      }
    );
  }, [commissionSnapshot, form, rowIndex]);

  const productLoadOptions = async (inputValue: string) =>
    loadProductOptions(inputValue, pricingData.products ?? []);

  return (
    <div className="grid gap-2 px-1 py-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,0.55fr)_minmax(0,0.75fr)_minmax(0,0.55fr)_minmax(0,0.55fr)_minmax(0,0.55fr)_minmax(0,0.55fr)_44px]">
      <div className="min-w-0">
        <EntityPickerField
          label="Currency"
          value={currencyCode ? `${currencyCode}${currencyName ? ` - ${currencyName}` : ''}` : ''}
          placeholder="Select currency"
          onClick={() => onOpenCurrencyPicker(rowIndex)}
          disabled={disabled}
          helperText={rateHelperText || undefined}
          buttonPosition="bottom"
        />
      </div>
      <div className="min-w-0">
        <FormFieldAsyncSelect
          name={`transactions.${rowIndex}.productId`}
          label="Product"
          loadOptions={productLoadOptions}
          placeholder="Select product"
          disabled={disabled}
          size="sm"
          isSearchable
          className="max-w-[220px]"
        />
      </div>
      <div className="min-w-0">
        <FormFieldInput
          name={`transactions.${rowIndex}.quantity`}
          label="Quantity"
          type="number"
          disabled={disabled}
          classes={{ container: 'max-w-[90px]' }}
        />
      </div>
      <div className="min-w-0">
        <FormFieldInput
          name={`transactions.${rowIndex}.rate`}
          label="Rate"
          type="number"
          disabled={disabled}
          classes={{ container: 'max-w-[100px]' }}
        />
        {hasCurrencyProductSelection && (
          <div className="mt-1 space-y-0.5 text-[11px] leading-tight text-text-tertiary">
            {hasBuyRange ? (
              <>
                <div>Buy min: {formatRangeValue(buyMinRate)}</div>
                <div>Buy max: {formatRangeValue(buyMaxRate)}</div>
              </>
            ) : (
              <div>No buy min/max configured for this product-currency pair.</div>
            )}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <FormFieldInput
          name={`transactions.${rowIndex}.total`}
          label="Total"
          readOnly
          classes={{ container: 'max-w-[95px]' }}
        />
      </div>
      <div className="min-w-0">
        <FormFieldInput
          name={`transactions.${rowIndex}.roundOff`}
          label="Round Off"
          readOnly
          classes={{ container: 'max-w-[95px]' }}
        />
      </div>
      <div className="min-w-0">
        <FormFieldInput
          name={`transactions.${rowIndex}.finalAmount`}
          label="Final Amount"
          readOnly
          classes={{ container: 'max-w-[95px]' }}
        />
      </div>
      <div className="min-w-0">
        <FormFieldInput
          name={`transactions.${rowIndex}.commission`}
          label="Commission"
          readOnly
          classes={{ container: 'max-w-[95px]' }}
        />
      </div>
      <div className="flex min-w-0 items-start justify-end pt-4">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          disabled={!canRemove || disabled}
          onClick={() => onRemove(rowIndex)}
          aria-label="Remove transaction row"
        >
          <TrashIcon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};

export default PurchaseTransactionRowCell;
