import type {
  ICurrencyRateComparisonPreview,
  ICurrencyRateMargin,
  CurrencyRateMarginType,
} from '@/modules/currencyRates/types/currencyRatesTypes';
import type { ITransactionAdditionalChargeFormRow } from '@/components/forms';
import {
  buildCurrencyRateComparisonPreview,
  getCurrencyPricingGroup,
  getLatestRateForCurrency,
} from '@/modules/currencyRates/utils/currencyRatesUtils';
import type {
  IBuyFromFormValues,
  IBuyFromPricingData,
  IBuyFromTransactionFormRow,
} from '../types/buyFromTypes';

const EMPTY_MARGIN: ICurrencyRateMargin = {
  marginType: '',
  marginValue: '',
  minRate: '',
  maxRate: '',
};

export const createEmptyBuyFromTransactionRow = (): IBuyFromTransactionFormRow => ({
  currencyId: '',
  currencyCode: '',
  currencyName: '',
  productId: '',
  productCode: '',
  productDescription: '',
  quantity: '',
  rate: '',
  total: '',
  roundOff: '',
  finalAmount: '',
});

export const createEmptyBuyFromFormValues = (branchCode = ''): IBuyFromFormValues => ({
  partyProfileId: '',
  partyProfileCode: '',
  partyProfileName: '',
  partyProfileApplyTax: false,
  agentProfileId: '',
  agentProfileCode: '',
  agentProfileName: '',
  manualBookReferenceType: 'CASHIER',
  manualBookId: '',
  manualBookNo: '',
  deliveryBoyUserId: '',
  deliveryBoyUserCode: '',
  deliveryBoyUserName: '',
  number: branchCode ? `${branchCode}-` : '',
  transactions: [createEmptyBuyFromTransactionRow()],
  additionalCharges: [],
  paymentDetails: [],
});

export const formatBuyFromEntityLabel = (code?: string | null, name?: string | null) => {
  const normalizedCode = code?.trim();
  const normalizedName = name?.trim();

  if (normalizedCode && normalizedName) {
    return `${normalizedCode} - ${normalizedName}`;
  }

  return normalizedCode || normalizedName || '';
};

const toMarginValue = (
  marginType?: CurrencyRateMarginType | null,
  marginValue?: string | null
): ICurrencyRateMargin => ({
  marginType: marginType ?? '',
  marginValue: marginValue ?? '',
  minRate: '',
  maxRate: '',
});

export const resolveBuyFromTransactionPreview = (
  data: IBuyFromPricingData,
  currencyId: string,
  productId: string
): ICurrencyRateComparisonPreview | null => {
  if (!currencyId || !productId) {
    return null;
  }

  const latestRate = getLatestRateForCurrency(data.latestRates ?? [], currencyId);
  if (!latestRate) {
    return null;
  }

  const pricingGroup = getCurrencyPricingGroup(data.currencies ?? [], currencyId);
  const productRules = data.productCurrencyRates ?? [];
  const productRule = productRules.find(
    rule => rule.currencyId === currencyId && rule.productId === productId
  );

  return buildCurrencyRateComparisonPreview({
    latestRate,
    pricingGroup,
    overrideBuy: productRule
      ? toMarginValue(productRule.buy.marginType, productRule.buy.marginValue)
      : EMPTY_MARGIN,
    overrideSale: productRule
      ? toMarginValue(productRule.sale.marginType, productRule.sale.marginValue)
      : EMPTY_MARGIN,
  });
};

export const calculateTransactionTotal = (
  quantity?: string,
  rate?: string | null
) => {
  if (!quantity || !rate) {
    return '';
  }

  const qty = Number(quantity);
  const parsedRate = Number(rate);

  if (!Number.isFinite(qty) || !Number.isFinite(parsedRate)) {
    return '';
  }

  return (qty * parsedRate).toFixed(4);
};

export const calculateRoundedTransactionAmount = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    return '';
  }

  return Math.round(parsedValue).toFixed(4);
};

export const calculateTransactionRoundOff = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    return '';
  }

  const roundedValue = Math.round(parsedValue);
  return (roundedValue - parsedValue).toFixed(4);
};

const toNumericTotal = (value?: string | number | null) => {
  const parsedValue = Number(value || 0);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

export const calculateBuyFromPayableTotal = (
  transactions: Array<{ total?: string | null; finalAmount?: string | null }>,
  additionalCharges: Array<
    Pick<ITransactionAdditionalChargeFormRow, 'totalAmount' | 'amount'>
  >
) => {
  const transactionTotal = transactions.reduce(
    (sum, transaction) =>
      sum + toNumericTotal(transaction.finalAmount || transaction.total),
    0
  );
  const additionalChargeTotal = additionalCharges.reduce(
    (sum, charge) => sum + toNumericTotal(charge.totalAmount || charge.amount),
    0
  );

  return (transactionTotal + additionalChargeTotal).toFixed(4);
};
