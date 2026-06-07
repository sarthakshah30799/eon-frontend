import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import type { IFinancialCode } from '@/modules/financialCodes/types/financialCodeTypes';
import type { IBranchProfile } from '@/modules/branchProfile/types';

export interface IAccountProfile {
  id: string;
  divisionDept: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  subLedger: string;
  bankNature: string;
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

export interface ICreateAccountProfile {
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
}

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
