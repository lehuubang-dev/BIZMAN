import { apiClient } from './api';
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  SendOTPRequest,
  SendOTPResponse,
  ForgotPasswordRequest,
  VerifyOTPRequest,
  ResetPasswordRequest,
} from '../types';

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/api/v1/auth/login',
      credentials
    );

    // Save token if present - API may return accessToken at root or in data
    const accessToken = (response as any)?.accessToken ?? (response as any)?.data?.accessToken;
    if (accessToken) {
      await apiClient.setToken(accessToken);
    }

    return response;
  }

  /**
   * Send OTP for signup
   */
  async sendOTP(data: SendOTPRequest): Promise<SendOTPResponse> {
    return apiClient.post<SendOTPResponse>('/api/v1/auth/send-otp', data);
  }

  /**
   * Signup new user
   */
  async signup(data: SignupRequest): Promise<SignupResponse> {
    const response = await apiClient.post<SignupResponse>('/api/v1/auth/register', data);
    
    // Save token if present - handle both old and new response format
    if ((response as any).data?.accessToken) {
      await apiClient.setToken((response as any).data.accessToken);
    } else if ((response as any).token) {
      await apiClient.setToken((response as any).token);
    }
    
    return response;
  }

  /**
   * Send OTP for forgot password
   */
  async sendForgotPasswordOTP(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/api/v1/auth/forgot-password', data);
  }

  /**
   * Verify OTP
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<{ message: string; verified: boolean }> {
    return apiClient.post<{ message: string; verified: boolean }>('/api/v1/auth/verify-otp', data);
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/api/v1/auth/reset-password', data);
  }

  /**
   * Logout user
   */
  async logout() {
    await apiClient.setToken(null);
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return apiClient.getToken();
  }

  /**
   * Load token from storage
   */
  async loadToken(): Promise<string | null> {
    return await apiClient.loadToken();
  }

  /**
   * Set token manually
   */
  async setToken(token: string) {
    await apiClient.setToken(token);
  }
}

export const authService = new AuthService();
