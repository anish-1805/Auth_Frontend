import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginFormData, SignupRequestData } from '@/types/auth';
import { AuthService } from '@/services/authService';

// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

// Auth State Interface
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Initial State
const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  isInitialized: false,
};

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: LoginFormData, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(data);

      if (response.success && response.user) {
        return response.user;
      } else {
        return rejectWithValue(response.message || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error) || 'Login failed');
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (data: SignupRequestData, { rejectWithValue }) => {
    try {
      const response = await AuthService.signup(data);

      if (response.success) {
        return response.message || 'Signup successful';
      } else {
        return rejectWithValue(response.message || 'Signup failed');
      }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error) || 'Signup failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await AuthService.logout();
    return true;
  } catch (error) {
    // Even if logout fails on server, we should clear local state
    console.error('Logout error:', getErrorMessage(error));
    return true;
  }
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async () => {
  try {
    const user = await AuthService.checkAuth();
    return user;
  } catch (error) {
    // Return null for failed auth check instead of rejecting
    return null;
  }
});

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.refreshToken();

      if (response.success && response.user) {
        return response.user;
      } else {
        return rejectWithValue(response.message || 'Token refresh failed');
      }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error) || 'Token refresh failed');
    }
  }
);

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      console.log('🧹 Redux: Clearing error');
      state.error = null;
    },
    resetAuthState: (state) => {
      console.log('🔄 Redux: Resetting auth state - clearing all user data');
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
      state.isInitialized = true;
    },
    setUser: (state, action: PayloadAction<User>) => {
      console.log('👤 Redux: Setting user data:', action.payload);
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        console.log('⏳ Redux: Login pending - setting loading state');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log(
          '✅ Redux: Login successful - storing user data:',
          action.payload
        );
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log(
          '❌ Redux: Login failed - clearing user data, error:',
          action.payload
        );
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
        state.isInitialized = true;
      });

    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        console.log('⏳ Redux: Signup pending - setting loading state');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        console.log(
          '✅ Redux: Signup successful - user created (no auto-login)'
        );
        state.isLoading = false;
        state.error = null;
        // Don't auto-login after signup
        state.isAuthenticated = false;
        state.user = null;
        state.isInitialized = true;
      })
      .addCase(signupUser.rejected, (state, action) => {
        console.log('❌ Redux: Signup failed - error:', action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
        state.isInitialized = true;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        console.log('⏳ Redux: Logout pending - setting loading state');
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        console.log('🚪 Redux: Logout successful - clearing all user data');
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(logoutUser.rejected, (state) => {
        console.log(
          '🚪 Redux: Logout completed (even with error) - clearing all user data'
        );
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        state.isInitialized = true;
      });

    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        console.log('⏳ Redux: Checking auth status - setting loading state');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          console.log(
            '✅ Redux: Auth check successful - user is authenticated:',
            action.payload
          );
          state.isAuthenticated = true;
          state.user = action.payload;
        } else {
          console.log(
            '❌ Redux: Auth check failed - no valid session, clearing user data'
          );
          state.isAuthenticated = false;
          state.user = null;
        }
        state.error = null;
        state.isInitialized = true;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        console.log('⏳ Redux: Token refresh pending - setting loading state');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        console.log(
          '🔄 Redux: Token refresh successful - updating user data:',
          action.payload
        );
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        console.log(
          '❌ Redux: Token refresh failed - clearing user data, error:',
          action.payload
        );
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
        state.isInitialized = true;
      });
  },
});

export const { clearError, resetAuthState, setUser } = authSlice.actions;
export default authSlice.reducer;
