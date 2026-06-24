import type { AsyncSelectResponse } from '@/components/ui';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';

export interface CategoryOptionCodeOption {
  value: string;
  label: string;
  type?: 'DOCUMENT';
}

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

export const CATEGORY_OPTION_CODE_OPTIONS: CategoryOptionCodeOption[] = [
  {
    value: CategoryOptionCodeEnum.LocationType,
    label: 'LOCATION TYPE',
  },
  {
    value: CategoryOptionCodeEnum.RiskCategory,
    label: 'RISK CATEGORY',
  },
  {
    value: CategoryOptionCodeEnum.FinancialType,
    label: 'FINANCIAL TYPE',
  },
  {
    value: CategoryOptionCodeEnum.DefaultSign,
    label: 'DEFAULT SIGN',
  },
  {
    value: CategoryOptionCodeEnum.DivisionDept,
    label: 'DIVISION/DEPT',
  },
  {
    value: CategoryOptionCodeEnum.AccountType,
    label: 'ACCOUNT TYPE',
  },
  {
    value: CategoryOptionCodeEnum.SubLedger,
    label: 'SUB LEDGER',
  },
  {
    value: CategoryOptionCodeEnum.BankNature,
    label: 'BANK NATURE',
  },
  {
    value: CategoryOptionCodeEnum.KycRiskCategory,
    label: 'KYC RISK CATEGORY',
  },
  {
    value: CategoryOptionCodeEnum.EntityType,
    label: 'ENTITY TYPE',
  },
  {
    value: CategoryOptionCodeEnum.DefaultAgent,
    label: 'DEFAULT AGENT',
  },
  {
    value: CategoryOptionCodeEnum.Group,
    label: 'GROUP',
  },
  {
    value: CategoryOptionCodeEnum.DocumentGroup,
    label: 'DOCUMENT GROUP',
  },
  {
    value: CategoryOptionCodeEnum.MarketingExecutive,
    label: 'MARKETING EXECUTIVE',
  },
  {
    value: CategoryOptionCodeEnum.BusinessNature,
    label: 'BUSINESS NATURE',
  },
  {
    value: CategoryOptionCodeEnum.TdsGroup,
    label: 'TDS GROUP',
  },
  {
    value: CategoryOptionCodeEnum.FfmcGroup,
    label: 'FFMC GROUP',
  },
  {
    value: CategoryOptionCodeEnum.Master,
    label: 'MASTER',
    type: 'DOCUMENT',
  },
  {
    value: CategoryOptionCodeEnum.Transaction,
    label: 'TRANSACTION',
    type: 'DOCUMENT',
  },
];

export const CATEGORY_OPTION_CODE_LABELS = {
  [CategoryOptionCodeEnum.LocationType]: 'LOCATION TYPE',
  [CategoryOptionCodeEnum.RiskCategory]: 'RISK CATEGORY',
  [CategoryOptionCodeEnum.FinancialType]: 'FINANCIAL TYPE',
  [CategoryOptionCodeEnum.DefaultSign]: 'DEFAULT SIGN',
  [CategoryOptionCodeEnum.DivisionDept]: 'DIVISION/DEPT',
  [CategoryOptionCodeEnum.AccountType]: 'ACCOUNT TYPE',
  [CategoryOptionCodeEnum.SubLedger]: 'SUB LEDGER',
  [CategoryOptionCodeEnum.BankNature]: 'BANK NATURE',
  [CategoryOptionCodeEnum.KycRiskCategory]: 'KYC RISK CATEGORY',
  [CategoryOptionCodeEnum.EntityType]: 'ENTITY TYPE',
  [CategoryOptionCodeEnum.DefaultAgent]: 'DEFAULT AGENT',
  [CategoryOptionCodeEnum.Group]: 'GROUP',
  [CategoryOptionCodeEnum.DocumentGroup]: 'DOCUMENT GROUP',
  [CategoryOptionCodeEnum.MarketingExecutive]: 'MARKETING EXECUTIVE',
  [CategoryOptionCodeEnum.BusinessNature]: 'BUSINESS NATURE',
  [CategoryOptionCodeEnum.TdsGroup]: 'TDS GROUP',
  [CategoryOptionCodeEnum.FfmcGroup]: 'FFMC GROUP',
  [CategoryOptionCodeEnum.Master]: 'MASTER',
  [CategoryOptionCodeEnum.Transaction]: 'TRANSACTION',
} as const;

export const loadCategoryOptionCodeOptions =
  async (): Promise<AsyncSelectResponse> => {
    return {
      options: CATEGORY_OPTION_CODE_OPTIONS,
    };
  };
