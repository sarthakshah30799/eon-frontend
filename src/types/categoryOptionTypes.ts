export const CategoryOptionCodeEnum = {
  LocationType: 'locationType',
  RiskCategory: 'riskCategory',
  FinancialType: 'financialType',
  DefaultSign: 'defaultSign',
  DivisionDept: 'divisionDept',
  AccountType: 'accountType',
  SubLedger: 'subLedger',
  BankNature: 'bankNature',
  KycRiskCategory: 'kycRiskCategory',
  EntityType: 'entityType',
  DefaultAgent: 'defaultAgent',
  Group: 'group',
  MarketingExecutive: 'marketingExecutive',
  BusinessNature: 'businessNature',
  TdsGroup: 'tdsGroup',
  FfmcGroup: 'ffmcGroup',
  Master: 'MASTER',
  Transaction: 'TRANSACTION',
} as const;

export type CategoryOptionCode =
  (typeof CategoryOptionCodeEnum)[keyof typeof CategoryOptionCodeEnum];

export interface ICategoryOption {
  id: string;
  code: string;
  value: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateCategoryOption {
  code: CategoryOptionCode;
  value: string;
  label: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ICreateCategoryOptionBulkEntry {
  value: string;
  label: string;
}

export type IUpdateCategoryOption = Partial<ICreateCategoryOption>;
