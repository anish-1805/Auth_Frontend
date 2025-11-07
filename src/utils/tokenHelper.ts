import api from '../services/api';

/**
 * Get JWT token from httpOnly cookie
 * Note: This is a workaround since we can't directly access httpOnly cookies from JavaScript
 * The token will be sent automatically with HTTP requests via withCredentials
 * For Socket.IO, we'll use a different approach
 */

export const getTokenFromCookie = (): string | null => {
  // Try to get token from regular cookies (if available)
  // Cookie name is 'jwt', not 'token'
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'jwt') {
      return value;
    }
  }
  return null;
};

/**
 * Since the token is in httpOnly cookie, we need to request it from the backend
 * This function will be used to get a socket token
 * Uses axios to ensure cookies are sent properly (same as other API calls)
 */
export const requestSocketToken = async (): Promise<string | null> => {
  try {
    const response = await api.get('/auth/socket-token');

    if (response.data && response.data.token) {
      return response.data.token;
    }
    return null;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : (error as { response?: { data?: { error?: string } } })?.response?.data
            ?.error || 'Unknown error';
    console.error('Failed to get socket token:', errorMessage);
    return null;
  }
};
