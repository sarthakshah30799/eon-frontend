export interface ILoginFormData {
  email: string;
  password: string;
}

export interface ILoginResponse {
  message: string;
  requiresPasswordChange?: boolean;
}

export interface IAuthError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface IOtpFormData {
  email: string;
  otp: string;
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
  isAdmin?: boolean;
  permissions?: Record<string, string[]>;
}
