import React from 'react';

const Footer = ({ onNavigate, currentUser }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer" data-testid="app-footer">
      <div className="footer-inner">
        <div>
          <span data-testid="footer-brand-title" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            Academic Learning Portal
          </span>
          <span style={{ margin: '0 8px', color: 'var(--border)' }}>•</span>
          <span>© {currentYear}. All rights reserved.</span>
        </div>

        <ul className="footer-links-list">
          <li>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('list')}
              className="footer-link-btn"
            >
              Course Catalog
            </button>
          </li>
          {currentUser ? (
            <li>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('dashboard')}
                className="footer-link-btn"
              >
                My Dashboard
              </button>
            </li>
          ) : (
            <li>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('login')}
                className="footer-link-btn"
              >
                Sign In
              </button>
            </li>
          )}
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
