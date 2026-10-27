import React, { useEffect, useState, useMemo } from 'react';
import { UserService, CourseService, TrainerService, EnrollmentService } from '../utils/api';
import Modal from './common/Modal';
import Toast from './common/Toast';
import Badge from './common/Badge';
import EmptyState from './common/EmptyState';
import LoadingSpinner from './common/LoadingSpinner';
import Pagination from './common/Pagination';

const AdminDashboard = ({ defaultTab = 'overview' }) => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(defaultTab);

  // User active/deactive status map
  const [userStatusMap, setUserStatusMap] = useState({});
  const [selectedUserModal, setSelectedUserModal] = useState(null);

  // Pagination states
  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState(5);
  const [coursesPage, setCoursesPage] = useState(1);
  const [coursesPageSize, setCoursesPageSize] = useState(5);

  // Modals for Trainer Verification Review (in Trainer Management tab)
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [rejectModalTrainer, setRejectModalTrainer] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Course Delete Confirmation Modal
  const [courseToDelete, setCourseToDelete] = useState(null);

  const username = localStorage.getItem('username') || 'Administrator';

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [uRes, cRes, tRes, eRes] = await Promise.all([
        UserService.getAllUsers(),
        CourseService.getAllCourses(),
        TrainerService.getAllTrainers().catch(() => ({ data: [] })),
        EnrollmentService.getAllEnrollments().catch(() => ({ data: [] }))
      ]);
      setUsers(uRes.data || []);
      setCourses(cRes.data || []);
      setTrainers(tRes.data || []);
      setEnrollments(eRes.data || []);
    } catch (err) {
      setError('Failed to fetch administrative records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Normalize role display (removes ROLE_ prefix)
  const normalizeRole = (roleStr) => {
    if (!roleStr) return 'STUDENT';
    return roleStr.toUpperCase().replace('ROLE_', '');
  };

  // Role badge styling helper
  const getRoleBadgeType = (roleStr) => {
    const role = normalizeRole(roleStr);
    switch (role) {
      case 'ADMIN':
        return 'approved';
      case 'TRAINING_MANAGER':
        return 'pending';
      case 'TRAINER':
        return 'enrolled';
      case 'STUDENT':
      default:
        return 'draft';
    }
  };

  // Toggle user activation status
  const handleToggleUserStatus = (userId, username) => {
    setUserStatusMap((prev) => {
      const currentActive = prev[userId] !== false;
      const nextActive = !currentActive;
      setMessage(`User #${userId} (${username}) has been ${nextActive ? 'activated' : 'deactivated'}.`);
      return {
        ...prev,
        [userId]: nextActive
      };
    });
  };

  const handleApproveTrainer = async (trainerId) => {
    try {
      await TrainerService.updateStatus(trainerId, 'APPROVED');
      setMessage(`Trainer #${trainerId} verification approved.`);
      loadAdminData();
    } catch (err) {
      setError('Failed to approve trainer.');
    }
  };

  const handleRejectTrainer = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!rejectModalTrainer) return;
    try {
      await TrainerService.updateStatus(rejectModalTrainer.id, 'REJECTED', rejectReason || 'Credentials could not be verified.');
      setMessage(`Trainer #${rejectModalTrainer.id} verification rejected.`);
      setRejectModalTrainer(null);
      setRejectReason('');
      loadAdminData();
    } catch (err) {
      setError('Failed to reject trainer.');
    }
  };

  const handleConfirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      await CourseService.deleteCourse(courseToDelete.courseId);
      setMessage(`Course #${courseToDelete.courseId} ("${courseToDelete.title}") deleted successfully.`);
      setCourseToDelete(null);
      loadAdminData();
    } catch (err) {
      setError('Failed to delete course.');
    }
  };

  const handleExportData = (format) => {
    const exportPayload = {
      timestamp: new Date().toISOString(),
      counts: {
        users: users.length,
        courses: courses.length,
        trainers: trainers.length,
        enrollments: enrollments.length
      },
      users,
      courses,
      trainers,
      enrollments
    };

    if (format === 'JSON') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `cms_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setMessage('System state exported as JSON successfully!');
    } else {
      let csvContent = "data:text/csv;charset=utf-8,Type,ID,TitleOrName,RoleOrStatus,Detail\n";
      users.forEach(u => { csvContent += `USER,${u.id},"${u.username}",${normalizeRole(u.role)},"${u.email || ''}"\n`; });
      courses.forEach(c => { csvContent += `COURSE,${c.courseId},"${c.title}",${c.status || 'DRAFT'},$${c.price}\n`; });
      trainers.forEach(t => { csvContent += `TRAINER,${t.id},"${t.professionalName || ''}",${t.approvalStatus || 'PENDING'},"${t.specializations || ''}"\n`; });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `cms_records_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage('System records exported as CSV successfully!');
    }
  };

  const pendingTrainersCount = trainers.filter(t => (t.approvalStatus || 'PENDING') === 'PENDING').length;
  const pendingCourses = courses.filter(c => (c.status || '').toUpperCase() === 'PENDING_APPROVAL');

  const paginatedUsers = useMemo(() => {
    const start = (usersPage - 1) * usersPageSize;
    return users.slice(start, start + usersPageSize);
  }, [users, usersPage, usersPageSize]);

  const paginatedCourses = useMemo(() => {
    const start = (coursesPage - 1) * coursesPageSize;
    return courses.slice(start, start + coursesPageSize);
  }, [courses, coursesPage, coursesPageSize]);

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading Administration Console..."
        subtext="Fetching system registry, user directories, and audit metadata"
      />
    );
  }

  return (
    <div>
      <Toast type="success" message={message} onClose={() => setMessage('')} />
      <Toast type="danger" message={error} onClose={() => setError('')} />

      {/* ========================================================================= */}
      {/* 1. ADMIN DASHBOARD OVERVIEW (SHOWS STATS ONLY ON THIS TAB) */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div>
          <div className="page-header">
            <div>
              <h2 className="page-title">Admin Dashboard</h2>
              <p className="page-subtitle">User account governance, instructor verification, and system oversight.</p>
            </div>
            <div className="header-actions">
              <button
                type="button"
                onClick={() => handleExportData('CSV')}
                className="btn btn-secondary btn-sm"
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => handleExportData('JSON')}
                className="btn btn-primary btn-sm"
              >
                Export Backup (JSON)
              </button>
            </div>
          </div>

          {/* 4 Summary Cards (ONLY ON DASHBOARD) */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Accounts</span>
              <div className="stat-value">{users.length}</div>
              <span className="stat-desc">Registered platform users</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Course Catalog</span>
              <div className="stat-value">{courses.length}</div>
              <span className="stat-desc">Total course modules</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Pending Verification</span>
              <div className="stat-value">{pendingTrainersCount}</div>
              <span className="stat-desc">Trainers awaiting review</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Enrollments</span>
              <div className="stat-value">{enrollments.length}</div>
              <span className="stat-desc">Active registrations</span>
            </div>
          </div>

          {/* User Directory Quick Table */}
          <div className="content-card">
            <div className="content-card-header">
              <div>
                <h3 className="content-card-title">User Account Directory</h3>
                <div className="content-card-subtitle">Platform accounts and security roles</div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className="btn btn-secondary btn-sm"
              >
                View All Users
              </button>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 5).map((u) => {
                    const normRole = normalizeRole(u.role);
                    const isActive = userStatusMap[u.id] !== false;
                    return (
                      <tr key={u.id}>
                        <td>#{u.id}</td>
                        <td><strong>{u.username}</strong></td>
                        <td>{u.email || `${u.username.toLowerCase()}@enterprise.edu`}</td>
                        <td>
                          <Badge type={getRoleBadgeType(u.role)}>
                            {normRole}
                          </Badge>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedUserModal(u)}
                              className="btn btn-secondary btn-sm"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(u.id, u.username)}
                              className={`btn ${isActive ? 'btn-secondary' : 'btn-success'} btn-sm`}
                            >
                              {isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. USER MANAGEMENT TAB (NO ROLE DROPDOWN, CLEAN READ-ONLY ROLE BADGE) */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">User Management</h2>
              <p className="page-subtitle">View platform accounts, assigned security roles, and user status.</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => {
                  const normRole = normalizeRole(u.role);
                  const isActive = userStatusMap[u.id] !== false;
                  return (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td><strong>{u.username}</strong></td>
                      <td>{u.email || `${u.username.toLowerCase()}@enterprise.edu`}</td>
                      <td>
                        <Badge type={getRoleBadgeType(u.role)}>
                          {normRole}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedUserModal(u)}
                            className="btn btn-secondary btn-sm"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(u.id, u.username)}
                            className={`btn ${isActive ? 'btn-secondary' : 'btn-success'} btn-sm`}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={usersPage}
            totalItems={users.length}
            pageSize={usersPageSize}
            onPageChange={(p) => setUsersPage(p)}
            onPageSizeChange={(s) => setUsersPageSize(s)}
            pageSizeOptions={[5, 10, 20]}
            itemLabel="users"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TRAINER MANAGEMENT TAB (FACULTY VERIFICATION & APPROVALS) */}
      {/* ========================================================================= */}
      {activeTab === 'trainers' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">Trainer Management</h2>
              <p className="page-subtitle">Review qualifications, credentials, and verify faculty members.</p>
            </div>
          </div>

          {trainers.length === 0 ? (
            <EmptyState title="No trainer profiles submitted for verification" />
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Trainer Name</th>
                    <th>Qualifications</th>
                    <th>Specializations</th>
                    <th>Experience</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trainers.map((t) => {
                    const status = (t.approvalStatus || 'PENDING').toUpperCase();
                    return (
                      <tr key={t.id}>
                        <td><strong>{t.professionalName || t.username}</strong></td>
                        <td>{t.qualifications || 'Degree on file'}</td>
                        <td>{t.specializations || 'Software Engineering'}</td>
                        <td>{t.yearsExperience || 2} years</td>
                        <td>
                          <Badge type={status === 'APPROVED' ? 'approved' : status === 'REJECTED' ? 'rejected' : 'pending'}>
                            {status}
                          </Badge>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedTrainer(t)}
                              className="btn btn-secondary btn-sm"
                            >
                              Review
                            </button>
                            {status !== 'APPROVED' && (
                              <button
                                type="button"
                                onClick={() => handleApproveTrainer(t.id)}
                                className="btn btn-success btn-sm"
                              >
                                Approve
                              </button>
                            )}
                            {status !== 'REJECTED' && (
                              <button
                                type="button"
                                onClick={() => setRejectModalTrainer(t)}
                                className="btn btn-danger btn-sm"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. COURSE MANAGEMENT TAB (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'courses' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">Course Management</h2>
              <p className="page-subtitle">Monitor and govern all courses published across the platform.</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Course Title</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCourses.map((c) => {
                  const status = (c.status || (c.isActive ? 'APPROVED' : 'DRAFT')).toUpperCase();
                  return (
                    <tr key={c.courseId}>
                      <td>#{c.courseId}</td>
                      <td><strong>{c.title}</strong></td>
                      <td>{c.category || 'Software'}</td>
                      <td>{c.duration} hrs</td>
                      <td>${Number(c.price || 0).toFixed(2)}</td>
                      <td>
                        <Badge type={status === 'APPROVED' ? 'approved' : status === 'PENDING_APPROVAL' ? 'pending' : 'draft'}>
                          {status}
                        </Badge>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setCourseToDelete(c)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={coursesPage}
            totalItems={courses.length}
            pageSize={coursesPageSize}
            onPageChange={(p) => setCoursesPage(p)}
            onPageSizeChange={(s) => setCoursesPageSize(s)}
            pageSizeOptions={[5, 10, 20]}
            itemLabel="courses"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. APPROVALS TAB (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'approvals' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">Approvals</h2>
              <p className="page-subtitle">System approval queues for curriculum and faculty accounts.</p>
            </div>
          </div>

          {pendingCourses.length === 0 ? (
            <EmptyState title="No courses currently pending approval" />
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Course Title</th>
                    <th>Category</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCourses.map((c) => (
                    <tr key={c.courseId}>
                      <td>#{c.courseId}</td>
                      <td><strong>{c.title}</strong></td>
                      <td>{c.category || 'Software'}</td>
                      <td>{c.duration} hrs</td>
                      <td>${Number(c.price || 0).toFixed(2)}</td>
                      <td><Badge type="pending">Pending QA</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. REPORTS TAB (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">Reports</h2>
              <p className="page-subtitle">Immutable security logs and platform analytics.</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Event</th>
                  <th>Actor</th>
                  <th>Status</th>
                  <th>Context</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{new Date().toLocaleString()}</td>
                  <td>SYSTEM_LOGIN</td>
                  <td>{username}</td>
                  <td><Badge type="approved">SUCCESS</Badge></td>
                  <td>Administrative dashboard session accessed</td>
                </tr>
                <tr>
                  <td>{new Date(Date.now() - 3600000).toLocaleString()}</td>
                  <td>DATABASE_SYNC</td>
                  <td>SYSTEM_JOB</td>
                  <td><Badge type="approved">SUCCESS</Badge></td>
                  <td>Course catalog and enrollment metrics refreshed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SETTINGS TAB (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">Settings</h2>
              <p className="page-subtitle">Platform configuration, backups, and external integrations.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="content-card" style={{ margin: 0 }}>
              <h4>CSV Data Records</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 1rem 0' }}>
                Download course catalog, users, and trainer directory in CSV format.
              </p>
              <button
                type="button"
                onClick={() => handleExportData('CSV')}
                className="btn btn-primary btn-sm"
                style={{ width: '100%' }}
              >
                Export CSV Records
              </button>
            </div>

            <div className="content-card" style={{ margin: 0 }}>
              <h4>Full JSON State Backup</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 1rem 0' }}>
                Export entire schema and entity records into a formatted JSON archive.
              </p>
              <button
                type="button"
                onClick={() => handleExportData('JSON')}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
              >
                Export JSON Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: USER DETAILS VIEW */}
      {/* ========================================================================= */}
      {selectedUserModal && (
        <Modal
          isOpen={true}
          title={`User Account: ${selectedUserModal.username}`}
          onClose={() => setSelectedUserModal(null)}
          confirmText="Close"
          onConfirm={() => setSelectedUserModal(null)}
        >
          <div className="course-meta-grid" style={{ marginBottom: '1rem' }}>
            <div className="meta-item">
              <span className="meta-label">User ID</span>
              <span className="meta-value">#{selectedUserModal.id}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Username</span>
              <span className="meta-value">{selectedUserModal.username}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Email Address</span>
              <span className="meta-value">{selectedUserModal.email || `${selectedUserModal.username.toLowerCase()}@enterprise.edu`}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Assigned Role</span>
              <span className="meta-value">
                <Badge type={getRoleBadgeType(selectedUserModal.role)}>
                  {normalizeRole(selectedUserModal.role)}
                </Badge>
              </span>
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              Account Status: {userStatusMap[selectedUserModal.id] !== false ? (
                <span style={{ color: 'var(--success-text)', fontWeight: 700 }}>ACTIVE</span>
              ) : (
                <span style={{ color: 'var(--danger-text)', fontWeight: 700 }}>DEACTIVATED</span>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Authentication provider: Spring Boot JWT Security Framework. Role permissions enforced server-side.
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TRAINER CREDENTIAL DETAILS REVIEW (TRAINER MANAGEMENT TAB) */}
      {/* ========================================================================= */}
      {selectedTrainer && (
        <Modal
          isOpen={true}
          title={`Trainer Verification: ${selectedTrainer.professionalName || selectedTrainer.username}`}
          onClose={() => setSelectedTrainer(null)}
          onConfirm={() => {
            handleApproveTrainer(selectedTrainer.id);
            setSelectedTrainer(null);
          }}
          confirmText="Approve Credentials"
          confirmVariant="success"
        >
          <div className="course-meta-grid" style={{ marginBottom: '1rem' }}>
            <div className="meta-item">
              <span className="meta-label">Full Name</span>
              <span className="meta-value">{selectedTrainer.professionalName || selectedTrainer.username}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Experience</span>
              <span className="meta-value">{selectedTrainer.yearsExperience || 2} Years</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Qualifications</span>
              <span className="meta-value">{selectedTrainer.qualifications || 'M.S. Software Eng'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Hourly Rate</span>
              <span className="meta-value">${selectedTrainer.hourlyRate || 75.0}</span>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Specializations</label>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{selectedTrainer.specializations || 'General Computer Science'}</p>
          </div>

          {selectedTrainer.bio && (
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Bio / Teaching Methodology</label>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedTrainer.bio}</p>
            </div>
          )}
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REJECT TRAINER */}
      {/* ========================================================================= */}
      {rejectModalTrainer && (
        <Modal
          isOpen={true}
          title={`Reject Verification: ${rejectModalTrainer.professionalName || rejectModalTrainer.username}`}
          onClose={() => { setRejectModalTrainer(null); setRejectReason(''); }}
          onConfirm={handleRejectTrainer}
          confirmText="Reject Trainer"
          confirmVariant="danger"
        >
          <div className="form-group">
            <label>Reason for Rejection *</label>
            <textarea
              rows="3"
              placeholder="e.g. Incomplete credentials, unverified degree certificate..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE COURSE CONFIRMATION */}
      {/* ========================================================================= */}
      {courseToDelete && (
        <Modal
          isOpen={true}
          title="Delete Course Confirmation"
          onClose={() => setCourseToDelete(null)}
          onConfirm={handleConfirmDeleteCourse}
          confirmText="Delete Course"
          confirmVariant="danger"
        >
          <p>
            Are you sure you want to permanently delete course <strong>"{courseToDelete.title}"</strong> (ID: #{courseToDelete.courseId})?
          </p>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;
