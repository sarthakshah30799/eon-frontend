import { AdditionalSettingsCodeEnum } from '../constants';
import {
  TRANSACTION_TYPE_PROFILE_ORDER,
  TransactionTypeProfileEnum,
  type TransactionTypeProfile,
} from '@/modules/transactions';

export type AdditionalSettingsCode =
  (typeof AdditionalSettingsCodeEnum)[keyof typeof AdditionalSettingsCodeEnum];

export type AdditionalSettingsRendererKey =
  | 'default'
  | 'password-policy'
  | 'session-policy';

export type AdditionalSettingsValueType =
  | 'text'
  | 'number'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'select'
  | 'json';

export interface AdditionalSettingsOption {
  value: AdditionalSettingsCode;
  label: string;
}

export interface AdditionalSettingSubcategoryDefinition {
  code: AdditionalSettingsCode;
  label: string;
  valueType: AdditionalSettingsValueType;
  required: boolean;
  descriptionLocked?: boolean;
  codeLocked?: boolean;
  valueLocked?: boolean;
  placeholder?: string;
  options?: readonly { value: string; label: string }[];
  optionsSource?: 'account-profile' | 'currency-profile';
}

export interface AdditionalSettingCategoryDefinition {
  code: AdditionalSettingsCode;
  label: string;
  rendererKey: AdditionalSettingsRendererKey;
  titleLocked?: boolean;
  subcategories: readonly AdditionalSettingSubcategoryDefinition[];
}

const PASSWORD_POLICY_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] = [
  {
    code: AdditionalSettingsCodeEnum.PasswordMinLength,
    label: 'MINIMUM LENGTH',
    valueType: 'number',
    required: true,
    placeholder: 'Enter minimum length',
  },
  {
    code: AdditionalSettingsCodeEnum.PasswordMaxLength,
    label: 'MAXIMUM LENGTH',
    valueType: 'number',
    required: true,
    placeholder: 'Enter maximum length',
  },
  {
    code: AdditionalSettingsCodeEnum.PasswordMinSpecialCharCount,
    label: 'MINIMUM SPECIAL CHARACTERS',
    valueType: 'number',
    required: false,
    placeholder: 'Leave empty if not required',
  },
  {
    code: AdditionalSettingsCodeEnum.PasswordMinNumericCharCount,
    label: 'MINIMUM NUMERIC CHARACTERS',
    valueType: 'number',
    required: false,
    placeholder: 'Leave empty if not required',
  },
  {
    code: AdditionalSettingsCodeEnum.PasswordMinAlphaCharCount,
    label: 'MINIMUM ALPHA CHARACTERS',
    valueType: 'number',
    required: false,
    placeholder: 'Leave empty if not required',
  },
  {
    code: AdditionalSettingsCodeEnum.PasswordMaxInvalidAttempts,
    label: 'MAXIMUM INVALID ATTEMPTS',
    valueType: 'number',
    required: false,
    placeholder: 'Leave empty if not required',
  },
];

const SESSION_POLICY_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] = [
  {
    code: AdditionalSettingsCodeEnum.SessionAllowMultipleLogin,
    label: 'ALLOW MULTIPLE LOGIN',
    valueType: 'boolean',
    required: true,
  },
  {
    code: AdditionalSettingsCodeEnum.SessionIdleTimeoutSeconds,
    label: 'IDLE TIMEOUT (SECONDS)',
    valueType: 'number',
    required: false,
    placeholder: 'Leave empty or 0 to disable inactivity logout',
  },
];

const TRANSACTION_APPROVAL_POLICY_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] = [
  {
    code: AdditionalSettingsCodeEnum.PurchaseFfmcAds,
    label: 'BUY FROM FFMC/ADS',
    valueType: 'boolean',
    required: true,
    placeholder: 'Check if approval is required',
  },
];

const TAX_CONFIGURATION_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] = [
  {
    code: AdditionalSettingsCodeEnum.TaxRate,
    label: 'GST RATE (%)',
    valueType: 'decimal',
    required: true,
    placeholder: 'Enter GST rate',
  },
];

const TRANSACTION_SAC_CODE_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] = [
  {
    code: AdditionalSettingsCodeEnum.TransactionPrintSacCode,
    label: 'SAC CODE',
    valueType: 'text',
    required: false,
    placeholder: 'Enter SAC code',
  },
];

