import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { AuthService } from '@/services/authService';
import './AuthForms.css';

// Validation schema
const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setServerError('');

    try {
      await AuthService.forgotPassword(data);
      
      toast.success('📧 Password reset code sent to your email!', {
        position: "top-right",
        autoClose: 4000,
      });

      // Navigate to password reset page
      navigate('/reset-password', { 
        state: { 
          email: data.email
        } 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset code. Please try again.';
      setServerError(errorMessage);
      
      toast.error(`⚠️ ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="forgot-password-icon">
            🔑
          </div>
          <h1>Forgot Password?</h1>
          <p>No worries! Enter your email and we'll send you a reset code.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {serverError && (
            <div className="error-message server-error">
              <span className="error-icon">⚠️</span>
              {serverError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <span className="label-icon">📧</span>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your registered email"
              {...register('email')}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <button
            type="submit"
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Sending Reset Code...
              </>
            ) : (
              <>
                <span className="button-icon">📤</span>
                Send Reset Code
              </>
            )}
          </button>
        </form>

        <div className="forgot-password-info">
          <div className="info-section">
            <h4>What happens next?</h4>
            <ol>
              <li>We'll send a 6-digit code to your email</li>
              <li>Enter the code on the next page</li>
              <li>Create your new password</li>
              <li>Log in with your new password</li>
            </ol>
          </div>

          <div className="security-note">
            <div className="security-icon">🛡️</div>
            <div>
              <strong>Security Note:</strong>
              <p>The reset code will expire in 5 minutes for your security.</p>
            </div>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="auth-link">
              <span className="link-icon">🔐</span>
              Sign In
            </Link>
          </p>
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              <span className="link-icon">✨</span>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
