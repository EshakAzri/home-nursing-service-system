import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Save, Edit2, X, Check, Shield, CheckCircle, AlertCircle, Eye, EyeOff, MapPin } from 'lucide-react';
import CustomerSidebar from './CustomerSidebar';
import './CustomerProfile.css';

const CustomerProfile = () => {
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    address: '',
    role: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editedInfo, setEditedInfo] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const navigate = useNavigate();

  const passwordRequirements = [
    { label: 'At least 8 characters', regex: /.{8,}/ },
    { label: 'Contains uppercase letter', regex: /[A-Z]/ },
    { label: 'Contains lowercase letter', regex: /[a-z]/ },
    { label: 'Contains number', regex: /\d/ },
    { label: 'Contains special character', regex: /[!@#$%^&*(),.?":{}|<>]/ }
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showFeedback = (text, type) => {
    setMessage({ text, type });
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 300);
    }, 3000);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:8080/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = {
        username: response.data.username || '',
        email: response.data.email || '',
        address: response.data.address || '',
        role: localStorage.getItem('role') || 'PATIENT'
      };

      setUserInfo(userData);
      setEditedInfo(userData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setMessage({ text: 'Failed to load profile', type: 'error' });
        setLoading(false);
      }
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      setEditedInfo(userInfo);
    }
    setEditMode(!editMode);
    setMessage({ text: '', type: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:8080/api/auth/profile', {
        username: editedInfo.username,
        email: editedInfo.email,
        address: editedInfo.address
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update token if username changed
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      setUserInfo(editedInfo);
      setEditMode(false);
      showFeedback('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showFeedback(error.response?.data?.error || 'Failed to update profile', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showFeedback('New passwords do not match', 'error');
      return;
    }

    // Validate password requirements
    if (passwordData.newPassword.length < 8) {
      showFeedback('Password must be at least 8 characters long', 'error');
      return;
    }

    if (!/(?=.*[a-z])/.test(passwordData.newPassword)) {
      showFeedback('Password must contain at least one lowercase letter', 'error');
      return;
    }

    if (!/(?=.*[A-Z])/.test(passwordData.newPassword)) {
      showFeedback('Password must contain at least one uppercase letter', 'error');
      return;
    }

    if (!/(?=.*\d)/.test(passwordData.newPassword)) {
      showFeedback('Password must contain at least one number', 'error');
      return;
    }

    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(passwordData.newPassword)) {
      showFeedback('Password must contain at least one special character', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:8080/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      showFeedback('Password changed successfully!', 'success');
    } catch (error) {
      console.error('Error changing password:', error);
      showFeedback(error.response?.data?.error || 'Failed to change password', 'error');
    }
  };

  if (loading) {
    return (
      <div className="customer-layout">
        <CustomerSidebar onLogout={handleLogout} isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className="customer-main">
          <div className="profile-container">
            <div className="loading">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-layout">
      <CustomerSidebar onLogout={handleLogout} isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className={`customer-main ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        {!sidebarOpen && <button className="sidebar-toggle" onClick={toggleSidebar}>☰</button>}
        
        {/* Feedback Popup */}
        {showPopup && (
          <div className={`feedback-popup ${message.type} ${showPopup ? 'show' : ''}`}>
            <div className="feedback-content">
              <div className="feedback-icon">
                {message.type === 'success' ? (
                  <CheckCircle size={32} />
                ) : (
                  <AlertCircle size={32} />
                )}
              </div>
              <div className="feedback-text">
                <h3>{message.type === 'success' ? 'Success!' : 'Error'}</h3>
                <p>{message.text}</p>
              </div>
              <button className="feedback-close" onClick={() => setShowPopup(false)}>
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        <div className="profile-container">
          <div className="profile-header">
            <h1>My Profile</h1>
            <p>Manage your account information</p>
          </div>

          <div className="profile-content">
            {/* Profile Info Card */}
            <div className="profile-card">
              <div className="profile-card-header-user">
                <h2>Personal Information</h2>
                <button 
                  className={`btn-edit ${editMode ? 'cancel' : ''}`}
                  onClick={handleEditToggle}
                >
                  {editMode ? (
                    <>
                      <X size={18} />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 size={18} />
                      Edit
                    </>
                  )}
                </button>
              </div>

              <div className="profile-card-body">
                <div className="profile-field-user">
                  <label>
                    <User size={18} />
                    Username
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name="username"
                      value={editedInfo.username}
                      onChange={handleInputChange}
                      className="profile-input"
                    />
                  ) : (
                    <div className="profile-value">{userInfo.username}</div>
                  )}
                </div>

                <div className="profile-field-user">
                  <label>
                    <Mail size={18} />
                    Email
                  </label>
                  {editMode ? (
                    <input
                      type="email"
                      name="email"
                      value={editedInfo.email}
                      onChange={handleInputChange}
                      className="profile-input"
                    />
                  ) : (
                    <div className="profile-value">{userInfo.email}</div>
                  )}
                </div>

                <div className="profile-field-user">
                  <label>
                    <MapPin size={18} />
                    Address
                  </label>
                  {editMode ? (
                    <textarea
                      name="address"
                      value={editedInfo.address}
                      onChange={handleInputChange}
                      className="profile-input address-input"
                      placeholder="Enter your full address"
                      rows="3"
                    />
                  ) : (
                    <div className="profile-value">{userInfo.address || 'Not provided'}</div>
                  )}
                </div>

                <div className="profile-field-user">
                  <label>
                    <Shield size={18} />
                    Role
                  </label>
                  <div className="profile-value">
                    <span className="role-badge">{userInfo.role}</span>
                  </div>
                </div>

                {editMode && (
                  <button className="btn-save" onClick={handleSaveProfile}>
                    <Save size={18} />
                    Save Changes
                  </button>
                )}
              </div>
            </div>

            {/* Password Card */}
            <div className="profile-card">
              <div className="profile-card-header-user">
                <h2>Password & Security</h2>
                <button 
                  className="btn-edit"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  <Lock size={18} />
                  {showPasswordForm ? 'Hide' : 'Change Password'}
                </button>
              </div>

              {showPasswordForm && (
                <form className="profile-card-body" onSubmit={handleChangePassword}>
                  <div className="profile-field">
                    <label>
                      <Lock size={18} />
                      Current Password
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="profile-input"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="profile-field">
                    <label>
                      <Lock size={18} />
                      New Password
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="profile-input"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {passwordData.newPassword && (
                      <div className="password-requirements">
                        {passwordRequirements.map((req, index) => {
                          const isMet = req.regex.test(passwordData.newPassword);
                          return (
                            <div key={index} className={`requirement-item ${isMet ? 'met' : ''}`}>
                              {isMet ? (
                                <CheckCircle size={14} className="requirement-icon" />
                              ) : (
                                <X size={14} className="requirement-icon" />
                              )}
                              <span>{req.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="profile-field">
                    <label>
                      <Lock size={18} />
                      Confirm New Password
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="profile-input"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn-save">
                    <Save size={18} />
                    Update Password
                  </button>
                </form>
              )}
            </div>

            {/* Account Stats */}
            <div className="profile-card stats-card">
              <div className="profile-card-header-user">
                <h2>Account Statistics</h2>
              </div>
              <div className="profile-card-body">
                <div className="stat-item">
                  <div className="stat-label">Account Type</div>
                  <div className="stat-value">{userInfo.role === 'PATIENT' ? 'Customer' : userInfo.role}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Member Since</div>
                  <div className="stat-value">2026</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Status</div>
                  <div className="stat-value">
                    <span className="status-active">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
