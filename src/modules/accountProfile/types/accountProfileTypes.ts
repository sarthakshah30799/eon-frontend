import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import type { IFinancialCode } from '@/modules/financialCodes/types/financialCodeTypes';
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
  financialCode?: IFinancialCode | null;
  financialSubProfileId?: string;
  financialSubCode?: string;
  pettyCashExpenseId: string;
  zeroBalanceAtEod: boolean;
  branchIdToTransfer?: string;
  branchToTransfer?: IBranchProfile | null;
  mapToAccountId?: string;
  mapToAccount?: IAccountProfile | null;
  doSale: boolean;
  doPurchase: boolean;
  doReceipt: boolean;
  doPayment: boolean;
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
  doSale?: boolean;
  doPurchase?: boolean;
  doReceipt?: boolean;
  doPayment?: boolean;
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
}

export interface IAccountProfileListResponse {
  data: IAccountProfile[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
