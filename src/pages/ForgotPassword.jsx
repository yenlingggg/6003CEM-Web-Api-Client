import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import loginBg from '../assets/login-bg.svg';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 5000);
    } catch (err) {
      console.error('Forgot password error:', err);
      if (err.response?.status === 404) {
        setError('No account found with this email address');
      } else {
        setError(err.response?.data?.error || 'Failed to initiate password reset.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-background">
      {loading && <LoadingSpinner />}
      <div className="login-container">
        <h1 className="login-title">Forgot Password</h1>
        {message ? (
          <p className="success-text">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />
            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              Send Reset Link
            </button>
            {error && <p className="error-text">{error}</p>}
          </form>
        )}
        <p className="toggle-text">
          Remember your password? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
} 