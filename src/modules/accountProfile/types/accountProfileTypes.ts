import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import type { IBranchProfile } from '@/modules/branchProfile/types';
import type { ICategoryOption } from '@/types/categoryOptionTypes';

export interface IAccountProfile {
  id: string;
  divisionDept: ICategoryOption | null;
  accountCode: string;
  accountName: string;
  accountType: ICategoryOption | null;
  subLedger: ICategoryOption | null;
  bankNature: ICategoryOption | null;
  currencyId: string;
  currencyCode?: string;
  currency?: ICurrencyProfile | null;
  financialCodeId: string;
  financialCode?: string;
  financialSubProfileId?: string;
  financialSubCode?: string;
  pettyCashExpenseId: string;
  zeroBalanceAtEod: boolean;
  branchIdToTransfer?: string;
  branchToTransfer?: IBranchProfile | null;
  mapToAccountId?: string;
  mapToAccount?: IAccountProfile | null;
  retailSale: boolean;
  retailPurchase: boolean;
  bulkSale: boolean;
  bulkPurchase: boolean;
  expense: boolean;
  receipt: boolean;
  payment: boolean;
  journalVoucher: boolean;
  active: boolean;
  cmsBank: boolean;
  directRemittance: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ICreateAccountProfile = Omit<
  IAccountProfile,
  | 'id'
  | 'divisionDept'
  | 'accountType'
  | 'subLedger'
  | 'bankNature'
  | 'currency'
  | 'currencyCode'
  | 'financialCode'
  | 'financialSubCode'
  | 'branchToTransfer'
  | 'mapToAccount'
  | 'createdAt'
  | 'updatedAt'
> & {
  divisionDept?: string;
  accountCode: string;
  accountName: string;
  accountType?: string;
  subLedger?: string;
  bankNature?: string;
  currencyId: string;
  financialCodeId: string;
  financialType?: string;
  financialSubProfileId?: string;
  pettyCashExpenseId?: string;
  zeroBalanceAtEod?: boolean;
  branchIdToTransfer?: string;
  mapToAccountId?: string;
  retailSale?: boolean;
  retailPurchase?: boolean;
  bulkSale?: boolean;
  bulkPurchase?: boolean;
  expense?: boolean;
  receipt?: boolean;
  payment?: boolean;
  journalVoucher?: boolean;
  active?: boolean;
  cmsBank?: boolean;
  directRemittance?: boolean;
};

export interface IAccountProfileListQuery {
  page?: number;
  limit?: number;
  search?: string;
  accountCode?: string;
  accountName?: string;
  financialCodeId?: string;
  currencyId?: string;
  active?: boolean;
  activeOnly?: boolean;
  bulkPurchase?: boolean;
}

export interface IAccountProfileListResponse {
  data: IAccountProfile[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
