import type {
  ILoginFormData,
  ILoginResponse,
  IAuthError,
  IUser,
} from '../../modules/auth/types';
import { dispatchSessionExpired } from '@/lib/authSessionEvents';

const SESSION_PROTECTED_ENDPOINTS = new Set([
  '/auth/setup-password',
  '/auth/logout',
  '/auth/me',
  '/auth/check',
  '/auth/sessions',
]);

export class ApiError extends Error {
  code?: string;
  details?: unknown;
  status?: number;

  constructor(message: string, options?: { code?: string; details?: unknown; status?: number }) {
    super(message);
    this.name = 'ApiError';
    this.code = options?.code;
    this.details = options?.details;
    this.status = options?.status;
  }
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class AuthAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData: IAuthError & { error?: string } = await response.json().catch(() => ({
          message: 'Network error occurred',
        }));
        if (response.status === 401 && SESSION_PROTECTED_ENDPOINTS.has(endpoint)) {
          const errorMessage =
            typeof errorData.message === 'string'
              ? errorData.message
              : typeof errorData.message === 'object' && errorData.message !== null
                ? errorData.message.message
                : undefined;
          dispatchSessionExpired({
            message: errorMessage,
            status: response.status,
          });
        }
        const nestedResponse =
          typeof errorData.message === 'object' && errorData.message !== null
            ? errorData.message
            : undefined;
        const nestedMessage =
          nestedResponse
            ? nestedResponse.message
            : undefined;
        const code = errorData.code || nestedResponse?.code;
        const details = errorData.details || nestedResponse?.details;
        const message =
          typeof errorData.message === 'string'
            ? errorData.message
            : typeof nestedMessage === 'string'
              ? nestedMessage
              : errorData.error || `HTTP error! status: ${response.status}`;

        throw new ApiError(message, {
          code,
          details,
          status: response.status,
        });
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred', { cause: error });
    }
  }

  async login(data: ILoginFormData): Promise<ILoginResponse> {
    return this.request<ILoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include', // Important for session-based auth
    });
  }

  async completeInitialPassword(password: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/setup-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
      credentials: 'include',
    });
  }

  async sendOtp(
    countryCode: string,
    mobileNumber: string
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ countryCode, mobileNumber }),
      credentials: 'include',
    });
  }

  async verifyOtp(
    countryCode: string,
    mobileNumber: string,
    otp: string
  ): Promise<ILoginResponse> {
    return this.request<ILoginResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ countryCode, mobileNumber, otp }),
      credentials: 'include',
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  }

  async getCurrentUser(): Promise<IUser> {
    return this.request<IUser>('/auth/me', {
      method: 'GET',
      credentials: 'include',
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(data: {
    email: string;
    token: string;
    password: string;
  }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}


export const authApi = new AuthAPI();
