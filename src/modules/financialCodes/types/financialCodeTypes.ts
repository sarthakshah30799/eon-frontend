import type { ICategoryOption } from '@/types/categoryOptionTypes';
import type { IOffsetPaginationParams, IPaginatedResponse } from '@/types/pagination';

export interface IFinancialSubProfileNested {
  id?: string;
  financialSubCode: string;
  financialSubName: string;
  priority: number;
}

export interface IFinancialCode {
  id: string;
  financialType: ICategoryOption | null;
  financialCode: string;
  financialName: string;
  defaultSign: ICategoryOption | null;
  priority: number;
  subProfiles?: IFinancialSubProfileNested[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type ICreateFinancialCode = Omit<
  IFinancialCode,
  | 'id'
  | 'financialType'
  | 'defaultSign'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
> & {
  financialType?: string;
  defaultSign?: string;
};

export type IUpdateFinancialCode = Partial<ICreateFinancialCode>;

export interface IFinancialCodeListQuery extends IOffsetPaginationParams {
  search?: string;
  financialType?: string;
  financialCode?: string;
  financialName?: string;
}

export type IFinancialCodeListResponse = IPaginatedResponse<IFinancialCode>;
