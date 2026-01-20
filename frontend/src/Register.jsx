import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Lock, UserCheck, UserCircle, Loader2, 
  ArrowRight, Eye, EyeOff, CheckCircle, XCircle,
  Shield, Stethoscope, Users, ChevronDown
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'PATIENT'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);
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

  const InputField = ({ label, icon: Icon, type = 'text', ...props }) => {
    const isPassword = type === 'password';
    const [isFocused, setIsFocused] = useState(false);
    const error = formErrors[props.name];
    const isTouched = touched[props.name];

    return (
      <div style={styles.formGroup}>
        <label style={styles.label}>
          {label}
          {error && isTouched && (
            <span style={styles.errorText}> • {error}</span>
          )}
        </label>
        <div style={{
          ...styles.inputWrapper,
          borderColor: error && isTouched ? '#ef4444' : 
                      isFocused ? '#4f46e5' : '#e2e8f0',
          boxShadow: isFocused ? '0 0 0 3px rgba(79, 70, 229, 0.1)' : 'none',
          transform: isFocused ? 'translateY(-1px)' : 'none'
        }}>
          <Icon size={18} style={{
            ...styles.inputIcon,
            color: error && isTouched ? '#ef4444' : 
                   isFocused ? '#4f46e5' : '#94a3b8'
          }} />
          <input
            {...props}
            type={isPassword && showPassword ? 'text' : type}
            style={styles.input}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false);
              handleBlur(e);
            }}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              {showPassword ? 
                <EyeOff size={18} color="#64748b" /> : 
                <Eye size={18} color="#64748b" />
              }
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Background elements */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>
      <div style={styles.blob3}></div>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <div style={styles.logo}>
              <UserCheck size={24} color="#4f46e5" />
            </div>
            <span style={styles.logoText}>CareLink</span>
          </div>
          <h1 style={styles.title}>Join Our Healthcare Community</h1>
          <p style={styles.subtitle}>
            Register to access personalized home nursing services and professional care
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <InputField
              label="Username"
              icon={User}
              type="text"
              name="username"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />

            <InputField
              label="Email Address"
              icon={Mail}
              type="email"
              name="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <InputField
            label="Password"
            icon={Lock}
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />

          {/* Password Strength Indicator */}
          {formData.password && (
            <div style={styles.passwordStrengthContainer}>
              <div style={styles.strengthBar}>
                <div 
                  style={{
                    ...styles.strengthFill,
                    width: `${passwordStrength}%`,
                    backgroundColor: getStrengthColor()
                  }}
                />
              </div>
              <div style={styles.requirements}>
                {passwordRequirements.map((req, index) => {
                  const meetsRequirement = req.regex.test(formData.password);
                  return (
                    <div key={index} style={styles.requirement}>
                      {meetsRequirement ? 
                        <CheckCircle size={14} color="#22c55e" /> : 
                        <XCircle size={14} color="#94a3b8" />
                      }
                      <span style={{
                        ...styles.requirementText,
                        color: meetsRequirement ? '#22c55e' : '#94a3b8'
                      }}>
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Your Role</label>
            <div style={styles.roleContainer}>
              {Object.entries(roleIcons).map(([role, Icon]) => {
                const RoleIcon = Icon;
                const isSelected = formData.role === role;
                return (
                  <div
                    key={role}
                    style={{
                      ...styles.roleCard,
                      borderColor: isSelected ? '#4f46e5' : '#e2e8f0',
                      backgroundColor: isSelected ? '#eef2ff' : 'white',
                      transform: isSelected ? 'translateY(-2px)' : 'none'
                    }}
                    onClick={() => setFormData(prev => ({ ...prev, role }))}
                  >
                    <RoleIcon 
                      size={24} 
                      color={isSelected ? '#4f46e5' : '#64748b'} 
                    />
                    <div style={styles.roleContent}>
                      <h4 style={styles.roleTitle}>
                        {role.charAt(0) + role.slice(1).toLowerCase()}
                        {isSelected && <CheckCircle size={16} color="#4f46e5" />}
                      </h4>
                      <p style={styles.roleDescription}>
                        {roleDescriptions[role]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div style={styles.termsContainer}>
            <input
              type="checkbox"
              id="terms"
              style={styles.checkbox}
              required
            />
            <label htmlFor="terms" style={styles.termsText}>
              I agree to the{' '}
              <Link to="/terms" style={styles.termsLink}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" style={styles.termsLink}>
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={styles.button}
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
            <div style={{
              ...styles.message,
              ...styles[message.type]
            }}>
              {message.type === 'success' ? 
                <CheckCircle size={18} style={{ marginRight: '8px' }} /> : 
                <XCircle size={18} style={{ marginRight: '8px' }} />
              }
              {message.text}
            </div>
          )}
        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerText}>Or continue with</span>
        </div>

        {/* Social Login Options (Optional) */}
        <div style={styles.socialContainer}>
          <button type="button" style={styles.socialButton}>
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              style={styles.socialIcon}
            />
            Google
          </button>
          <button type="button" style={styles.socialButton}>
            <img 
              src="https://static.xx.fbcdn.net/rsrc.php/yT/r/aGT3gskzWBf.ico" 
              alt="Facebook" 
              style={styles.socialIcon}
            />
            Facebook
          </button>
        </div>

        {/* Footer */}
        <p style={styles.footerText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            <strong>Sign in here</strong>
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { 
          100% { transform: rotate(360deg); } 
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .spinner { 
          animation: spin 1s linear infinite; 
        }
        .shake {
          animation: shake 0.5s ease-in-out;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px white inset;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1), transparent)',
    top: '-200px',
    left: '-200px',
    animation: 'float 20s ease-in-out infinite',
  },
  blob2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, transparent, rgba(118, 75, 162, 0.1))',
    bottom: '-150px',
    right: '-150px',
    animation: 'float 25s ease-in-out infinite reverse',
  },
  blob3: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.05), transparent)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    animation: 'float 30s ease-in-out infinite',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderRadius: '32px',
    boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.25)',
    padding: '56px',
    width: '100%',
    maxWidth: '560px',
    zIndex: 1,
    animation: 'fadeInUp 0.6s ease-out',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  logo: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.025em',
  },
  title: {
    color: '#1e293b',
    fontSize: '36px',
    fontWeight: '800',
    letterSpacing: '-0.025em',
    marginBottom: '12px',
    lineHeight: 1.2,
  },
  subtitle: {
    color: '#64748b',
    fontSize: '18px',
    lineHeight: 1.5,
    maxWidth: '480px',
    margin: '0 auto',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
    '@media (max-width: 640px)': {
      gridTemplateColumns: '1fr',
    },
  },
  form: {
    marginBottom: '32px',
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#475569',
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '12px',
    fontWeight: '500',
    marginLeft: '8px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
  },
  inputIcon: {
    position: 'absolute',
    left: '18px',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '18px 18px 18px 52px',
    border: 'none',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    backgroundColor: 'transparent',
    color: '#1e293b',
    '&::placeholder': {
      color: '#94a3b8',
    },
  },
  passwordToggle: {
    position: 'absolute',
    right: '18px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    borderRadius: '6px',
    transition: 'background 0.2s ease',
    '&:hover': {
      background: '#f1f5f9',
    },
  },
  passwordStrengthContainer: {
    marginTop: '8px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  strengthBar: {
    height: '6px',
    background: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  strengthFill: {
    height: '100%',
    transition: 'all 0.3s ease',
    borderRadius: '3px',
  },
  requirements: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    fontSize: '12px',
  },
  requirement: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  requirementText: {
    fontSize: '12px',
    fontWeight: '500',
  },
  roleContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    '@media (max-width: 640px)': {
      gridTemplateColumns: '1fr',
    },
  },
  roleCard: {
    padding: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    '&:hover': {
      borderColor: '#c7d2fe',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.1)',
    },
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleDescription: {
    fontSize: '12px',
    color: '#64748b',
    lineHeight: 1.4,
  },
  termsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    borderRadius: '6px',
    border: '2px solid #cbd5e1',
    cursor: 'pointer',
    accentColor: '#4f46e5',
  },
  termsText: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: 1.5,
  },
  termsLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '600',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  button: {
    width: '100%',
    padding: '18px',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 25px rgba(79, 70, 229, 0.4)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&:disabled': {
      opacity: 0.7,
      cursor: 'not-allowed',
      transform: 'none',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
      transition: '0.5s',
    },
    '&:hover::before': {
      left: '100%',
    },
  },
  message: {
    marginTop: '20px',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    animation: 'fadeInUp 0.3s ease-out',
  },
  success: {
    background: '#f0fdf4',
    color: '#166534',
    border: '1px solid #bbf7d0',
  },
  error: {
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    margin: '32px 0',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '0',
      right: '0',
      height: '1px',
      background: '#e2e8f0',
    },
  },
  dividerText: {
    position: 'relative',
    display: 'inline-block',
    padding: '0 16px',
    background: 'white',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
  },
  socialContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
  },
  socialButton: {
    flex: 1,
    padding: '14px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    background: 'white',
    fontSize: '14px',
    fontWeight: '500',
    color: '#475569',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: '#cbd5e1',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    },
  },
  socialIcon: {
    width: '20px',
    height: '20px',
  },
  footerText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '15px',
    paddingTop: '24px',
    borderTop: '1px solid #e2e8f0',
  },
  link: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
};

export default Register;