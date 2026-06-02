import type { AsyncSelectResponse } from '@/components/ui';
import type {
  IUserProfileOption,
  IUserProfileControlSetupItem,
} from '../types';


export const USER_PROFILE_TEXTS = {
  LIST_TITLE: 'User Profile',
  LIST_SUBTITLE: 'Manage users, edit details, and remove records from the list.',
  CREATE_USER: 'Create User',
  SAVE_CHANGES: 'Save Changes',
  FORM_TITLE: 'User Details',
  FORM_SUBTITLE: 'Fill in the user details and control setup values.',
  EMPTY_STATE: 'No users found. Create your first user.',
  LIST_ERROR: 'Error loading users',
  EDIT_USER: 'Edit User',
  CREATE_SUCCESS: 'User created successfully!',
  UPDATE_SUCCESS: 'User updated successfully!',
  DELETE_SUCCESS: 'User deleted successfully!',
  CREATE_ERROR: 'Failed to create user',
  UPDATE_ERROR: 'Failed to update user',
  DELETE_ERROR: 'Failed to delete user',
} as const;

export const CORPORATE_CLIENT_OPTIONS: IUserProfileOption[] = [
  { value: 'client-1', label: 'Alpha Forex Pvt Ltd' },
  { value: 'client-2', label: 'Global Remit Services' },
  { value: 'client-3', label: 'Maraekat Trading Co' },
];

export const BRANCH_OPTIONS: IUserProfileOption[] = [
  { value: 'branch-1', label: 'Mumbai Main Branch' },
  { value: 'branch-2', label: 'Delhi City Branch' },
  { value: 'branch-3', label: 'Dubai Desk' },
];

export const GROUP_OPTIONS: IUserProfileOption[] = [
  { value: 'group-1', label: 'Operations' },
  { value: 'group-2', label: 'Accounts' },
  { value: 'group-3', label: 'Compliance' },
];

export const PURPOSE_OPTIONS: IUserProfileOption[] = [
  { value: 'purpose-1', label: 'Payroll' },
  { value: 'purpose-2', label: 'Travel' },
  { value: 'purpose-3', label: 'Trade Settlement' },
];

export const CONTROL_SETUP_ITEMS: IUserProfileControlSetupItem[] = [
  { key: 'isActive', label: 'Is Active' },
  { key: 'isAdministrator', label: 'Is Administrator' },
  { key: 'miscLimitAuthorization', label: 'Misc Limit Authorization' },
  { key: 'canClearCounter', label: 'Can Clear Counter' },
  { key: 'complianceAuthorization', label: 'Compliance Authorization' },
  { key: 'dataEntryAuthorization', label: 'Data Entry Authorization' },
  { key: 'creditLimitAuthorization', label: 'Credit Limit Authorization' },
];

export const createStaticLoadOptions =
  (options: IUserProfileOption[]) =>
  async (inputValue: string): Promise<AsyncSelectResponse> => {
    const normalizedValue = inputValue.trim().toLowerCase();
    const filteredOptions = normalizedValue
      ? options.filter(option =>
          option.label.toLowerCase().includes(normalizedValue)
        )
      : options;

    return {
      options: filteredOptions,
    };
  };
