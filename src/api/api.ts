import { dispatchSessionExpired } from '@/lib/authSessionEvents';
import { API_BASE_URL } from '@/config/api';

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

interface ApiDownloadResponse {
  blob: Blob;
  filename?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = new Headers(options.headers);
      if (options.body instanceof FormData) {
        headers.delete('Content-Type');
      } else if (options.body !== undefined && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          dispatchSessionExpired({
            message:
              typeof errorData?.message === 'string'
                ? errorData.message
                : undefined,
            status: response.status,
          });
        }
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text();
      return { data };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  private async requestBlob(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<ApiDownloadResponse>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = new Headers(options.headers);
      if (options.body instanceof FormData) {
        headers.delete('Content-Type');
      } else if (options.body !== undefined && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          dispatchSessionExpired({
            message:
              typeof errorData?.message === 'string'
                ? errorData.message
                : undefined,
            status: response.status,
          });
        }
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const disposition = response.headers.get('content-disposition') || '';
      const filenameMatch = disposition.match(
        /filename="?([^"]+)"?/i
      );
      return {
        data: {
          blob: await response.blob(),
          filename: filenameMatch?.[1],
        },
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  async get<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async postFormData<T>(
    endpoint: string,
    data: FormData,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data,
    });
  }

  async postDownload(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<ApiDownloadResponse>> {
    return this.requestBlob(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient();
