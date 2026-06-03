export const CategoryOptionCodeEnum = {
  LocationType: 'locationType',
  RiskCategory: 'riskCategory',
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
