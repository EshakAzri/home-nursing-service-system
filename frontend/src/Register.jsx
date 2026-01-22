import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Lock, UserCheck, UserCircle, Loader2, 
  ArrowRight, Eye, EyeOff, CheckCircle, XCircle,
  Shield, Stethoscope, Users, ChevronDown
} from 'lucide-react';
import './Register.css';

const InputField = ({ label, icon: Icon, type = 'text', error, isTouched, ...props }) => {
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
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
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

  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        }
        break;
      case 'username':
        if (value.length < 3) {
          errors.username = 'Username must be at least 3 characters';
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
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
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
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
      
      // Add success animation delay
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      'Registration failed. Please try again.';
      setMessage({ 
        text: errorMsg, 
        type: 'error' 
      });
      
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

          {message.text && (
            <div className={`register-message ${message.type}`}>
              {message.type === 'success' ? 
                <CheckCircle size={18} style={{ marginRight: '8px' }} /> : 
                <XCircle size={18} style={{ marginRight: '8px' }} />
              }
              {message.text}
            </div>
          )}
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
    </div>
  );
};

export default Register;
 