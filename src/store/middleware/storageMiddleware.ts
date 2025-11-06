/**
 * Storage Persistence Middleware
 * 
 * Redux middleware that automatically persists auth state to secure storage
 * when certain actions are dispatched.
 * 
 * Features:
 * - Automatic persistence on auth state changes
 * - Secure encrypted storage
 * - Debounced writes to prevent excessive storage operations
 * - Type-safe implementation
 */

import { Middleware } from '@reduxjs/toolkit';
import StorageService from '@/services/storageService';
import type { AuthState } from '../slices/authSlice';

// Actions that trigger storage persistence
const PERSIST_ACTIONS = [
  'auth/login/fulfilled',
  'auth/signup/fulfilled',
  'auth/logout/fulfilled',
  'auth/checkAuth/fulfilled',
  'auth/refreshToken/fulfilled',
  'auth/setUser',
  'auth/resetAuthState',
];

// Debounce timer
let debounceTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 500; // 500ms

// Type guard for action with type property
const hasType = (action: unknown): action is { type: string } => {
  return typeof action === 'object' && action !== null && 'type' in action;
};

/**
 * Storage Persistence Middleware
 */
export const storageMiddleware: Middleware = (store) => (next) => (action) => {
  // Pass the action to the next middleware/reducer
  const result = next(action);

  // Check if this action should trigger persistence
  if (hasType(action) && PERSIST_ACTIONS.includes(action.type)) {
    // Clear existing debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Debounce the storage operation
    debounceTimer = setTimeout(() => {
      const state = store.getState() as { auth: AuthState };
      const { user, isAuthenticated } = state.auth;

      try {
        // Save auth state
        StorageService.saveAuthState(isAuthenticated);

        // Save user data if authenticated
        if (isAuthenticated && user) {
          const rememberMe = StorageService.isRememberMeEnabled();
          StorageService.saveUser(user, rememberMe);
          console.log('💾 StorageMiddleware: Auth state persisted to secure storage');
        } else {
          // Clear user data if not authenticated
          StorageService.removeUser();
          console.log('🗑️ StorageMiddleware: User data removed from secure storage');
        }
      } catch (error) {
        console.error('❌ StorageMiddleware: Failed to persist auth state', error);
      }
    }, DEBOUNCE_DELAY);
  }

  return result;
};

export default storageMiddleware;
