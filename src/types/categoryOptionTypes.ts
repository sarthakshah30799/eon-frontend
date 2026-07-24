export const CategoryOptionCodeEnum = {
  LocationType: 'LOCATIONTYPE',
  RiskCategory: 'RISKCATEGORY',
  FinancialType: 'FINANCIALTYPE',
  FinancialYear: 'FINANCIALYEAR',
  DefaultSign: 'DEFAULTSIGN',
  DivisionDept: 'DIVISIONDEPT',
  AccountType: 'ACCOUNTTYPE',
  SubLedger: 'SUBLEDGER',
  BankNature: 'BANKNATURE',
  KycRiskCategory: 'KYCRISKCATEGORY',
  EntityType: 'ENTITYTYPE',
  DefaultAgent: 'DEFAULTAGENT',
  Group: 'GROUP',
  DocumentGroup: 'DOCUMENTGROUP',
  MarketingExecutive: 'MARKETINGEXECUTIVE',
  BusinessNature: 'BUSINESSNATURE',
  TdsGroup: 'TDSGROUP',
  FfmcGroup: 'FFMCGROUP',
  Master: 'MASTER',
  Transaction: 'TRANSACTION',
  Segment: 'SEGMENT',
  Relationship: 'RELATIONSHIP',
  CommissionGiven: 'COMMISSIONGIVEN',
  ServicedBy: 'SERVICEDBY',
  Product: 'PRODUCT',
  Marketing: 'MARKETING',
  PassengerNationality: 'NATIONALITY',
  PassengerResidentStatus: 'RESIDENT',
  PassengerPanHolderRelation: 'RELATION',
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
