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

export const PURCHASE_RATE_DECIMALS = 7;
export const PURCHASE_MONEY_DECIMALS = 2;

export const formatPurchaseDecimal = (
  value?: string | number | null,
  decimals = PURCHASE_MONEY_DECIMALS
) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue.toFixed(decimals) : String(value);
};

export const createStaticLoadOptions =
  (options: { value: string; label: string }[]) => async () => ({
    options,
    hasMore: false,
  });

export const createEmptyPurchaseTransactionRow = (): IPurchaseTransactionFormRow => ({
  currencyId: '',
  currencyCode: '',
  currencyName: '',
  productId: '',
  productCode: '',
  productDescription: '',
  quantity: '',
  per: '',
  rate: '',
  commission: '',
  commissionSnapshot: null,
  total: '',
  roundOff: '',
  finalAmount: '',
});

export const createEmptyPurchaseFormValues = (
  transactionType: TransactionType = TransactionTypeEnum.PURCHASE,
  tradeMode: TradeMode = TradeModeEnum.BULK,
  purchasePageType: PurchasePageType | null = null,
  branchSnapshot: ITransactionReferenceSnapshot | null = null,
  branchId = '',
  counterId = ''
): IPurchaseFormValues => ({
  purchasePageType,
  branchId,
  branchSnapshot,
  counterId,
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
  partyProfileStateName: '',
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
  cashierUserId: '',
  cashierUserCode: '',
  cashierUserName: '',
  deliveryBoyUserId: '',
  deliveryBoyUserCode: '',
  deliveryBoyUserName: '',
  number: '',
  transactions: [createEmptyPurchaseTransactionRow()],
  additionalCharges: [],
  paymentDetails: [],
});

export const mapPurchaseFormValuesToSubmitPayload = (
  values: IPurchaseFormValues,
  attachments: IPurchaseDocumentAttachment[],
  requiresApproval: boolean
): IPurchaseSubmitPayload => {
  if (!values.purchasePageType) {
    throw new Error('Transaction slug is required');
  }

  return {
    transaction: {
      branchId: values.branchId,
      branchSnapshot: values.branchSnapshot,
      counterId: values.counterId,
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
        per: row.per,
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
        drawnOn: row.drawnOn || null,
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
  branchId: transaction.branchId ?? '',
  branchSnapshot: transaction.branchSnapshot ?? null,
  counterId: transaction.counterId ?? '',
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
  partyProfileStateName:
    (transaction.partyProfileSnapshot?.stateName as string | undefined) ?? '',
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
  cashierUserId: '',
  cashierUserCode: '',
  cashierUserName: '',
  deliveryBoyUserId: '',
  deliveryBoyUserCode: '',
  deliveryBoyUserName: '',
  number: transaction.number ?? '',
  transactions: (transaction.items ?? []).map(item => ({
    currencyId: item.currencyId,
    currencyCode: item.currencySnapshot?.label ?? item.currencySnapshot?.code ?? '',
    currencyName: item.currencySnapshot?.name ?? '',
    productId: item.productId,
    productCode: item.productSnapshot?.label ?? item.productSnapshot?.code ?? '',
    productDescription: item.productSnapshot?.name ?? '',
    quantity: item.quantity ?? '',
    per: item.per ?? '',
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
      const isSale = transaction.transactionType === TransactionTypeEnum.SALE;
      const signedMultiplier = isSale ? 1 : -1;
      if (!Number.isFinite(amountValue)) {
        return '';
      }
      if (!Number.isFinite(gstValue)) {
        return (amountValue * signedMultiplier).toFixed(PURCHASE_MONEY_DECIMALS);
      }
      return ((amountValue + gstValue) * signedMultiplier).toFixed(PURCHASE_MONEY_DECIMALS);
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
    drawnOn: payment.drawnOn ?? '',
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

export const getPurchaseTransactionProductFilter = (
  transactionType: TransactionType
) =>
  transactionType === TransactionTypeEnum.SALE
    ? ({ bulkSelling: true } as const)
    : ({ bulkBuying: true } as const);

export const getPurchaseTransactionAccountFilter = (
  transactionType: TransactionType
) =>
  transactionType === TransactionTypeEnum.SALE
    ? ({ bulkSale: true } as const)
    : ({ bulkPurchase: true } as const);

export const getPurchaseTransactionPartyProfileFilter = (
  transactionType: TransactionType
) =>
  transactionType === TransactionTypeEnum.SALE
    ? ({ sale: true } as const)
    : ({ purchase: true } as const);

export const getPurchaseTransactionPricingSide = (
  transactionType: TransactionType | null | undefined
): 'buy' | 'sale' =>
  transactionType === TransactionTypeEnum.SALE ? 'sale' : 'buy';

export const getPurchaseTransactionPricingSideLabel = (
  transactionType: TransactionType | null | undefined
): 'Sale' | 'Buy' =>
  transactionType === TransactionTypeEnum.SALE ? 'Sale' : 'Buy';

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
  quantity?: string | null,
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

  if (rule.commissionType === 'PAISA' && !quantity) {
    return '';
  }

  const commission =
    rule.commissionType === 'PERCENTAGE'
      ? (parsedAmount * parsedValue * parsedPer) / 100
      : parsedValue * (Number(quantity ?? 0) || 0);

  return commission.toFixed(PURCHASE_MONEY_DECIMALS);
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
  rate?: string | null,
  per?: string | number | null
) => {
  if (!quantity || !rate) {
    return '';
  }

  const qty = Number(quantity);
  const parsedRate = Number(rate);
  const parsedPer = Number(per ?? 1) || 1;

  if (
    !Number.isFinite(qty) ||
    !Number.isFinite(parsedRate) ||
    !Number.isFinite(parsedPer) ||
    parsedPer === 0
  ) {
    return '';
  }

  return (qty * (parsedRate / parsedPer)).toFixed(PURCHASE_MONEY_DECIMALS);
};

export const calculateRoundedTransactionAmount = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    return '';
  }

  return Math.round(parsedValue).toFixed(PURCHASE_MONEY_DECIMALS);
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
  return (roundedValue - parsedValue).toFixed(PURCHASE_MONEY_DECIMALS);
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

  return (transactionTotal + additionalChargeTotal).toFixed(
    PURCHASE_MONEY_DECIMALS
  );
};
