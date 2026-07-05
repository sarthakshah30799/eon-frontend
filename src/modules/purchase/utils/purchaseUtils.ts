import type {
  ICurrencyRateComparisonPreview,
  ICurrencyRateMargin,
  CurrencyRateMarginType,
} from '@/modules/currencyRates/types/currencyRatesTypes';
import {
  TransactionDocumentStatusEnum,
  TransactionPaymentMethodEnum,
  TradeModeEnum,
  TransactionTypeEnum,
} from '@/modules/transactions';
import type { TradeMode, TransactionType } from '@/modules/transactions';
import {
  buildCurrencyRateComparisonPreview,
  getCurrencyPricingGroup,
  getLatestRateForCurrency,
} from '@/modules/currencyRates/utils/currencyRatesUtils';
import type { ITransactionReferenceSnapshot } from '@/modules/transactions';
import type { PurchasePageType } from '@/pages/purchase/[slug]/purchasePage.enum';
import type {
  IPurchaseDocumentAttachment,
  IPurchaseFormValues,
  IPurchasePricingData,
  IPurchaseTransactionFormRow,
  IPurchaseSubmitPayload,
} from '../types/purchaseTypes';

const EMPTY_MARGIN: ICurrencyRateMargin = {
  marginType: '',
  marginValue: '',
  minRate: '',
  maxRate: '',
};

export const createEmptyPurchaseTransactionRow = (): IPurchaseTransactionFormRow => ({
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

export const createEmptyPurchaseFormValues = (
  branchCode = '',
  transactionType: TransactionType = TransactionTypeEnum.PURCHASE,
  tradeMode: TradeMode = TradeModeEnum.BULK,
  purchasePageType: PurchasePageType | null = null,
  branchSnapshot: ITransactionReferenceSnapshot | null = null
): IPurchaseFormValues => ({
  purchasePageType,
  branchSnapshot,
  transactionType,
  tradeMode,
  partyProfileId: '',
  partyProfileCode: '',
  partyProfileName: '',
  partyProfileEmail: '',
  partyProfilePhoneNo: '',
  partyProfileAddress1: '',
  partyProfileAddress2: '',
  partyProfileAddress3: '',
  partyProfileCity: '',
  partyProfilePinCode: '',
  partyProfilePanNo: '',
  partyProfileGstNo: '',
  partyProfileGstStateName: '',
  partyProfileContactName: '',
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
  transactions: [createEmptyPurchaseTransactionRow()],
  additionalCharges: [],
  paymentDetails: [],
});

export const mapPurchaseFormValuesToSubmitPayload = (
  values: IPurchaseFormValues,
  branchId: string,
  attachments: IPurchaseDocumentAttachment[],
  requiresApproval: boolean
): IPurchaseSubmitPayload => {
  if (!values.purchasePageType) {
    throw new Error('Transaction slug is required');
  }

  return {
    transaction: {
      number: values.number.trim(),
      branchId,
      branchSnapshot: values.branchSnapshot,
      requiresApproval,
      slug: values.purchasePageType,
      partyProfileId: values.partyProfileId,
      agentProfileId: values.agentProfileId || null,
      transactionType: values.transactionType,
      tradeMode: values.tradeMode,
      remarks: null,
      items: values.transactions.map(row => ({
        currencyId: row.currencyId,
        productId: row.productId,
        quantity: row.quantity,
        rate: row.rate,
        remarks: null,
      })),
      documents: attachments.map(attachment => ({
        documentProfileId: attachment.documentProfileId,
        status: TransactionDocumentStatusEnum.ATTACHED,
        remarks: null,
      })),
      additionalCharges: values.additionalCharges.map(row => ({
        accountId: row.accountId,
        amount: row.amount,
        gstRate: row.gstRate || null,
        gstAmount: row.gstAmount || null,
        applyTax: Boolean(values.partyProfileApplyTax),
        remarks: null,
      })),
      payments: values.paymentDetails.map(row => ({
        accountId: row.accountId,
        paymentMethod: TransactionPaymentMethodEnum.CHEQUE,
        referenceNumber: row.chequeNumber,
        referenceDate: row.chequeDate,
        branchName: row.branchName,
        amount: row.amount,
        remarks: null,
      })),
    },
    attachments,
  };
};

export const formatPurchaseEntityLabel = (code?: string | null, name?: string | null) => {
  const normalizedCode = code?.trim();
  const normalizedName = name?.trim();

  if (normalizedCode && normalizedName) {
    return `${normalizedCode} - ${normalizedName}`;
  }

  return normalizedCode || normalizedName || '';
};

const toMarginValue = (
  marginType?: CurrencyRateMarginType | '' | null,
  marginValue?: string | null
): ICurrencyRateMargin => ({
  marginType: marginType ?? '',
  marginValue: marginValue ?? '',
  minRate: '',
  maxRate: '',
});

export const resolvePurchaseTransactionPreview = (
  data: IPurchasePricingData,
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
      ? toMarginValue(
          productRule.buy.marginType ?? '',
          productRule.buy.marginValue
        )
      : EMPTY_MARGIN,
    overrideSale: productRule
      ? toMarginValue(
          productRule.sale.marginType ?? '',
          productRule.sale.marginValue
        )
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

export const calculatePurchasePayableTotal = (
  transactions: Array<{ total?: string | null; finalAmount?: string | null }>,
  additionalCharges: Array<{
    totalAmount?: string | null;
    amount?: string | null;
  }>
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
