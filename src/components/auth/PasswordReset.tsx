import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import OTPInput from '@/components/common/OTPInput';
import { AuthService } from '@/services/authService';
import './AuthForms.css';

// Validation schema for new password
const passwordSchema = yup.object({
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

type PasswordFormData = yup.InferType<typeof passwordSchema>;

type ResetStep = 'otp' | 'password';

const PasswordReset: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<ResetStep>('otp');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verifiedOTP, setVerifiedOTP] = useState('');
  const [countdown, setCountdown] = useState(0); // Countdown in seconds
  const [canResend, setCanResend] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state
  const email = location.state?.email || '';
  
  // OTP expiry time in seconds (5 minutes)
  const OTP_EXPIRY_TIME = 300;

  useEffect(() => {
    // Redirect if no email provided
    if (!email) {
      navigate('/forgot-password');
      return;
    }
  }, [email, navigate]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    clearErrors,
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
    mode: 'onBlur',
  });

  // Watch form values for clearing errors
  const watchedValues = watch();
  
  useEffect(() => {
    if (currentStep === 'password') {
      if (!watchedValues.newPassword || watchedValues.newPassword.trim() === '') {
        clearErrors('newPassword');
      }
      if (!watchedValues.confirmPassword || watchedValues.confirmPassword.trim() === '') {
        clearErrors('confirmPassword');
      }
      
      if (serverError && (watchedValues.newPassword || watchedValues.confirmPassword)) {
        setServerError('');
      }
    }
  }, [watchedValues.newPassword, watchedValues.confirmPassword, clearErrors, serverError, currentStep]);

  // Handle OTP verification
  const handleOTPComplete = async (otp: string) => {
    setIsLoading(true);
    setError('');

    try {
      await AuthService.verifyPasswordResetOTP({ email, otp });
      
      setVerifiedOTP(otp);
      setCurrentStep('password');
      
      toast.success('✅ Code verified! Now create your new password.', {
        position: "top-right",
        autoClose: 3000,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid or expired code. Please try again.';
      setError(errorMessage);
      
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendCode = async () => {
    if (!canResend) return;

    setIsResending(true);
    setError('');
    setCanResend(false);

    try {
      await AuthService.forgotPassword({ email });
      
      // Start countdown timer
      setCountdown(OTP_EXPIRY_TIME);
      
      toast.success('📧 New reset code sent to your email!', {
        position: "top-right",
        autoClose: 4000,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend reset code.';
      setError(errorMessage);
      
      // Re-enable resend button on error
      setCanResend(true);
      
      toast.error(`⚠️ ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsResending(false);
    }
  };

  // Handle password reset
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    setServerError('');

    try {
      await AuthService.resetPassword({
        email,
        otp: verifiedOTP,
        newPassword: data.newPassword
      });
      
      toast.success('🎉 Password reset successfully! You can now log in with your new password.', {
        position: "top-right",
        autoClose: 5000,
      });

      // Navigate to login page
      navigate('/login', { 
        state: { 
          message: 'Password reset successfully! Please log in with your new password.',
          email: email 
        } 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password. Please try again.';
      setServerError(errorMessage);
      
      if (errorMessage.toLowerCase().includes('expired') || errorMessage.toLowerCase().includes('invalid')) {
        toast.error('🔄 Reset code expired. Please request a new one.', {
          position: "top-right",
          autoClose: 5000,
        });
        
        // Go back to OTP step
        setCurrentStep('otp');
        setVerifiedOTP('');
      } else {
        toast.error(`⚠️ ${errorMessage}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to OTP step
  const goBackToOTP = () => {
    setCurrentStep('otp');
    setVerifiedOTP('');
    setServerError('');
    setError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Progress indicator */}
        <div className="progress-indicator">
          <div className={`progress-step ${currentStep === 'otp' ? 'active' : 'completed'}`}>
            <span className="step-number">1</span>
            <span className="step-label">Verify Code</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep === 'password' ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">New Password</span>
          </div>
        </div>

        {currentStep === 'otp' ? (
          // OTP Verification Step
          <>
            <div className="auth-header">
              <div className="reset-otp-icon">🔐</div>
              <h1>Enter Reset Code</h1>
              <p>We've sent a 6-digit reset code to</p>
              <div className="email-display">
                <strong>{email}</strong>
              </div>
            </div>

            <div className="verification-content">
              <div className="verification-instructions">
                <p>Enter the reset code to verify your identity:</p>
              </div>

              <OTPInput
                length={6}
                onComplete={handleOTPComplete}
                loading={isLoading}
                error={error}
                autoFocus={true}
              />

              <div className="verification-actions">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending || !canResend}
                  className="resend-button"
                >
                  {isResending ? (
                    <>
                      <span className="loading-spinner"></span>
                      Sending...
                    </>
                  ) : !canResend && countdown > 0 ? (
                    <>
                      <span className="resend-icon">⏱️</span>
                      Resend in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                    </>
                  ) : (
                    <>
                      <span className="resend-icon">🔄</span>
                      Resend Code
                    </>
                  )}
                </button>
              </div>

              <div className="verification-help">
                <div className="help-section">
                  <h4>Didn't receive the code?</h4>
                  <ul>
                    <li>Check your spam/junk folder</li>
                    <li>Make sure {email} is correct</li>
                    <li>Wait a few minutes for delivery</li>
                    <li>Click "Resend Code" to get a new one</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Password Reset Step
          <>
            <div className="auth-header">
              <div className="reset-password-icon">🔐</div>
              <h1>Create New Password</h1>
              <p>Enter a strong new password for your account</p>
              <div className="email-display">
                <strong>{email}</strong>
              </div>
            </div>

            <form onSubmit={handleSubmit(onPasswordSubmit)} className="auth-form">
              {serverError && (
                <div className="error-message server-error">
                  <span className="error-icon">⚠️</span>
                  {serverError}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  <span className="label-icon">🔒</span>
                  New Password
                </label>
                <div className="password-input-container">
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${errors.newPassword ? 'error' : ''}`}
                    placeholder="Enter your new password"
                    {...register('newPassword')}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.newPassword && (
                  <span className="error-message">{errors.newPassword.message}</span>
                )}
                <div className="password-requirements">
                  <small>
                    Password must contain at least 8 characters with uppercase, lowercase, number, and special character.
                  </small>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  <span className="label-icon">🔒</span>
                  Confirm New Password
                </label>
                <div className="password-input-container">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm your new password"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword.message}</span>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={goBackToOTP}
                  className="back-button"
                >
                  ← Back to Code
                </button>
                
                <button
                  type="submit"
                  className={`auth-button ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading || !isValid}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <span className="button-icon">🔐</span>
                      Reset Password
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="password-security-info">
              <div className="security-tips">
                <h4>🛡️ Password Security Tips:</h4>
                <ul>
                  <li>Use a unique password you haven't used before</li>
                  <li>Consider using a password manager</li>
                  <li>Don't share your password with anyone</li>
                  <li>Enable two-factor authentication if available</li>
                </ul>
              </div>
            </div>
          </>
        )}

        <div className="auth-footer">
          <p>
            Wrong email?{' '}
            <button 
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="link-button"
            >
              Try different email
            </button>
          </p>
          <p>
            Remember your password?{' '}
            <button 
              type="button"
              onClick={() => navigate('/login')}
              className="link-button"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
