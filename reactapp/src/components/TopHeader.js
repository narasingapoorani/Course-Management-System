import React from 'react';

const TopHeader = ({ currentUser, currentView, activeTab, onNavigate, onToggleMobileSidebar }) => {
  const role = (currentUser?.role || 'STUDENT').toUpperCase().replace('ROLE_', '');

  const getPageTitle = () => {
    if (currentView === 'add') {
      return 'Create New Course';
    }
    if (currentView === 'list') {
      return 'Course Catalog';
    }

    if (role === 'STUDENT') {
      switch (activeTab) {
        case 'browse':
          return 'Course Catalog';
        case 'my-courses':
          return 'My Courses & Progress';
        case 'schedule':
          return 'Class Timetable';
        case 'assessments':
          return 'Assignments & Grades';
        case 'resources':
          return 'Learning Resources';
        case 'support':
          return 'Help & Support';
        case 'overview':
        default:
          return 'Dashboard';
      }
    }

    if (role === 'TRAINER') {
      switch (activeTab) {
        case 'courses':
          return 'My Courses';
        case 'create-course':
        case 'add':
          return 'Create Course';
        case 'schedule':
          return 'Schedule Management';
        case 'assessments':
          return 'Assessments & Grading';
        case 'progress':
          return 'Student Progress';
        case 'overview':
        default:
          return 'Trainer Dashboard';
      }
    }

    if (role === 'TRAINING_MANAGER') {
      switch (activeTab) {
        case 'approvals':
          return 'Course Approvals';
        case 'all-courses':
          return 'Courses';
        case 'trainers':
          return 'Trainer Management';
        case 'schedules':
          return 'Schedule Monitoring';
        case 'reports':
          return 'Reports';
        case 'overview':
        default:
          return 'Training Manager Dashboard';
      }
    }

    if (role === 'ADMIN') {
      switch (activeTab) {
        case 'users':
          return 'User Management';
        case 'trainers':
          return 'Trainer Management';
        case 'courses':
          return 'Course Management';
        case 'approvals':
          return 'Approvals';
        case 'reports':
          return 'Reports';
        case 'settings':
          return 'Settings';
        case 'overview':
        default:
          return 'Admin Dashboard';
      }
    }

    return 'Course Management System';
  };

  const title = getPageTitle();

  return (
    <header className="top-header">
      <div className="top-header-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onToggleMobileSidebar && (
            <button
              type="button"
              className="mobile-menu-toggle-btn"
              onClick={onToggleMobileSidebar}
              aria-label="Toggle navigation drawer"
            >
              ☰
            </button>
          )}
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            {title}
          </h2>
        </div>

        <div className="header-actions">
          <div className="user-info-pill">
            <span>{currentUser?.username || 'User'}</span>
            <span>|</span>
            <span className="user-info-role">{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