const TRANSACTION_ACCOUNTING_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] = [
  {
    code: AdditionalSettingsCodeEnum.PurchaseControlAccount,
    label: 'CURRENCY PURCHASE CONTROL ACCOUNT',
    valueType: 'select',
    required: true,
    placeholder: 'Select purchase control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.SaleControlAccount,
    label: 'CURRENCY SELL CONTROL ACCOUNT',
    valueType: 'select',
    required: true,
    placeholder: 'Select sell control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.CardSellControlAccount,
    label: 'CARD SELL CONTROL ACCOUNT (SELLCC)',
    valueType: 'select',
    required: true,
    placeholder: 'Select CARD sell control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.CardLoadControlAccount,
    label: 'CARD LOAD CONTROL ACCOUNT (CLOCC)',
    valueType: 'select',
    required: true,
    placeholder: 'Select CARD load control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.CardControlAccount,
    label: 'CARD CONTROL ACCOUNT (CRDCC)',
    valueType: 'select',
    required: true,
    placeholder: 'Select CARD control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.CardPurchaseControlAccount,
    label: 'CARD PURCHASE CONTROL ACCOUNT (PURCC)',
    valueType: 'select',
    required: true,
    placeholder: 'Select CARD purchase control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.CardProfitControlAccount,
    label: 'CARD PROFIT CONTROL ACCOUNT (PROCC)',
    valueType: 'select',
    required: true,
    placeholder: 'Select CARD profit control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.RoundOffAccount,
    label: 'ROUND OFF ACCOUNT',
    valueType: 'select',
    required: true,
    placeholder: 'Select round off account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.IgstControlAccount,
    label: 'IGST CONTROL ACCOUNT',
    valueType: 'select',
    required: true,
    placeholder: 'Select IGST control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.CgstControlAccount,
    label: 'CGST CONTROL ACCOUNT',
    valueType: 'select',
    required: true,
    placeholder: 'Select CGST control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.SgstControlAccount,
    label: 'SGST CONTROL ACCOUNT',
    valueType: 'select',
    required: true,
    placeholder: 'Select SGST control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.HandlingChargeAccount,
    label: 'HANDLING FEE CONTROL ACCOUNT',
    valueType: 'select',
    required: true,
    placeholder: 'Select handling fee control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.AgentControlAccount,
    label: 'AGENT CONTROL ACCOUNT',
    valueType: 'select',
    required: true,
    placeholder: 'Select agent control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.TdsControlAccount,
    label: 'TDS CONTROL ACCOUNT',
    valueType: 'select',
    required: true,
    placeholder: 'Select TDS control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.CommissionControlAccount,
    label: 'COMMISSION CONTROL ACCOUNT',
    valueType: 'select',
    required: true,
    placeholder: 'Select commission control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.BranchControlAccount,
    label: 'BRANCH CONTROL ACCOUNT',
    valueType: 'select',
    required: true,
    placeholder: 'Select branch control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.CounterControlAccount,
    label: 'COUNTER CONTROL ACCOUNT',
    valueType: 'select',
    required: true,
    placeholder: 'Select counter control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.CashControlAccount,
    label: 'CASH CONTROL ACCOUNT',
    valueType: 'select',
    required: true,
    placeholder: 'Select cash control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.AdvanceControlAccount,
    label: 'ADVANCE CONTROL ACCOUNT',
    valueType: 'select',
    required: true,
    placeholder: 'Select advance control account',
    optionsSource: 'account-profile',
  },
];

const PURCHASE_PASSENGER_RULE_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] = [
  {
    code: AdditionalSettingsCodeEnum.PurchasePassengerRuleReferenceCurrencyCode,
    label: 'REFERENCE CURRENCY CODE',
    valueType: 'select',
    required: true,
    placeholder: 'Select reference currency',
    optionsSource: 'currency-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.PurchasePassengerRuleCdfThresholdAmount,
    label: 'CDF THRESHOLD AMOUNT',
    valueType: 'decimal',
    required: true,
    placeholder: 'Enter CDF threshold amount',
  },
  {
    code: AdditionalSettingsCodeEnum.PurchasePassengerRuleIndianCashLimitAmount,
    label: 'INDIAN CASH LIMIT AMOUNT',
    valueType: 'decimal',
    required: true,
    placeholder: 'Enter Indian cash limit amount',
  },
  {
    code: AdditionalSettingsCodeEnum.PurchasePassengerRuleNriCashLimitAmount,
    label: 'NRI / FOREIGNER CASH LIMIT AMOUNT',
    valueType: 'decimal',
    required: true,
    placeholder: 'Enter NRI / FOREIGNER cash limit amount',
  },
  {
    code: AdditionalSettingsCodeEnum.PurchasePassengerRuleWindowDays,
    label: 'HISTORY WINDOW DAYS',
    valueType: 'number',
    required: true,
    placeholder: 'Enter history window days',
  },
];

