import type { AsyncSelectResponse } from '@/components/ui';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';

export const CATEGORY_OPTIONS_TEXTS = {
  LIST_TITLE: 'Category Options',
  LIST_SUBTITLE: 'Manage reusable dropdown values for the application.',
  CREATE_TITLE: 'Create Category Option',
  CREATE_SUBTITLE: 'Add one or more options for the selected category.',
  EDIT_TITLE: 'Edit Category Option',
  EDIT_SUBTITLE: 'Update the selected category option.',
  SAVE_CHANGES: 'Save Changes',
  SAVE_OPTIONS: 'Save Options',
  CREATE_SUCCESS: 'Category option created successfully!',
  CREATE_ERROR: 'Failed to create category option',
  UPDATE_SUCCESS: 'Category option updated successfully!',
  UPDATE_ERROR: 'Failed to update category option',
  BULK_CREATE_SUCCESS: 'Category options created successfully!',
  BULK_CREATE_ERROR: 'Failed to create category options',
  BULK_SAVE_CHANGES: 'Save Options',
} as const;

export const CATEGORY_OPTION_CODE_OPTIONS = [
  {
    value: CategoryOptionCodeEnum.LocationType,
    label: 'Location Type',
  },
  {
    value: CategoryOptionCodeEnum.RiskCategory,
    label: 'Risk Category',
  },
];

export const CATEGORY_OPTION_CODE_LABELS = {
  [CategoryOptionCodeEnum.LocationType]: 'Location Type',
  [CategoryOptionCodeEnum.RiskCategory]: 'Risk Category',
} as const;

export const loadCategoryOptionCodeOptions = async (): Promise<AsyncSelectResponse> => {
  return {
    options: CATEGORY_OPTION_CODE_OPTIONS,
  };
};
