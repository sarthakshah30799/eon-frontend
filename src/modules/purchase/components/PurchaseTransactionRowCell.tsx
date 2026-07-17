import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';
import { FormFieldAsyncSelect, FormFieldInput } from '@/components/forms';
import { TransactionTypeEnum } from '@/modules/transactions';
import type {
  IPurchaseFormValues,
  IPurchasePricingData,
} from '../types/purchaseTypes';
import {
  PURCHASE_RATE_DECIMALS,
  calculateRoundedTransactionAmount,
  calculatePurchaseTransactionCommission,
  calculateTransactionRoundOff,
  calculateTransactionTotal,
  formatPurchaseDecimal,
  getPurchaseTransactionPricingSide,
  getPurchaseTransactionPricingSideLabel,
  resolveAgentCommissionRule,
  resolvePurchaseTransactionPreview,
} from '../utils/purchaseUtils';
import { EntityPickerField } from './EntityPickerField';
import type { AsyncSelectResponse } from '@/components/ui';
import type { IPartyProfileCommissionRule } from '@/modules/partyProfiles/types';
import { usePurchaseQuantityAvailability } from '../hooks';

interface PurchaseTransactionRowCellProps {
  rowIndex: number;
  branchId?: string;
  excludeTransactionId?: string;
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
  return Number.isFinite(numericValue)
    ? numericValue.toFixed(PURCHASE_RATE_DECIMALS)
    : value;
};

const normalizeValue = (value: unknown) => String(value ?? '').trim();

