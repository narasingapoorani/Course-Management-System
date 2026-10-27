import React, { useEffect, useState, useMemo } from 'react';
import { CourseService, TrainerService, ScheduleService } from '../utils/api';
import Modal from './common/Modal';
import Toast from './common/Toast';
import Badge from './common/Badge';
import EmptyState from './common/EmptyState';
import LoadingSpinner from './common/LoadingSpinner';
import Pagination from './common/Pagination';

const TrainingManagerDashboard = ({ defaultTab = 'overview' }) => {
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Pagination states
  const [allCoursesPage, setAllCoursesPage] = useState(1);
  const [allCoursesPageSize, setAllCoursesPageSize] = useState(6);

  // Reject Course Modal
  const [rejectCourseModal, setRejectCourseModal] = useState(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('Prerequisites and learning objectives require further detail.');

  const loadManagerData = async () => {
    setLoading(true);
    setError('');
    try {
      const [cRes, tRes, sRes] = await Promise.all([
        CourseService.getAllCourses(),
        TrainerService.getAllTrainers().catch(() => ({ data: [] })),
        ScheduleService.getAllSchedules().catch(() => ({ data: [] }))
      ]);
      setCourses(cRes.data || []);
      setTrainers(tRes.data || []);
      setSchedules(sRes.data || []);
    } catch (err) {
      setError('Failed to fetch training manager data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagerData();
  }, []);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleApproveCourse = async (courseId) => {
    try {
      await CourseService.approveCourse(courseId);
      setMessage(`Course #${courseId} approved successfully and published to active catalog!`);
      loadManagerData();
    } catch (err) {
      setError('Failed to approve course.');
    }
  };

  const handleConfirmRejectCourse = async () => {
    if (!rejectCourseModal) return;
    try {
      await CourseService.rejectCourse(rejectCourseModal.courseId, rejectionFeedback);
      setMessage(`Course #${rejectCourseModal.courseId} returned to trainer for revision.`);
      setRejectCourseModal(null);
      setRejectionFeedback('Prerequisites and learning objectives require further detail.');
      loadManagerData();
    } catch (err) {
      setError('Failed to reject course.');
    }
  };

  const handleExportQAReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Title,Trainer,Price,Status\n";
    courses.forEach(c => {
      csvContent += `${c.courseId},"${c.title}","${c.trainerName || 'N/A'}",$${c.price || 0},${c.status || 'DRAFT'}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `qa_accreditation_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setMessage('QA report exported successfully!');
  };

  const pendingCourses = useMemo(() => {
    return courses.filter((c) => (c.status || '').toUpperCase() === 'PENDING_APPROVAL');
  }, [courses]);

  const approvedCourses = useMemo(() => {
    return courses.filter((c) => (c.status || '').toUpperCase() === 'APPROVED' || c.isActive);
  }, [courses]);

  const paginatedAllCourses = useMemo(() => {
    const start = (allCoursesPage - 1) * allCoursesPageSize;
    return courses.slice(start, start + allCoursesPageSize);
  }, [courses, allCoursesPage, allCoursesPageSize]);

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading Training Manager Dashboard..."
        subtext="Fetching course approval queue, faculty records, and schedules"
      />
    );
  }

  return (
    <div>
      <Toast type="success" message={message} onClose={() => setMessage('')} />
      <Toast type="danger" message={error} onClose={() => setError('')} />

      {/* ========================================================================= */}
      {/* 1. TRAINING MANAGER OVERVIEW (SHOWS STATS ONLY ON THIS TAB) */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div>
          <div className="page-header">
            <div>
              <h2 className="page-title">Training Manager Dashboard</h2>
              <p className="page-subtitle">Curriculum quality assurance, course accreditation approvals, and faculty evaluations.</p>
            </div>
          </div>

          {/* 4 Summary Cards (ONLY ON DASHBOARD) */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Pending Approvals</span>
              <div className="stat-value">{pendingCourses.length}</div>
              <span className="stat-desc">Review queue count</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Approved & Active</span>
              <div className="stat-value">{approvedCourses.length}</div>
              <span className="stat-desc">Accredited catalog</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Certified Trainers</span>
              <div className="stat-value">{trainers.length}</div>
              <span className="stat-desc">Faculty members</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Total Schedules</span>
              <div className="stat-value">{schedules.length}</div>
              <span className="stat-desc">Active timetables</span>
            </div>
          </div>

          {/* Course Approval Queue Table */}
          <div className="content-card">
            <div className="content-card-header">
              <div>
                <h3 className="content-card-title">Pending Course Approvals</h3>
                <div className="content-card-subtitle">Review newly authored syllabi before public release</div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('approvals')}
                className="btn btn-secondary btn-sm"
              >
                View Full Queue
              </button>
            </div>

            {pendingCourses.length === 0 ? (
              <EmptyState
                title="No courses pending approval"
                description="All submitted courses have been reviewed and approved."
              />
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Course Title</th>
                      <th>Category</th>
                      <th>Trainer</th>
                      <th>Duration</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCourses.map((c) => (
                      <tr key={c.courseId}>
                        <td>#{c.courseId}</td>
                        <td>
                          <strong>{c.title}</strong>
                        </td>
                        <td>{c.category || 'Software'}</td>
                        <td>{c.trainerName || 'Instructor'}</td>
                        <td>{c.duration} hrs</td>
                        <td>${Number(c.price || 0).toFixed(2)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleApproveCourse(c.courseId)}
                              className="btn btn-success btn-sm"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectCourseModal(c)}
                              className="btn btn-danger btn-sm"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. COURSE APPROVALS TAB (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'approvals' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">Course Approvals</h2>
              <p className="page-subtitle">Quality review of submitted course syllabi and learning objectives.</p>
            </div>
          </div>

          {pendingCourses.length === 0 ? (
            <EmptyState
              title="No courses pending approval"
              description="The review queue is currently empty."
            />
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Course Title</th>
                    <th>Category</th>
                    <th>Trainer</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCourses.map((c) => (
                    <tr key={c.courseId}>
                      <td>#{c.courseId}</td>
                      <td>
                        <strong>{c.title}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.description}</div>
                      </td>
                      <td>{c.category || 'Software'}</td>
                      <td>{c.trainerName || 'Instructor'}</td>
                      <td>{c.duration} hrs</td>
                      <td>${Number(c.price || 0).toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleApproveCourse(c.courseId)}
                            className="btn btn-success btn-sm"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectCourseModal(c)}
                            className="btn btn-danger btn-sm"
                          >
                            Request Revision
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. COURSES TAB (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'all-courses' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">Courses</h2>
              <p className="page-subtitle">Complete institutional course curriculum directory.</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Level</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAllCourses.map((c) => {
                  const status = (c.status || (c.isActive ? 'APPROVED' : 'DRAFT')).toUpperCase();
                  return (
                    <tr key={c.courseId}>
                      <td>#{c.courseId}</td>
                      <td><strong>{c.title}</strong></td>
                      <td>{c.category || 'Software'}</td>
                      <td><Badge type="draft">{c.level || 'Beginner'}</Badge></td>
                      <td>{c.duration} hrs</td>
                      <td>${Number(c.price || 0).toFixed(2)}</td>
                      <td>
                        <Badge type={status === 'APPROVED' ? 'approved' : status === 'PENDING_APPROVAL' ? 'pending' : 'draft'}>
                          {status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={allCoursesPage}
            totalItems={courses.length}
            pageSize={allCoursesPageSize}
            onPageChange={(p) => setAllCoursesPage(p)}
            onPageSizeChange={(s) => setAllCoursesPageSize(s)}
            pageSizeOptions={[6, 12, 24]}
            itemLabel="courses"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TRAINER MANAGEMENT TAB (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'trainers' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">Trainer Management</h2>
              <p className="page-subtitle">Faculty profiles, specializations, and verification statuses.</p>
            </div>
          </div>

          {trainers.length === 0 ? (
            <EmptyState title="No trainers registered in directory" />
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Trainer</th>
                    <th>Qualifications</th>
                    <th>Specializations</th>
                    <th>Experience</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trainers.map((t) => (
                    <tr key={t.id}>
                      <td><strong>{t.professionalName || t.username}</strong></td>
                      <td>{t.qualifications || 'Degree on file'}</td>
                      <td>{t.specializations || 'Software Engineering'}</td>
                      <td>{t.yearsExperience || 2} years</td>
                      <td>
                        <Badge type={t.approvalStatus === 'APPROVED' ? 'approved' : 'pending'}>
                          {t.approvalStatus || 'PENDING'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SCHEDULE MONITORING TAB (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'schedules' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">Schedule Monitoring</h2>
              <p className="page-subtitle">All scheduled sessions across faculty and classrooms.</p>
            </div>
          </div>

          {schedules.length === 0 ? (
            <EmptyState title="No sessions currently scheduled" />
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Course ID</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Location / Room</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.sessionTitle}</strong></td>
                      <td>Course #{s.courseId}</td>
                      <td>{s.sessionDate}</td>
                      <td>{s.startTime || '10:00'} - {s.endTime || '12:00'}</td>
                      <td>{s.roomNumber || s.location || 'Hall A'}</td>
                      <td><Badge type="enrolled">{s.sessionType || 'LECTURE'}</Badge></td>
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
              <p className="page-subtitle">Institutional curriculum QA metrics and accreditation export.</p>
            </div>
            <button
              type="button"
              onClick={handleExportQAReport}
              className="btn btn-primary"
            >
              Export QA Report (CSV)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div className="content-card" style={{ margin: 0 }}>
              <span className="stat-label">Total Curricula</span>
              <div className="stat-value">{courses.length}</div>
            </div>
            <div className="content-card" style={{ margin: 0 }}>
              <span className="stat-label">Approval Rate</span>
              <div className="stat-value">
                {courses.length > 0 ? Math.round((approvedCourses.length / courses.length) * 100) : 100}%
              </div>
            </div>
            <div className="content-card" style={{ margin: 0 }}>
              <span className="stat-label">Pending In Queue</span>
              <div className="stat-value">{pendingCourses.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REJECT COURSE CONFIRMATION */}
      {/* ========================================================================= */}
      {rejectCourseModal && (
        <Modal
          isOpen={true}
          title={`Request Revision for Course #${rejectCourseModal.courseId}`}
          onClose={() => setRejectCourseModal(null)}
          onConfirm={handleConfirmRejectCourse}
          confirmText="Send Revision Notes"
          confirmVariant="danger"
        >
          <p style={{ marginBottom: '1rem' }}>
            Course: <strong>"{rejectCourseModal.title}"</strong>
          </p>
          <div className="form-group">
            <label>Revision Feedback for Instructor *</label>
            <textarea
              rows="4"
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              required
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TrainingManagerDashboard;
