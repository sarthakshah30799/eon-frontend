export interface ICountryAccessRule {
  id: string;
  countryId: string;
  branchId: string;
  userId: string;
  branchName: string | null;
  userName: string | null;
  isActive: boolean;
  revokedAt?: string | null;
  revokedBy?: string | null;
}

export interface IMonthlyLockWindow {
  id: string;
  branchId: string;
  userId: string;
  branchName: string | null;
  userName: string | null;
  fromDate: string;
  toDate: string;
  isActive: boolean;
  revokedAt?: string | null;
  revokedBy?: string | null;
}

export type ITransactionBackdateWindow = IMonthlyLockWindow;

export interface ICreateCountryAccessRuleInput {
  branchId: string;
  userId: string;
}

export interface ICreateCountryAccessRulesPayload {
  rules: ICreateCountryAccessRuleInput[];
}

export interface ICreateMonthlyLockInput {
  branchId: string;
  userId: string;
  fromDate: string;
  toDate: string;
}

export interface ICreateMonthlyLocksPayload {
  rules: ICreateMonthlyLockInput[];
}

export type ICreateBackdateWindowInput = ICreateMonthlyLockInput;
export type ICreateBackdateWindowsPayload = ICreateMonthlyLocksPayload;
