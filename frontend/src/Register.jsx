import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Lock, UserCheck, Loader2, 
  ArrowRight, Eye, EyeOff, CheckCircle, XCircle,
  Shield, Users, Heart, Clock, Star, ShieldCheck
} from 'lucide-react';
import './Register.css';

const InputField = ({ label, icon: Icon, type = 'text', error, isTouched, availability, checking, usernameValue, emailValue, ...props }) => {
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="reg-field">
      <label className="reg-field-label">{label}</label>
      <div className={`reg-input-box ${error && isTouched ? 'has-error' : ''} ${!error && availability === true && isTouched ? 'has-success' : ''}`}>
        <Icon className="reg-input-icon" size={18} />
        <input
          {...props}
          type={isPassword && showPassword ? 'text' : type}
          className="reg-input"
          onBlur={(e) => {
            props.onBlur && props.onBlur(e);
          }}
        />
        {checking && (
          <div className="reg-input-status">
            <Loader2 className="spinner" size={16} />
          </div>
        )}
        {!checking && availability !== null && (props.name === 'username' || props.name === 'email') && (
          <div className="reg-input-status">
            {availability ? (
              <CheckCircle size={16} color="#10b981" />
            ) : (
              <XCircle size={16} color="#ef4444" />
            )}
          </div>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="reg-eye-toggle"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && isTouched && <span className="reg-error">{error}</span>}
      {!error && availability === false && (props.name === 'username' || props.name === 'email') && (
        <span className="reg-error">
          {props.name === 'username' ? 'Username is already taken' : 'Email is already registered'}
        </span>
      )}
      {!error && availability === true && ((props.name === 'username' && usernameValue && usernameValue.length >= 3) || (props.name === 'email' && emailValue && emailValue.includes('@'))) && (
        <span className="reg-success">Available</span>
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
    ADMIN: Shield
  };

  const roleDescriptions = {
    PATIENT: 'For individuals seeking home nursing services',
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
    <div className="reg-page">
      {/* Left Branding Panel */}
      <div className="reg-brand-panel">
        <div className="reg-brand-shapes">
          <div className="reg-shape reg-shape-1"></div>
          <div className="reg-shape reg-shape-2"></div>
          <div className="reg-shape reg-shape-3"></div>
        </div>
        <div className="reg-brand-content">
          <Link to="/" className="reg-brand-logo">
            <span className="reg-brand-icon">+</span>
            <span className="reg-brand-name">HomeNurse</span>
          </Link>
          <h2 className="reg-brand-headline">Start Your Healthcare Journey Today</h2>
          <p className="reg-brand-desc">
            Join thousands of families who trust HomeNurse for professional, 
            compassionate care delivered right at home.
          </p>
          <div className="reg-brand-features">
            <div className="reg-brand-feature">
              <div className="reg-brand-feature-icon"><Heart size={18} /></div>
              <div>
                <strong>500+ Verified Nurses</strong>
                <span>Licensed & background-checked professionals</span>
              </div>
            </div>
            <div className="reg-brand-feature">
              <div className="reg-brand-feature-icon"><Clock size={18} /></div>
              <div>
                <strong>24/7 Availability</strong>
                <span>Book care anytime, day or night</span>
              </div>
            </div>
            <div className="reg-brand-feature">
              <div className="reg-brand-feature-icon"><Star size={18} /></div>
              <div>
                <strong>4.9/5 Patient Rating</strong>
                <span>Trusted by 15,000+ home visits</span>
              </div>
            </div>
            <div className="reg-brand-feature">
              <div className="reg-brand-feature-icon"><ShieldCheck size={18} /></div>
              <div>
                <strong>100% Secure</strong>
                <span>Your data is encrypted & protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="reg-form-panel">
        <div className="reg-form-wrapper">
          <div className="reg-form-header">
            <h1 className="reg-form-title">Create Your Account</h1>
            <p className="reg-form-subtitle">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="reg-form">
            <div className="reg-row">
              <InputField
                label="Username"
                icon={User}
                type="text"
                name="username"
                placeholder="Choose a username"
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
                placeholder="you@example.com"
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

            <div className="reg-row">
              <InputField
                label="Password"
                icon={Lock}
                type="password"
                name="password"
                placeholder="Min 8 characters"
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
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={formErrors.confirmPassword}
                isTouched={touched.confirmPassword}
                required
                autoComplete="new-password"
              />
            </div>

            {/* Password Strength */}
            {formData.password && (
              <div className="reg-pw-strength">
                <div className="reg-pw-bar-track">
                  <div
                    className={`reg-pw-bar-fill ${passwordStrength <= 33 ? 'weak' : passwordStrength <= 66 ? 'medium' : 'strong'}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                <div className="reg-pw-reqs">
                  {passwordRequirements.map((req, i) => {
                    const met = req.regex.test(formData.password);
                    return (
                      <span key={i} className={`reg-pw-req ${met ? 'met' : ''}`}>
                        {met ? <CheckCircle size={12} /> : <span className="reg-pw-req-dot" />}
                        {req.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Role Selection */}
            <div className="reg-field">
              <label className="reg-field-label">Account Type</label>
              <div className="reg-roles">
                {Object.entries(roleIcons).map(([role, Icon]) => {
                  const RoleIcon = Icon;
                  const selected = formData.role === role;
                  return (
                    <div
                      key={role}
                      className={`reg-role ${selected ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, role }))}
                    >
                      <div className="reg-role-icon-wrap">
                        <RoleIcon size={20} />
                      </div>
                      <div className="reg-role-info">
                        <strong>{role.charAt(0) + role.slice(1).toLowerCase()}</strong>
                        <span>{roleDescriptions[role]}</span>
                      </div>
                      {selected && <CheckCircle size={18} className="reg-role-check" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Terms */}
            <label className="reg-terms">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                required
              />
              <span>
                I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              </span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={loading} className="reg-submit">
              {loading ? (
                <>
                  <Loader2 className="spinner" size={20} />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="reg-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="reg-link">Sign in</Link>
            </p>
          </form>
        </div>
      </div>

      {/* Modal */}
      {showModal && message.text && (
        <div className="reg-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="reg-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`reg-modal-body ${message.type}`}>
              <div className="reg-modal-icon">
                {message.type === 'success' ? 
                  <CheckCircle size={48} color="#10b981" /> : 
                  <XCircle size={48} color="#ef4444" />
                }
              </div>
              <h3>{message.type === 'success' ? 'Success!' : (message.title || 'Error')}</h3>
              <p>{message.text}</p>
              <button onClick={() => setShowModal(false)} className="reg-modal-btn">
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
 