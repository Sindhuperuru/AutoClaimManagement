import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // When sending FormData, delete Content-Type so browser sets boundary automatically
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
}, (error) => Promise.reject(error));

// Global response unwrapper
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me')
};

export const claimAPI = {
  submit: (claimData) => api.post('/claims', claimData),
  getById: (id) => api.get(`/claims/${id}`),
  track: (claimNumber) => api.get(`/claims/track/${claimNumber}`),
  getMyClaims: () => api.get('/claims/my-claims'),
  getAll: () => api.get('/claims')
};

export const documentAPI = {
  upload: (claimId, documentType, file) => {
    const formData = new FormData();
    formData.append('claimId', claimId);
    formData.append('documentType', documentType);
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': undefined }
    });
  },
  getByClaim: (claimId) => api.get(`/documents/claim/${claimId}`),
  verify: (documentId, status, remarks) => api.patch(`/documents/${documentId}/verify`, { status, remarks })
};

export const workflowAPI = {
  getTasks: (candidateGroup, assignee) => api.get('/workflow/tasks', { params: { candidateGroup, assignee } }),
  getTaskForClaim: (claimId) => api.get(`/workflow/claim/${claimId}/task`),
  completeTask: (taskId, variables) => api.post(`/workflow/tasks/${taskId}/complete`, variables),
  getHistory: (processInstanceId) => api.get(`/workflow/history/${processInstanceId}`),
  getStatus: (processInstanceId) => api.get(`/workflow/status/${processInstanceId}`)
};

export const agentAPI = {
  getPendingClaims: () => api.get('/agent/claims'),
  verifyDocuments: (data) => api.post('/agent/verify-documents', data)
};

export const officerAPI = {
  getAwaitingClaims: () => api.get('/officer/claims'),
  submitReview: (data) => api.post('/officer/review', data),
  submitInvestigation: (data) => api.post('/officer/investigations', data)
};

export const settlementAPI = {
  getAll: () => api.get('/settlements'),
  getByClaim: (claimId) => api.get(`/settlements/claim/${claimId}`),
  authorize: (claimId, simulateFailure = false) => api.post(`/settlements/authorize/${claimId}?simulateFailure=${simulateFailure}`)
};

export const policyAPI = {
  getAll: () => api.get('/policies'),
  getByNumber: (number) => api.get(`/policies/${number}`),
  getByCustomer: (customerId) => api.get(`/policies/customer/${customerId}`)
};

export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getAuditLogs: () => api.get('/admin/audit-logs'),
  getUsers: () => api.get('/admin/users'),
  getRules: () => api.get('/admin/rules'),
  updateRule: (key, data) => api.put(`/admin/rules/${key}`, data)
};

export const notificationAPI = {
  getMyNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`)
};

export default api;
