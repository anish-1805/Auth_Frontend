import { useAuthRedux } from './useAuthRedux';

// Re-export the useAuth hook from Redux for easier imports
export const useAuth = useAuthRedux;

// Additional auth-related hooks can be added here

// Hook to check if user has specific permissions (example)
export const usePermissions = () => {
  const { state } = useAuth();
  
  const hasPermission = (_permission: string): boolean => {
    // Implement your permission logic here
    // This is just an example - using underscore prefix to indicate unused parameter
    return state.user ? true : false;
  };

  const hasRole = (_role: string): boolean => {
    // Implement your role checking logic here
    // This is just an example - using underscore prefix to indicate unused parameter
    return state.user ? true : false;
  };

  return {
    hasPermission,
    hasRole,
  };
};

// Hook for auth loading states
export const useAuthLoading = () => {
  const { state } = useAuth();
  
  return {
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  };
};
