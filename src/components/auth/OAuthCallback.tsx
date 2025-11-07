import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/store/hooks';
import { checkAuth } from '@/store/slices/authSlice';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const authStatus = searchParams.get('auth');
      const error = searchParams.get('error');

      if (error) {
        // Handle OAuth error
        const errorMessage =
          error === 'oauth_failed'
            ? 'Google authentication failed. Please try again.'
            : decodeURIComponent(error);

        toast.error(`❌ ${errorMessage}`, {
          position: 'top-right',
          autoClose: 5000,
        });

        navigate('/login', { replace: true });
        return;
      }

      if (authStatus === 'success') {
        // OAuth successful, check auth to get user data
        try {
          await dispatch(checkAuth()).unwrap();

          toast.success('🎉 Successfully logged in with Google!', {
            position: 'top-right',
            autoClose: 3000,
          });

          navigate('/dashboard', { replace: true });
        } catch (error) {
          toast.error('Failed to authenticate. Please try again.', {
            position: 'top-right',
            autoClose: 5000,
          });

          navigate('/login', { replace: true });
        }
      } else {
        // No valid params, redirect to login
        navigate('/login', { replace: true });
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Authenticating...</h1>
          <p>Please wait while we complete your Google sign-in</p>
        </div>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div className="spinner"></div>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
