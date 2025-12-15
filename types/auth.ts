export interface UserData {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserData;
  message?: string;
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
