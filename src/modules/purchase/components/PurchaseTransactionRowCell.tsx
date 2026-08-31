import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch, type FieldPath } from 'react-hook-form';
import {
  FormFieldAsyncSelect,
  FormFieldInput,
  FormFieldCheckbox,
} from '@/components/forms';
import { TransactionTypeEnum } from '@/modules/transactions';
import type {
  IPurchaseFormValues,
  IPurchasePricingData,
} from '../types/purchaseTypes';
import type { ITransactionReferenceSnapshot } from '@/modules/transactions';
import {
  PURCHASE_RATE_DECIMALS,
  calculateRoundedTransactionAmount,
  calculatePurchaseTransactionCommission,
  calculateTransactionRoundOff,
  calculateTransactionTotal,
  formatPurchaseDecimal,
  getPurchaseTransactionPricingSide,
  getPurchaseTransactionPricingSideLabel,
  isCardProductCode,
  isMultiCurrencyCardProduct,
  PURCHASE_TRANSACTION_TEXT,
  resolveAgentCommissionRule,
  resolvePurchaseTransactionPreview,
} from '../utils/purchaseUtils';
import { EntityPickerField } from './EntityPickerField';
import type { AsyncSelectResponse } from '@/components/ui';
import type { IPartyProfileCommissionRule } from '@/modules/partyProfiles/types';
import { usePurchaseQuantityAvailability } from '../hooks';
import { TransactionItemRowShell } from '@/components/forms/TransactionItemsFieldArray/TransactionItemRowShell';
import { useAverageSellPrice } from '@/modules/transactions/hooks/useAverageSellPrice';
import { useCounterHoldCost } from '@/modules/transactions/hooks/useCounterHoldCost';
import { SelectPartyProfiles } from '@/modules/partyProfiles/components';
import {
  PartyProfileTypeEnum,
  type IPartyProfile,
} from '@/modules/partyProfiles/types';
import { SelectCardStockCards } from '@/modules/cardStock/components/SelectCardStockCards';
import type { CardStockSelectableCard } from '@/api/cardStock';

