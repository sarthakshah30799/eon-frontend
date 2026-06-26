export interface ILoginFormData {
  email: string;
  password: string;
}

export interface ILoginResponse {
  message: string;
  requiresPasswordChange?: boolean;
}

export interface IAuthError {
  message: string | { message?: string; code?: string; details?: unknown };
  code?: string;
  details?: unknown;
}

export const PasswordValidationCodeEnum = {
  TooShort: 'PASSWORD_TOO_SHORT',
  TooLong: 'PASSWORD_TOO_LONG',
  MissingSpecialChars: 'PASSWORD_MISSING_SPECIAL_CHARS',
  MissingNumericChars: 'PASSWORD_MISSING_NUMERIC_CHARS',
  MissingAlphaChars: 'PASSWORD_MISSING_ALPHA_CHARS',
  AccountLocked: 'ACCOUNT_LOCKED',
  InvalidPolicyConfig: 'PASSWORD_POLICY_INVALID',
} as const;

export type PasswordValidationCode =
  (typeof PasswordValidationCodeEnum)[keyof typeof PasswordValidationCodeEnum];

export interface IPasswordPolicy {
  minLength: number;
  maxLength: number;
  minSpecialCharCount: number;
  minNumericCount: number;
  minAlphaCount: number;
  maxInvalidAttempts: number;
}

export interface IOtpFormData {
  email: string;
  otp: string;
}

export interface IUserAssignment {
  roleId: string;
  roleName?: string;
  branchId: string;
  branchName?: string;
  counterId: string;
  counterName?: string;
}

export interface IUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  lastLogin?: string;
  status?: 'active' | 'inactive' | 'suspended';
  isHo?: boolean;
  isHoStaff?: boolean;
  isAdmin?: boolean;
  branchId?: string;
  branchName?: string;
  counterId?: string;
  counterName?: string;
  counterNo?: number;
  assignments?: IUserAssignment[];
  permissions?: Record<string, string[]>;
}

export interface IWorkplaceSession {
  activeBranchId: string | null;
  activeCounterId: string | null;
}
