import type { AsyncSelectResponse } from '@/components/ui';
import type { IBranchProfileOption } from '../types';

export const BRANCH_PROFILE_TEXTS = {
  LIST_TITLE: 'Branch Profile',
  LIST_SUBTITLE:
    'Manage branches, update address and contact details, and maintain operational settings from one place.',
  CREATE_BRANCH: 'Create Branch',
  SAVE_CHANGES: 'Save Changes',
  FORM_TITLE: 'Branch Details',
  FORM_SUBTITLE:
    'Fill in the profile, address, contact, and operational details for the branch.',
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

export const LOCATION_TYPE_OPTIONS: IBranchProfileOption[] = [
  { value: 'branch', label: 'Branch' },
  { value: 'franchies', label: 'Franchies' },
];

export const OPERATIONAL_GROUP_OPTIONS: IBranchProfileOption[] = [
  { value: 'city-location', label: 'City Location' },
  { value: 'rural-location', label: 'Rural Location' },
  { value: 'airport-location', label: 'Airport Location' },
];

export const STATE_OPTIONS: IBranchProfileOption[] = [
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'gujarat', label: 'Gujarat' },
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'tamil-nadu', label: 'Tamil Nadu' },
  { value: 'rajasthan', label: 'Rajasthan' },
  { value: 'west-bengal', label: 'West Bengal' },
  { value: 'kerala', label: 'Kerala' },
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
