import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const AuthService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  registerTrainer: (trainerData) => api.post('/auth/register-trainer', trainerData),
  getProfile: () => api.get('/auth/profile')
};

export const CourseService = {
  getAllCourses: (params) => api.get('/api/courses', { params }),
  getCourseById: (id) => api.get(`/api/courses/${id}`),
  createCourse: (courseData) => api.post('/api/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/api/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/api/courses/${id}`),
  approveCourse: (id) => api.put(`/api/courses/${id}/approve`),
  rejectCourse: (id) => api.put(`/api/courses/${id}/reject`),
  updateStatus: (id, status) => api.put(`/api/courses/${id}/status?status=${encodeURIComponent(status)}`),
  getRecommendations: (category) => api.get('/api/recommendations', { params: { category } })
};

export const EnrollmentService = {
  getAllEnrollments: () => api.get('/api/enrollments'),
  getMyEnrollments: () => api.get('/api/enrollments/my'),
  getStudentEnrollments: (studentId) => api.get(`/api/enrollments/student/${studentId}`),
  getEnrollmentById: (id) => api.get(`/api/enrollments/${id}`),
  enroll: (enrollmentData) => api.post('/api/enrollments', enrollmentData),
  enrollCourse: (enrollmentData) => api.post('/api/enrollments', enrollmentData),
  updateProgress: (id, progressPercentage) => api.put(`/api/enrollments/${id}/progress?progressPercentage=${progressPercentage}`)
};

export const TrainerService = {
  getAllTrainers: () => api.get('/api/trainers'),
  getPendingTrainers: () => api.get('/api/trainers/pending'),
  getMyProfile: () => api.get('/api/trainers/me'),
  getTrainerById: (id) => api.get(`/api/trainers/${id}`),
  registerTrainer: (trainerData) => api.post('/api/trainers', trainerData),
  updateTrainer: (id, trainerData) => api.put(`/api/trainers/${id}`, trainerData),
  updateStatus: (id, status, reason = '') =>
    api.put(`/api/trainers/${id}/status?status=${encodeURIComponent(status)}${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`)
};

export const ScheduleService = {
  getAllSchedules: () => api.get('/api/schedules'),
  getCourseSchedule: (courseId) => api.get(`/api/schedules/course/${courseId}`),
  createSchedule: (scheduleData) => api.post('/api/schedules', scheduleData)
};

export const AssessmentService = {
  getAllAssessments: () => api.get('/api/assessments'),
  getCourseAssessments: (courseId) => api.get(`/api/assessments/course/${courseId}`),
  createAssessment: (data) => api.post('/api/assessments', data),
  submitAssessment: (idOrData, feedback) => {
    if (typeof idOrData === 'object' && idOrData !== null) {
      return api.post('/api/assessments', idOrData);
    }
    return api.post(`/api/assessments/${idOrData}/submit`, { feedback });
  },
  submitAssessmentResponse: (id, data) => api.post(`/api/assessments/${id}/submit`, data),
  gradeAssessment: (id, score, feedback) => api.put(`/api/assessments/${id}/grade`, null, { params: { score, feedback } })
};

export const UserService = {
  getAllUsers: () => api.get('/api/users'),
  updateUserRole: (id, role) => api.put(`/api/users/${id}/role?role=${encodeURIComponent(role)}`)
};

export const AuditLogService = {
  getAllLogs: () => api.get('/api/audit-logs'),
  createLog: (logData) => api.post('/api/audit-logs', logData)
};

export const ResourceService = {
  getCourseResources: (courseId) => api.get(`/api/resources/course/${courseId}`),
  createResource: (data) => api.post('/api/resources', data),
  deleteResource: (id) => api.delete(`/api/resources/${id}`)
};

export const SupportService = {
  getAllTickets: () => api.get('/api/support'),
  getMyTickets: () => api.get('/api/support/my'),
  createTicket: (data) => api.post('/api/support', data),
  respondTicket: (id, responseText) => api.put(`/api/support/${id}/respond`, { response: responseText })
};

export const NotificationService = {
  getMyNotifications: () => api.get('/api/notifications/my'),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  createNotification: (data) => api.post('/api/notifications', data)
};

export default api;
