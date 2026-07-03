import { useEffect, useMemo, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { AsyncSelectResponse } from '@/components/ui';
import { Button } from '@/components/ui';
import { FormFieldAsyncSelect, FormFieldInput } from '@/components/forms';
import type {
  IBuyFromFormValues,
  IBuyFromPricingData,
} from '../types/buyFromTypes';
import {
  calculateTransactionTotal,
  calculateRoundedTransactionAmount,
  calculateTransactionRoundOff,
  resolveBuyFromTransactionPreview,
} from '../utils/buyFromUtils';
import { EntityPickerField } from './EntityPickerField';

interface BuyFromTransactionRowProps {
  index: number;
  rowId: string;
  pricingData: IBuyFromPricingData;
  onOpenCurrencyPicker: (rowIndex: number) => void;
  onRemove: (rowIndex: number) => void;
  canRemove: boolean;
  disabled?: boolean;
}

const loadProductOptions = async (
  inputValue: string,
  products: IBuyFromPricingData['products']
): Promise<AsyncSelectResponse> => {
  const search = inputValue.trim().toLowerCase();

  return {
    options: products
      .filter(product => {
        if (!search) {
          return true;
        }

        return [
          product.productCode,
          product.productDescription,
        ]
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

export const BuyFromTransactionRow = ({
  index,
  rowId,
  pricingData,
  onOpenCurrencyPicker,
  onRemove,
  canRemove,
  disabled = false,
}: BuyFromTransactionRowProps) => {
  const form = useFormContext<IBuyFromFormValues>();
  const currencyId = useWatch({
    control: form.control,
    name: `transactions.${index}.currencyId`,
  });
  const currencyCode = useWatch({
    control: form.control,
    name: `transactions.${index}.currencyCode`,
  });
  const currencyName = useWatch({
    control: form.control,
    name: `transactions.${index}.currencyName`,
  });
  const productId = useWatch({
    control: form.control,
    name: `transactions.${index}.productId`,
  });
  const quantity = useWatch({
    control: form.control,
    name: `transactions.${index}.quantity`,
  });
  const rateValue = useWatch({
    control: form.control,
    name: `transactions.${index}.rate`,
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
      resolveBuyFromTransactionPreview(
        pricingData,
        String(currencyId || ''),
        String(productId || '')
      ),
    [currencyId, pricingData, productId]
  );
  const effectiveGroupCode = preview?.effectiveGroupCode ?? '';

  const calculatedRate = preview?.buy.appliedFinalRate ?? '';
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
    const fieldName = `transactions.${index}.rate` as const;
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
    index,
    rateValue,
    selectionKey,
  ]);

  useEffect(() => {
    form.setValue(
      `transactions.${index}.productCode`,
      selectedProduct?.productCode ?? '',
      {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      }
    );
    form.setValue(
      `transactions.${index}.productDescription`,
      selectedProduct?.productDescription ?? '',
      {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      }
    );
  }, [form, index, selectedProduct]);

  useEffect(() => {
    const fieldName = `transactions.${index}.rate` as const;
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
  }, [buyMaxRate, buyMinRate, form, hasCurrencyProductSelection, index, rateValue]);

  useEffect(() => {
    form.setValue(`transactions.${index}.total`, total, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [form, index, total]);

  useEffect(() => {
    form.setValue(`transactions.${index}.roundOff`, roundOffAmount, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    form.setValue(`transactions.${index}.finalAmount`, roundedTotal, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [form, index, roundedTotal, roundOffAmount]);

  const productLoadOptions = async (inputValue: string) =>
    loadProductOptions(inputValue, pricingData.products ?? []);

  const rowKey = `${rowId}-${index}`;

  return (
    <tr key={rowKey} className="border-b border-border-secondary align-top">
      <td className="min-w-[260px] px-3 py-3">
        <EntityPickerField
          label="Currency"
          value={currencyCode ? `${currencyCode}${currencyName ? ` - ${currencyName}` : ''}` : ''}
          placeholder="Select currency"
          onClick={() => onOpenCurrencyPicker(index)}
          disabled={disabled}
          helperText={rateHelperText || undefined}
        />
      </td>
      <td className="min-w-[260px] px-3 py-3">
        <FormFieldAsyncSelect
          name={`transactions.${index}.productId`}
          label="Product"
          loadOptions={productLoadOptions}
          placeholder="Select product"
          disabled={disabled}
          size="sm"
          isSearchable
        />
      </td>
      <td className="min-w-[140px] px-3 py-3">
        <FormFieldInput
          name={`transactions.${index}.quantity`}
          label="Quantity"
          type="number"
          disabled={disabled}
        />
      </td>
      <td className="min-w-[160px] px-3 py-3">
        <FormFieldInput
          name={`transactions.${index}.rate`}
          label="Rate"
          type="number"
          disabled={disabled}
        />
        {hasCurrencyProductSelection && (
          <div className="mt-1 space-y-1 text-xs text-text-tertiary">
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
      </td>
      <td className="min-w-[160px] px-3 py-3">
        <FormFieldInput
          name={`transactions.${index}.total`}
          label="Total"
          readOnly
        />
      </td>
      <td className="min-w-[160px] px-3 py-3">
        <FormFieldInput
          name={`transactions.${index}.roundOff`}
          label="Round Off"
          readOnly
        />
      </td>
      <td className="min-w-[160px] px-3 py-3">
        <FormFieldInput
          name={`transactions.${index}.finalAmount`}
          label="Final Amount"
          readOnly
        />
      </td>
      <td className="w-[84px] px-3 py-3">
        <div className="flex h-full items-start justify-end pt-7">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            disabled={!canRemove || disabled}
            onClick={() => onRemove(index)}
            aria-label="Remove transaction row"
          >
            <TrashIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default BuyFromTransactionRow;
