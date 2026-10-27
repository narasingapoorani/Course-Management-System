import React, { useState } from 'react';
import { AuthService } from '../utils/api';

const Login = ({ onLoginSuccess, onSwitchToSignup }) => {
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      setError('Please provide both username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await AuthService.login(credentials);
      const { token, role, username, id } = response.data;

      // Backend role verification against selected role
      const backendRole = (role || 'STUDENT').toUpperCase().replace('ROLE_', '');
      const expectedRole = selectedRole.toUpperCase().replace('ROLE_', '');

      if (backendRole !== expectedRole) {
        setError('Selected role does not match this account.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('role', role || 'STUDENT');
      localStorage.setItem('username', username || credentials.username);
      if (id) localStorage.setItem('userId', id);

      if (onLoginSuccess) {
        onLoginSuccess({ token, role: role || 'STUDENT', username: username || credentials.username, id });
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-box">
        <div className="auth-system-tag">COURSE MANAGEMENT SYSTEM</div>
        <h2 className="auth-title">Login</h2>

        {error && (
          <div className="alert alert-danger" data-testid="login-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection Dropdown (Requirement 1) */}
          <div className="form-group">
            <label htmlFor="roleSelect">Role</label>
            <select
              id="roleSelect"
              data-testid="login-role-select"
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setError('');
              }}
              className="filter-select"
              style={{ width: '100%' }}
            >
              <option value="STUDENT">Student</option>
              <option value="TRAINER">Trainer</option>
              <option value="TRAINING_MANAGER">Training Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter username"
              data-testid="login-username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
              data-testid="login-password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            data-testid="login-submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {onSwitchToSignup && (
          <div className="auth-footer-link">
            New user?{' '}
            <button type="button" onClick={onSwitchToSignup}>
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
