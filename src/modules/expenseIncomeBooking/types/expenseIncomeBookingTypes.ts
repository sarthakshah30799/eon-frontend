export type BookingMasterType = 'EXPENSE' | 'INCOME';

import type {
  IOffsetPaginationParams,
  IPaginatedResponse,
} from '@/types/pagination';

export interface ITdsAccountSummary {
  id: string;
  accountCode: string;
  accountName: string;
}

export interface IExpenseIncomeBookingMaster {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  type: BookingMasterType;
  code: string;
  description: string | null;
  applicableCustomer: boolean;
  applicableVendor: boolean;
  applicableEmployee: boolean;
  applicableAgent: boolean;
  applicableCardIssuer: boolean;
  active: boolean;
  allowRecPay: boolean;
  totalGst: number;
  tdsApplicable: boolean;
  tdsValue: number;
  tdsAccountId: string | null;
  tdsAccount: ITdsAccountSummary | null;
  from: string | null;
  to: string | null;
}

export interface ICreateExpenseIncomeBookingMaster {
  type: BookingMasterType;
  code: string;
  description: string | null;
  applicableCustomer: boolean;
  applicableVendor: boolean;
  applicableEmployee: boolean;
  applicableAgent: boolean;
  applicableCardIssuer: boolean;
  active: boolean;
  allowRecPay: boolean;
  totalGst: number;
  tdsApplicable: boolean;
  tdsValue: number;
  tdsAccountId: string | null;
  from: string | null;
  to: string | null;
}

export interface IExpenseIncomeBookingMasterListQuery extends IOffsetPaginationParams {
  type?: BookingMasterType;
  search?: string;
}

export type IExpenseIncomeBookingMasterListResponse =
  IPaginatedResponse<IExpenseIncomeBookingMaster>;
