'use client';

import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { signUp, signIn, signOut, getCurrentUser, confirmSignUp } from 'aws-amplify/auth';
import outputs from '../../amplify_outputs.json';

Amplify.configure(outputs);

interface AuthComponentProps {
  onAuthStateChange: (isAuthenticated: boolean, user: any) => void;
}

export default function AuthComponent({ onAuthStateChange }: AuthComponentProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'confirm'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      onAuthStateChange(true, currentUser);
    } catch (error) {
      // User not authenticated, stay on auth screen
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (authMode === 'signup' && !username.trim()) {
      setError('Please enter a display name');
      setLoading(false);
      return;
    }

    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            // Store username in nickname field (available in default Cognito)
            nickname: username.trim(),
          },
        },
      });

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setAuthMode('confirm');
      }
    } catch (error: any) {
      setError(error.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password,
      });

      if (isSignedIn) {
        const currentUser = await getCurrentUser();
        onAuthStateChange(true, currentUser);
      }
    } catch (error: any) {
      setError(error.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
        confirmationCode,
      });

      if (isSignUpComplete) {
        setAuthMode('signin');
        setError('Account confirmed! Please sign in.');
      }
    } catch (error: any) {
      setError(error.message || 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAsGuest = () => {
    onAuthStateChange(false, { username: 'Guest' });
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <h1>🎮 Tetris Game</h1>
          <h2>
            {authMode === 'signin' && 'Sign In'}
            {authMode === 'signup' && 'Sign Up'}
            {authMode === 'confirm' && 'Confirm Account'}
          </h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        {authMode === 'confirm' ? (
          <form onSubmit={handleConfirmSignUp}>
            <div className="form-group">
              <label htmlFor="confirmationCode">Confirmation Code:</label>
              <input
                type="text"
                id="confirmationCode"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                required
                placeholder="Enter confirmation code from email"
              />
            </div>
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Confirming...' : 'Confirm Account'}
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className="auth-link"
            >
              Back to Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            {authMode === 'signup' && (
              <div className="form-group">
                <label htmlFor="username">Display Name:</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Choose your display name"
                  maxLength={20}
                  pattern="[a-zA-Z0-9_\s]+"
                  title="Only letters, numbers, underscores, and spaces allowed"
                />
                <small className="input-help">This name will appear on the leaderboard</small>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                minLength={8}
              />
            </div>
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Loading...' : authMode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        )}

        {authMode !== 'confirm' && (
          <div className="auth-switch">
            {authMode === 'signin' ? (
              <>
                <p>Don&apos;t have an account?</p>
                <button
                  onClick={() => setAuthMode('signup')}
                  className="auth-link"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <p>Already have an account?</p>
                <button
                  onClick={() => setAuthMode('signin')}
                  className="auth-link"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        )}

        <div className="guest-option">
          <div className="divider">
            <span>OR</span>
          </div>
          <button
            onClick={handlePlayAsGuest}
            className="auth-button guest"
          >
            🎮 Play as Guest
          </button>
          <p className="guest-note">
            Play without an account. Your scores won&apos;t be saved permanently.
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .auth-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="tetris" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23tetris)"/></svg>');
          opacity: 0.3;
        }

        .auth-form {
          background: rgba(255, 255, 255, 0.95);
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 450px;
          position: relative;
          z-index: 1;
          backdrop-filter: blur(10px);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .auth-header h1 {
          color: #2a5298;
          font-size: 36px;
          margin: 0 0 10px 0;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }

        .auth-header h2 {
          color: #333;
          font-size: 24px;
          margin: 0;
          font-weight: 500;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #555;
          font-weight: 600;
          font-size: 14px;
        }

        .form-group input {
          width: 100%;
          padding: 14px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: #f8f9fa;
        }

        .form-group input:focus {
          outline: none;
          border-color: #2a5298;
          background: white;
          box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
        }

        .input-help {
          display: block;
          margin-top: 5px;
          color: #666;
          font-size: 12px;
          font-style: italic;
        }

        .auth-button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(45deg, #2a5298, #1e3c72);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 15px;
          box-shadow: 0 4px 15px rgba(42, 82, 152, 0.3);
        }

        .auth-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(42, 82, 152, 0.4);
        }

        .auth-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .auth-button.guest {
          background: linear-gradient(45deg, #6c757d, #495057);
          box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
        }

        .auth-button.guest:hover {
          box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
        }

        .auth-link {
          background: none;
          border: none;
          color: #2a5298;
          cursor: pointer;
          text-decoration: underline;
          font-size: 14px;
          font-weight: 500;
          padding: 5px;
        }

        .auth-link:hover {
          color: #1e3c72;
        }

        .auth-switch {
          text-align: center;
          margin: 20px 0;
          padding: 15px 0;
          border-top: 1px solid #eee;
        }

        .auth-switch p {
          margin: 0 0 8px 0;
          color: #666;
          font-size: 14px;
        }

        .guest-option {
          text-align: center;
          margin-top: 25px;
          padding-top: 25px;
          border-top: 1px solid #eee;
        }

        .divider {
          position: relative;
          margin-bottom: 20px;
        }

        .divider span {
          background: white;
          color: #999;
          padding: 0 15px;
          font-size: 14px;
          font-weight: 500;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #ddd;
          z-index: -1;
        }

        .guest-note {
          margin: 10px 0 0 0;
          color: #666;
          font-size: 12px;
          line-height: 1.4;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
          font-size: 14px;
        }

        @media (max-width: 480px) {
          .auth-form {
            padding: 30px 20px;
            margin: 10px;
          }

          .auth-header h1 {
            font-size: 28px;
          }

          .auth-header h2 {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}
