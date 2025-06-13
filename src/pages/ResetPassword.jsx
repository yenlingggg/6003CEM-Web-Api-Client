// client/src/pages/ResetPassword.jsx

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import loginBg from '../assets/login-bg.svg';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const rawToken = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Verify token on mount
  useEffect(() => {
    async function verify() {
      if (!rawToken) {
        setTokenValid(false);
        return;
      }
      try {
        const res = await api.get(`/auth/verify-reset-token?token=${rawToken}`);
        setTokenValid(res.data.valid);
      } catch {
        setTokenValid(false);
      }
    }
    verify();
  }, [rawToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) {
      setError('Please fill out both fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/reset-password', { token: rawToken, password });
      setMessage(res.data.message || 'Password reset successful!');
    } catch (err) {
      console.error('Reset error:', err);
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === null) {
    return <LoadingSpinner />;
  }

  return (
    <div className="login-background">
      {loading && <LoadingSpinner />}
      <div className="login-container">
        <h1 className="login-title">
          {tokenValid ? 'Reset Password' : 'Link Expired'}
        </h1>

        {tokenValid ? (
          message ? (
            <p className="success-text">{message}</p>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="reset-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="password-input-container">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="reset-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="password-toggle"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {error && <p className="error-text">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="login-button"
              >
                Reset Password
              </button>
            </form>
          )
        ) : (
          <p className="error-text">
            This reset link is invalid or has expired.
          </p>
        )}
      </div>

      <style jsx>{`
        .login-background {
          min-height: 100vh;
          min-width: 100vw;
          background: url(${loginBg}) no-repeat center center / cover;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-container {
          width: 100%;
          max-width: 400px;
          background-color: rgba(31, 41, 55, 0.85);
          border-radius: 8px;
          padding: 2rem 1.5rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
          text-align: center;
        }
        .login-title {
          margin: 0 0 1.5rem 0;
          color: #e5e7eb;
          font-size: 1.5rem;
          font-weight: 500;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .password-input-container {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
        }
        .reset-input {
          padding: 0.75rem 1rem;
          border: 1px solid #374151;
          border-radius: 6px;
          background-color: #1f2937;
          color: #e5e7eb;
          font-size: 1rem;
          width: 100%;
          box-sizing: border-box;
        }
        .login-input::placeholder {
          color: #9ca3af;
        }
        .password-toggle {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          color: #ffffff;
          cursor: pointer;
          padding: 5px;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
          transition: opacity 0.2s;
          height: 100%;
        }
        .password-toggle:hover {
          opacity: 1;
        }
        .login-button {
          background-color: #2563eb;
          color: #ffffff;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
        }
        .login-button:disabled {
          background-color: #4b5563;
          cursor: not-allowed;
        }
        .error-text {
          color: #f87171;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
        .success-text {
          color: #4ade80;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}
