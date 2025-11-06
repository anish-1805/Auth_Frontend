/**
 * useSecureStorage Hook
 * 
 * React hook for using secure localStorage with encryption.
 * Provides a simple API similar to useState but with persistence.
 * 
 * @example
 * const [value, setValue, removeValue] = useSecureStorage('myKey', 'defaultValue');
 */

import { useState, useEffect, useCallback } from 'react';
import SecureStorage from '@/utils/secureStorage';

/**
 * Hook for secure localStorage with encryption
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 * @param expiresInMs - Optional expiration time in milliseconds
 */
export function useSecureStorage<T>(
  key: string,
  initialValue: T,
  expiresInMs?: number
): [T, (value: T) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from secure storage
      const item = SecureStorage.getItem<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error('useSecureStorage: Error reading from storage', error);
      return initialValue;
    }
  });

  // Return a wrapped version of setValue that persists to secure storage
  const setValue = useCallback(
    (value: T) => {
      try {
        // Save state
        setStoredValue(value);
        // Save to secure storage
        SecureStorage.setItem(key, value, expiresInMs);
      } catch (error) {
        console.error('useSecureStorage: Error saving to storage', error);
      }
    },
    [key, expiresInMs]
  );

  // Function to remove the value
  const removeValue = useCallback(() => {
    try {
      // Remove from state
      setStoredValue(initialValue);
      // Remove from secure storage
      SecureStorage.removeItem(key);
    } catch (error) {
      console.error('useSecureStorage: Error removing from storage', error);
    }
  }, [key, initialValue]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const item = SecureStorage.getItem<T>(key);
        if (item !== null) {
          setStoredValue(item);
        }
      } catch (error) {
        console.error('useSecureStorage: Error handling storage change', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

export default useSecureStorage;
