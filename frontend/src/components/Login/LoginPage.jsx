import React, { useEffect, useMemo, useState } from 'react';
import { User, Lock, ShieldCheck, UserCircle, CheckCircle, XCircle, Mail, Eye, EyeOff, Users, Wind } from 'lucide-react';
import { getAuthUrl } from '../../config/apiConfig';
import './LoginPage.css';

const LoginPage = () => {
  const [userType, setUserType] = useState('user');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  // Update browser title and favicon for login page alone
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Vectarc";
    
    return () => {
      document.title = prevTitle;
    };
  }, []);

  const validatePassword = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password)
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const passwordChecks = useMemo(() => validatePassword(formData.password || ''), [formData.password]);
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async () => {
    setErrors({});
    setMessage('');
    setLoading(true);

    if (userType === 'admin' && isLogin) {
      try {
        const adminLoginUrl = getAuthUrl('admin-login');
        const response = await fetch(adminLoginUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });
        const data = await response.json();

        if (response.ok) {
          setMessage('✅ Login successful! Redirecting...');
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('userRole', 'admin');
          setTimeout(() => window.location.reload(), 800);
        } else {
          setErrors({ general: 'Invalid credentials' });
        }
      } catch (error) {
        console.error('Admin login error:', error);
        setErrors({ general: 'Server error. Please try again.' });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (userType === 'user' && !isLogin) {
      if (!isPasswordValid) {
        setErrors({ password: 'Password does not meet requirements' });
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrors({ confirmPassword: 'Passwords do not match' });
        setLoading(false);
        return;
      }
      if (!formData.username || formData.username.length < 3) {
        setErrors({ username: 'Username must be at least 3 characters' });
        setLoading(false);
        return;
      }
      if (!formData.email) {
        setErrors({ email: 'Email is required' });
        setLoading(false);
        return;
      }

      try {
        const registerUrl = getAuthUrl('register');
        const response = await fetch(registerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
          })
        });
        const data = await response.json();
        if (response.ok) {
          setMessage('✅ Request sent! You will receive an email once approved.');
          setIsLogin(true);
          setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        } else {
          setErrors({ general: data.error || 'Registration failed' });
        }
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ general: 'Server error. Please try again.' });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (userType === 'user' && isLogin) {
      try {
        const loginUrl = getAuthUrl('login');
        const response = await fetch(loginUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });
        const data = await response.json();
        if (response.ok) {
          setMessage('✅ Login successful!');
          localStorage.setItem('userToken', data.token);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setErrors({ general: data.error || 'Invalid credentials' });
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ general: 'Server error. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSwitchMode = (type) => {
    setUserType(type);
    setIsLogin(true);
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setMessage('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="login-root">
      {/* Branding Panel - Left Side */}
      <div className="branding-panel">
        <div className="branding-content">
          <div className="company-logo">
            <img src="/assets/favicon.png" alt="Vectarc Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <span>Vectarc</span>
          </div>
          
          <div className="hero-section">
            
            <h1>Precision Engineering</h1>
            <p>
              Precision Diagnostics for the Modern Technician. 
              Vectarc delivers reliable HVAC/R performance 
              tracking for high-stakes environments.
            </p>
          </div>
          
          <div className="branding-footer">
            © 2026 Vectarc Precision System
          </div>
        </div>
      </div>

      {/* Login Form Panel - Right Side */}
      <div className="login-form-panel">
        <div className="login-card">
          <div className="mobile-branding">
            <img src="/assets/favicon.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <span>Vectarc</span>
          </div>
          
          <header className="login-header">
            <div className={`mode-icon ${userType}`}>
              {userType === 'admin' ? <ShieldCheck size={32} /> : <UserCircle size={32} />}
            </div>
            <h1 className="login-title">
              {userType === 'admin' ? 'Admin Portal' : 'Welcome Back'}
            </h1>
            <p className="login-subtitle">
              {userType === 'admin' 
                ? 'Enter your administrative credentials to manage the system.' 
                : 'Please enter your account details to access your dashboard.'}
            </p>
          </header>

          {/* Success Message */}
          {message && (
            <div className="success-message">
              <CheckCircle size={20} />
              <span>{message}</span>
            </div>
          )}

          {/* User Type Toggle */}
          <div className="pill-toggle" role="tablist">
            <button
              onClick={() => handleSwitchMode('user')}
              className={userType === 'user' ? 'active' : ''}
              role="tab"
              aria-selected={userType === 'user'}
            >
              <UserCircle size={18} />
              User
            </button>
            <button
              onClick={() => handleSwitchMode('admin')}
              className={userType === 'admin' ? 'active' : ''}
              role="tab"
              aria-selected={userType === 'admin'}
            >
              <ShieldCheck size={18} />
              Admin
            </button>
          </div>

          {/* Form */}
          <div className="login-form-body">
            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username">
                {userType === 'admin' ? 'Username' : 'Username'}
              </label>
              <div className="input-wrapper">
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder={userType === 'admin' ? 'Enter your username' : 'Enter your username'}
                />
              </div>
              {errors.username && (
                <div className="error-message">
                  <XCircle size={16} />
                  {errors.username}
                </div>
              )}
            </div>

            {/* Email Field (Signup Only) */}
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                {errors.email && (
                  <div className="error-message">
                    <XCircle size={16} />
                    {errors.email}
                  </div>
                )}
              </div>
            )}

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <div className="error-message">
                  <XCircle size={16} />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Confirm Password Field (Signup Only) */}
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    style={{ paddingRight: '48px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94A3B8'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="error-message">
                    <XCircle size={16} />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            )}

            {/* Password Requirements Checklist (Signup) */}
            {userType === 'user' && !isLogin && (
              <div id="pw-requirements" className="pw-requirements-box" style={{
                marginBottom: '1.5rem',
                padding: '12px',
                background: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '0.8rem'
              }}>
                <div style={{ color: passwordChecks.length ? '#10B981' : '#94A3B8', display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  {passwordChecks.length ? <CheckCircle size={14} /> : <XCircle size={14} />} At least 8 characters
                </div>
                <div style={{ color: passwordChecks.uppercase ? '#10B981' : '#94A3B8', display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  {passwordChecks.uppercase ? <CheckCircle size={14} /> : <XCircle size={14} />} 1 Uppercase letter
                </div>
                <div style={{ color: passwordChecks.number ? '#10B981' : '#94A3B8', display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  {passwordChecks.number ? <CheckCircle size={14} /> : <XCircle size={14} />} 1 Number
                </div>
                <div style={{ color: passwordChecks.special ? '#10B981' : '#94A3B8', display: 'flex', gap: '8px' }}>
                  {passwordChecks.special ? <CheckCircle size={14} /> : <XCircle size={14} />} 1 Special character
                </div>
              </div>
            )}

            {/* General Error Message */}
            {errors.general && (
              <div className="error-message">
                <XCircle size={16} />
                {errors.general}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || (userType === 'user' && !isLogin && !isPasswordValid)}
              className="submit-button"
            >
              {loading ? (
                <span className="spinner" style={{ 
                  display: 'inline-block', 
                  width: '18px', 
                  height: '18px', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  borderTopColor: '#fff', 
                  borderRadius: '50%', 
                  animation: 'spin 0.6s linear infinite' 
                }}></span>
              ) : (
                isLogin ? 'Sign In' : 'Request Account'
              )}
            </button>

            {/* User Toggle Link */}
            {userType === 'user' && (
              <>
                <div className="toggle-link">
                  {isLogin ? "New to the platform?" : "Already have an account?"}
                  <button onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Request account" : "Sign in"}
                  </button>
                </div>

                <div className="guest-login-divider">
                  <span>OR</span>
                </div>

                <button
                  className="guest-login-btn"
                  onClick={() => {
                    localStorage.setItem('userMode', 'guest');
                    localStorage.setItem('userRole', 'user');
                    localStorage.setItem('userToken', 'guest-token');
                    window.location.reload();
                  }}
                >
                  <Users size={18} />
                  Login as Guest
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;