export const PurchaseTransactionRowCell = ({
  rowIndex,
  branchId = '',
  excludeTransactionId,
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
  const transactionType = useWatch({
    control: form.control,
    name: 'transactionType',
  });
  const quantity = useWatch({
    control: form.control,
    name: `transactions.${rowIndex}.quantity`,
  });
  const perValue = useWatch({
    control: form.control,
    name: `transactions.${rowIndex}.per`,
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
  const pricingSide = getPurchaseTransactionPricingSide(transactionType);
  const pricingSideLabel =
    getPurchaseTransactionPricingSideLabel(transactionType);

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
  const selectedSidePreview =
    pricingSide === 'sale' ? (preview?.sale ?? null) : (preview?.buy ?? null);
  const calculatedRate = selectedSidePreview?.appliedFinalRate ?? '';
  const selectedCurrencyProfile = useMemo(
    () =>
      (pricingData.currencies ?? []).find(
        currency => currency.id === String(currencyId || '')
      ) ?? null,
    [currencyId, pricingData.currencies]
  );
  const quantityAvailabilityQuery = usePurchaseQuantityAvailability({
    branchId,
    currencyId: String(currencyId || ''),
    productId: String(productId || ''),
    excludeTransactionId,
    enabled: Boolean(branchId && currencyId && productId),
  });
  const quantityAvailability = quantityAvailabilityQuery.data ?? null;
  const agentCommissionRule = useMemo(
    () =>
      resolveAgentCommissionRule(
        agentCommissionRules,
        String(selectedCurrencyProfile?.currencyCode || ''),
        String(selectedProduct?.productCode || '')
      ),
    [
      agentCommissionRules,
      selectedProduct?.productCode,
      selectedCurrencyProfile?.currencyCode,
    ]
  );
  const total = useMemo(
    () =>
      calculateTransactionTotal(
        String(quantity || ''),
        String(rateValue || ''),
        selectedCurrencyProfile?.ratePer || 1
      ),
    [quantity, rateValue, selectedCurrencyProfile?.ratePer]
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
        String(quantity || ''),
        selectedCurrencyProfile?.ratePer || 1,
        agentCommissionRule
      ),
    [
      agentCommissionRule,
      finalAmountValue,
      roundedTotal,
      selectedCurrencyProfile?.ratePer,
      quantity,
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
  const selectedSideCurrencyRule =
    selectedProductCurrencyRule?.[pricingSide] ?? null;
  const sideMinRate = selectedSideCurrencyRule?.minRate ?? '';
  const sideMaxRate = selectedSideCurrencyRule?.maxRate ?? '';
  const hasSideRange = Boolean(sideMinRate || sideMaxRate);
  const availabilityErrorType = 'available-quantity-exceeded';
  const lastAutoFilledRateRef = useRef({
    selectionKey: '',
    value: '',
  });
  const hasManualRateChangeRef = useRef(false);
  const selectionKey = `${currencyId || ''}:${productId || ''}`;

  useEffect(() => {
    hasManualRateChangeRef.current = false;
  }, [selectionKey]);

  useEffect(() => {
    const fieldName = `transactions.${rowIndex}.rate` as const;
    const currentRate = String(rateValue ?? '').trim();

    if (!hasCurrencyProductSelection || !calculatedRate) {
      return;
    }

    if (!currentRate && hasManualRateChangeRef.current) {
      return;
    }

    const shouldResetToCalculatedRate =
      lastAutoFilledRateRef.current.selectionKey !== selectionKey ||
      !currentRate ||
      currentRate === lastAutoFilledRateRef.current.value;

    if (!shouldResetToCalculatedRate || currentRate === calculatedRate) {
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
    const fieldName = `transactions.${rowIndex}.per` as const;
    const nextPer = String(selectedCurrencyProfile?.ratePer ?? '').trim();
    const currentPer = normalizeValue(perValue);

    if (currentPer !== nextPer) {
      form.setValue(fieldName, nextPer, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [form, perValue, rowIndex, selectedCurrencyProfile?.ratePer]);

  useEffect(() => {
    const nextProductCode = selectedProduct?.productCode ?? '';
    const nextProductDescription = selectedProduct?.productDescription ?? '';
    const currentProductCode = normalizeValue(
      form.getValues(`transactions.${rowIndex}.productCode`)
    );
    const currentProductDescription = normalizeValue(
      form.getValues(`transactions.${rowIndex}.productDescription`)
    );

    if (currentProductCode !== nextProductCode) {
      form.setValue(`transactions.${rowIndex}.productCode`, nextProductCode, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }

    if (currentProductDescription !== nextProductDescription) {
      form.setValue(
        `transactions.${rowIndex}.productDescription`,
        nextProductDescription,
        {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        }
      );
    }
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
    const parsedMinRate = sideMinRate ? Number(sideMinRate) : null;
    const parsedMaxRate = sideMaxRate ? Number(sideMaxRate) : null;

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
        message: `${pricingSideLabel} rate cannot be lower than ${formatRangeValue(sideMinRate)}`,
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
        message: `${pricingSideLabel} rate cannot be higher than ${formatRangeValue(sideMaxRate)}`,
      });
      return;
    }

    if (form.getFieldState(fieldName).error?.type === rangeErrorType) {
      form.clearErrors(fieldName);
    }
  }, [
    form,
    hasCurrencyProductSelection,
    pricingSideLabel,
    rowIndex,
    rateValue,
    sideMaxRate,
    sideMinRate,
  ]);

  useEffect(() => {
    const fieldName = `transactions.${rowIndex}.quantity` as const;
    const currentQuantity = Number(String(quantity ?? '').trim() || 0);
    const availableQuantity = Number(
      String(quantityAvailability?.availableQuantity ?? '').trim() || 0
    );

    if (
      !hasCurrencyProductSelection ||
      transactionType !== TransactionTypeEnum.SALE
    ) {
      if (form.getFieldState(fieldName).error?.type === availabilityErrorType) {
        form.clearErrors(fieldName);
      }
      return;
    }

    if (!Number.isFinite(currentQuantity) || currentQuantity <= 0) {
      if (form.getFieldState(fieldName).error?.type === availabilityErrorType) {
        form.clearErrors(fieldName);
      }
      return;
    }

    if (
      Number.isFinite(availableQuantity) &&
      currentQuantity > availableQuantity
    ) {
      form.setError(fieldName, {
        type: availabilityErrorType,
        message: `Quantity cannot exceed available stock of ${formatPurchaseDecimal(availableQuantity, PURCHASE_RATE_DECIMALS)}`,
      });
      return;
    }

    if (form.getFieldState(fieldName).error?.type === availabilityErrorType) {
      form.clearErrors(fieldName);
    }
  }, [
    form,
    hasCurrencyProductSelection,
    quantity,
    quantityAvailability?.availableQuantity,
    rowIndex,
    transactionType,
  ]);

  useEffect(() => {
    const fieldName = `transactions.${rowIndex}.total` as const;
    const currentTotal = normalizeValue(form.getValues(fieldName));

    if (currentTotal !== total) {
      form.setValue(fieldName, total, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [form, rowIndex, total]);

  useEffect(() => {
    const roundOffField = `transactions.${rowIndex}.roundOff` as const;
    const finalAmountField = `transactions.${rowIndex}.finalAmount` as const;
    const currentRoundOff = normalizeValue(form.getValues(roundOffField));
    const currentFinalAmount = normalizeValue(form.getValues(finalAmountField));

    if (currentRoundOff !== roundOffAmount) {
      form.setValue(roundOffField, roundOffAmount, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }

    if (currentFinalAmount !== roundedTotal) {
      form.setValue(finalAmountField, roundedTotal, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [form, rowIndex, roundedTotal, roundOffAmount]);

  useEffect(() => {
    const fieldName = `transactions.${rowIndex}.commission` as const;
    const currentCommission = normalizeValue(form.getValues(fieldName));
    const nextCommission = commissionAmount || '';

    if (currentCommission !== nextCommission) {
      form.setValue(fieldName, nextCommission, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [commissionAmount, form, rowIndex]);

  useEffect(() => {
    const fieldName = `transactions.${rowIndex}.commissionSnapshot` as const;
    const currentSnapshot = form.getValues(fieldName);
    const nextSnapshot = commissionSnapshot;
    if (JSON.stringify(currentSnapshot) !== JSON.stringify(nextSnapshot)) {
      form.setValue(fieldName, nextSnapshot, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [commissionSnapshot, form, rowIndex]);

  const productLoadOptions = useCallback(
    (inputValue: string) =>
      loadProductOptions(
        inputValue,
        (pricingData.products ?? []).filter(product =>
          pricingSide === 'sale'
            ? product.availableInBulkSelling !== false
            : product.availableInBulkBuying !== false
        )
      ),
    [pricingData.products, pricingSide]
  );

  return (
    <div className="flex flex-col items-start gap-2 border-b border-border-base px-1 py-1 last:border-b-0">
      {hasCurrencyProductSelection ? (
        <div className="flex w-full space-y-0.5 space-x-2 break-words text-[10px] leading-snug text-text-tertiary">
          {quantityAvailabilityQuery.isLoading ? (
            <div>Checking available quantity...</div>
          ) : (
            <>
              <div>
                <b>Available:{' '}</b>
                {formatPurchaseDecimal(
                  quantityAvailability?.availableQuantity,
                  PURCHASE_RATE_DECIMALS
                )}
              </div>
              <div>
                <b>Purchased:{' '}</b>
                {formatPurchaseDecimal(
                  quantityAvailability?.purchasedQuantity,
                  PURCHASE_RATE_DECIMALS
                )}
              </div>
              <div>
                <b>Sold:{' '}</b>
                {formatPurchaseDecimal(
                  quantityAvailability?.soldQuantity,
                  PURCHASE_RATE_DECIMALS
                )}
              </div>
            </>
          )}
        </div>
      ) : null}
      <div className="grid gap-2 px-1 py-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,0.55fr)_minmax(0,0.65fr)_minmax(0,0.75fr)_minmax(0,0.55fr)_minmax(0,0.55fr)_minmax(0,0.55fr)_minmax(0,0.55fr)_44px]">
        <div className="min-w-0">
          <EntityPickerField
            label="Currency"
            value={
              currencyCode
                ? `${currencyCode}${currencyName ? ` - ${currencyName}` : ''}`
                : ''
            }
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
        <div className="relative min-w-0 pb-14">
          <FormFieldInput
            name={`transactions.${rowIndex}.quantity`}
            label="Quantity"
            type="number"
            inputMode="decimal"
            step={`0.${'0'.repeat(PURCHASE_RATE_DECIMALS - 1)}1`}
            maxDecimalPlaces={PURCHASE_RATE_DECIMALS}
            disabled={disabled}
            classes={{ container: 'max-w-[90px]' }}
          />
        </div>
        <div className="relative min-w-0 pb-14">
          <FormFieldInput
            name={`transactions.${rowIndex}.rate`}
            label="Rate"
            type="number"
            step={`0.${'0'.repeat(PURCHASE_RATE_DECIMALS - 1)}1`}
            maxDecimalPlaces={PURCHASE_RATE_DECIMALS}
            disabled={disabled}
            onChange={() => {
              hasManualRateChangeRef.current = true;
            }}
            classes={{ container: 'max-w-[100px]' }}
          />
          {hasCurrencyProductSelection && (
            <div className="mt-1 space-y-0.5 text-[11px] leading-tight text-text-tertiary">
              {selectedSidePreview?.baseRate ? (
                <div>
                  Base {pricingSideLabel.toLowerCase()} rate:{' '}
                  {formatRangeValue(selectedSidePreview.baseRate)}
                </div>
              ) : null}
              {hasSideRange ? (
                <>
                  <div>
                    {pricingSideLabel} min: {formatRangeValue(sideMinRate)}
                  </div>
                  <div>
                    {pricingSideLabel} max: {formatRangeValue(sideMaxRate)}
                  </div>
                </>
              ) : (
                <div>
                  No {pricingSideLabel.toLowerCase()} min/max configured for
                  this product-currency pair.
                </div>
              )}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <FormFieldInput
            name={`transactions.${rowIndex}.per`}
            label="Per"
            readOnly
            classes={{ container: 'max-w-[95px]' }}
          />
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
    </div>
  );
};

export default PurchaseTransactionRowCell;
