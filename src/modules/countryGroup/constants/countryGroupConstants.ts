import type { AsyncSelectOption } from '@/components/ui';

export const COUNTRY_GROUP_TEXTS = {
  LIST_TITLE: 'Country Group Master',
  LIST_SUBTITLE: 'Manage sell limits and travel-day controls for country groups.',
  CREATE_TITLE: 'Create Country Group',
  EDIT_TITLE: 'Edit Country Group',
  CREATE_BUTTON: 'Create Country Group',
  SAVE_CHANGES: 'Save Changes',
  SAVE_GROUP: 'Save Country Group',
  CREATE_SUCCESS: 'Country group created successfully!',
  CREATE_ERROR: 'Failed to create country group',
  UPDATE_SUCCESS: 'Country group updated successfully!',
  UPDATE_ERROR: 'Failed to update country group',
  DELETE_SUCCESS: 'Country group deleted successfully!',
  DELETE_ERROR: 'Failed to delete country group',
  LIST_ERROR: 'Error loading country groups',
  EMPTY_STATE: 'No country groups found. Create your first country group.',
  DETAILS_TITLE: 'Group Details',
  SALE_LIMIT_TITLE: 'Sale Limit',
  TRAVEL_DURATION_TITLE: 'Travel Duration',
} as const;

export const COUNTRY_GROUP_LIST_COLUMNS = {
  CODE: 'Code',
  NAME: 'Name',
  SELL_LIMIT: 'Sell Limit',
  MIN_TRAVEL_DAYS: 'Minimum Travel Days',
  MAX_TRAVEL_DAYS: 'Maximum Travel Days',
  ACTIONS: 'Actions',
} as const;

export const createCurrencyOptionLabel = (currencyCode: string, currencyName: string) =>
  `${currencyCode} - ${currencyName}`;

export const countryGroupNumericHintOptions: AsyncSelectOption[] = [];
