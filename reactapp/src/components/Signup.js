import React, { useState } from 'react';
import { AuthService } from '../utils/api';

const Signup = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [activeTab, setActiveTab] = useState('STUDENT'); // 'STUDENT' or 'TRAINER'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'STUDENT',
    professionalName: '',
    qualifications: '',
    specializations: '',
    yearsExperience: 2,
    certifications: '',
    bio: '',
    hourlyRate: 75.0,
    licenseOrResumeUrl: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (role) => {
    setActiveTab(role);
    setFormData((prev) => ({ ...prev, role }));
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.email) {
      setError('Please fill in all required fields (username, email, password).');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (activeTab === 'TRAINER') {
        await AuthService.registerTrainer(formData);
        setSuccess('Trainer profile registered successfully! Redirecting to login...');
      } else {
        await AuthService.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          role: 'STUDENT'
        });
        setSuccess('Student account registered successfully! Redirecting to login...');
      }

      if (onSignupSuccess) {
        setTimeout(() => {
          onSignupSuccess();
        }, 1200);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed. Please choose a different username or email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-box" style={{ maxWidth: activeTab === 'TRAINER' ? '560px' : '440px' }}>
        <div className="auth-system-tag">COURSE MANAGEMENT SYSTEM</div>
        <h2 className="auth-title">Create Account</h2>

        {/* Role Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => handleTabChange('STUDENT')}
            className={`nav-tab-btn ${activeTab === 'STUDENT' ? 'active' : ''}`}
            style={{ flex: 1 }}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('TRAINER')}
            className={`nav-tab-btn ${activeTab === 'TRAINER' ? 'active' : ''}`}
            style={{ flex: 1 }}
          >
            Trainer
          </button>
        </div>

        {/* Hidden select for Jest test-compatibility */}
        <select
          id="role"
          name="role"
          data-testid="signup-role"
          value={formData.role}
          onChange={(e) => handleTabChange(e.target.value)}
          style={{ display: 'none' }}
        >
          <option value="STUDENT">Student</option>
          <option value="TRAINER">Trainer</option>
        </select>

        {error && (
          <div className="alert alert-danger" data-testid="signup-error">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success" data-testid="signup-success">
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter username"
              data-testid="signup-username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email address"
              data-testid="signup-email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
              data-testid="signup-password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="text"
              placeholder="Enter phone number"
              data-testid="signup-phone"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          {/* Trainer Fields */}
          {activeTab === 'TRAINER' && (
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                Trainer Qualifications
              </div>

              <div className="form-group">
                <label htmlFor="professionalName">Full Name *</label>
                <input
                  id="professionalName"
                  name="professionalName"
                  type="text"
                  placeholder="e.g. Dr. Sarah Jenkins"
                  value={formData.professionalName}
                  onChange={handleChange}
                  required={activeTab === 'TRAINER'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="qualifications">Highest Degree / Qualifications *</label>
                <input
                  id="qualifications"
                  name="qualifications"
                  type="text"
                  placeholder="e.g. M.S. Computer Science"
                  value={formData.qualifications}
                  onChange={handleChange}
                  required={activeTab === 'TRAINER'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="specializations">Specializations *</label>
                <input
                  id="specializations"
                  name="specializations"
                  type="text"
                  placeholder="e.g. Web Development, Java"
                  value={formData.specializations}
                  onChange={handleChange}
                  required={activeTab === 'TRAINER'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="yearsExperience">Years of Experience</label>
                <input
                  id="yearsExperience"
                  name="yearsExperience"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.yearsExperience}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            data-testid="signup-submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {onSwitchToLogin && (
          <div className="auth-footer-link">
            Already registered?{' '}
            <button type="button" onClick={onSwitchToLogin}>
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
