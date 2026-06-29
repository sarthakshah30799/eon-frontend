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

const CURRENCY_RATES_SUBCATEGORIES: readonly AdditionalSettingSubcategoryDefinition[] = [
  {
    code: AdditionalSettingsCodeEnum.CurrencyRatesConfig,
    label: 'CURRENCY RATES CONFIG',
    valueType: 'json',
    required: true,
    placeholder: 'Paste structured currency rates config JSON',
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
    code: AdditionalSettingsCodeEnum.CurrencyRates,
    label: 'CURRENCY RATES',
    rendererKey: 'default',
    titleLocked: true,
    subcategories: CURRENCY_RATES_SUBCATEGORIES,
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
