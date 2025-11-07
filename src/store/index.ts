import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { storageMiddleware } from './middleware/storageMiddleware';
import StorageService from '@/services/storageService';

// Load initial state from secure encrypted storage
const loadInitialState = () => {
  try {
    const user = StorageService.getUser();
    const authState = StorageService.getAuthState();

    return {
      auth: {
        user: user,
        isLoading: false,
        isAuthenticated: authState?.isAuthenticated || false,
        error: null,
        isInitialized: true,
      },
    };
  } catch (error) {
    console.error('Failed to load initial state from secure storage:', error);
    return undefined;
  }
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: loadInitialState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(storageMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
