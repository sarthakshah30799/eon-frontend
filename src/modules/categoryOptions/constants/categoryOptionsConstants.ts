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
  {
    value: CategoryOptionCodeEnum.FinancialType,
    label: 'Financial Type',
  },
  {
    value: CategoryOptionCodeEnum.DefaultSign,
    label: 'Default Sign',
  },
  {
    value: CategoryOptionCodeEnum.DivisionDept,
    label: 'Division/Dept',
  },
  {
    value: CategoryOptionCodeEnum.AccountType,
    label: 'Account Type',
  },
  {
    value: CategoryOptionCodeEnum.SubLedger,
    label: 'Sub Ledger',
  },
  {
    value: CategoryOptionCodeEnum.BankNature,
    label: 'Bank Nature',
  },
  {
    value: CategoryOptionCodeEnum.KycRiskCategory,
    label: 'KYC Risk Category',
  },
  {
    value: CategoryOptionCodeEnum.EntityType,
    label: 'Entity Type',
  },
  {
    value: CategoryOptionCodeEnum.DefaultAgent,
    label: 'Default Agent',
  },
  {
    value: CategoryOptionCodeEnum.Group,
    label: 'Group',
  },
  {
    value: CategoryOptionCodeEnum.MarketingExecutive,
    label: 'Marketing Executive',
  },
  {
    value: CategoryOptionCodeEnum.BusinessNature,
    label: 'Business Nature',
  },
  {
    value: CategoryOptionCodeEnum.TdsGroup,
    label: 'TDS Group',
  },

];

export const CATEGORY_OPTION_CODE_LABELS = {
  [CategoryOptionCodeEnum.LocationType]: 'Location Type',
  [CategoryOptionCodeEnum.RiskCategory]: 'Risk Category',
  [CategoryOptionCodeEnum.FinancialType]: 'Financial Type',
  [CategoryOptionCodeEnum.DefaultSign]: 'Default Sign',
  [CategoryOptionCodeEnum.DivisionDept]: 'Division/Dept',
  [CategoryOptionCodeEnum.AccountType]: 'Account Type',
  [CategoryOptionCodeEnum.SubLedger]: 'Sub Ledger',
  [CategoryOptionCodeEnum.BankNature]: 'Bank Nature',
  [CategoryOptionCodeEnum.KycRiskCategory]: 'KYC Risk Category',
  [CategoryOptionCodeEnum.EntityType]: 'Entity Type',
  [CategoryOptionCodeEnum.DefaultAgent]: 'Default Agent',
  [CategoryOptionCodeEnum.Group]: 'Group',
  [CategoryOptionCodeEnum.MarketingExecutive]: 'Marketing Executive',
  [CategoryOptionCodeEnum.BusinessNature]: 'Business Nature',
  [CategoryOptionCodeEnum.TdsGroup]: 'TDS Group',

} as const;

export const loadCategoryOptionCodeOptions = async (): Promise<AsyncSelectResponse> => {
  return {
    options: CATEGORY_OPTION_CODE_OPTIONS,
  };
};
