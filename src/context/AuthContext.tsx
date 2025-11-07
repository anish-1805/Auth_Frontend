import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { User, LoginFormData, SignupRequestData } from '@/types/auth';
import { AuthService } from '@/services/authService';

// Auth State
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Auth Context Type
interface AuthContextType {
  state: AuthState;
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupRequestData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

// Initial State
const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  isInitialized: false,
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
        isInitialized: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
        isInitialized: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null,
        isInitialized: true,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(false);

  // Check authentication status
  const checkAuth = useCallback(async (): Promise<void> => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingAuth) {
      return;
    }

    setIsCheckingAuth(true);
    dispatch({ type: 'AUTH_START' });

    try {
      const user = await AuthService.checkAuth();

      if (user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
    } finally {
      setIsCheckingAuth(false);
    }
  }, [isCheckingAuth]);

  // Check authentication on mount (only once)
  useEffect(() => {
    if (!state.isInitialized) {
      checkAuth();
    }
  }, [state.isInitialized]); // Remove checkAuth from dependencies

  // Login function
  const login = async (data: LoginFormData): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await AuthService.login(data);

      if (response.success && response.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error; // Re-throw to handle in component
    }
  };

  // Signup function
  const signup = async (data: SignupRequestData): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await AuthService.signup(data);

      if (response.success) {
        // For signup, we don't automatically log in the user
        // They need to login after successful signup
        dispatch({ type: 'LOGOUT' });
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Signup failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error; // Re-throw to handle in component
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      await AuthService.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      // Even if logout fails on server, clear local state
      dispatch({ type: 'LOGOUT' });
      console.error(
        'Logout error:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    state,
    login,
    signup,
    logout,
    checkAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
