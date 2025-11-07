import api from './api';
import {
  LoginFormData,
  SignupRequestData,
  AuthResponse,
  User,
} from '@/types/auth';
import { AxiosError } from 'axios';

// Helper function to extract error message from Axios error
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message || defaultMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};

export class AuthService {
  // Login user
  static async login(data: LoginFormData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Login failed'));
    }
  }

  // Signup user
  static async signup(data: SignupRequestData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/signup', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Signup failed'));
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Logout failed'));
    }
  }

  // Check if user is authenticated
  static async checkAuth(): Promise<User | null> {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      // If 401, user is not authenticated
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401) {
          return null;
        }
      }
      throw new Error(getErrorMessage(error, 'Authentication check failed'));
    }
  }

  // Refresh token (if needed)
  static async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Token refresh failed'));
    }
  }

  // Verify signup OTP
  static async verifySignupOTP(data: {
    email: string;
    otp: string;
  }): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/verify-signup-otp', data);

      // If auto-login was successful, update auth context
      if (response.data.user && response.data.data?.autoLogin) {
        // The JWT cookie is automatically set by the backend
        // Return the response with user data for context update
        return response.data;
      }

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'OTP verification failed'));
    }
  }

  // Resend signup OTP
  static async resendSignupOTP(data: { email: string }): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/resend-signup-otp', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to resend OTP'));
    }
  }

  // Forgot password - send OTP
  static async forgotPassword(data: { email: string }): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/forgot-password', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to send reset code'));
    }
  }

  // Verify password reset OTP
  static async verifyPasswordResetOTP(data: {
    email: string;
    otp: string;
  }): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/verify-password-reset-otp', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'OTP verification failed'));
    }
  }

  // Reset password
  static async resetPassword(data: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Password reset failed'));
    }
  }

  // Google OAuth - Initiate login
  static getGoogleAuthUrl(): string {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${backendUrl}/api/auth/google`;
  }

  // Handle OAuth callback (if needed for additional processing)
  static async handleOAuthCallback(): Promise<User | null> {
    try {
      // After OAuth redirect, check if user is authenticated
      const user = await this.checkAuth();
      return user;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'OAuth authentication failed'));
    }
  }
}
