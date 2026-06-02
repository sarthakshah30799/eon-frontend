import type {
  ILoginFormData,
  ILoginResponse,
  IAuthError,
  IUser,
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
        const errorData: IAuthError = await response.json().catch(() => ({
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

  async login(data: ILoginFormData): Promise<ILoginResponse> {
    return this.request<ILoginResponse>('/auth/login', {
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
