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
import type { IPartyProfileCommissionRule } from '@/modules/partyProfiles/types';
import type {
  IPurchaseDocumentAttachment,
  IPurchaseFormValues,
  IPurchasePricingData,
  IPurchaseTransactionFormRow,
  IPurchaseSubmitPayload,
} from '../types/purchaseTypes';
import type { ITransactionEntity } from '@/modules/transactions';

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
  commission: '',
  commissionSnapshot: null,
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
  manualBookPageId: '',
  manualBookPageSnapshot: null,
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
      manualBookPageId: values.manualBookPageId || null,
      manualBookPageSnapshot: values.manualBookPageSnapshot ?? null,
      transactionType: values.transactionType,
      tradeMode: values.tradeMode,
      remarks: null,
      items: values.transactions.map(row => ({
        currencyId: row.currencyId,
        productId: row.productId,
        quantity: row.quantity,
        rate: row.rate,
        commission: row.commission || null,
        commissionSnapshot: row.commissionSnapshot ?? null,
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
        chequePageId: row.chequePageId ?? null,
        chequePageSnapshot: row.chequePageSnapshot ?? null,
        amount: row.amount,
        remarks: null,
      })),
    },
    attachments,
  };
};

export const mapPurchaseTransactionToFormValues = (
  transaction: ITransactionEntity,
  purchasePageType: PurchasePageType | null
): IPurchaseFormValues => ({
  purchasePageType,
  branchSnapshot: transaction.branchSnapshot ?? null,
  transactionType: transaction.transactionType,
  tradeMode: transaction.tradeMode,
  partyProfileId: transaction.partyProfileId,
  partyProfileCode: transaction.partyProfileSnapshot?.code ?? '',
  partyProfileName: transaction.partyProfileSnapshot?.name ?? '',
  partyProfileEmail:
    (transaction.partyProfileSnapshot?.email as string | undefined) ?? '',
  partyProfilePhoneNo:
    (transaction.partyProfileSnapshot?.phoneNo as string | undefined) ?? '',
  partyProfileAddress1:
    (transaction.partyProfileSnapshot?.address1 as string | undefined) ?? '',
  partyProfileAddress2:
    (transaction.partyProfileSnapshot?.address2 as string | undefined) ?? '',
  partyProfileAddress3:
    (transaction.partyProfileSnapshot?.address3 as string | undefined) ?? '',
  partyProfileCity:
    (transaction.partyProfileSnapshot?.city as string | undefined) ?? '',
  partyProfilePinCode:
    (transaction.partyProfileSnapshot?.pinCode as string | undefined) ?? '',
  partyProfilePanNo:
    (transaction.partyProfileSnapshot?.panNo as string | undefined) ?? '',
  partyProfileGstNo:
    (transaction.partyProfileSnapshot?.gstNo as string | undefined) ?? '',
  partyProfileGstStateName:
    (transaction.partyProfileSnapshot?.gstStateName as string | undefined) ?? '',
  partyProfileContactName:
    (transaction.partyProfileSnapshot?.contactName as string | undefined) ?? '',
  partyProfileApplyTax: Boolean(transaction.partyProfileSnapshot?.applyTax),
  agentProfileId: transaction.agentProfileId ?? '',
  agentProfileCode: transaction.agentProfileSnapshot?.code ?? '',
  agentProfileName: transaction.agentProfileSnapshot?.name ?? '',
  manualBookReferenceType: 'CASHIER',
  manualBookId: (transaction.manualBookPageSnapshot as Record<string, unknown> | null | undefined)?.manualBookId
    ? String((transaction.manualBookPageSnapshot as Record<string, unknown>).manualBookId)
    : '',
  manualBookNo: (() => {
    const snapshot = transaction.manualBookPageSnapshot as
      | { manualBook?: { no?: string } }
      | null
      | undefined;
    return snapshot?.manualBook?.no ?? '';
  })(),
  manualBookPageId: transaction.manualBookPageId ?? '',
  manualBookPageSnapshot: transaction.manualBookPageSnapshot ?? null,
  deliveryBoyUserId: '',
  deliveryBoyUserCode: '',
  deliveryBoyUserName: '',
  number: transaction.number,
  transactions: (transaction.items ?? []).map(item => ({
    currencyId: item.currencyId,
    currencyCode: item.currencySnapshot?.label ?? item.currencySnapshot?.code ?? '',
    currencyName: item.currencySnapshot?.name ?? '',
    productId: item.productId,
    productCode: item.productSnapshot?.label ?? item.productSnapshot?.code ?? '',
    productDescription: item.productSnapshot?.name ?? '',
    quantity: item.quantity ?? '',
    rate: item.rate ?? '',
    commission: item.commission ?? '',
    commissionSnapshot: item.commissionSnapshot ?? null,
    total: '',
    roundOff: '',
    finalAmount: '',
  })),
  additionalCharges: (transaction.additionalCharges ?? []).map(charge => ({
    accountId: charge.accountId,
    accountName: charge.accountSnapshot?.label ?? charge.accountSnapshot?.name ?? charge.accountSnapshot?.code ?? '',
    amount: charge.amount ?? '',
    gstRate: charge.gstRate ?? '',
    gstAmount: charge.gstAmount ?? '',
    totalAmount: (() => {
      const amountValue = Number(charge.amount ?? 0);
      const gstValue = Number(charge.gstAmount ?? 0);
      if (!Number.isFinite(amountValue)) {
        return '';
      }
      if (!Number.isFinite(gstValue)) {
        return amountValue.toFixed(4);
      }
      return (amountValue + gstValue).toFixed(4);
    })(),
    applyTax: Boolean(charge.applyTax),
    remarks: charge.remarks ?? '',
  })),
  paymentDetails: (transaction.payments ?? []).map(payment => ({
    accountId: payment.accountId,
    accountName: payment.accountSnapshot?.label ?? payment.accountSnapshot?.name ?? payment.accountSnapshot?.code ?? '',
    amount: payment.amount ?? '',
    chequeNumber: payment.referenceNumber ?? '',
    chequeDate: payment.referenceDate ?? '',
    branchName: payment.branchName ?? '',
    chequePageId: payment.chequePageId ?? '',
    chequePageSnapshot: payment.chequePageSnapshot ?? null,
    remarks: payment.remarks ?? '',
  })),
});

