import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { signupSchema, SignupFormData } from '@/validations/authSchemas';
import { AuthService } from '@/services/authService';
import GoogleLoginButton from '@/components/common/GoogleLoginButton';
import './AuthForms.css';

const SignupForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    clearErrors,
    watch,
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'firstError',
  });

  // Watch form values to clear errors when fields are emptied
  const watchedValues = watch();

  useEffect(() => {
    // Clear errors immediately when field becomes empty
    const nameValue = watchedValues.name || '';
    const emailValue = watchedValues.email || '';
    const passwordValue = watchedValues.password || '';
    const confirmPasswordValue = watchedValues.confirmPassword || '';

    if (nameValue.trim() === '') {
      clearErrors('name');
    }
    if (emailValue.trim() === '') {
      clearErrors('email');
    }
    if (passwordValue.trim() === '') {
      clearErrors('password');
    }
    if (confirmPasswordValue.trim() === '') {
      clearErrors('confirmPassword');
    }

    // Clear server error when user starts typing
    if (
      serverError &&
      (nameValue || emailValue || passwordValue || confirmPasswordValue)
    ) {
      setServerError('');
    }
  }, [
    watchedValues.name,
    watchedValues.email,
    watchedValues.password,
    watchedValues.confirmPassword,
    clearErrors,
    serverError,
  ]);

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setServerError('');

    try {
      // Remove confirmPassword from data before sending to backend
      const { confirmPassword, ...signupData } = data;
      const response = await AuthService.signup(signupData);

      if (response.success) {
        // Reset form
        reset();

        // Show success toast
        toast.success(
          '🎉 Account created successfully! Please login to continue.',
          {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );

        // Redirect to email verification page
        navigate('/verify-email', {
          state: {
            email: signupData.email,
          },
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Signup failed. Please try again.';

      // Show different toast messages based on error type
      if (
        errorMessage.toLowerCase().includes('email') &&
        errorMessage.toLowerCase().includes('exists')
      ) {
        toast.error(
          '📧 Email already exists! Please use a different email or try logging in.',
          {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
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
    toast.error(`Google signup failed: ${error}`, {
      position: 'top-right',
      autoClose: 5000,
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {serverError && (
            <div className="error-message server-error">{serverError}</div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your full name"
              {...register('name')}
            />
            {errors.name && (
              <span className="error-message">{errors.name.message}</span>
            )}
          </div>

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
              placeholder="Create a strong password"
              {...register('password')}
            />
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
            <div className="password-requirements">
              <small>
                Password must contain at least 8 characters with uppercase,
                lowercase, number, and special character.
              </small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <span className="error-message">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !isValid}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <GoogleLoginButton
            onError={handleGoogleError}
            isLoading={isLoading}
            mode="signup"
          />
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
