import React, { useEffect, useState, useMemo } from 'react';
import { CourseService, ScheduleService, AssessmentService, EnrollmentService, TrainerService } from '../utils/api';
import CourseForm from './CourseForm';
import Modal from './common/Modal';
import Toast from './common/Toast';
import Badge from './common/Badge';
import EmptyState from './common/EmptyState';
import LoadingSpinner from './common/LoadingSpinner';
import Pagination from './common/Pagination';

const TrainerDashboard = ({ onNavigateToAdd, defaultTab = 'overview' }) => {
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [trainerProfile, setTrainerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination states
  const [coursesPage, setCoursesPage] = useState(1);
  const [coursesPageSize, setCoursesPageSize] = useState(5);

  // Delete Course Modal
  const [courseToDelete, setCourseToDelete] = useState(null);

  // Edit Course Modal
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'BEGINNER',
    price: '',
    category: 'Software Development',
    capacity: 50
  });

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [sessionData, setSessionData] = useState({
    sessionTitle: '',
    sessionDate: '',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Campus Building A, Room 302',
    roomNumber: 'A-302',
    maxCapacity: 50,
    sessionType: 'LECTURE'
  });

  // Assessment modal state
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [assessmentData, setAssessmentData] = useState({
    courseId: '',
    assessmentTitle: '',
    assessmentType: 'ASSIGNMENT',
    maxScore: 100,
    dueDate: ''
  });

  // Grading input state
  const [gradeInputs, setGradeInputs] = useState({});

  const username = localStorage.getItem('username') || 'Trainer';
  const userId = localStorage.getItem('userId');

  const loadTrainerData = async () => {
    setLoading(true);
    setError('');
    try {
      const [cRes, sRes, aRes, eRes, pRes] = await Promise.all([
        CourseService.getAllCourses(),
        ScheduleService.getAllSchedules().catch(() => ({ data: [] })),
        AssessmentService.getAllAssessments().catch(() => ({ data: [] })),
        EnrollmentService.getAllEnrollments().catch(() => ({ data: [] })),
        TrainerService.getMyProfile().catch(() => ({ data: null }))
      ]);
      setCourses(cRes.data || []);
      setSchedules(sRes.data || []);
      setAssessments(aRes.data || []);
      setEnrollments(eRes.data || []);
      setTrainerProfile(pRes.data || null);
    } catch (err) {
      setError('Failed to load trainer dashboard records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainerData();
  }, []);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const isApproved = !trainerProfile || trainerProfile.approvalStatus === 'APPROVED';

  const handleStartCreateCourse = () => {
    if (!isApproved) {
      setError('Your trainer profile is pending verification. Course creation will be unlocked once approved.');
      return;
    }
    setActiveTab('create-course');
  };

  const handleCreateSchedule = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isApproved) {
      setError('Only approved trainers can schedule class sessions.');
      return;
    }
    if (!selectedCourseId || !sessionData.sessionTitle || !sessionData.sessionDate) {
      setError('Please select a course and enter session details.');
      return;
    }
    try {
      await ScheduleService.createSchedule({
        ...sessionData,
        courseId: Number(selectedCourseId)
      });
      setMessage('Session scheduled successfully!');
      setShowScheduleModal(false);
      loadTrainerData();
    } catch (err) {
      setError('Failed to create session schedule.');
    }
  };

  const handleCreateAssessment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isApproved) {
      setError('Only approved trainers can publish assessments.');
      return;
    }
    if (!assessmentData.courseId || !assessmentData.assessmentTitle) {
      setError('Please choose a course and enter assessment title.');
      return;
    }
    try {
      await AssessmentService.createAssessment({
        ...assessmentData,
        courseId: Number(assessmentData.courseId),
        maxScore: Number(assessmentData.maxScore)
      });
      setMessage('Assessment published successfully!');
      setShowAssessmentModal(false);
      setAssessmentData({ courseId: '', assessmentTitle: '', assessmentType: 'ASSIGNMENT', maxScore: 100, dueDate: '' });
      loadTrainerData();
    } catch (err) {
      setError('Failed to create assessment.');
    }
  };

  const handleSubmitForApproval = async (courseId) => {
    try {
      await CourseService.updateStatus(courseId, 'PENDING_APPROVAL');
      setMessage(`Course #${courseId} submitted for review!`);
      loadTrainerData();
    } catch (err) {
      setError('Failed to submit course for approval.');
    }
  };

  const handleStartEditCourse = (course) => {
    setCourseToEdit(course);
    setEditFormData({
      title: course.title || '',
      description: course.description || '',
      duration: course.duration || '',
      level: course.level || 'BEGINNER',
      price: course.price || '',
      category: course.category || 'Software Development',
      capacity: course.capacity || 50
    });
  };

  const handleSaveEditCourse = async () => {
    if (!courseToEdit) return;
    try {
      await CourseService.updateCourse(courseToEdit.courseId, {
        ...courseToEdit,
        ...editFormData,
        duration: Number(editFormData.duration),
        price: Number(editFormData.price),
        capacity: Number(editFormData.capacity)
      });
      setMessage(`Course "${editFormData.title}" updated successfully.`);
      setCourseToEdit(null);
      loadTrainerData();
    } catch (err) {
      setError('Failed to update course.');
    }
  };

  const handleConfirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      await CourseService.deleteCourse(courseToDelete.courseId);
      setMessage(`Course #${courseToDelete.courseId} ("${courseToDelete.title}") deleted successfully.`);
      setCourseToDelete(null);
      loadTrainerData();
    } catch (err) {
      setError('Failed to delete course.');
    }
  };

  const handleGradeSubmit = async (assessmentId) => {
    const input = gradeInputs[assessmentId] || {};
    const score = input.score !== undefined && input.score !== '' ? Number(input.score) : 90;
    const feedback = input.feedback || 'Evaluated and approved by instructor';
    try {
      await AssessmentService.gradeAssessment(assessmentId, score, feedback);
      setMessage(`Assessment #${assessmentId} graded with score ${score}!`);
      loadTrainerData();
    } catch (err) {
      setError('Failed to record assessment grade.');
    }
  };

  const handleUpdateStudentProgress = async (enrollmentId, currentProgress) => {
    const nextProgress = Math.min(100, Math.round((currentProgress || 0) + 25));
    try {
      await EnrollmentService.updateProgress(enrollmentId, nextProgress);
      if (nextProgress >= 100) {
        setMessage(`Enrollment #${enrollmentId} reached 100% and certificate issued!`);
      } else {
        setMessage(`Enrollment #${enrollmentId} progress recorded at ${nextProgress}%.`);
      }
      loadTrainerData();
    } catch (err) {
      setError('Failed to update student progress.');
    }
  };

  const myCourses = useMemo(() => {
    return courses.filter((c) => !userId || String(c.trainerId) === String(userId) || c.trainerName === username);
  }, [courses, userId, username]);

  const displayCourses = myCourses.length > 0 ? myCourses : courses;

  const draftCount = displayCourses.filter((c) => (c.status || '').toUpperCase() === 'DRAFT').length;
  const pendingCount = displayCourses.filter((c) => (c.status || '').toUpperCase() === 'PENDING_APPROVAL').length;
  const approvedCount = displayCourses.filter((c) => (c.status || '').toUpperCase() === 'APPROVED' || c.isActive).length;

  const filteredCourses = useMemo(() => {
    return displayCourses.filter((c) => {
      const matchesSearch =
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const courseStatus = (c.status || (c.isActive ? 'APPROVED' : 'DRAFT')).toUpperCase();
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'DRAFT' && courseStatus === 'DRAFT') ||
        (statusFilter === 'PENDING' && courseStatus === 'PENDING_APPROVAL') ||
        (statusFilter === 'APPROVED' && (courseStatus === 'APPROVED' || c.isActive));
      return matchesSearch && matchesStatus;
    });
  }, [displayCourses, searchTerm, statusFilter]);

  const paginatedCourses = useMemo(() => {
    const start = (coursesPage - 1) * coursesPageSize;
    return filteredCourses.slice(start, start + coursesPageSize);
  }, [filteredCourses, coursesPage, coursesPageSize]);

  // Requirement 9: Exactly two student records for trainer-related demo views
  const trainerDemoStudents = useMemo(() => {
    if (enrollments && enrollments.length >= 2) {
      return enrollments.slice(0, 2).map((e, idx) => ({
        id: e.id,
        studentName: idx === 0 ? 'Alex Rivera' : 'Emily Chen',
        courseTitle: courses.find(c => Number(c.courseId) === Number(e.courseId))?.title || 'Fullstack Spring Boot & React',
        progress: e.progressPercentage || (idx === 0 ? 75 : 100),
        assessmentStatus: idx === 0 ? 'Assignment Submitted (Pending Grade)' : 'Capstone Project Graded (95/100)',
        status: (e.progressPercentage || 0) >= 100 ? 'COMPLETED' : 'IN_PROGRESS'
      }));
    }
    return [
      {
        id: 101,
        studentName: 'Alex Rivera',
        courseTitle: courses[0]?.title || 'Fullstack Spring Boot & React',
        progress: 75,
        assessmentStatus: 'Assignment Submitted (Pending Grade)',
        status: 'IN_PROGRESS'
      },
      {
        id: 102,
        studentName: 'Emily Chen',
        courseTitle: courses[1]?.title || 'Advanced React & Architecture',
        progress: 100,
        assessmentStatus: 'Capstone Project Graded (95/100)',
        status: 'COMPLETED'
      }
    ];
  }, [enrollments, courses]);

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading Trainer Dashboard..."
        subtext="Fetching course modules, student submissions, and class schedules"
        dataTestId="trainer-loading"
      />
    );
  }

  return (
    <div>
      <Toast type="success" message={message} onClose={() => setMessage('')} />
      <Toast type="danger" message={error} onClose={() => setError('')} />

      {/* ========================================================================= */}
      {/* 1. TRAINER DASHBOARD OVERVIEW (SHOWS STATS ONLY ON THIS TAB) */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div>
          <div className="page-header">
            <div>
              <h2 className="page-title">Trainer Dashboard</h2>
              <p className="page-subtitle">Manage curriculum courses, schedule sessions, and grade student submissions.</p>
            </div>
            <div className="header-actions">
              <button
                type="button"
                onClick={handleStartCreateCourse}
                className="btn btn-primary"
              >
                Create New Course
              </button>
            </div>
          </div>

          {/* 4 KPI Stats (ONLY ON DASHBOARD) */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total My Courses</span>
              <div className="stat-value">{displayCourses.length}</div>
              <span className="stat-desc">Curriculum authored</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Draft Courses</span>
              <div className="stat-value">{draftCount}</div>
              <span className="stat-desc">In preparation</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Pending Approval</span>
              <div className="stat-value">{pendingCount}</div>
              <span className="stat-desc">Under QA review</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Approved & Active</span>
              <div className="stat-value">{approvedCount}</div>
              <span className="stat-desc">Published in catalog</span>
            </div>
          </div>

          {/* My Courses List */}
          <div className="content-card">
            <div className="content-card-header">
              <div>
                <h3 className="content-card-title">My Courses</h3>
                <div className="content-card-subtitle">Active syllabus modules, review status, and management</div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('courses')}
                className="btn btn-secondary btn-sm"
              >
                View All Courses
              </button>
            </div>

            {displayCourses.length === 0 ? (
              <EmptyState
                title="No courses created yet"
                description="Start authoring your first course curriculum."
                actionText="Create Course"
                onAction={handleStartCreateCourse}
              />
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Course Title</th>
                      <th>Category</th>
                      <th>Level</th>
                      <th>Duration</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayCourses.slice(0, 5).map((c) => {
                      const courseStatus = (c.status || (c.isActive ? 'APPROVED' : 'DRAFT')).toUpperCase();
                      return (
                        <tr key={c.courseId}>
                          <td><strong>{c.title}</strong></td>
                          <td>{c.category || 'Software Development'}</td>
                          <td><Badge type="draft">{c.level || 'Beginner'}</Badge></td>
                          <td>{c.duration} hrs</td>
                          <td>${Number(c.price || 0).toFixed(2)}</td>
                          <td>
                            <Badge type={courseStatus === 'APPROVED' ? 'approved' : courseStatus === 'PENDING_APPROVAL' ? 'pending' : 'draft'}>
                              {courseStatus === 'PENDING_APPROVAL' ? 'Pending QA' : courseStatus}
                            </Badge>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => handleStartEditCourse(c)}
                                className="btn btn-secondary btn-sm"
                              >
                                Edit
                              </button>
                              {courseStatus === 'DRAFT' && (
                                <button
                                  type="button"
                                  onClick={() => handleSubmitForApproval(c.courseId)}
                                  className="btn btn-primary btn-sm"
                                >
                                  Submit QA
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setCourseToDelete(c)}
                                className="btn btn-danger btn-sm"
                              >
                                Delete
                              </button>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MY COURSES TAB (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'courses' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">My Courses</h2>
              <p className="page-subtitle">Manage, update, and submit your courses for QA review.</p>
            </div>
            <button
              type="button"
              onClick={handleStartCreateCourse}
              className="btn btn-primary"
            >
              Create Course
            </button>
          </div>

          {/* Search and Filters */}
          <div className="catalog-toolbar">
            <div className="search-bar-container">
              <input
                type="text"
                className="search-input-field"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCoursesPage(1); }}
              />
            </div>

            <div className="filter-dropdown-group">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCoursesPage(1); }}
                className="filter-select"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved & Active</option>
              </select>
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <EmptyState title="No courses found matching criteria" />
          ) : (
            <>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Course Title</th>
                      <th>Category</th>
                      <th>Duration</th>
                      <th>Level</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCourses.map((c) => {
                      const courseStatus = (c.status || (c.isActive ? 'APPROVED' : 'DRAFT')).toUpperCase();
                      return (
                        <tr key={c.courseId}>
                          <td><strong>{c.title}</strong></td>
                          <td>{c.category || 'Software'}</td>
                          <td>{c.duration} hrs</td>
                          <td><Badge type="draft">{c.level || 'Beginner'}</Badge></td>
                          <td>${Number(c.price || 0).toFixed(2)}</td>
                          <td>
                            <Badge type={courseStatus === 'APPROVED' ? 'approved' : courseStatus === 'PENDING_APPROVAL' ? 'pending' : 'draft'}>
                              {courseStatus === 'PENDING_APPROVAL' ? 'Pending' : courseStatus}
                            </Badge>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => handleStartEditCourse(c)}
                                className="btn btn-secondary btn-sm"
                              >
                                Edit
                              </button>
                              {courseStatus === 'DRAFT' && (
                                <button
                                  type="button"
                                  onClick={() => handleSubmitForApproval(c.courseId)}
                                  className="btn btn-primary btn-sm"
                                >
                                  Submit QA
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setCourseToDelete(c)}
                                className="btn btn-danger btn-sm"
                              >
                                Delete
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
                currentPage={coursesPage}
                totalItems={filteredCourses.length}
                pageSize={coursesPageSize}
                onPageChange={(p) => setCoursesPage(p)}
                onPageSizeChange={(s) => setCoursesPageSize(s)}
                pageSizeOptions={[5, 10, 20]}
                itemLabel="courses"
              />
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CREATE COURSE TAB (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'create-course' && (
        <CourseForm
          onCourseCreated={() => {
            setMessage('Course created successfully!');
            loadTrainerData();
            setActiveTab('courses');
          }}
          onCancel={() => setActiveTab('courses')}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. SCHEDULE MANAGEMENT (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'schedule' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">Schedule Management</h2>
              <p className="page-subtitle">Schedule live lecture sessions and practical lab hours.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="btn btn-primary"
            >
              Schedule New Session
            </button>
          </div>

          {schedules.length === 0 ? (
            <EmptyState
              title="No sessions scheduled yet"
              actionText="Schedule Session"
              onAction={() => setShowScheduleModal(true)}
            />
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Session Title</th>
                    <th>Course ID</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Room / Location</th>
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
      {/* 5. ASSESSMENTS & GRADING (NO STATS CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'assessments' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">Assessments & Grading</h2>
              <p className="page-subtitle">Create assessments and evaluate student submissions.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAssessmentModal(true)}
              className="btn btn-primary"
            >
              Create Assessment
            </button>
          </div>

          {assessments.length === 0 ? (
            <EmptyState
              title="No assessments published yet"
              actionText="Create Assessment"
              onAction={() => setShowAssessmentModal(true)}
            />
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Assessment Title</th>
                    <th>Course ID</th>
                    <th>Type</th>
                    <th>Max Points</th>
                    <th>Score / Grade</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => (
                    <tr key={a.id}>
                      <td><strong>{a.assessmentTitle}</strong></td>
                      <td>Course #{a.courseId}</td>
                      <td>{a.assessmentType || 'ASSIGNMENT'}</td>
                      <td>{a.maxScore || 100} pts</td>
                      <td>
                        <input
                          type="number"
                          placeholder="Score"
                          defaultValue={a.achievedScore || ''}
                          style={{ width: '80px', padding: '4px 8px', border: '1px solid var(--border-input)', borderRadius: '4px' }}
                          onChange={(e) => setGradeInputs((prev) => ({
                            ...prev,
                            [a.id]: { ...prev[a.id], score: e.target.value }
                          }))}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleGradeSubmit(a.id)}
                          className="btn btn-primary btn-sm"
                        >
                          Save Grade
                        </button>
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
      {/* 6. STUDENT PROGRESS (REQUIREMENT 9: TWO DEMO STUDENT RECORDS) */}
      {/* ========================================================================= */}
      {activeTab === 'progress' && (
        <div className="content-card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="page-title">Student Progress</h2>
              <p className="page-subtitle">Track student progress, module completion, and grading evaluations.</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Progress</th>
                  <th>Assessment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trainerDemoStudents.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.studentName}</strong></td>
                    <td>{s.courseTitle}</td>
                    <td style={{ minWidth: '160px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${s.progress}%` }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{s.progress}%</span>
                      </div>
                    </td>
                    <td>{s.assessmentStatus}</td>
                    <td>
                      <Badge type={s.status === 'COMPLETED' ? 'approved' : 'enrolled'}>
                        {s.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                      </Badge>
                    </td>
                    <td>
                      {s.status !== 'COMPLETED' ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateStudentProgress(s.id, s.progress)}
                          className="btn btn-primary btn-sm"
                        >
                          +25% Progress
                        </button>
                      ) : (
                        <Badge type="approved">Certified</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT COURSE */}
      {/* ========================================================================= */}
      {courseToEdit && (
        <Modal
          isOpen={true}
          title={`Edit Course #${courseToEdit.courseId}`}
          onClose={() => setCourseToEdit(null)}
          onConfirm={handleSaveEditCourse}
          confirmText="Save Changes"
        >
          <div className="form-group">
            <label>Course Title *</label>
            <input
              type="text"
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="3"
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Duration (Hours) *</label>
              <input
                type="number"
                value={editFormData.duration}
                onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Level *</label>
              <select
                value={editFormData.level}
                onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value })}
              >
                <option value="BEGINEER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Price ($) *</label>
              <input
                type="number"
                step="0.01"
                value={editFormData.price}
                onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                value={editFormData.capacity}
                onChange={(e) => setEditFormData({ ...editFormData, capacity: e.target.value })}
              />
            </div>
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
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.5rem' }}>
            This action cannot be undone.
          </p>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SCHEDULE SESSION */}
      {/* ========================================================================= */}
      {showScheduleModal && (
        <Modal
          isOpen={true}
          title="Schedule Class Session"
          onClose={() => setShowScheduleModal(false)}
          onConfirm={handleCreateSchedule}
          confirmText="Save Session"
        >
          <div className="form-group">
            <label>Select Course *</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              required
            >
              <option value="">-- Choose Course --</option>
              {displayCourses.map((c) => (
                <option key={c.courseId} value={c.courseId}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Session Title *</label>
            <input
              type="text"
              placeholder="e.g. Live Architecture Workshop"
              value={sessionData.sessionTitle}
              onChange={(e) => setSessionData({ ...sessionData, sessionTitle: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={sessionData.sessionDate}
                onChange={(e) => setSessionData({ ...sessionData, sessionDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Session Type</label>
              <select
                value={sessionData.sessionType}
                onChange={(e) => setSessionData({ ...sessionData, sessionType: e.target.value })}
              >
                <option value="LECTURE">Lecture</option>
                <option value="LAB">Lab Session</option>
                <option value="WORKSHOP">Workshop</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE ASSESSMENT */}
      {/* ========================================================================= */}
      {showAssessmentModal && (
        <Modal
          isOpen={true}
          title="Publish Assessment"
          onClose={() => setShowAssessmentModal(false)}
          onConfirm={handleCreateAssessment}
          confirmText="Publish Assessment"
        >
          <div className="form-group">
            <label>Select Course *</label>
            <select
              value={assessmentData.courseId}
              onChange={(e) => setAssessmentData({ ...assessmentData, courseId: e.target.value })}
              required
            >
              <option value="">-- Choose Course --</option>
              {displayCourses.map((c) => (
                <option key={c.courseId} value={c.courseId}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Assessment Title *</label>
            <input
              type="text"
              placeholder="e.g. Midterm Project Evaluation"
              value={assessmentData.assessmentTitle}
              onChange={(e) => setAssessmentData({ ...assessmentData, assessmentTitle: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Max Points</label>
              <input
                type="number"
                value={assessmentData.maxScore}
                onChange={(e) => setAssessmentData({ ...assessmentData, maxScore: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select
                value={assessmentData.assessmentType}
                onChange={(e) => setAssessmentData({ ...assessmentData, assessmentType: e.target.value })}
              >
                <option value="ASSIGNMENT">Assignment</option>
                <option value="QUIZ">Quiz</option>
                <option value="PROJECT">Project</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TrainerDashboard;
