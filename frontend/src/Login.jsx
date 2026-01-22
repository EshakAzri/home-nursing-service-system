import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Lock, UserCheck, Loader2, 
  ArrowRight, CheckCircle, XCircle
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
      let redirectPath = '/booking'; // default for patients
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
    <div className="login-container">
      {/* Background elements */}
      <div className="login-blob1"></div>
      <div className="login-blob2"></div>
      <div className="login-blob3"></div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-container">
            <div className="login-logo">
              <UserCheck size={24} color="#ffffff" />
            </div>
            <span className="login-logo-text">CareLink</span>
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Sign in to access your healthcare dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label className="login-label">Username</label>
            <div className="login-input-wrapper">
              <User className="login-input-icon" size={18} />
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`login-input ${formErrors.username && touched.username ? 'error' : ''}`}
                required
                autoComplete="username"
              />
            </div>
            {formErrors.username && touched.username && (
              <span className="login-error-text">{formErrors.username}</span>
            )}
          </div>

          <div className="login-form-group">
            <label className="login-label">Password</label>
            <div className="login-input-wrapper">
              <Lock className="login-input-icon" size={18} />
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`login-input ${formErrors.password && touched.password ? 'error' : ''}`}
                required
                autoComplete="current-password"
              />
            </div>
            {formErrors.password && touched.password && (
              <span className="login-error-text">{formErrors.password}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={20} />
                <span style={{ marginLeft: '8px' }}>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </>
            )}
          </button>
        </form>

        <div className="login-links">
          <p className="login-footer-text">
            Don't have an account?{' '}
            <Link to="/register" className="login-link">
              <strong>Register here</strong>
            </Link>
          </p>
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && message.text && (
        <div className="login-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`login-modal-content ${message.type}`}>
              <div className="login-modal-icon">
                {message.type === 'success' ? 
                  <CheckCircle size={48} color="#166534" /> : 
                  <XCircle size={48} color="#dc2626" />
                }
              </div>
              <h3 className="login-modal-title">
                {message.type === 'success' ? 'Success!' : (message.title || 'Error')}
              </h3>
              <p className="login-modal-message">{message.text}</p>
              <button 
                className="login-modal-close"
                onClick={() => setShowModal(false)}
              >
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