import type { AsyncSelectResponse } from '@/components/ui';
import type { BranchProfileOption } from '../types';

export const BRANCH_PROFILE_TEXTS = {
  LIST_TITLE: 'Branch Profile',
  LIST_SUBTITLE:
    'Manage branches, update address and contact details, and maintain operational settings from one place.',
  CREATE_BRANCH: 'Create Branch',
  SAVE_CHANGES: 'Save Changes',
  FORM_TITLE: 'Branch Details',
  FORM_SUBTITLE:
    'Fill in the profile, address, contact, and operational details for the branch.',
  LOADING_BRANCHES: 'Loading branches...',
  EMPTY_STATE: 'No branches found. Create your first branch.',
  LIST_ERROR: 'Error loading branches',
  EDIT_BRANCH: 'Edit Branch',
  CREATE_SUCCESS: 'Branch created successfully!',
  UPDATE_SUCCESS: 'Branch updated successfully!',
  DELETE_SUCCESS: 'Branch deleted successfully!',
  CREATE_ERROR: 'Failed to create branch',
  UPDATE_ERROR: 'Failed to update branch',
  DELETE_ERROR: 'Failed to delete branch',
} as const;

export const LOCATION_TYPE_OPTIONS: BranchProfileOption[] = [
  { value: 'branch', label: 'Branch' },
  { value: 'franchies', label: 'Franchies' },
];

export const OPERATIONAL_GROUP_OPTIONS: BranchProfileOption[] = [
  { value: 'city-location', label: 'City Location' },
  { value: 'rural-location', label: 'Rural Location' },
  { value: 'airport-location', label: 'Airport Location' },
];

export const STATE_OPTIONS: BranchProfileOption[] = [
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'gujarat', label: 'Gujarat' },
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'tamil-nadu', label: 'Tamil Nadu' },
  { value: 'rajasthan', label: 'Rajasthan' },
  { value: 'west-bengal', label: 'West Bengal' },
  { value: 'kerala', label: 'Kerala' },
];

export const OPERATIONAL_USER_OPTIONS: BranchProfileOption[] = [
  { value: 'operational-user-1', label: 'Ramesh Kumar' },
  { value: 'operational-user-2', label: 'Neha Sharma' },
  { value: 'operational-user-3', label: 'Imran Ali' },
];

export const AC_USER_INCHARGE_OPTIONS: BranchProfileOption[] = [
  { value: 'ac-user-1', label: 'Priya Mehta' },
  { value: 'ac-user-2', label: 'Aman Verma' },
  { value: 'ac-user-3', label: 'Salma Khan' },
];

export const WU_AC_BRANCH_POSTING_OPTIONS: BranchProfileOption[] = [
  { value: 'wu-posting-1', label: 'Mumbai Main Branch' },
  { value: 'wu-posting-2', label: 'Delhi City Branch' },
  { value: 'wu-posting-3', label: 'Dubai Desk' },
];

export const IBM_BRANCH_OPTIONS: BranchProfileOption[] = [
  { value: 'ibm-branch-1', label: 'IBMX Main' },
  { value: 'ibm-branch-2', label: 'IBMX South' },
  { value: 'ibm-branch-3', label: 'IBMX Gulf' },
];

export const BRANCH_PHONE_COUNTRY_CODE_OPTIONS = [
  { value: '+91', label: '+91 India' },
  { value: '+971', label: '+971 UAE' },
  { value: '+44', label: '+44 UK' },
  { value: '+1', label: '+1 USA' },
];

export const createStaticLoadOptions =
  (options: BranchProfileOption[]) =>
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
  options: BranchProfileOption[],
  value: string
): string => {
  return options.find(option => option.value === value)?.label ?? value;
};
