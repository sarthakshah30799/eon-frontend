export const ADDITIONAL_SETTINGS_STORAGE_KEY = 'additional-settings';

export const AdditionalSettingsCodeEnum = {
  PasswordPolicy: 'PASSWORD_POLICY',
  PasswordMinLength: 'PASSWORD_MIN_LENGTH',
  PasswordMaxLength: 'PASSWORD_MAX_LENGTH',
  PasswordMinSpecialCharCount: 'PASSWORD_MIN_SPECIAL_CHAR_COUNT',
  PasswordMinNumericCharCount: 'PASSWORD_MIN_NUMERIC_CHAR_COUNT',
  PasswordMinAlphaCharCount: 'PASSWORD_MIN_ALPHA_CHAR_COUNT',
  PasswordMaxInvalidAttempts: 'PASSWORD_MAX_INVALID_ATTEMPTS',
  SessionPolicy: 'SESSION_POLICY',
  SessionAllowMultipleLogin: 'ALLOW_MULTIPLE_LOGIN',
  SessionIdleTimeoutSeconds: 'IDLE_TIMEOUT_SECONDS',
  CurrencyRates: 'CURRENCY_RATES',
  CurrencyRatesDefaultProvider: 'DEFAULT_PROVIDER',
  CurrencyRatesBuyMarginType: 'BUY_MARGIN_TYPE',
  CurrencyRatesBuyMarginValue: 'BUY_MARGIN_VALUE',
  CurrencyRatesBuyMinRate: 'BUY_MIN_RATE',
  CurrencyRatesBuyMaxRate: 'BUY_MAX_RATE',
  CurrencyRatesSaleMarginType: 'SALE_MARGIN_TYPE',
  CurrencyRatesSaleMarginValue: 'SALE_MARGIN_VALUE',
  CurrencyRatesSaleMinRate: 'SALE_MIN_RATE',
  CurrencyRatesSaleMaxRate: 'SALE_MAX_RATE',
} as const;

export const ADDITIONAL_SETTINGS_TEXTS = {
  ADMIN_LABEL: 'Admin',
  PAGE_TITLE: 'Additional Settings',
  PAGE_SUBTITLE:
    'Create categories and linked subcategories. Categories appear on the left and the selected category details appear on the right.',
  CREATE_CATEGORY: 'Create Category',
  CREATE_CATEGORY_TITLE: 'Create Category',
  CREATE_CATEGORY_SUBTITLE:
    'Add a category and one or more linked subcategories. All data is stored locally for now.',
  CATEGORY_TITLE: 'Category Title',
  CATEGORY_CODE: 'Category Code',
  SUBCATEGORIES: 'Subcategories',
  ADD_SUBCATEGORY: 'Add subcategory',
  ADD_MORE: 'Add More',
  ADD_CATEGORY: 'Add category',
  CATEGORY_DETAILS: 'Category Details',
  UPDATE_CATEGORY_TITLE: 'Update Category',
  UPDATE_CATEGORY_SUBTITLE:
    'Edit the category and linked subcategories, then save your changes.',
  UPDATE_CATEGORY: 'Update Category',
  NO_CATEGORIES: 'No categories yet',
  NO_CATEGORIES_SUBTITLE:
    'Create your first category to start managing additional settings.',
  SAVE_CHANGES: 'Save Changes',
  CANCEL: 'Cancel',
  EDIT: 'Edit',
  UPDATE_ERROR: 'Failed to update additional settings',
  CREATE_ERROR: 'Failed to create additional settings',
  CREATE_SUCCESS: 'Additional settings created',
  UPDATE_SUCCESS: 'Additional settings updated',
} as const;
