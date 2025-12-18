import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { ApiError } from '../types';
import { API_BASE_URL as ENV_API_BASE_URL } from '@env';

// API Base URL from environment variable with fallback
export const API_BASE_URL = ENV_API_BASE_URL || 'http://demoportal.ccvi.com.vn:8888/api/v1';

// API Configuration
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json, text/plain, */*',
};

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: 30000, // 30 seconds timeout
      headers: DEFAULT_HEADERS,
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        console.log('API Request:', {
          url: config.url,
          method: config.method?.toUpperCase(),
          baseURL: config.baseURL,
          headers: config.headers,
        });
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        const apiError: ApiError = this.handleAxiosError(error);
        console.error('API Error:', {
          url: error.config?.url,
          error: apiError,
        });
        return Promise.reject(apiError);
      }
    );
  }

  private handleAxiosError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as any;
      return {
        message: data?.message || 'An error occurred',
        code: data?.code,
        status: error.response.status,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: `Cannot connect to server. Please check your internet connection or API URL.`,
        status: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'Network error. Please check your connection.',
        status: 0,
      };
    }
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint, config);
    return response.data;
  }

  async post<T>(endpoint: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, body, config);
    return response.data;
  }

  async put<T>(endpoint: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, body, config);
    return response.data;
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint, config);
    return response.data;
  }

  async patch<T>(endpoint: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(endpoint, body, config);
    return response.data;
  }

  // Method to update base URL if needed
  updateBaseUrl(newBaseUrl: string) {
    this.axiosInstance.defaults.baseURL = newBaseUrl;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
