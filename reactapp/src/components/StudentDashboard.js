import React, { useEffect, useState, useMemo } from 'react';
import { CourseService, EnrollmentService, ScheduleService, AssessmentService } from '../utils/api';
import Pagination from './common/Pagination';
import Badge from './common/Badge';
import Toast from './common/Toast';
import LoadingSpinner from './common/LoadingSpinner';
import EmptyState from './common/EmptyState';

const StudentDashboard = ({ defaultTab = 'overview' }) => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Search & Filter state for catalog browsing tab
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');

  // Pagination states
  const [browsePage, setBrowsePage] = useState(1);
  const [browsePageSize, setBrowsePageSize] = useState(6);
  const [enrollmentsPage, setEnrollmentsPage] = useState(1);
  const [enrollmentsPageSize, setEnrollmentsPageSize] = useState(5);

  const username = localStorage.getItem('username') || 'Student';
  const userId = localStorage.getItem('userId');

  const loadStudentData = async () => {
    setLoading(true);
    setError('');
    try {
      const [cRes, eRes, sRes, aRes] = await Promise.all([
        CourseService.getAllCourses(),
        EnrollmentService.getAllEnrollments().catch(() => ({ data: [] })),
        ScheduleService.getAllSchedules().catch(() => ({ data: [] })),
        AssessmentService.getAllAssessments().catch(() => ({ data: [] }))
      ]);

      setCourses(cRes.data || []);
      const myEnrollments = (eRes.data || []).filter((e) => !userId || String(e.studentId) === String(userId));
      setEnrollments(myEnrollments.length > 0 ? myEnrollments : (eRes.data || []));
      setSchedules(sRes.data || []);
      setAssessments(aRes.data || []);
    } catch (err) {
      setError('Failed to fetch student dashboard records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleEnroll = async (courseId) => {
    try {
      await EnrollmentService.enrollCourse({
        studentId: userId ? Number(userId) : 1,
        courseId: Number(courseId)
      });
      setMessage('Enrolled in course successfully!');
      loadStudentData();
      setActiveTab('my-courses');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to enroll in course. Please try again.');
    }
  };

  const handleSimulateProgress = async (enrollmentId, currentProgress) => {
    const nextProgress = Math.min(100, Math.round((currentProgress || 0) + 20));
    try {
      await EnrollmentService.updateProgress(enrollmentId, nextProgress);
      if (nextProgress >= 100) {
        setMessage('Congratulations! Course completed and certificate issued.');
      } else {
        setMessage(`Progress updated to ${nextProgress}%.`);
      }
      loadStudentData();
    } catch (err) {
      setError('Failed to update progress.');
    }
  };

  const enrolledCourseIds = useMemo(() => {
    return new Set(enrollments.map((e) => Number(e.courseId)));
  }, [enrollments]);

  const availableCourses = useMemo(() => {
    return courses.filter((c) => c.isActive || (c.status || '').toUpperCase() === 'APPROVED');
  }, [courses]);

  const filteredCatalogCourses = useMemo(() => {
    let result = [...availableCourses];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(term) ||
          c.description?.toLowerCase().includes(term) ||
          c.category?.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== 'ALL') {
      result = result.filter(
        (c) => c.category && c.category.toUpperCase().includes(selectedCategory.toUpperCase())
      );
    }

    if (selectedLevel !== 'ALL') {
      result = result.filter((c) => (c.level || '').toUpperCase() === selectedLevel.toUpperCase());
    }

    switch (sortBy) {
      case 'TITLE_ASC':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'TITLE_DESC':
        result.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      case 'PRICE_ASC':
        result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'PRICE_DESC':
        result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case 'DURATION_ASC':
        result.sort((a, b) => (Number(a.duration) || 0) - (Number(b.duration) || 0));
        break;
      default:
        break;
    }

    return result;
  }, [availableCourses, searchTerm, selectedCategory, selectedLevel, sortBy]);

  const paginatedBrowseCourses = useMemo(() => {
    const start = (browsePage - 1) * browsePageSize;
    return filteredCatalogCourses.slice(start, start + browsePageSize);
  }, [filteredCatalogCourses, browsePage, browsePageSize]);

  const paginatedEnrollments = useMemo(() => {
    const start = (enrollmentsPage - 1) * enrollmentsPageSize;
    return enrollments.slice(start, start + enrollmentsPageSize);
  }, [enrollments, enrollmentsPage, enrollmentsPageSize]);

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading Student Portal..."
        subtext="Fetching course registrations and class schedules"
      />
    );
  }

  const completedCount = enrollments.filter((e) => (e.progressPercentage || 0) >= 100 || e.status === 'COMPLETED').length;
  const inProgressCount = enrollments.length - completedCount;
  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.progressPercentage || 0), 0) / enrollments.length)
    : 0;

  return (
    <div>
      <Toast type="success" message={message} onClose={() => setMessage('')} />
      <Toast type="danger" message={error} onClose={() => setError('')} />

      {/* ========================================================================= */}
      {/* 1. DASHBOARD OVERVIEW (Shows 4 Stats & Summary ONLY on this tab) */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div>
          <div className="page-header">
            <div>
              <h2 className="page-title">Student Dashboard</h2>
              <p className="page-subtitle">Welcome back, {username}. Track course progress, attend scheduled classes, and view certificates.</p>
            </div>
            <div className="header-actions">
              <button
                type="button"
                onClick={() => { setActiveTab('browse'); setBrowsePage(1); }}
                className="btn btn-primary"
              >
                Browse Courses
              </button>
            </div>
          </div>

          {/* 4 KPI Stats (ONLY ON DASHBOARD) */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Enrolled Courses</span>
              <div className="stat-value">{enrollments.length}</div>
              <span className="stat-desc">Active study programs</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">In Progress</span>
              <div className="stat-value">{inProgressCount}</div>
              <span className="stat-desc">Ongoing modules</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Completed</span>
              <div className="stat-value">{completedCount}</div>
              <span className="stat-desc">Issued certificates</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Average Progress</span>
              <div className="stat-value">{avgProgress}%</div>
              <span className="stat-desc">Overall completion</span>
            </div>
          </div>

          {/* My Courses & Progress Table */}
          <div className="content-card">
            <div className="content-card-header">
              <div>
                <h3 className="content-card-title">My Courses & Progress</h3>
                <div className="content-card-subtitle">Active enrollments, milestone progress, and certificates</div>
              </div>
              <button
                type="button"
                onClick={() => { setActiveTab('browse'); setBrowsePage(1); }}
                className="btn btn-secondary btn-sm"
              >
                Browse Catalog
              </button>
            </div>

            {enrollments.length === 0 ? (
              <EmptyState
                title="No course enrollments yet"
                description="Explore the catalog and enroll in your first course."
                actionText="Browse Courses"
                onAction={() => setActiveTab('browse')}
              />
            ) : (
              <>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Course Title</th>
                        <th>Category</th>
                        <th>Trainer</th>
                        <th>Level</th>
                        <th>Progress</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEnrollments.map((e) => {
                        const matchedCourse = courses.find((c) => Number(c.courseId) === Number(e.courseId)) || {};
                        const progress = Math.min(100, Math.round(e.progressPercentage || 0));
                        const isCompleted = progress >= 100 || e.status === 'COMPLETED' || e.certificateIssued;

                        return (
                          <tr key={e.id}>
                            <td>
                              <strong>{matchedCourse.title || `Course #${e.courseId}`}</strong>
                            </td>
                            <td>{matchedCourse.category || 'Computer Science'}</td>
                            <td>{matchedCourse.trainerName || 'Instructor'}</td>
                            <td><Badge type="draft">{matchedCourse.level || 'Beginner'}</Badge></td>
                            <td style={{ minWidth: '160px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="progress-bar-container">
                                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                                </div>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '35px' }}>{progress}%</span>
                              </div>
                            </td>
                            <td>
                              {isCompleted ? (
                                <Badge type="approved">Completed</Badge>
                              ) : (
                                <Badge type="enrolled">In Progress</Badge>
                              )}
                            </td>
                            <td>
                              {!isCompleted ? (
                                <button
                                  type="button"
                                  onClick={() => handleSimulateProgress(e.id, progress)}
                                  className="btn btn-primary btn-sm"
                                >
                                  +20% Progress
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setMessage(`Certificate verified for Course: "${matchedCourse.title}". Certificate ID: CERT-${e.id}-${Date.now().toString().slice(-6)}`)}
                                  className="btn btn-success btn-sm"
                                >
                                  Certificate
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={enrollmentsPage}
                  totalItems={enrollments.length}
                  pageSize={enrollmentsPageSize}
                  onPageChange={(p) => setEnrollmentsPage(p)}
                  onPageSizeChange={(s) => setEnrollmentsPageSize(s)}
                  pageSizeOptions={[5, 10, 20]}
                  itemLabel="enrollments"
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BROWSE COURSES / CATALOG (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'browse' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">Available Courses</h2>
              <p className="page-subtitle">Browse and enroll in accredited academic and technical courses.</p>
            </div>
          </div>

          {/* Search, Filters and Sorting */}
          <div className="catalog-toolbar">
            <div className="search-bar-container">
              <input
                type="text"
                className="search-input-field"
                placeholder="Search courses by title, topic..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setBrowsePage(1); }}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => { setSearchTerm(''); setBrowsePage(1); }}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="filter-dropdown-group">
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setBrowsePage(1); }}
                className="filter-select"
              >
                <option value="ALL">All Categories</option>
                <option value="DEVELOPMENT">Development</option>
                <option value="CLOUD">Cloud & DevOps</option>
                <option value="AI">AI & Data</option>
                <option value="SECURITY">Security</option>
              </select>
            </div>

            <div className="filter-dropdown-group">
              <select
                value={selectedLevel}
                onChange={(e) => { setSelectedLevel(e.target.value); setBrowsePage(1); }}
                className="filter-select"
              >
                <option value="ALL">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <div className="filter-dropdown-group">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setBrowsePage(1); }}
                className="filter-select"
              >
                <option value="DEFAULT">Sort: Default</option>
                <option value="TITLE_ASC">Title A–Z</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="DURATION_ASC">Duration: Shortest</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); setSelectedLevel('ALL'); setSortBy('DEFAULT'); setBrowsePage(1); }}
              className="btn btn-secondary btn-sm"
            >
              Reset
            </button>
          </div>

          {/* Cards Grid */}
          {filteredCatalogCourses.length === 0 ? (
            <EmptyState
              title="No courses match your criteria"
              description="Try adjusting your search terms or filters."
              actionText="Reset Filters"
              onAction={() => { setSearchTerm(''); setSelectedCategory('ALL'); setSelectedLevel('ALL'); setBrowsePage(1); }}
            />
          ) : (
            <>
              <div className="course-grid">
                {paginatedBrowseCourses.map((c) => {
                  const isEnrolled = enrolledCourseIds.has(Number(c.courseId));
                  return (
                    <div key={c.courseId} className="course-card">
                      <div>
                        <div className="course-card-header">
                          <h3 className="course-title">{c.title}</h3>
                          <Badge type="approved">Available</Badge>
                        </div>

                        <div className="course-category">{c.category || 'Computer Science'}</div>

                        <p className="course-desc">{c.description || 'Comprehensive curriculum covering key principles and hands-on modules.'}</p>

                        <div className="course-meta-grid">
                          <div className="meta-item">
                            <span className="meta-label">Duration</span>
                            <span className="meta-value">{c.duration} hrs</span>
                          </div>

                          <div className="meta-item">
                            <span className="meta-label">Level</span>
                            <span className="meta-value">{c.level || 'Beginner'}</span>
                          </div>

                          <div className="meta-item">
                            <span className="meta-label">Seats</span>
                            <span className="meta-value">{c.capacity || 50}</span>
                          </div>

                          <div className="meta-item">
                            <span className="meta-label">Price</span>
                            <span className="meta-value price">${Number(c.price || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="course-card-actions">
                        {isEnrolled ? (
                          <button type="button" className="btn btn-secondary btn-sm" disabled style={{ width: '100%' }}>
                            Enrolled
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleEnroll(c.courseId)}
                            className="btn btn-primary btn-sm"
                            style={{ width: '100%' }}
                          >
                            Enroll in Course
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Pagination
                currentPage={browsePage}
                totalItems={filteredCatalogCourses.length}
                pageSize={browsePageSize}
                onPageChange={(p) => setBrowsePage(p)}
                onPageSizeChange={(s) => setBrowsePageSize(s)}
                pageSizeOptions={[6, 12, 24]}
                itemLabel="courses"
              />
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MY COURSES & PROGRESS (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'my-courses' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">My Courses & Progress</h2>
              <p className="page-subtitle">Track your enrolled courses, milestone completions, and certificates.</p>
            </div>
            <button
              type="button"
              onClick={() => { setActiveTab('browse'); setBrowsePage(1); }}
              className="btn btn-primary"
            >
              Browse More Courses
            </button>
          </div>

          {enrollments.length === 0 ? (
            <EmptyState
              title="No courses enrolled"
              description="Explore the catalog and enroll in your first course."
              actionText="Browse Courses"
              onAction={() => setActiveTab('browse')}
            />
          ) : (
            <>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Course Title</th>
                      <th>Category</th>
                      <th>Trainer</th>
                      <th>Level</th>
                      <th>Progress</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEnrollments.map((e) => {
                      const matchedCourse = courses.find((c) => Number(c.courseId) === Number(e.courseId)) || {};
                      const progress = Math.min(100, Math.round(e.progressPercentage || 0));
                      const isCompleted = progress >= 100 || e.status === 'COMPLETED' || e.certificateIssued;

                      return (
                        <tr key={e.id}>
                          <td><strong>{matchedCourse.title || `Course #${e.courseId}`}</strong></td>
                          <td>{matchedCourse.category || 'Computer Science'}</td>
                          <td>{matchedCourse.trainerName || 'Instructor'}</td>
                          <td><Badge type="draft">{matchedCourse.level || 'Beginner'}</Badge></td>
                          <td style={{ minWidth: '160px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                              </div>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '35px' }}>{progress}%</span>
                            </div>
                          </td>
                          <td>
                            {isCompleted ? (
                              <Badge type="approved">Completed</Badge>
                            ) : (
                              <Badge type="enrolled">In Progress</Badge>
                            )}
                          </td>
                          <td>
                            {!isCompleted ? (
                              <button
                                type="button"
                                onClick={() => handleSimulateProgress(e.id, progress)}
                                className="btn btn-primary btn-sm"
                              >
                                +20% Progress
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setMessage(`Certificate verified for Course: "${matchedCourse.title}". Certificate ID: CERT-${e.id}-${Date.now().toString().slice(-6)}`)}
                                className="btn btn-success btn-sm"
                              >
                                Certificate
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={enrollmentsPage}
                totalItems={enrollments.length}
                pageSize={enrollmentsPageSize}
                onPageChange={(p) => setEnrollmentsPage(p)}
                onPageSizeChange={(s) => setEnrollmentsPageSize(s)}
                pageSizeOptions={[5, 10, 20]}
                itemLabel="enrollments"
              />
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CLASS TIMETABLE (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'schedule' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">Class Schedule & Timetable</h2>
              <p className="page-subtitle">Upcoming lectures, practical labs, and live sessions.</p>
            </div>
          </div>

          {schedules.length === 0 ? (
            <EmptyState title="No scheduled sessions available" />
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
      {/* 5. ASSIGNMENTS & GRADES (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'assessments' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">Assignments & Assessment Grades</h2>
              <p className="page-subtitle">Submitted assignments, quizzes, and evaluated grades.</p>
            </div>
          </div>

          {assessments.length === 0 ? (
            <EmptyState title="No assessments assigned yet" />
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Assessment</th>
                    <th>Course</th>
                    <th>Type</th>
                    <th>Max Points</th>
                    <th>Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => {
                    const hasScore = a.achievedScore !== null && a.achievedScore !== undefined;
                    return (
                      <tr key={a.id}>
                        <td><strong>{a.assessmentTitle}</strong></td>
                        <td>Course #{a.courseId}</td>
                        <td>{a.assessmentType || 'ASSIGNMENT'}</td>
                        <td>{a.maxScore || 100} pts</td>
                        <td>
                          {hasScore ? (
                            <strong>{a.achievedScore} / {a.maxScore || 100}</strong>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Pending</span>
                          )}
                        </td>
                        <td>
                          {hasScore ? (
                            <Badge type="approved">Graded</Badge>
                          ) : (
                            <Badge type="pending">Submitted</Badge>
                          )}
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
      {/* 6. LEARNING RESOURCES (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'resources' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">Learning Resources</h2>
              <p className="page-subtitle">Curriculum handbooks, code repositories, and documentation.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div className="content-card" style={{ margin: 0 }}>
              <Badge type="enrolled">PDF Handbook</Badge>
              <h4 style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>Fullstack Java & Spring Reference Guide</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>REST API architecture and authentication fundamentals.</p>
              <a href="https://docs.spring.io" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Open Documentation
              </a>
            </div>

            <div className="content-card" style={{ margin: 0 }}>
              <Badge type="enrolled">Code Repository</Badge>
              <h4 style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>React 18 Component Starter Repository</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Component patterns and unit testing suites.</p>
              <a href="https://react.dev" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Open Repository
              </a>
            </div>

            <div className="content-card" style={{ margin: 0 }}>
              <Badge type="enrolled">Lab Guide</Badge>
              <h4 style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>Cloud Infrastructure & Containers Guide</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Docker container configurations and deployment pipelines.</p>
              <a href="https://kubernetes.io/docs" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Open Lab Guide
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. HELP & SUPPORT (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'support' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">Help & Support</h2>
              <p className="page-subtitle">Submit inquiries or get assistance with courses and enrollments.</p>
            </div>
          </div>

          <div style={{ maxWidth: '600px', marginTop: '1rem' }}>
            <form onSubmit={(e) => { e.preventDefault(); setMessage('Support inquiry submitted. An advisor will respond shortly.'); }}>
              <div className="form-group">
                <label>Topic / Inquiry Category</label>
                <select className="filter-select" style={{ width: '100%' }}>
                  <option>Curriculum & Course Content</option>
                  <option>Enrollment & Certificates</option>
                  <option>Technical Access & Platform Support</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea rows="4" placeholder="Describe your question or issue in detail..." required />
              </div>

              <button type="submit" className="btn btn-primary">
                Submit Support Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
