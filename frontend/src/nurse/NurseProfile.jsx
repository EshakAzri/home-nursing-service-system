import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Briefcase, Award, Clock, DollarSign, 
  Calendar, FileText, Edit2, Save, X, CheckCircle, AlertCircle, Lock, Eye, EyeOff 
} from 'lucide-react';
import NurseSidebar from './NurseSidebar';
import './NurseProfile.css';

const NurseProfile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    specialization: '',
    yearsOfExperience: 0,
    hourlyRate: 0,
    bio: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    dateOfBirth: '',
    isAvailable: true
  });
  
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const navigate = useNavigate();

  const passwordRequirements = [
    { label: 'At least 8 characters', regex: /.{8,}/ },
    { label: 'Contains uppercase letter', regex: /[A-Z]/ },
    { label: 'Contains lowercase letter', regex: /[a-z]/ },
    { label: 'Contains number', regex: /\d/ },
    { label: 'Contains special character', regex: /[!@#$%^&*(),.?":{}|<>]/ }
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const showFeedback = (text, type) => {
    setMessage({ text, type });
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 300);
    }, 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  useEffect(() => {
    fetchNurseProfile();
  }, []);

  const fetchNurseProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const userResponse = await axios.get('http://localhost:8080/api/auth/me', config);
      const email = userResponse.data.email;

      // Fetch nurse profile by email - this endpoint is public, so don't send token
      const nurseResponse = await axios.get(`http://localhost:8080/api/nurses/email/${email}`);
      
      if (nurseResponse.data && nurseResponse.data.length > 0) {
        setProfile(nurseResponse.data[0]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      showFeedback('Failed to load profile: ' + (err.response?.data?.error || err.message), 'error');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (
        name === 'yearsOfExperience' || name === 'hourlyRate' ? parseFloat(value) : value
      )
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(`http://localhost:8080/api/nurses/${profile.id}`, profile, config);
      
      setEditMode(false);
      showFeedback('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      showFeedback('Failed to update profile: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showFeedback('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showFeedback('Password must be at least 8 characters long', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post('http://localhost:8080/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, config);

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      setShowPasswords({ current: false, new: false, confirm: false });
      showFeedback('Password changed successfully!', 'success');
    } catch (err) {
      console.error('Error changing password:', err);
      showFeedback(err.response?.data?.error || 'Failed to change password', 'error');
    }
  };

  if (loading) {
    return (
      <div className="nurse-layout">
        <NurseSidebar onLogout={handleLogout} isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className="nurse-main">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="nurse-layout">
      <NurseSidebar onLogout={handleLogout} isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className={`nurse-main ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
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
            <p>View and update your professional information</p>
          </div>

          <div className="profile-content">
            {/* Personal Information Card */}
            <div className="profile-card">
              <div className="profile-card-header">
                <h2>Personal Information</h2>
                <button 
                  className={`btn-edit ${editMode ? 'cancel' : ''}`}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? (
                    <>
                      <X size={16} />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 size={16} />
                      Edit
                    </>
                  )}
                </button>
              </div>
              <div className="profile-card-body">
                <div className="profile-field">
                  <label>
                    <User size={16} />
                    First Name
                  </label>
                  <input 
                    type="text"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="profile-input"
                  />
                </div>

                <div className="profile-field">
                  <label>
                    <User size={16} />
                    Last Name
                  </label>
                  <input 
                    type="text"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="profile-input"
                  />
                </div>

                <div className="profile-field">
                  <label>
                    <Mail size={16} />
                    Email
                  </label>
                  <div className="profile-value">
                    {profile.email}
                  </div>
                </div>

                <div className="profile-field">
                  <label>
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input 
                    type="tel"
                    name="phoneNumber"
                    value={profile.phoneNumber}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="profile-input"
                  />
                </div>

                <div className="profile-field">
                  <label>
                    <Calendar size={16} />
                    Date of Birth
                  </label>
                  <input 
                    type="date"
                    name="dateOfBirth"
                    value={profile.dateOfBirth}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="profile-input"
                  />
                </div>
              </div>
            </div>

            {/* Password & Security Card */}
            <div className="profile-card profile-card-full">
              <div className="profile-card-header">
                <h2>Password & Security</h2>
                <button 
                  className="btn-edit"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  <Lock size={16} />
                  {showPasswordForm ? 'Hide' : 'Change Password'}
                </button>
              </div>

              {showPasswordForm && (
                <form className="profile-card-body" onSubmit={handleChangePassword}>
                  <div className="profile-field">
                    <label>
                      <Lock size={16} />
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
                      <Lock size={16} />
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
                      <Lock size={16} />
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

            {/* Professional Information Card */}
            <div className="profile-card">
              <div className="profile-card-header">
                <h2>Professional Information</h2>
              </div>
              <div className="profile-card-body">
                <div className="profile-field">
                  <label>
                    <Briefcase size={16} />
                    Specialization
                  </label>
                  <div className="profile-value">
                    {profile.specialization}
                  </div>
                </div>

                <div className="profile-field">
                  <label>
                    <Award size={16} />
                    Years of Experience
                  </label>
                  <div className="profile-value">
                    {profile.yearsOfExperience}
                  </div>
                </div>

                <div className="profile-field">
                  <label>
                    <DollarSign size={16} />
                    Hourly Rate (RM)
                  </label>
                  <div className="profile-value">
                    {profile.hourlyRate}
                  </div>
                </div>

                <div className="profile-field">
                  <label>
                    <Clock size={16} />
                    Availability
                  </label>
                  <div className="profile-value">
                    {profile.isAvailable ? 'Available' : 'Not Available'}
                  </div>
                </div>
              </div>
            </div>

            {/* License Information Card */}
            <div className="profile-card">
              <div className="profile-card-header">
                <h2>License Information</h2>
              </div>
              <div className="profile-card-body">
                <div className="profile-field">
                  <label>
                    <FileText size={16} />
                    License Number
                  </label>
                  <div className="profile-value">
                    {profile.licenseNumber}
                  </div>
                </div>

                <div className="profile-field">
                  <label>
                    <Calendar size={16} />
                    License Expiry Date
                  </label>
                  <div className="profile-value">
                    {profile.licenseExpiryDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Card */}
            <div className="profile-card profile-card-full">
              <div className="profile-card-header">
                <h2>Bio</h2>
                <button 
                  className={`btn-edit ${editMode ? 'cancel' : ''}`}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? (
                    <>
                      <X size={16} />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 size={16} />
                      Edit
                    </>
                  )}
                </button>
              </div>
              <div className="profile-card-body">
                <div className="profile-field full-width">
                  <label>
                    <FileText size={16} />
                    About You
                  </label>
                  <textarea 
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="profile-textarea"
                    rows="5"
                    placeholder="Tell patients about yourself, your experience, and specialties..."
                  />
                </div>
              </div>
            </div>

            
            {editMode && (
              <button className="btn-save" onClick={handleSave}>
                <Save size={18} />
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseProfile;
