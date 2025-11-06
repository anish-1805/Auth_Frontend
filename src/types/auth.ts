// Authentication related types
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupRequestData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  data?: {
    emailVerified?: boolean;
    autoLogin?: boolean;
    otpSent?: boolean;
    expiresIn?: string;
    passwordReset?: boolean;
  };
}

export interface AuthError {
  message: string;
  field?: string;
  code?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
