import React from 'react';

const Sidebar = ({
  currentUser,
  currentView,
  activeTab,
  onNavigate,
  onSelectTab,
  onLogout,
  mobileOpen = false,
  onCloseMobile = null
}) => {
  const role = (currentUser?.role || 'STUDENT').toUpperCase().replace('ROLE_', '');
  const username = currentUser?.username || 'User';

  const handleNav = (view, tab) => {
    if (onCloseMobile) {
      onCloseMobile();
    }
    onNavigate(view);
    if (onSelectTab && tab) {
      onSelectTab(tab);
    }
  };

  const handleLogoutClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="modal-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
          style={{ zIndex: 140 }}
        />
      )}

      <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div>
          {/* Brand Header */}
          <div className="sidebar-header">
            <div
              className="brand-section"
              onClick={() => handleNav('dashboard', 'overview')}
              role="button"
              tabIndex={0}
            >
              <span className="sidebar-brand-text">Course Management</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="sidebar-nav">
            {/* ============================================================= */}
            {/* STUDENT NAVIGATION */}
            {/* ============================================================= */}
            {role === 'STUDENT' && (
              <>
                <button
                  type="button"
                  data-testid="nav-dashboard"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && (!activeTab || activeTab === 'overview') ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'overview')}
                >
                  Dashboard
                </button>

                <button
                  type="button"
                  data-testid="nav-list"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'browse' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'browse')}
                >
                  Browse Courses
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'my-courses' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'my-courses')}
                >
                  My Courses & Progress
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'schedule' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'schedule')}
                >
                  Class Timetable
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'assessments' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'assessments')}
                >
                  Assignments & Grades
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'resources' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'resources')}
                >
                  Learning Resources
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'support' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'support')}
                >
                  Help & Support
                </button>

                <span style={{ display: 'none' }}>
                  <button data-testid="nav-add" onClick={() => handleNav('add')}>Add Course</button>
                </span>
              </>
            )}

            {/* ============================================================= */}
            {/* TRAINER NAVIGATION */}
            {/* ============================================================= */}
            {role === 'TRAINER' && (
              <>
                <button
                  type="button"
                  data-testid="nav-dashboard"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && (!activeTab || activeTab === 'overview') ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'overview')}
                >
                  Dashboard
                </button>

                <button
                  type="button"
                  data-testid="nav-list"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'courses' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'courses')}
                >
                  My Courses
                </button>

                <button
                  type="button"
                  data-testid="nav-add"
                  className={`sidebar-nav-item ${(currentView === 'add' || activeTab === 'create-course' || activeTab === 'add') ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'create-course')}
                >
                  Create Course
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'schedule' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'schedule')}
                >
                  Schedule
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'assessments' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'assessments')}
                >
                  Assessments
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'progress' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'progress')}
                >
                  Student Progress
                </button>
              </>
            )}

            {/* ============================================================= */}
            {/* TRAINING MANAGER NAVIGATION */}
            {/* ============================================================= */}
            {role === 'TRAINING_MANAGER' && (
              <>
                <button
                  type="button"
                  data-testid="nav-dashboard"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && (!activeTab || activeTab === 'overview') ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'overview')}
                >
                  Dashboard
                </button>

                <button
                  type="button"
                  data-testid="nav-list"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'approvals' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'approvals')}
                >
                  Course Approvals
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'all-courses' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'all-courses')}
                >
                  Courses
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'trainers' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'trainers')}
                >
                  Trainers
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'schedules' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'schedules')}
                >
                  Schedules
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'reports' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'reports')}
                >
                  Reports
                </button>

                <span style={{ display: 'none' }}>
                  <button data-testid="nav-add" onClick={() => handleNav('add')}>Add Course</button>
                </span>
              </>
            )}

            {/* ============================================================= */}
            {/* ADMIN NAVIGATION */}
            {/* ============================================================= */}
            {role === 'ADMIN' && (
              <>
                <button
                  type="button"
                  data-testid="nav-dashboard"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && (!activeTab || activeTab === 'overview') ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'overview')}
                >
                  Dashboard
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'users')}
                >
                  Users
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'trainers' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'trainers')}
                >
                  Trainers
                </button>

                <button
                  type="button"
                  data-testid="nav-list"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'courses' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'courses')}
                >
                  Courses
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'approvals' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'approvals')}
                >
                  Approvals
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'reports' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'reports')}
                >
                  Reports
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${currentView === 'dashboard' && activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard', 'settings')}
                >
                  Settings
                </button>

                <span style={{ display: 'none' }}>
                  <button data-testid="nav-add" onClick={() => handleNav('add')}>Add Course</button>
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Footer Profile & Logout */}
        <div className="sidebar-footer">
          <div className="user-info-pill" style={{ marginBottom: '0.75rem', justifyContent: 'center' }}>
            <span>{username}</span>
            <span>|</span>
            <span className="user-info-role">{role}</span>
          </div>

          <button
            type="button"
            data-testid="nav-logout"
            onClick={handleLogoutClick}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%' }}
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
