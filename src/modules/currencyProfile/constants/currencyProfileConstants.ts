import type { AsyncSelectOption } from '@/components/ui';
import {
  CurrencyCalculationMethod,
  CurrencyGroup,
  CurrencyProductAllowed,
} from '../types';

export const CURRENCY_PROFILE_TEXTS = {
  LIST_TITLE: 'Currency Profile',
  LIST_SUBTITLE:
    'Manage currencies, maintain rates and configuration, and keep currency rules organized from one place.',
  CREATE_CURRENCY: 'Create Currency',
  SAVE_CHANGES: 'Save Changes',
  EDIT_CURRENCY: 'Edit Currency',
  FORM_SUBTITLE:
    'Fill in the currency details, rate configuration, and related flags.',
  BASIC_INFO_TITLE: 'Basic Info',
  RATE_CONFIGURATION_TITLE: 'Rate Configuration',
  STATUS_TITLE: 'Status',
  EMPTY_STATE: 'No currencies found. Create your first currency.',
  LIST_ERROR: 'Error loading currencies',
  CREATE_SUCCESS: 'Currency created successfully!',
  UPDATE_SUCCESS: 'Currency updated successfully!',
  CREATE_ERROR: 'Failed to create currency',
  UPDATE_ERROR: 'Failed to update currency',
} as const;

export const CURRENCY_CALCULATION_METHOD_OPTIONS: AsyncSelectOption[] = [
  { value: CurrencyCalculationMethod.MULTIPLICATION, label: 'MULTIPLICATION' },
  { value: CurrencyCalculationMethod.DIVISION, label: 'DIVISION' },
];

export const CURRENCY_GROUP_OPTIONS: AsyncSelectOption[] = [
  { value: CurrencyGroup.ASIA, label: 'ASIA' },
  { value: CurrencyGroup.AFRICA, label: 'AFRICA' },
  { value: CurrencyGroup.EUROPE, label: 'EUROPE' },
  { value: CurrencyGroup.GULF, label: 'GULF' },
];

export const CURRENCY_PRODUCT_ALLOWED_OPTIONS: AsyncSelectOption[] = [
  { value: CurrencyProductAllowed.CN, label: 'CN' },
  { value: CurrencyProductAllowed.CM, label: 'CM' },
  { value: CurrencyProductAllowed.CC, label: 'CC' },
  { value: CurrencyProductAllowed.ET, label: 'ET' },
  { value: CurrencyProductAllowed.TC, label: 'TC' },
  { value: CurrencyProductAllowed.TM, label: 'TM' },
];

export const CURRENCY_LIST_COLUMNS = {
  CURRENCY_CODE: 'Currency Code',
  CURRENCY_NAME: 'Currency Name',
  COUNTRIES: 'Countries',
  PRIORITY: 'Priority',
  RATE_PER: 'Rate / Per',
  CALCULATION_METHOD: 'Calculation Method',
  GROUP: 'Group',
  ACTIVE: 'Active',
  ONLY_STOCKING: 'Only Stocking',
  ACTIONS: 'Actions',
} as const;
