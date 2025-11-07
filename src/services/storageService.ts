/**
 * Storage Service
 *
 * Manages application storage with secure localStorage for sensitive data
 * and regular localStorage for non-sensitive data.
 *
 * Features:
 * - Secure encrypted storage for auth tokens and sensitive data
 * - Regular storage for user preferences
 * - Type-safe API
 * - Automatic cleanup
 */

import SecureStorage from '@/utils/secureStorage';
import { User } from '@/types/auth';

// Storage keys
export const STORAGE_KEYS = {
  // Secure storage keys (encrypted)
  USER_DATA: 'user_data',
  AUTH_STATE: 'auth_state',
  REMEMBER_ME: 'remember_me',

  // Regular storage keys (not encrypted - for non-sensitive data)
  THEME: 'theme',
  LANGUAGE: 'language',
  USER_PREFERENCES: 'user_preferences',
  LAST_LOGIN_EMAIL: 'last_login_email',
} as const;

// Storage expiration times (in milliseconds)
export const STORAGE_EXPIRATION = {
  USER_DATA: 7 * 24 * 60 * 60 * 1000, // 7 days
  AUTH_STATE: 7 * 24 * 60 * 60 * 1000, // 7 days
  REMEMBER_ME: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

/**
 * User preferences interface
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: boolean;
  emailNotifications?: boolean;
}

/**
 * Auth state for persistence
 */
export interface PersistedAuthState {
  isAuthenticated: boolean;
  lastChecked: number;
}

/**
 * Storage Service Class
 */
export class StorageService {
  // ==================== Secure Storage Methods ====================

  /**
   * Save user data securely
   */
  static saveUser(user: User, rememberMe: boolean = false): void {
    try {
      const expiration = rememberMe
        ? STORAGE_EXPIRATION.REMEMBER_ME
        : STORAGE_EXPIRATION.USER_DATA;

      SecureStorage.setItem(STORAGE_KEYS.USER_DATA, user, expiration);
      SecureStorage.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe, expiration);

      console.log('✅ StorageService: User data saved securely');
    } catch (error) {
      console.error('❌ StorageService: Failed to save user data', error);
    }
  }

  /**
   * Get user data from secure storage
   */
  static getUser(): User | null {
    try {
      const user = SecureStorage.getItem<User>(STORAGE_KEYS.USER_DATA);
      if (user) {
        console.log(
          '✅ StorageService: User data retrieved from secure storage'
        );
      }
      return user;
    } catch (error) {
      console.error('❌ StorageService: Failed to get user data', error);
      return null;
    }
  }

  /**
   * Remove user data from secure storage
   */
  static removeUser(): void {
    try {
      SecureStorage.removeItem(STORAGE_KEYS.USER_DATA);
      SecureStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      console.log('✅ StorageService: User data removed from secure storage');
    } catch (error) {
      console.error('❌ StorageService: Failed to remove user data', error);
    }
  }

  /**
   * Save auth state securely
   */
  static saveAuthState(isAuthenticated: boolean): void {
    try {
      const authState: PersistedAuthState = {
        isAuthenticated,
        lastChecked: Date.now(),
      };

      SecureStorage.setItem(
        STORAGE_KEYS.AUTH_STATE,
        authState,
        STORAGE_EXPIRATION.AUTH_STATE
      );

      console.log('✅ StorageService: Auth state saved securely');
    } catch (error) {
      console.error('❌ StorageService: Failed to save auth state', error);
    }
  }

  /**
   * Get auth state from secure storage
   */
  static getAuthState(): PersistedAuthState | null {
    try {
      return SecureStorage.getItem<PersistedAuthState>(STORAGE_KEYS.AUTH_STATE);
    } catch (error) {
      console.error('❌ StorageService: Failed to get auth state', error);
      return null;
    }
  }

  /**
   * Remove auth state from secure storage
   */
  static removeAuthState(): void {
    try {
      SecureStorage.removeItem(STORAGE_KEYS.AUTH_STATE);
      console.log('✅ StorageService: Auth state removed from secure storage');
    } catch (error) {
      console.error('❌ StorageService: Failed to remove auth state', error);
    }
  }

  /**
   * Check if remember me is enabled
   */
  static isRememberMeEnabled(): boolean {
    try {
      return SecureStorage.getItem<boolean>(STORAGE_KEYS.REMEMBER_ME) || false;
    } catch (error) {
      console.error('❌ StorageService: Failed to check remember me', error);
      return false;
    }
  }

  // ==================== Regular Storage Methods ====================

  /**
   * Save user preferences (non-sensitive)
   */
  static savePreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(preferences)
      );
      console.log('✅ StorageService: User preferences saved');
    } catch (error) {
      console.error('❌ StorageService: Failed to save preferences', error);
    }
  }

  /**
   * Get user preferences
   */
  static getPreferences(): UserPreferences | null {
    try {
      const preferences = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
      console.error('❌ StorageService: Failed to get preferences', error);
      return null;
    }
  }

  /**
   * Save theme preference
   */
  static saveTheme(theme: 'light' | 'dark' | 'system'): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error('❌ StorageService: Failed to save theme', error);
    }
  }

  /**
   * Get theme preference
   */
  static getTheme(): 'light' | 'dark' | 'system' | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) as
        | 'light'
        | 'dark'
        | 'system'
        | null;
    } catch (error) {
      console.error('❌ StorageService: Failed to get theme', error);
      return null;
    }
  }

  /**
   * Save last login email (for convenience, not sensitive)
   */
  static saveLastLoginEmail(email: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_LOGIN_EMAIL, email);
    } catch (error) {
      console.error(
        '❌ StorageService: Failed to save last login email',
        error
      );
    }
  }

  /**
   * Get last login email
   */
  static getLastLoginEmail(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_LOGIN_EMAIL);
    } catch (error) {
      console.error('❌ StorageService: Failed to get last login email', error);
      return null;
    }
  }

  // ==================== Cleanup Methods ====================

  /**
   * Clear all auth-related storage (secure and regular)
   */
  static clearAuthStorage(): void {
    try {
      this.removeUser();
      this.removeAuthState();
      console.log('✅ StorageService: All auth storage cleared');
    } catch (error) {
      console.error('❌ StorageService: Failed to clear auth storage', error);
    }
  }

  /**
   * Clear all application storage
   */
  static clearAllStorage(): void {
    try {
      SecureStorage.clear();
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ StorageService: All storage cleared');
    } catch (error) {
      console.error('❌ StorageService: Failed to clear all storage', error);
    }
  }

  /**
   * Get storage info for debugging
   */
  static getStorageInfo(): {
    secureStorageSize: number;
    localStorageSize: number;
    secureKeys: string[];
  } {
    try {
      return {
        secureStorageSize: SecureStorage.getStorageSize(),
        localStorageSize: new Blob([JSON.stringify(localStorage)]).size,
        secureKeys: SecureStorage.getAllKeys(),
      };
    } catch (error) {
      console.error('❌ StorageService: Failed to get storage info', error);
      return {
        secureStorageSize: 0,
        localStorageSize: 0,
        secureKeys: [],
      };
    }
  }
}

export default StorageService;
