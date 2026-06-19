import type { AsyncSelectResponse } from '@/components/ui';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';

export const CATEGORY_OPTIONS_TEXTS = {
  LIST_TITLE: 'Miscellaneous Profile',
  LIST_SUBTITLE: 'Manage reusable dropdown values for miscellaneous profiles.',
  CREATE_TITLE: 'Create Miscellaneous Profile',
  CREATE_SUBTITLE: 'Add one or more options for the selected profile.',
  EDIT_TITLE: 'Edit Miscellaneous Profile',
  EDIT_SUBTITLE: 'Update the selected profile option.',
  SAVE_CHANGES: 'Save Changes',
  SAVE_OPTIONS: 'Save Options',
  CREATE_SUCCESS: 'Miscellaneous profile created successfully!',
  CREATE_ERROR: 'Failed to create miscellaneous profile',
  UPDATE_SUCCESS: 'Miscellaneous profile updated successfully!',
  UPDATE_ERROR: 'Failed to update miscellaneous profile',
  BULK_CREATE_SUCCESS: 'Miscellaneous profiles created successfully!',
  BULK_CREATE_ERROR: 'Failed to create miscellaneous profiles',
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
  {
    value: CategoryOptionCodeEnum.FfmcGroup,
    label: 'FFMC Group',
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
  [CategoryOptionCodeEnum.FfmcGroup]: 'FFMC Group',
} as const;

export const loadCategoryOptionCodeOptions = async (): Promise<AsyncSelectResponse> => {
  return {
    options: CATEGORY_OPTION_CODE_OPTIONS,
  };
};
