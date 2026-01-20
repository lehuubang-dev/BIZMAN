export interface UserData {
  userId: string;
  email: string;
  role: string;
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  code: string;
  message: string;
  data: LoginData;
}

export interface SendOTPRequest {
  email: string;
}

export interface SendOTPResponse {
  message: string;
}

export interface SignupRequest {
  phone: string;
  email: string;
  password: string;
  role: string;
  otp: string;
}

export interface SignupResponse {
  message: string;
  user?: UserData;
  token?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
