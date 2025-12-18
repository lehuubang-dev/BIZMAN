import { ApiError } from '../types';
import { API_BASE_URL as ENV_API_BASE_URL } from '@env';

// API Base URL from environment variable with fallback
export const API_BASE_URL = ENV_API_BASE_URL || 'https://api.eduhubvn.com/api/v1';

// API Configuration
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json, text/plain, */*',
};

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { ...DEFAULT_HEADERS };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    console.log('API Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
    });

    try {
      const response = await fetch(url, config);
      let data: any = null;
      // Always read as text first to avoid JSON parse errors
      if (response.status === 204) {
        data = {};
      } else {
        const text = await response.text();
        if (text && text.length > 0) {
          try {
            data = JSON.parse(text);
          } catch {
            // Not JSON; return as message payload
            data = { message: text };
          }
        } else {
          data = {};
        }
      }

      if (!response.ok) {
        const error: ApiError = {
          message: data?.message || 'An error occurred',
          code: data?.code,
          status: response.status,
        };
        throw error;
      }

      return data as T;
    } catch (error) {
      console.error('API Error:', {
        url,
        error,
        message: (error as any)?.message,
      });
      
      if ((error as ApiError).message) {
        throw error;
      }
      
      // More specific error messages
      const errorMessage = (error as any)?.message || '';
      if (errorMessage.includes('Network request failed') || errorMessage.includes('fetch failed')) {
        throw {
          message: `Cannot connect to server: ${this.baseUrl}. Please check your internet connection or API URL.`,
          status: 0,
        } as ApiError;
      }
      
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      } as ApiError;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