interface PurchaseTransactionRowCellProps {
  rowIndex: number;
  fieldPrefix?: string;
  branchId?: string;
  counterId?: string;
  passengerId?: string;
  excludeTransactionId?: string;
  pricingData: IPurchasePricingData;
  agentCommissionRules?: IPartyProfileCommissionRule[];
  onOpenCurrencyPicker: (rowIndex: number) => void;
  onRemove: (rowIndex: number) => void;
  canRemove: boolean;
  disabled?: boolean;
  rateEditable?: boolean;
  useAverageSellRate?: boolean;
  useCounterHoldCostRate?: boolean;
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
  fieldPrefix = 'transactions',
  branchId = '',
  counterId = '',
  passengerId = '',
  excludeTransactionId,
  pricingData,
  agentCommissionRules = [],
  onOpenCurrencyPicker,
  onRemove,
  canRemove,
  disabled = false,
  rateEditable = true,
  useAverageSellRate = false,
  useCounterHoldCostRate = false,
}: PurchaseTransactionRowCellProps) => {
  const form = useFormContext<IPurchaseFormValues>();
  const [issuerPickerOpen, setIssuerPickerOpen] = useState(false);
  const [cardPickerOpen, setCardPickerOpen] = useState(false);
  const fieldPath = useMemo(
    () => (fieldName: string) =>
      `${fieldPrefix}.${rowIndex}.${fieldName}` as FieldPath<IPurchaseFormValues>,
    [fieldPrefix, rowIndex]
  );
  const currencyId = useWatch({
    control: form.control,
    name: fieldPath('currencyId'),
  });
  const currencyCode = useWatch({
    control: form.control,
    name: fieldPath('currencyCode'),
  });
  const productId = useWatch({
    control: form.control,
    name: fieldPath('productId'),
  });
  const transactionType = useWatch({
    control: form.control,
    name: 'transactionType',
  });
  const quantity = useWatch({
    control: form.control,
    name: fieldPath('quantity'),
  });
  const perValue = useWatch({
    control: form.control,
    name: fieldPath('per'),
  });
  const rateValue = useWatch({
    control: form.control,
    name: fieldPath('rate'),
  });
  const finalAmountValue = useWatch({
    control: form.control,
    name: fieldPath('finalAmount'),
  });
  const issuerPartyProfileId = useWatch({
    control: form.control,
    name: fieldPath('issuerPartyProfileId'),
  });
  const cardId = useWatch({ control: form.control, name: fieldPath('cardId') });
  const issuerSnapshot = useWatch({
    control: form.control,
    name: fieldPath('issuerPartyProfileSnapshot'),
  }) as ITransactionReferenceSnapshot | null;
  const cardSnapshot = useWatch({
    control: form.control,
    name: fieldPath('cardSnapshot'),
  }) as ITransactionReferenceSnapshot | null;
  const isReload = useWatch({
    control: form.control,
    name: fieldPath('isReload'),
  });
  const pricingRuleSnapshot = useWatch({
    control: form.control,
    name: fieldPath('pricingRuleSnapshot'),
  }) as Record<string, unknown> | null;

  const selectedProduct = useMemo(
    () =>
      (pricingData.products ?? []).find(
        product => product.id === String(productId || '')
      ) ?? null,
    [pricingData.products, productId]
  );
  const isCardProduct = isCardProductCode(selectedProduct?.productCode);
  const isMultiCurrencyCard = isMultiCurrencyCardProduct(
    selectedProduct?.productCode
  );
  const isSaleCardProduct =
    isCardProduct && transactionType === TransactionTypeEnum.SALE;

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
  const averageSellRateQuery = useAverageSellPrice({
    productId: String(productId || ''),
    currencyId: String(currencyId || ''),
    enabled: useAverageSellRate,
  });
  const counterHoldCostQuery = useCounterHoldCost({
    branchId,
    counterId,
    currencyId: String(currencyId || ''),
    enabled: useCounterHoldCostRate,
  });
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
  const selectedCurrencyProfile = useMemo(
    () =>
      (pricingData.currencies ?? []).find(
        currency => currency.id === String(currencyId || '')
      ) ?? null,
    [currencyId, pricingData.currencies]
  );
  const calculatedRate = useCounterHoldCostRate
    ? counterHoldCostQuery.data?.holdCostRate &&
      selectedCurrencyProfile?.ratePer
      ? (
          Number(counterHoldCostQuery.data.holdCostRate) *
          Number(selectedCurrencyProfile.ratePer)
        ).toFixed(PURCHASE_RATE_DECIMALS)
      : ''
    : useAverageSellRate
      ? averageSellRateQuery.data?.averageSellRate ||
        selectedSidePreview?.appliedFinalRate ||
        ''
      : (selectedSidePreview?.appliedFinalRate ?? '');
  const quantityAvailabilityQuery = usePurchaseQuantityAvailability({
    branchId,
    counterId,
    currencyId: String(currencyId || ''),
    productId: String(productId || ''),
    excludeTransactionId,
    enabled: Boolean(
      branchId && counterId && currencyId && productId && !isSaleCardProduct
    ),
    queryKeyPrefix: 'transaction-quantity-availability',
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
  const cardSelectionContextKey = isMultiCurrencyCard
    ? `${branchId}:${passengerId}:${productId || ''}:${issuerPartyProfileId || ''}`
    : `${branchId}:${passengerId}:${currencyId || ''}:${productId || ''}:${issuerPartyProfileId || ''}`;
  const previousCardSelectionContextRef = useRef(cardSelectionContextKey);

  useEffect(() => {
    if (previousCardSelectionContextRef.current === cardSelectionContextKey)
      return;
    previousCardSelectionContextRef.current = cardSelectionContextKey;
    if (!cardId) return;
    form.setValue(fieldPath('cardId'), '', {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(fieldPath('cardSnapshot'), null, { shouldDirty: true });
  }, [cardId, cardSelectionContextKey, fieldPath, form]);

  useEffect(() => {
    if (disabled || !preview || !currencyId || !productId) return;
    if (
      pricingRuleSnapshot?.currencyId === currencyId &&
      pricingRuleSnapshot?.productId === productId
    )
      return;
    form.setValue(
      fieldPath('pricingRuleSnapshot'),
      { ...preview, currencyId, productId },
      {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      }
    );
  }, [
    currencyId,
    disabled,
    fieldPath,
    form,
    pricingRuleSnapshot,
    preview,
    productId,
  ]);

  useEffect(() => {
    hasManualRateChangeRef.current = false;
  }, [selectionKey]);

  useEffect(() => {
    const fieldName = fieldPath('rate');
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
    fieldPath,
    rowIndex,
    rateValue,
    selectionKey,
  ]);

  useEffect(() => {
    const fieldName = fieldPath('per');
    const nextPer = String(selectedCurrencyProfile?.ratePer ?? '').trim();
    const currentPer = normalizeValue(perValue);

    if (currentPer !== nextPer) {
      form.setValue(fieldName, nextPer, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [fieldPath, form, perValue, rowIndex, selectedCurrencyProfile?.ratePer]);

  useEffect(() => {
    const nextProductCode = selectedProduct?.productCode ?? '';
    const nextProductDescription = selectedProduct?.productDescription ?? '';
    const currentProductCode = normalizeValue(
      form.getValues(fieldPath('productCode'))
    );
    const currentProductDescription = normalizeValue(
      form.getValues(fieldPath('productDescription'))
    );

    if (currentProductCode !== nextProductCode) {
      form.setValue(fieldPath('productCode'), nextProductCode, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }

    if (currentProductDescription !== nextProductDescription) {
      form.setValue(fieldPath('productDescription'), nextProductDescription, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [fieldPath, form, rowIndex, selectedProduct]);

  useEffect(() => {
    const fieldName = fieldPath('rate');
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
    fieldPath,
    rowIndex,
    rateValue,
    sideMaxRate,
    sideMinRate,
  ]);

  useEffect(() => {
    const fieldName = fieldPath('quantity');
    const currentQuantity = Number(String(quantity ?? '').trim() || 0);
    const availableQuantity = Number(
      String(quantityAvailability?.availableQuantity ?? '').trim() || 0
    );
    const quantityFieldState = form.getFieldState(fieldName);

    if (
      !hasCurrencyProductSelection ||
      transactionType !== TransactionTypeEnum.SALE ||
      isSaleCardProduct
    ) {
      if (quantityFieldState.error?.type === availabilityErrorType) {
        form.clearErrors(fieldName);
      }
      return;
    }

    if (!quantityFieldState.isDirty) {
      if (quantityFieldState.error?.type === availabilityErrorType) {
        form.clearErrors(fieldName);
      }
      return;
    }

    if (!Number.isFinite(currentQuantity) || currentQuantity <= 0) {
      if (quantityFieldState.error?.type === availabilityErrorType) {
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

    if (quantityFieldState.error?.type === availabilityErrorType) {
      form.clearErrors(fieldName);
    }
  }, [
    form,
    hasCurrencyProductSelection,
    fieldPath,
    isSaleCardProduct,
    quantity,
    quantityAvailability?.availableQuantity,
    rowIndex,
    transactionType,
  ]);

  useEffect(() => {
    const fieldName = fieldPath('total');
    const currentTotal = normalizeValue(form.getValues(fieldName));

    if (currentTotal !== total) {
      form.setValue(fieldName, total, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [fieldPath, form, rowIndex, total]);

  useEffect(() => {
    const roundOffField = fieldPath('roundOff');
    const finalAmountField = fieldPath('finalAmount');
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
  }, [fieldPath, form, rowIndex, roundedTotal, roundOffAmount]);

  useEffect(() => {
    const fieldName = fieldPath('commission');
    const currentCommission = normalizeValue(form.getValues(fieldName));
    const nextCommission = commissionAmount || '';

    if (currentCommission !== nextCommission) {
      form.setValue(fieldName, nextCommission, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [commissionAmount, fieldPath, form, rowIndex]);

  useEffect(() => {
    const fieldName = fieldPath('commissionSnapshot');
    const currentSnapshot = form.getValues(fieldName);
    const nextSnapshot = commissionSnapshot;
    if (JSON.stringify(currentSnapshot) !== JSON.stringify(nextSnapshot)) {
      form.setValue(fieldName, nextSnapshot, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [commissionSnapshot, fieldPath, form, rowIndex]);

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
    <TransactionItemRowShell
      title={`Transaction Item ${rowIndex + 1}`}
      availabilityText={
        hasCurrencyProductSelection && !isSaleCardProduct ? (
          quantityAvailabilityQuery.isLoading ? (
            'Checking available quantity...'
          ) : (
            <>
              <b>Available:</b>{' '}
              {formatPurchaseDecimal(
                quantityAvailability?.availableQuantity,
                PURCHASE_RATE_DECIMALS
              )}{' '}
              <b>Purchased:</b>{' '}
              {formatPurchaseDecimal(
                quantityAvailability?.purchasedQuantity,
                PURCHASE_RATE_DECIMALS
              )}{' '}
              <b>Sold:</b>{' '}
              {formatPurchaseDecimal(
                quantityAvailability?.soldQuantity,
                PURCHASE_RATE_DECIMALS
              )}
            </>
          )
        ) : null
      }
      canRemove={canRemove}
      disabled={disabled}
      onRemove={() => onRemove(rowIndex)}
    >
      <div className="flex flex-wrap gap-2 px-1 py-1 lg:flex-nowrap">
        <div
          className={`min-w-0 basis-[46%] sm:basis-[31%] md:basis-[18%] lg:basis-0 lg:flex-1 ${currencyCode ? 'lg:max-w-[60px]' : ''}`}
        >
          <EntityPickerField
            label="Currency"
            value={currencyCode ? `${currencyCode}` : ''}
            placeholder="Select currency"
            onClick={() => onOpenCurrencyPicker(rowIndex)}
            disabled={disabled}
            helperText={rateHelperText || undefined}
            buttonPosition="bottom"
          />
        </div>
        {isCardProduct ? (
          <div className="min-w-0 basis-[46%] sm:basis-[31%] md:basis-[18%] lg:basis-0 lg:flex-1">
            <EntityPickerField
              label="Issuer"
              value={String(issuerSnapshot?.name ?? issuerSnapshot?.code ?? '')}
              placeholder="Select issuer"
              disabled={disabled}
              onClick={() => setIssuerPickerOpen(true)}
              buttonPosition="bottom"
            />
          </div>
        ) : null}
        <div
          className={`min-w-0 basis-[46%] sm:basis-[31%] md:basis-[22%] lg:basis-0 lg:flex-1 ${productId ? 'lg:max-w-[130px]' : 'lg:max-w-[200px]'}`}
        >
          <FormFieldAsyncSelect
            name={fieldPath('productId')}
            label="Product"
            loadOptions={productLoadOptions}
            placeholder="Select product"
            disabled={disabled}
            size="sm"
            isSearchable
            className="w-full"
            displayValue="code"
          />
        </div>
        <div className="relative min-w-0 basis-[46%] sm:basis-[31%] md:basis-[18%] lg:basis-auto lg:flex-none lg:w-[82px] lg:min-w-[82px] lg:max-w-[82px]">
          <FormFieldInput
            name={fieldPath('quantity')}
            label={
              isSaleCardProduct
                ? PURCHASE_TRANSACTION_TEXT.feAmountLabel
                : isCardProduct
                  ? PURCHASE_TRANSACTION_TEXT.denominationLabel
                  : PURCHASE_TRANSACTION_TEXT.quantityLabel
            }
            type="number"
            inputMode="decimal"
            step={`0.${'0'.repeat(PURCHASE_RATE_DECIMALS - 1)}1`}
            maxDecimalPlaces={PURCHASE_RATE_DECIMALS}
            disabled={disabled}
            classes={{ container: 'w-full' }}
          />
        </div>
        {isCardProduct ? (
          <div className="min-w-0 basis-full sm:basis-[48%] md:basis-[22%] lg:basis-0 lg:flex-1 lg:min-w-0 lg:max-w-[120px] xl:max-w-[145px] min-[1464px]:max-w-[170px]">
            <EntityPickerField
              label="CARD"
              value={String(
                cardSnapshot?.maskedCardNumber ?? cardSnapshot?.series ?? ''
              )}
              placeholder="Select card"
              disabled={disabled || !issuerPartyProfileId}
              onClick={() => setCardPickerOpen(true)}
              buttonPosition="bottom"
            />
          </div>
        ) : null}
        <div className="relative min-w-[160px] basis-full sm:basis-[48%] md:basis-[30%] lg:basis-0 lg:flex-1 lg:min-w-0">
          <FormFieldInput
            name={fieldPath('rate')}
            label="Rate"
            type="number"
            step={`0.${'0'.repeat(PURCHASE_RATE_DECIMALS - 1)}1`}
            maxDecimalPlaces={PURCHASE_RATE_DECIMALS}
            disabled={disabled || !rateEditable}
            onChange={() => {
              hasManualRateChangeRef.current = true;
            }}
            classes={{ container: 'w-full' }}
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
        <div className="min-w-0 basis-[46%] sm:basis-[22%] md:basis-[14%] lg:basis-auto lg:flex-none lg:w-[40px] lg:min-w-[40px] lg:max-w-[40px]">
          <FormFieldInput
            name={fieldPath('per')}
            label="Per"
            readOnly
            classes={{ container: 'w-full' }}
          />
        </div>
        <div className="min-w-[160px] basis-full sm:basis-[48%] md:basis-[30%] lg:basis-0 lg:flex-1 lg:min-w-0">
          <FormFieldInput
            name={fieldPath('total')}
            label="Total"
            readOnly
            classes={{ container: 'w-full' }}
          />
        </div>
        <div className="min-w-0 basis-[46%] sm:basis-[22%] md:basis-[14%] lg:basis-auto lg:flex-none lg:w-[55px] lg:min-w-[55px] lg:max-w-[55px]">
          <FormFieldInput
            name={fieldPath('roundOff')}
            label="Round Off"
            readOnly
            classes={{ container: 'w-full' }}
          />
        </div>
        <div className="min-w-[160px] basis-full sm:basis-[48%] md:basis-[30%] lg:basis-0 lg:flex-1 lg:min-w-0">
          <FormFieldInput
            name={fieldPath('finalAmount')}
            label="Final Amount"
            readOnly
            classes={{ container: 'w-full' }}
          />
        </div>
        <div className="min-w-0 basis-[46%] sm:basis-[31%] md:basis-[18%] lg:basis-auto lg:flex-none lg:w-[80px] lg:min-w-[80px] lg:max-w-[80px]">
          <FormFieldInput
            name={fieldPath('commission')}
            label="Commission"
            readOnly
            classes={{ container: 'w-full' }}
          />
        </div>
      </div>
      {isCardProduct ? (
        <div className="mt-2 flex items-center gap-4 px-1">
          <FormFieldCheckbox
            name={fieldPath('isReload')}
            label="Reload"
            disabled={disabled}
            onChange={() => {
              form.setValue(fieldPath('cardId'), '', {
                shouldDirty: true,
                shouldValidate: true,
              });
              form.setValue(fieldPath('cardSnapshot'), null, {
                shouldDirty: true,
              });
              setCardPickerOpen(false);
            }}
          />
          <span className="text-xs text-text-tertiary">
            {isSaleCardProduct
              ? PURCHASE_TRANSACTION_TEXT.cardSaleHint
              : PURCHASE_TRANSACTION_TEXT.cardPurchaseHint}
          </span>
        </div>
      ) : null}
      <SelectPartyProfiles
        open={issuerPickerOpen}
        types={PartyProfileTypeEnum.CARD_ISSUER_PROFILE}
        allowedProfileIds={selectedProduct?.cardIssuerProfileIds}
        selectable
        multiple={false}
        title="Select CARD issuer"
        description="Select an approved active CARD issuer linked to this CARD product."
        onClose={() => setIssuerPickerOpen(false)}
        onContinue={(profiles: IPartyProfile[]) => {
          const profile = profiles[0];
          if (!profile) return;
          form.setValue(fieldPath('issuerPartyProfileId'), profile.id, {
            shouldDirty: true,
            shouldValidate: true,
          });
          form.setValue(
            fieldPath('issuerPartyProfileSnapshot'),
            { id: profile.id, code: profile.code, name: profile.name },
            { shouldDirty: true }
          );
          form.setValue(fieldPath('cardId'), '', {
            shouldDirty: true,
            shouldValidate: true,
          });
          form.setValue(fieldPath('cardSnapshot'), null, { shouldDirty: true });
          setCardPickerOpen(false);
          setIssuerPickerOpen(false);
        }}
      />
      <SelectCardStockCards
        open={cardPickerOpen}
        reload={Boolean(isReload)}
        multiCurrency={isMultiCurrencyCard}
        branchId={branchId}
        passengerId={passengerId}
        currencyId={String(currencyId || '')}
        productId={String(productId || '')}
        issuerPartyProfileId={String(issuerPartyProfileId || '')}
        onClose={() => setCardPickerOpen(false)}
        onContinue={(card: CardStockSelectableCard) => {
          form.setValue(fieldPath('cardId'), card.id, {
            shouldDirty: true,
            shouldValidate: true,
          });
          form.setValue(
            fieldPath('cardSnapshot'),
            {
              id: card.id,
              series: card.series,
              kitNumber: card.kitNumber,
              maskedCardNumber: card.maskedCardNumber,
              denomination: card.denomination,
              amount: card.amount,
              expirationDate: card.expirationDate,
            },
            { shouldDirty: true }
          );
          if (!isSaleCardProduct) {
            form.setValue(fieldPath('quantity'), card.denomination, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }
          setCardPickerOpen(false);
        }}
      />
    </TransactionItemRowShell>
  );
};

export default PurchaseTransactionRowCell;
