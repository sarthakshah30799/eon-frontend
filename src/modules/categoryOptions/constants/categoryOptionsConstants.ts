import type { AsyncSelectResponse } from '@/components/ui';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';

export const CATEGORY_OPTIONS_TEXTS = {
  CREATE_TITLE: 'Create Category Option',
  FORM_SUBTITLE: 'Create reusable dropdown values for the application.',
  SAVE_CHANGES: 'Save Changes',
  CREATE_SUCCESS: 'Category option created successfully!',
  CREATE_ERROR: 'Failed to create category option',
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

export const loadCategoryOptionCodeOptions = async (): Promise<AsyncSelectResponse> => {
  return {
    options: CATEGORY_OPTION_CODE_OPTIONS,
  };
};
