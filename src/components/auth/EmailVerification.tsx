import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import OTPInput from '@/components/common/OTPInput';
import { AuthService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import './AuthForms.css';

const EmailVerification: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0); // Countdown in seconds
  const [canResend, setCanResend] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth } = useAuth();

  // Get email from location state (passed from signup)
  const email = location.state?.email || '';

  // OTP expiry time in seconds (5 minutes)
  const OTP_EXPIRY_TIME = 300;

  useEffect(() => {
    // Redirect if no email provided
    if (!email) {
      navigate('/signup');
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

  const handleOTPComplete = async (otp: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await AuthService.verifySignupOTP({ email, otp });

      toast.success(
        '🎉 Email verified successfully! Welcome to your dashboard!',
        {
          position: 'top-right',
          autoClose: 4000,
        }
      );

      // Check if auto-login was successful
      if (response.user && response.data?.autoLogin) {
        // Update auth context with the new user data
        await checkAuth();

        // User is now automatically logged in, redirect to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // Fallback: redirect to login page
        navigate('/login', {
          state: {
            message: 'Email verified successfully! Please log in.',
            email: email,
          },
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Invalid or expired OTP. Please try again.';
      setError(errorMessage);

      toast.error(`❌ ${errorMessage}`, {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsResending(true);
    setError('');
    setCanResend(false);

    try {
      await AuthService.resendSignupOTP({ email });

      // Start countdown timer
      setCountdown(OTP_EXPIRY_TIME);

      toast.success('📧 New verification code sent to your email!', {
        position: 'top-right',
        autoClose: 4000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to resend verification code.';
      setError(errorMessage);

      // Re-enable resend button on error
      setCanResend(true);

      toast.error(`⚠️ ${errorMessage}`, {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="verification-icon">📧</div>
          <h1>Verify Your Email</h1>
          <p>We've sent a 6-digit verification code to</p>
          <div className="email-display">
            <strong>{email}</strong>
          </div>
        </div>

        <div className="verification-content">
          <div className="verification-instructions">
            <p>
              Enter the verification code below to complete your registration:
            </p>
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
              onClick={handleResendOTP}
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
                  Resend in {Math.floor(countdown / 60)}:
                  {String(countdown % 60).padStart(2, '0')}
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

        <div className="auth-footer">
          <p>
            Wrong email?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="link-button"
            >
              Sign up again
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
