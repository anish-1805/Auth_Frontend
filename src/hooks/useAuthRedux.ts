import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loginUser,
  signupUser,
  logoutUser,
  checkAuth,
  clearError,
  refreshToken,
} from '@/store/slices/authSlice';
import {
  selectAuthState,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectIsInitialized,
} from '@/store/selectors/authSelectors';
import { LoginFormData, SignupRequestData } from '@/types/auth';

export const useAuthRedux = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const authState = useAppSelector(selectAuthState);
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectAuthError);
  const isInitialized = useAppSelector(selectIsInitialized);

  // Actions
  const login = useCallback(
    async (data: LoginFormData): Promise<void> => {
      const result = await dispatch(loginUser(data));
      if (loginUser.rejected.match(result)) {
        throw new Error(result.payload as string);
      }
    },
    [dispatch]
  );

  const signup = useCallback(
    async (data: SignupRequestData): Promise<void> => {
      const result = await dispatch(signupUser(data));
      if (signupUser.rejected.match(result)) {
        throw new Error(result.payload as string);
      }
    },
    [dispatch]
  );

  const logout = useCallback(async (): Promise<void> => {
    await dispatch(logoutUser());
  }, [dispatch]);

  const checkAuthentication = useCallback(async (): Promise<void> => {
    await dispatch(checkAuth());
  }, [dispatch]);

  const refresh = useCallback(async (): Promise<void> => {
    const result = await dispatch(refreshToken());
    if (refreshToken.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
  }, [dispatch]);

  const clearAuthError = useCallback((): void => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State (compatible with previous Context API)
    state: {
      user,
      isLoading,
      isAuthenticated,
      error,
      isInitialized,
    },
    // Individual state properties for convenience
    user,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,
    authState,
    // Actions
    login,
    signup,
    logout,
    checkAuth: checkAuthentication,
    refreshToken: refresh,
    clearError: clearAuthError,
  };
};
