export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
}

export interface AuthError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface OtpFormData {
  email: string;
  otp: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  lastLogin?: string;
  status?: 'active' | 'inactive' | 'suspended';
}
