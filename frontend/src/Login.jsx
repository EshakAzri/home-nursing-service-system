import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Lock, Loader2, 
  ArrowRight, CheckCircle, XCircle,
  Heart, Clock, Star, ShieldCheck
} from 'lucide-react';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showModal, setShowModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  const validateField = (name, value) => {
    const errors = {};

    if (!value || value.trim() === '') {
      switch (name) {
        case 'username':
          errors.username = 'Username is required';
          break;
        case 'password':
          errors.password = 'Password is required';
          break;
        default:
          break;
      }
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const errors = validateField(name, value);
      setFormErrors(prev => ({ ...prev, [name]: errors[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const errors = validateField(name, formData[name]);
    setFormErrors(prev => ({ ...prev, [name]: errors[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach(key => {
      const fieldErrors = validateField(key, formData[key]);
      if (fieldErrors[key]) errors[key] = fieldErrors[key];
    });
    
    if (Object.keys(errors).length > 0) {
      setMessage({ 
        text: 'Please fill in all required fields.',
        title: 'Validation Error',
        type: 'error' 
      });
      setShowModal(true);
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', formData);
      const { token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      
      setMessage({ 
        text: 'Login successful! Redirecting to dashboard...', 
        type: 'success' 
      });
      setShowModal(true);
      
      // Role-based navigation
      let redirectPath = '/customer/dashboard'; // default for patients
      if (role === 'NURSE') {
        redirectPath = '/nurse-dashboard';
      } else if (role === 'ADMIN') {
        redirectPath = '/admin-dashboard';
      }
      
      setTimeout(() => {
        setShowModal(false);
        navigate(redirectPath);
      }, 2000);
    } catch (error) {
      let errorMsg = 'Login failed. Please check your credentials.';
      let errorTitle = 'Login Error';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401 || status === 400) {
          // For login, treat 400 and 401 as authentication failures
          errorMsg = 'Invalid username or password. Please try again.';
          errorTitle = 'Authentication Failed';
        } else if (status >= 500) {
          errorMsg = 'Server error occurred. Please try again later.';
          errorTitle = 'Server Error';
        }
      } else if (error.code === 'NETWORK_ERROR') {
        errorMsg = 'Unable to connect to the server. Please check your internet connection.';
        errorTitle = 'Connection Error';
      }

      setMessage({ 
        text: errorMsg,
        title: errorTitle,
        type: 'error' 
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Branding Panel */}
      <div className="login-brand-panel">
        <div className="login-brand-shapes">
          <div className="login-shape login-shape-1"></div>
          <div className="login-shape login-shape-2"></div>
          <div className="login-shape login-shape-3"></div>
        </div>
        <div className="login-brand-content">
          <Link to="/" className="login-brand-logo">
            <span className="login-brand-icon">+</span>
            <span className="login-brand-name">HomeNurse</span>
          </Link>
          <h2 className="login-brand-headline">Welcome Back to HomeNurse</h2>
          <p className="login-brand-desc">
            Sign in to manage your bookings, connect with nurses, and access your healthcare dashboard.
          </p>
          <div className="login-brand-features">
            <div className="login-brand-feature">
              <div className="login-brand-feature-icon"><Heart size={18} /></div>
              <div>
                <strong>500+ Verified Nurses</strong>
                <span>Licensed & background-checked</span>
              </div>
            </div>
            <div className="login-brand-feature">
              <div className="login-brand-feature-icon"><Clock size={18} /></div>
              <div>
                <strong>24/7 Availability</strong>
                <span>Book care anytime</span>
              </div>
            </div>
            <div className="login-brand-feature">
              <div className="login-brand-feature-icon"><Star size={18} /></div>
              <div>
                <strong>4.9/5 Rating</strong>
                <span>15,000+ home visits</span>
              </div>
            </div>
            <div className="login-brand-feature">
              <div className="login-brand-feature-icon"><ShieldCheck size={18} /></div>
              <div>
                <strong>100% Secure</strong>
                <span>Encrypted & protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="login-form-panel">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h1 className="login-title">Sign In</h1>
            <p className="login-subtitle">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label className="login-label">Username</label>
              <div className={`login-input-box ${formErrors.username && touched.username ? 'has-error' : ''}`}>
                <User className="login-input-icon" size={18} />
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="login-input"
                  required
                  autoComplete="username"
                />
              </div>
              {formErrors.username && touched.username && (
                <span className="login-error">{formErrors.username}</span>
              )}
            </div>

            <div className="login-field">
              <label className="login-label">Password</label>
              <div className={`login-input-box ${formErrors.password && touched.password ? 'has-error' : ''}`}>
                <Lock className="login-input-icon" size={18} />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="login-input"
                  required
                  autoComplete="current-password"
                />
              </div>
              {formErrors.password && touched.password && (
                <span className="login-error">{formErrors.password}</span>
              )}
            </div>

            <button type="submit" disabled={loading} className="login-submit">
              {loading ? (
                <>
                  <Loader2 className="spinner" size={20} />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="login-footer-text">
              Don't have an account?{' '}
              <Link to="/register" className="login-link">Create one</Link>
            </p>
          </form>
        </div>
      </div>

      {/* Modal */}
      {showModal && message.text && (
        <div className="login-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`login-modal-body ${message.type}`}>
              <div className="login-modal-icon">
                {message.type === 'success' ? 
                  <CheckCircle size={48} color="#10b981" /> : 
                  <XCircle size={48} color="#ef4444" />
                }
              </div>
              <h3>{message.type === 'success' ? 'Success!' : (message.title || 'Error')}</h3>
              <p>{message.text}</p>
              <button onClick={() => setShowModal(false)} className="login-modal-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;