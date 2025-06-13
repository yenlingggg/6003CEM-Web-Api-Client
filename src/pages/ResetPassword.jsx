// client/src/pages/ResetPassword.jsx

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './ResetPassword.css';
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

    
    </div>
  );
}
