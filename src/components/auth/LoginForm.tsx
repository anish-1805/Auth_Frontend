import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginSchema, LoginFormData } from '@/validations/authSchemas';
import { useAuth } from '@/hooks/useAuth';
import GoogleLoginButton from '@/components/common/GoogleLoginButton';
import './AuthForms.css';

const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state, default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    clearErrors,
    watch,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'firstError',
  });

  // Watch form values to clear errors when fields are emptied
  const watchedValues = watch();

  useEffect(() => {
    // Clear errors immediately when field becomes empty
    const emailValue = watchedValues.email || '';
    const passwordValue = watchedValues.password || '';

    if (emailValue.trim() === '') {
      clearErrors('email');
    }
    if (passwordValue.trim() === '') {
      clearErrors('password');
    }

    // Clear server error when user starts typing
    if (serverError && (emailValue || passwordValue)) {
      setServerError('');
    }
  }, [watchedValues.email, watchedValues.password, clearErrors, serverError]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError('');

    try {
      await login(data);

      // Show success toast
      toast.success('Login successful! Welcome back!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Redirect to the intended page or dashboard
      navigate(from, { replace: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Login failed. Please check your credentials.';

      // Show different toast messages based on error type
      if (
        errorMessage.toLowerCase().includes('password') ||
        errorMessage.toLowerCase().includes('invalid email or password') ||
        errorMessage.toLowerCase().includes('credentials')
      ) {
        toast.error(
          '❌ Wrong password! Please check your credentials and try again.',
          {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      } else if (errorMessage.toLowerCase().includes('email')) {
        toast.error('📧 Email not found! Please check your email address.', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error(`⚠️ ${errorMessage}`, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error: string) => {
    toast.error(`Google login failed: ${error}`, {
      position: 'top-right',
      autoClose: 5000,
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {serverError && (
            <div className="error-message server-error">{serverError}</div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              {...register('email')}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              {...register('password')}
            />
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <div className="form-options">
            <Link to="/forgot-password" className="forgot-password-link">
              <span className="link-icon">🔑</span>
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !isValid}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <GoogleLoginButton
            onError={handleGoogleError}
            isLoading={isLoading}
            mode="login"
          />
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