const TRANSACTION_NUMBERING_SUBCATEGORY_CONFIG: Partial<Record<
  TransactionTypeProfile,
  Pick<
    AdditionalSettingSubcategoryDefinition,
    'code' | 'label' | 'valueType' | 'required' | 'placeholder'
  >
>> = {
  [TransactionTypeProfileEnum.PURCHASE_FFMC]: {
    code: AdditionalSettingsCodeEnum.PurchaseFfmcNumberSeries,
    label: 'PURCHASE FFMC/ADS',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  [TransactionTypeProfileEnum.FAKE_CURRENCY]: {
    code: AdditionalSettingsCodeEnum.FakeCurrencyNumberSeries,
    label: 'FAKE CURRENCY',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  [TransactionTypeProfileEnum.CARD_STOCK_RECEIPT]: {
    code: AdditionalSettingsCodeEnum.CardStockReceiptNumberSeries,
    label: 'CARD STOCK RECEIPT',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  [TransactionTypeProfileEnum.CARD_TRANSFER_SELL]: {
    code: AdditionalSettingsCodeEnum.CardTransferSellNumberSeries,
    label: 'CARD TRANSFER SELL',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  [TransactionTypeProfileEnum.PURCHASE_CORPORATE_INDIVIDUAL]: {
    code: AdditionalSettingsCodeEnum.PurchaseCorporateNumberSeries,
    label: 'PURCHASE CORPORATE / INDIVIDUAL',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  [TransactionTypeProfileEnum.SALE_CORPORATE_INDIVIDUAL]: {
    code: AdditionalSettingsCodeEnum.SaleCorporateNumberSeries,
    label: 'SELL CORPORATE / INDIVIDUAL',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  [TransactionTypeProfileEnum.SALE_FFMC]: {
    code: AdditionalSettingsCodeEnum.SaleFfmcNumberSeries,
    label: 'SELL FFMC/ADS',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  [TransactionTypeProfileEnum.SALE_RMC]: {
    code: AdditionalSettingsCodeEnum.SaleRmcNumberSeries,
    label: 'SELL RMC',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  [TransactionTypeProfileEnum.SALE_FOREX]: {
    code: AdditionalSettingsCodeEnum.SaleForexNumberSeries,
    label: 'SELL FOREX',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  [TransactionTypeProfileEnum.SALE_FOREIGN]: {
    code: AdditionalSettingsCodeEnum.SaleForeignNumberSeries,
    label: 'SELL FOREIGN',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  [TransactionTypeProfileEnum.SALE_MISC]: {
    code: AdditionalSettingsCodeEnum.SaleMiscNumberSeries,
    label: 'SELL MISC',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  [TransactionTypeProfileEnum.SALE_FRANCHISE]: {
    code: AdditionalSettingsCodeEnum.SaleFranchiseNumberSeries,
    label: 'SELL FRANCHISE',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  [TransactionTypeProfileEnum.PURCHASE_RMC]: {
    code: AdditionalSettingsCodeEnum.PurchaseRmcNumberSeries,
    label: 'PURCHASE RMC',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  [TransactionTypeProfileEnum.PURCHASE_FOREX]: {
    code: AdditionalSettingsCodeEnum.PurchaseForexNumberSeries,
    label: 'PURCHASE FOREX',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  [TransactionTypeProfileEnum.PURCHASE_FOREIGN]: {
    code: AdditionalSettingsCodeEnum.PurchaseForeignNumberSeries,
    label: 'PURCHASE FOREIGN',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  [TransactionTypeProfileEnum.PURCHASE_MISC]: {
    code: AdditionalSettingsCodeEnum.PurchaseMiscNumberSeries,
    label: 'PURCHASE MISC',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  [TransactionTypeProfileEnum.PURCHASE_FRANCHISE]: {
    code: AdditionalSettingsCodeEnum.PurchaseFranchiseNumberSeries,
    label: 'PURCHASE FRANCHISE',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
};

const TRANSFER_NUMBERING_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] = [
  {
    code: AdditionalSettingsCodeEnum.BranchTransferSellNumberSeries,
    label: 'BRANCH TRANSFER SELL',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  {
    code: AdditionalSettingsCodeEnum.BranchTransferPurchaseNumberSeries,
    label: 'BRANCH TRANSFER PURCHASE',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  {
    code: AdditionalSettingsCodeEnum.CounterTransferSellNumberSeries,
    label: 'COUNTER TRANSFER SELL',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  {
    code: AdditionalSettingsCodeEnum.CounterTransferPurchaseNumberSeries,
    label: 'COUNTER TRANSFER PURCHASE',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
];

const CARD_TECHNICAL_NUMBERING_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] = [
  { code: AdditionalSettingsCodeEnum.CardTransferOutNumberSeries, label: 'CARD TRANSFER OUT', valueType: 'number', required: true, placeholder: 'Enter starting sequence number' },
  { code: AdditionalSettingsCodeEnum.CardTransferInNumberSeries, label: 'CARD TRANSFER IN', valueType: 'number', required: true, placeholder: 'Enter starting sequence number' },
  { code: AdditionalSettingsCodeEnum.CardStockLoadNumberSeries, label: 'CARD STOCK LOAD', valueType: 'number', required: true, placeholder: 'Enter starting sequence number' },
  { code: AdditionalSettingsCodeEnum.CardSettleNumberSeries, label: 'CARD SETTLEMENT', valueType: 'number', required: true, placeholder: 'Enter starting sequence number' },
];

const VOUCHER_NUMBERING_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] = [
  { code: AdditionalSettingsCodeEnum.ReceiptVoucherNumberSeries, label: 'RECEIPT VOUCHER', valueType: 'number', required: true, placeholder: 'Enter starting sequence number' },
  { code: AdditionalSettingsCodeEnum.PaymentVoucherNumberSeries, label: 'PAYMENT VOUCHER', valueType: 'number', required: true, placeholder: 'Enter starting sequence number' },
  { code: AdditionalSettingsCodeEnum.JournalVoucherNumberSeries, label: 'JOURNAL VOUCHER', valueType: 'number', required: true, placeholder: 'Enter starting sequence number' },
];

const FAKE_CURRENCY_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] = [
  {
    code: AdditionalSettingsCodeEnum.FakeCurrencyRateEditable,
    label: 'FAKE CURRENCY RATE EDITABLE',
    valueType: 'boolean',
    required: true,
    placeholder: 'YES or NO',
  },
];

const TRANSFER_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] = [
  {
    code: AdditionalSettingsCodeEnum.TransferRateEditable,
    label: 'TRANSFER RATE EDITABLE',
    valueType: 'boolean',
    required: true,
    placeholder: 'YES or NO',
  },
];

const STOCK_REVALUATION_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] = [
  {
    code: AdditionalSettingsCodeEnum.StockRevaluationFrequency,
    label: 'STOCK REVALUATION FREQUENCY',
    valueType: 'select',
    required: true,
    options: [
      { value: 'MONTHLY', label: 'Monthly' },
      { value: 'QUARTERLY', label: 'Quarterly' },
      { value: 'HALF_YEARLY', label: 'Half-yearly' },
      { value: 'YEARLY', label: 'Yearly' },
    ],
  },
];

const CARD_SETTING_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] = [
  {
    code: AdditionalSettingsCodeEnum.CardAutoSettleWithHo,
    label: 'AUTOMATICALLY SETTLE CARD SALES WITH HO',
    valueType: 'boolean',
    required: true,
    placeholder: 'YES or NO',
  },
];

const REPORTS_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] = [
  {
    code: AdditionalSettingsCodeEnum.Flm1CurrencyColumnCount,
    label: 'FLM1 CURRENCY COLUMNS PER BLOCK',
    valueType: 'number',
    required: true,
    placeholder: 'Default 5',
  },
];

const TRANSACTION_NUMBERING_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] =
  [
    ...TRANSACTION_TYPE_PROFILE_ORDER.flatMap(profileType => {
      const definition = TRANSACTION_NUMBERING_SUBCATEGORY_CONFIG[profileType];
      return definition ? [{ ...definition }] : [];
    }),
    ...TRANSFER_NUMBERING_SUBCATEGORIES,
    ...CARD_TECHNICAL_NUMBERING_SUBCATEGORIES,
    ...VOUCHER_NUMBERING_SUBCATEGORIES,
  ];

export const ADDITIONAL_SETTING_DEFINITIONS: readonly AdditionalSettingCategoryDefinition[] = [
  {
    code: AdditionalSettingsCodeEnum.PasswordPolicy,
    label: 'PASSWORD POLICY',
    rendererKey: 'password-policy',
    titleLocked: true,
    subcategories: PASSWORD_POLICY_SUBCATEGORIES,
  },
  {
    code: AdditionalSettingsCodeEnum.SessionPolicy,
    label: 'SESSION POLICY',
    rendererKey: 'session-policy',
    titleLocked: true,
    subcategories: SESSION_POLICY_SUBCATEGORIES,
  },
  {
    code: AdditionalSettingsCodeEnum.TransactionApprovalPolicy,
    label: 'TRANSACTION APPROVAL POLICY',
    rendererKey: 'default',
    titleLocked: true,
    subcategories: TRANSACTION_APPROVAL_POLICY_SUBCATEGORIES,
  },
  {
    code: AdditionalSettingsCodeEnum.TransactionSacCode,
    label: 'SAC CODE',
    rendererKey: 'default',
    titleLocked: true,
    subcategories: TRANSACTION_SAC_CODE_SUBCATEGORIES,
  },
  {
    code: AdditionalSettingsCodeEnum.TaxConfiguration,
    label: 'TAX CONFIGURATION',
    rendererKey: 'default',
    titleLocked: true,
    subcategories: TAX_CONFIGURATION_SUBCATEGORIES,
  },
  {
    code: AdditionalSettingsCodeEnum.TransactionAccounting,
    label: 'TRANSACTION ACCOUNTING',
    rendererKey: 'default',
    titleLocked: true,
    subcategories: TRANSACTION_ACCOUNTING_SUBCATEGORIES,
  },
  {
    code: AdditionalSettingsCodeEnum.PurchasePassengerRule,
    label: 'PURCHASE PASSENGER RULE',
    rendererKey: 'default',
    titleLocked: true,
    subcategories: PURCHASE_PASSENGER_RULE_SUBCATEGORIES,
  },
  {
    code: AdditionalSettingsCodeEnum.TransactionNumbering,
    label: 'TRANSACTION NUMBERING',
    rendererKey: 'default',
    titleLocked: true,
    subcategories: TRANSACTION_NUMBERING_SUBCATEGORIES,
  },
  {
    code: AdditionalSettingsCodeEnum.FakeCurrency,
    label: 'FAKE CURRENCY SETTINGS',
    rendererKey: 'default',
    titleLocked: true,
    subcategories: FAKE_CURRENCY_SUBCATEGORIES,
  },
  {
    code: AdditionalSettingsCodeEnum.TransferSettings,
    label: 'TRANSFER SETTINGS',
    rendererKey: 'default',
    titleLocked: true,
    subcategories: TRANSFER_SUBCATEGORIES,
  },
  {
    code: AdditionalSettingsCodeEnum.StockRevaluationSettings,
    label: 'STOCK REVALUATION SETTINGS',
    rendererKey: 'default',
    titleLocked: true,
    subcategories: STOCK_REVALUATION_SUBCATEGORIES,
  },
  {
    code: AdditionalSettingsCodeEnum.CardSettings,
    label: 'CARD SETTINGS',
    rendererKey: 'default',
    titleLocked: true,
    subcategories: CARD_SETTING_SUBCATEGORIES,
  },
  {
    code: AdditionalSettingsCodeEnum.Reports,
    label: 'REPORTS',
    rendererKey: 'default',
    titleLocked: true,
    subcategories: REPORTS_SUBCATEGORIES,
  },
];

const normalizeCode = (code?: string | null) => code?.trim().toUpperCase() ?? '';

export const getAdditionalSettingCategoryDefinitions = () =>
  [...ADDITIONAL_SETTING_DEFINITIONS] as const;

export const getAdditionalSettingCategoryDefinition = (code?: string | null) =>
  ADDITIONAL_SETTING_DEFINITIONS.find(
    definition => definition.code === normalizeCode(code)
  ) ?? null;

export const getAdditionalSettingCategoryCodeOptions = (): AdditionalSettingsOption[] =>
  ADDITIONAL_SETTING_DEFINITIONS.map(definition => ({
    value: definition.code,
    label: definition.label,
  }));

export const getAdditionalSettingSubcategoryCodeOptions = (
  categoryCode?: string | null
): AdditionalSettingsOption[] =>
  getAdditionalSettingCategoryDefinition(categoryCode)?.subcategories.map(definition => ({
    value: definition.code,
    label: definition.label,
  })) ?? [];

export const getAdditionalSettingSubcategoryDefinition = (
  categoryCode?: string | null,
  subcategoryCode?: string | null
) =>
  getAdditionalSettingCategoryDefinition(categoryCode)?.subcategories.find(
    definition => definition.code === normalizeCode(subcategoryCode)
  ) ?? null;

export const isRegisteredAdditionalSettingCategoryCode = (code?: string | null) =>
  Boolean(getAdditionalSettingCategoryDefinition(code));

export const isRegisteredAdditionalSettingSubcategoryCode = (
  categoryCode?: string | null,
  subcategoryCode?: string | null
) =>
  Boolean(getAdditionalSettingSubcategoryDefinition(categoryCode, subcategoryCode));

export const getAdditionalSettingRendererKey = (
  code?: string | null
): AdditionalSettingsRendererKey =>
  getAdditionalSettingCategoryDefinition(code)?.rendererKey ?? 'default';
