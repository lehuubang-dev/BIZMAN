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
      '/auth/login',
      credentials
    );
    
    // Save token if present
    if (response.token) {
      apiClient.setToken(response.token);
    }
    
    return response;
  }

  /**
   * Send OTP for signup
   */
  async sendOTP(data: SendOTPRequest): Promise<SendOTPResponse> {
    return apiClient.post<SendOTPResponse>('/auth/send-otp', data);
  }

  /**
   * Signup new user
   */
  async signup(data: SignupRequest): Promise<SignupResponse> {
    const response = await apiClient.post<SignupResponse>('/auth/register', data);
    
    // Save token if present
    if (response.token) {
      apiClient.setToken(response.token);
    }
    
    return response;
  }

  /**
   * Send OTP for forgot password
   */
  async sendForgotPasswordOTP(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/forgot-password', data);
  }

  /**
   * Verify OTP
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<{ message: string; verified: boolean }> {
    return apiClient.post<{ message: string; verified: boolean }>('/auth/verify-otp', data);
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/reset-password', data);
  }

  /**
   * Logout user
   */
  logout() {
    apiClient.setToken(null);
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return apiClient.getToken();
  }

  /**
   * Set token manually
   */
  setToken(token: string) {
    apiClient.setToken(token);
  }
}

export const authService = new AuthService();
