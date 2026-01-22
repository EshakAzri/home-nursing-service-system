import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Lock, UserCheck, UserCircle, Loader2, 
  ArrowRight, Eye, EyeOff, CheckCircle, XCircle,
  Shield, Stethoscope, Users, ChevronDown
} from 'lucide-react';
import './Register.css';

const InputField = ({ label, icon: Icon, type = 'text', error, isTouched, availability, checking, usernameValue, emailValue, ...props }) => {
  const isPassword = type === 'password';
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="register-form-group">
      <label className="register-label">
        {label}
      </label>
      <div className={`register-input-wrapper ${error && isTouched ? 'error' : ''}`}>
        <Icon className="register-input-icon" size={18} />
        <input
          {...props}
          type={isPassword && showPassword ? 'text' : type}
          className="register-input"
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur && props.onBlur(e);
          }}
          aria-describedby={error && isTouched ? `${props.name}-error` : undefined}
          aria-invalid={error && isTouched ? 'true' : 'false'}
        />
        {checking && (
          <div className="register-input-status">
            <Loader2 className="spinner" size={16} />
          </div>
        )}
        {!checking && availability !== null && (props.name === 'username' || props.name === 'email') && (
          <div className="register-input-status">
            {availability ? (
              <CheckCircle size={16} color="#16a34a" />
            ) : (
              <XCircle size={16} color="#dc2626" />
            )}
          </div>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="register-password-toggle"
          >
            {showPassword ? 
              <EyeOff size={18} color="#64748b" /> : 
              <Eye size={18} color="#64748b" />
            }
          </button>
        )}
      </div>
      {error && isTouched && (
        <span id={`${props.name}-error`} className="register-error-text">
          {error}
        </span>
      )}
      {!error && availability === false && (props.name === 'username' || props.name === 'email') && (
        <span className="register-error-text">
          {props.name === 'username' ? 'This username is already taken' : 'This email address is already registered'}
        </span>
      )}
      {!error && availability === true && ((props.name === 'username' && usernameValue && usernameValue.length >= 3) || (props.name === 'email' && emailValue && emailValue.includes('@'))) && (
        <span className="register-success-text">
          {props.name === 'username' ? 'Username is available' : 'Email address is available'}
        </span>
      )}
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    role: 'PATIENT'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showModal, setShowModal] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const navigate = useNavigate();

  const roleIcons = {
    PATIENT: Users,
    NURSE: Stethoscope,
    ADMIN: Shield
  };

  const roleDescriptions = {
    PATIENT: 'For individuals seeking home nursing services',
    NURSE: 'For qualified healthcare professionals',
    ADMIN: 'For system administrators and managers'
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', regex: /.{8,}/ },
    { label: 'Contains uppercase letter', regex: /[A-Z]/ },
    { label: 'Contains lowercase letter', regex: /[a-z]/ },
    { label: 'Contains number', regex: /\d/ },
    { label: 'Contains special character', regex: /[!@#$%^&*(),.?":{}|<>]/ }
  ];

  useEffect(() => {
    calculatePasswordStrength(formData.password);
  }, [formData.password]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      checkUsernameAvailability(formData.username);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(debounceTimer);
  }, [formData.username]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      checkEmailAvailability(formData.email);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(debounceTimer);
  }, [formData.email]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    const requirements = [
      /.{8,}/,
      /[A-Z]/,
      /[a-z]/,
      /\d/,
      /[!@#$%^&*(),.?":{}|<>]/
    ];
    
    requirements.forEach(req => {
      if (req.test(password)) strength += 20;
    });
    
    setPasswordStrength(strength);
  };

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      // Check if username is available
      const response = await axios.get(`http://localhost:8080/api/auth/check-username?username=${encodeURIComponent(username)}`);
      setUsernameAvailable(response.data.available);
    } catch (error) {
      // If endpoint doesn't exist or there's an error, assume available for now
      console.log('Username check failed:', error.message);
      setUsernameAvailable(true);
    } finally {
      setCheckingUsername(false);
    }
  };

  const checkEmailAvailability = async (email) => {
    if (!email || !email.includes('@')) {
      setEmailAvailable(null);
      return;
    }

    setCheckingEmail(true);
    try {
      // Check if email is available
      const response = await axios.get(`http://localhost:8080/api/auth/check-email?email=${encodeURIComponent(email)}`);
      setEmailAvailable(response.data.available);
    } catch (error) {
      // If endpoint doesn't exist or there's an error, assume available for now
      console.log('Email check failed:', error.message);
      setEmailAvailable(true);
    } finally {
      setCheckingEmail(false);
    }
  };

  const validateField = (name, value) => {
    const errors = {};

    // Check for empty required fields
    if (!value || value.trim() === '') {
      switch (name) {
        case 'username':
          errors.username = 'Username is required';
          break;
        case 'email':
          errors.email = 'Email address is required';
          break;
        case 'password':
          errors.password = 'Password is required';
          break;
        case 'confirmPassword':
          errors.confirmPassword = 'Please confirm your password';
          break;
        default:
          break;
      }
      return errors;
    }
    
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address (e.g., user@example.com)';
        } else if (emailAvailable === false) {
          errors.email = 'This email address is already registered. Please use a different email or try logging in.';
        }
        break;
      case 'password':
        if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])/.test(value)) {
          errors.password = 'Password must contain at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          errors.password = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(value)) {
          errors.password = 'Password must contain at least one number';
        } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(value)) {
          errors.password = 'Password must contain at least one special character';
        }
        break;
      case 'username':
        if (value.length < 3) {
          errors.username = 'Username must be at least 3 characters long';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          errors.username = 'Username can only contain letters, numbers, and underscores';
        } else if (usernameAvailable === false) {
          errors.username = 'This username is already taken. Please choose a different one.';
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match. Please try again';
        }
        break;
      default:
        break;
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate field on change
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

  const getStrengthColor = () => {
    if (passwordStrength <= 20) return '#ef4444';
    if (passwordStrength <= 40) return '#f97316';
    if (passwordStrength <= 60) return '#eab308';
    if (passwordStrength <= 80) return '#22c55e';
    return '#16a34a';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach(key => {
      const fieldErrors = validateField(key, formData[key]);
      if (fieldErrors[key]) errors[key] = fieldErrors[key];
    });
    
    // Check terms acceptance
    if (!acceptTerms) {
      setMessage({ 
        text: 'Please accept the Terms of Service and Privacy Policy to continue.',
        title: 'Terms Required',
        type: 'error' 
      });
      setShowModal(true);
      return;
    }
    
    if (Object.keys(errors).length > 0) {
      // Show validation errors in modal
      const errorMessages = Object.values(errors).filter(msg => msg);
      setMessage({ 
        text: errorMessages.join(' '),
        title: 'Please Check Your Input',
        type: 'error' 
      });
      setShowModal(true);
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Simulate API call with timeout for better UX
      await Promise.race([
        axios.post('http://localhost:8080/api/auth/register', formData),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]);
      
      setMessage({ 
        text: 'Account created successfully! Redirecting to login...', 
        type: 'success' 
      });
      setShowModal(true);
      
      // Add success animation delay
      setTimeout(() => {
        setShowModal(false);
        navigate('/login');
      }, 2000);
    } catch (error) {
      let errorMsg = 'Registration failed. Please try again.';
      let errorTitle = 'Error';

      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          // Bad request - validation errors
          if (data.message) {
            errorMsg = data.message;
          } else if (data.errors && Array.isArray(data.errors)) {
            errorMsg = data.errors.join(', ');
          } else {
            errorMsg = 'Please check your input and try again.';
          }
          errorTitle = 'Invalid Input';
        } else if (status === 409) {
          // Conflict - user already exists
          errorMsg = 'An account with this email or username already exists. Please try logging in instead.';
          errorTitle = 'Account Already Exists';
        } else if (status === 422) {
          // Unprocessable entity - validation failed
          errorMsg = data.message || 'Please check your information and try again.';
          errorTitle = 'Validation Error';
        } else if (status >= 500) {
          // Server error
          errorMsg = 'Server error occurred. Please try again later.';
          errorTitle = 'Server Error';
        }
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        // Network connectivity issues
        errorMsg = 'Unable to connect to the server. Please check your internet connection and try again.';
        errorTitle = 'Connection Error';
      } else if (error.message.includes('timeout') || error.message.includes('Request timeout')) {
        // Request timeout
        errorMsg = 'Request timed out. Please check your connection and try again.';
        errorTitle = 'Timeout Error';
      }

      setMessage({ 
        text: errorMsg,
        title: errorTitle,
        type: 'error' 
      });
      setShowModal(true);
      
      // Add shake animation for error
      document.querySelector('form').classList.add('shake');
      setTimeout(() => {
        document.querySelector('form').classList.remove('shake');
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Background elements */}
      <div className="register-blob1"></div>
      <div className="register-blob2"></div>
      <div className="register-blob3"></div>
      
      <div className="register-card">
        <div className="register-header">
          <div className="register-logo-container">
            <div className="register-logo">
              <UserCheck size={24} color="#4f46e5" />
            </div>
            <span className="register-logo-text">CareLink</span>
          </div>
          <h1 className="register-title">Join Our Healthcare Community</h1>
          <p className="register-subtitle">
            Register to access personalized home nursing services and professional care
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="register-form-grid">
            <InputField
              label="Username"
              icon={User}
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={formErrors.username}
              isTouched={touched.username}
              availability={usernameAvailable}
              checking={checkingUsername}
              usernameValue={formData.username}
              required
              autoComplete="username"
            />

            <InputField
              label="Email Address"
              icon={Mail}
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={formErrors.email}
              isTouched={touched.email}
              availability={emailAvailable}
              checking={checkingEmail}
              emailValue={formData.email}
              required
              autoComplete="email"
            />
          </div>

          <InputField
            label="Password"
            icon={Lock}
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={formErrors.password}
            isTouched={touched.password}
            required
            autoComplete="new-password"
          />

          <InputField
            label="Confirm Password"
            icon={Lock}
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={formErrors.confirmPassword}
            isTouched={touched.confirmPassword}
            required
            autoComplete="new-password"
          />

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="register-password-strength">
              <div className="register-strength-bar">
                <div 
                  className={`register-strength-fill ${passwordStrength <= 33 ? 'weak' : passwordStrength <= 66 ? 'medium' : 'strong'}`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </div>
              <div className="register-strength-text">
                Password Strength: <span className={passwordStrength <= 33 ? 'weak' : passwordStrength <= 66 ? 'medium' : 'strong'}>
                  {passwordStrength <= 33 ? 'Weak' : passwordStrength <= 66 ? 'Medium' : 'Strong'}
                </span>
              </div>
              <div className="register-requirements">
                {passwordRequirements.map((req, index) => {
                  const meetsRequirement = req.regex.test(formData.password);
                  return (
                    <div key={index} className="register-requirement">
                      <span className="register-requirement-icon">
                        {meetsRequirement ? '✓' : ''}
                      </span>
                      <span className={meetsRequirement ? 'met' : ''}>
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div className="register-form-group">
            <label className="register-label">Select Your Role</label>
            <div className="register-role-grid">
              {Object.entries(roleIcons).map(([role, Icon]) => {
                const RoleIcon = Icon;
                const isSelected = formData.role === role;
                return (
                  <div
                    key={role}
                    className={`register-role-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, role }))}
                  >
                    <RoleIcon 
                      size={24} 
                      color={isSelected ? '#3b82f6' : '#64748b'} 
                    />
                    <div className="register-role-content">
                      <h4 className="register-role-title">
                        {role.charAt(0) + role.slice(1).toLowerCase()}
                        {isSelected && <CheckCircle size={16} color="#3b82f6" />}
                      </h4>
                      <p className="register-role-description">
                        {roleDescriptions[role]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="register-terms-container">
            <input
              type="checkbox"
              id="terms"
              className="register-checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              required
            />
            <label htmlFor="terms" className="register-terms-text">
              I agree to the{' '}
              <a href="/terms" className="register-terms-link" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="register-terms-link" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="register-button"
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={20} />
                <span style={{ marginLeft: '8px' }}>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="register-links">
          <p className="register-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="register-link">
              <strong>Sign in here</strong>
            </Link>
          </p>
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && message.text && (
        <div className="register-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="register-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`register-modal-content ${message.type}`}>
              <div className="register-modal-icon">
                {message.type === 'success' ? 
                  <CheckCircle size={48} color="#166534" /> : 
                  <XCircle size={48} color="#dc2626" />
                }
              </div>
              <h3 className="register-modal-title">
                {message.type === 'success' ? 'Success!' : (message.title || 'Error')}
              </h3>
              <p className="register-modal-message">{message.text}</p>
              <button 
                className="register-modal-close"
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

export default Register;
 