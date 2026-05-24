import React, { useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let result;
      if (mode === 'signup') {
        result = await api.signup(name, email, password);
      } else {
        result = await api.signin(email, password);
      }
      login(result.token, result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-logo">
          <h1>Free<span className="logo-dot">.</span>File</h1>
        </div>
        <div className="auth-brand-tagline">
          <p>
            <strong>Your notes.</strong><br />
            Your files.<br />
            Your space.
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-container">
          <h2>{mode === 'signin' ? 'Welcome back' : 'Create account'}</h2>
          <p className="auth-subtitle">
            {mode === 'signin'
              ? 'Sign in to access your files'
              : 'Get started — it only takes a moment'}
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === 'signup' ? 6 : 1}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="auth-toggle">
            {mode === 'signin' ? (
              <>Don't have an account? <button onClick={toggleMode}>Sign up free</button></>
            ) : (
              <>Already have an account? <button onClick={toggleMode}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
