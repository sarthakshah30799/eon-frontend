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
  details?: any;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
}
