export interface IFinancialSubProfileNested {
  id?: string;
  financialSubCode: string;
  financialSubName: string;
  priority: number;
}

export interface IFinancialCode {
  id: string;
  financialType: string;
  financialCode: string;
  financialName: string;
  defaultSign: string;
  priority: number;
  subProfiles?: IFinancialSubProfileNested[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type ICreateFinancialCode = Omit<
  IFinancialCode,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export type IUpdateFinancialCode = Partial<ICreateFinancialCode>;

export interface IFinancialCodeListQuery {
  page?: number;
  limit?: number;
  search?: string;
  financialType?: string;
  financialCode?: string;
  financialName?: string;
}

export interface IFinancialCodeListResponse {
  data: IFinancialCode[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
