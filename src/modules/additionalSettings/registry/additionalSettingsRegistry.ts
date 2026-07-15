import { AdditionalSettingsCodeEnum } from '../constants';

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
  optionsSource?: 'account-profile';
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
    label: 'PURCHASE CONTROL ACCOUNT',
    valueType: 'select',
    required: true,
    placeholder: 'Select purchase control account',
    optionsSource: 'account-profile',
  },
  {
    code: AdditionalSettingsCodeEnum.SaleControlAccount,
    label: 'SALE CONTROL ACCOUNT',
    valueType: 'select',
    required: true,
    placeholder: 'Select sale control account',
    optionsSource: 'account-profile',
  },
];

const TRANSACTION_NUMBERING_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] = [
  {
    code: AdditionalSettingsCodeEnum.PurchaseFfmcNumberSeries,
    label: 'PURCHASE FFMC/ADS',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  {
    code: AdditionalSettingsCodeEnum.SaleFfmcNumberSeries,
    label: 'SALE FFMC/ADS',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  {
    code: AdditionalSettingsCodeEnum.PurchaseRmcNumberSeries,
    label: 'PURCHASE RMC',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  {
    code: AdditionalSettingsCodeEnum.PurchaseForexNumberSeries,
    label: 'PURCHASE FOREX',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  {
    code: AdditionalSettingsCodeEnum.PurchaseForeignNumberSeries,
    label: 'PURCHASE FOREIGN',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  {
    code: AdditionalSettingsCodeEnum.PurchaseMiscNumberSeries,
    label: 'PURCHASE MISC',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
  {
    code: AdditionalSettingsCodeEnum.PurchaseFranchiseNumberSeries,
    label: 'PURCHASE FRANCHISE',
    valueType: 'number',
    required: true,
    placeholder: 'Enter starting sequence number',
  },
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
    code: AdditionalSettingsCodeEnum.TransactionAccounting,
    label: 'TRANSACTION ACCOUNTING',
    rendererKey: 'default',
    titleLocked: true,
    subcategories: TRANSACTION_ACCOUNTING_SUBCATEGORIES,
  },
  {
    code: AdditionalSettingsCodeEnum.TransactionNumbering,
    label: 'TRANSACTION NUMBERING',
    rendererKey: 'default',
    titleLocked: true,
    subcategories: TRANSACTION_NUMBERING_SUBCATEGORIES,
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
