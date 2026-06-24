export type BookingMasterType = 'EXPENSE' | 'INCOME';

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
  interstateTransaction: boolean;
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
  interstateTransaction: boolean;
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

export interface IExpenseIncomeBookingMasterListQuery {
  type?: BookingMasterType;
  page?: number;
  limit?: number;
}

export interface IExpenseIncomeBookingMasterListResponse {
  data: IExpenseIncomeBookingMaster[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
