import type {
  LoginFormData,
  LoginResponse,
  AuthError,
  User,
} from '../../modules/auth/types';

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
        const errorData: AuthError = await response.json().catch(() => ({
          message: 'Network error occurred',
        }));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred', { cause: error });
    }
  }

  async login(data: LoginFormData): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include', // Important for session-based auth
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
  ): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/verify-otp', {
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

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me', {
      method: 'GET',
      credentials: 'include',
    });
  }
}

export const authApi = new AuthAPI();
