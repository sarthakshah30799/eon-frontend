import type { AsyncSelectResponse } from '@/components/ui';
import type { IBranchProfileOption } from '../types';

export const BRANCH_PROFILE_TEXTS = {
  LIST_TITLE: 'Company Branch',
  LIST_SUBTITLE:
    'Manage company branches, update address and contact details, and maintain operational settings from one place.',
  CREATE_BRANCH: 'Create Company Branch',
  SAVE_CHANGES: 'Save Changes',
  FORM_TITLE: 'Company Branch Details',
  FORM_SUBTITLE:
    'Fill in the profile, address, country, state, contact, and operational details for the company branch.',
  EMPTY_STATE: 'No company branches found. Create your first company branch.',
  LIST_ERROR: 'Error loading company branches',
  EDIT_BRANCH: 'Edit Company Branch',
  CREATE_SUCCESS: 'Company branch created successfully!',
  UPDATE_SUCCESS: 'Company branch updated successfully!',
  DELETE_SUCCESS: 'Company branch deleted successfully!',
  CREATE_ERROR: 'Failed to create company branch',
  UPDATE_ERROR: 'Failed to update company branch',
  DELETE_ERROR: 'Failed to delete company branch',
} as const;

export const LOCATION_TYPE_OPTIONS: IBranchProfileOption[] = [
  { value: 'branch', label: 'Branch' },
  { value: 'franchies', label: 'Franchies' },
];

export const OPERATIONAL_GROUP_OPTIONS: IBranchProfileOption[] = [
  { value: 'city-location', label: 'City Location' },
  { value: 'rural-location', label: 'Rural Location' },
  { value: 'airport-location', label: 'Airport Location' },
];

export const OPERATIONAL_USER_OPTIONS: IBranchProfileOption[] = [
  { value: 'operational-user-1', label: 'Ramesh Kumar' },
  { value: 'operational-user-2', label: 'Neha Sharma' },
  { value: 'operational-user-3', label: 'Imran Ali' },
];

export const AC_USER_INCHARGE_OPTIONS: IBranchProfileOption[] = [
  { value: 'ac-user-1', label: 'Priya Mehta' },
  { value: 'ac-user-2', label: 'Aman Verma' },
  { value: 'ac-user-3', label: 'Salma Khan' },
];

export const WU_AC_BRANCH_POSTING_OPTIONS: IBranchProfileOption[] = [
  { value: 'wu-posting-1', label: 'Mumbai Main Branch' },
  { value: 'wu-posting-2', label: 'Delhi City Branch' },
  { value: 'wu-posting-3', label: 'Dubai Desk' },
];

export const IBM_BRANCH_OPTIONS: IBranchProfileOption[] = [
  { value: 'ibm-branch-1', label: 'IBMX Main' },
  { value: 'ibm-branch-2', label: 'IBMX South' },
  { value: 'ibm-branch-3', label: 'IBMX Gulf' },
];

export const createStaticLoadOptions =
  (options: IBranchProfileOption[]) =>
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

export const getBranchProfileText = (
  options: IBranchProfileOption[],
  value: string
): string => {
  return options.find(option => option.value === value)?.label ?? value;
};