export const formatPurchaseEntityLabel = (code?: string | null, name?: string | null) => {
  const normalizedCode = code?.trim();
  const normalizedName = name?.trim();

  if (normalizedCode && normalizedName) {
    return `${normalizedCode} - ${normalizedName}`;
  }

  return normalizedCode || normalizedName || '';
};

export const resolveAgentCommissionRule = (
  rules: IPartyProfileCommissionRule[] = [],
  currencyCode: string,
  productCode: string
) =>
  rules.find(
    rule =>
      rule.currencyCode === currencyCode && rule.productCode === productCode
  ) ?? null;

export const calculatePurchaseTransactionCommission = (
  amount?: string | null,
  currencyRatePer?: string | number | null,
  rule?: IPartyProfileCommissionRule | null
) => {
  if (!amount || !rule) {
    return '';
  }

  const parsedAmount = Number(amount);
  const parsedValue = Number(rule.commissionValue);
  const parsedPer = Number(currencyRatePer ?? 1) || 1;

  if (
    !Number.isFinite(parsedAmount) ||
    !Number.isFinite(parsedValue) ||
    !Number.isFinite(parsedPer)
  ) {
    return '';
  }

  const commission =
    rule.commissionType === 'PERCENTAGE'
      ? (parsedAmount * parsedValue * parsedPer) / 100
      : parsedValue * parsedPer;

  return commission.toFixed(4);
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
