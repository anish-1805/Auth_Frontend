import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkAuth } from '@/store/slices/authSlice';
import { selectIsInitialized } from '@/store/selectors/authSelectors';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import EmailVerification from '@/components/auth/EmailVerification';
import ForgotPassword from '@/components/auth/ForgotPassword';
import PasswordReset from '@/components/auth/PasswordReset';
import OAuthCallback from '@/components/auth/OAuthCallback';
import Dashboard from '@/components/Dashboard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import cleanupOldStorage from '@/utils/cleanupOldStorage';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

// Cleanup old redux-persist data on app load (run once)
if (!sessionStorage.getItem('storage_cleaned')) {
  cleanupOldStorage();
  sessionStorage.setItem('storage_cleaned', 'true');
}

// Public Route component - redirects to dashboard if already authenticated
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authState = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Show loading while checking authentication
  if (authState.isLoading || !authState.isInitialized) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard (or the page they came from)
  if (authState.isAuthenticated) {
    const locationState = location.state as { from?: { pathname: string } } | null;
    const from = locationState?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // If not authenticated, show the public page
  return <>{children}</>;
};

// Auth initialization component
const AuthChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectIsInitialized);

  useEffect(() => {
    if (!isInitialized) {
      dispatch(checkAuth());
    }
  }, [dispatch, isInitialized]);

  return <>{children}</>;
};

// App Routes component (needs to be inside Redux Provider)
const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <SignupForm />
            </PublicRoute>
          } 
        />
        <Route 
          path="/verify-email" 
          element={
            <PublicRoute>
              <EmailVerification />
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <PublicRoute>
              <PasswordReset />
            </PublicRoute>
          } 
        />
        <Route 
          path="/auth/callback" 
          element={
            <PublicRoute>
              <OAuthCallback />
            </PublicRoute>
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AuthChecker>
        <div className="app">
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </AuthChecker>
    </Provider>
  );
};

export default App;
