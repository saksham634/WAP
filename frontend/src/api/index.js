import request from './client';

// =========================================================
// AUTH APIS
// =========================================================
export const authAPI = {
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  registerOrg: (data) => request('/auth/register-org', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  sendOtp: (email) => request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  verifyOtp: (email, otp) => request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  }),

  resetPassword: (email, otp, newPassword) => request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, otp, newPassword }),
  }),
};

// =========================================================
// USER & PROFILE APIS
// =========================================================
export const userAPI = {
  getMe: () => request('/admin/users/me'),
  getMyProfile: () => request('/admin/users/me'),
  
  updateMeProfile: (data) => request('/admin/users/me/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  updateMyProfile: (data) => request('/admin/users/me/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  uploadProfilePicture: (profilePicture) => request('/admin/users/me/profile', {
    method: 'PUT',
    body: JSON.stringify({ profilePicture }),
  }),

  getAllUsers: () => request('/admin/users'),

  createUser: (userData) => request('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  updateUser: (id, userData) => request('/admin/users/' + id, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),

  deleteUser: (id) => request('/admin/users/' + id, {
    method: 'DELETE',
  }),

  updateSalary: (employeeId, salaryData) => request(`/payroll/salary-structure/${employeeId}`, {
    method: 'PUT',
    body: JSON.stringify(salaryData),
  }),

  getRolePermissions: () => request('/admin/roles/permissions'),
  
  saveRolePermissions: (permissionsMap) => request('/admin/roles/permissions', {
    method: 'PUT',
    body: JSON.stringify(permissionsMap),
  }),

  changePassword: (data) => request('/admin/users/me/password', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// =========================================================
// ADMIN & DASHBOARD APIS
// =========================================================
export const adminAPI = {
  getDashboardMetrics: () => request('/admin/dashboard'),
  getAuditLogs: () => request('/admin/audit'),
  getSettings: () => request('/admin/settings'),
  updateSettings: (settingsData) => request('/admin/settings', {
    method: 'POST',
    body: JSON.stringify(settingsData),
  }),
};

export const employeeAPI = {
  getDashboardMetrics: () => request('/employee/dashboard'),
};

// =========================================================
// ATTENDANCE APIS
// =========================================================
export const attendanceAPI = {
  getTodayStatus: () => request('/attendance/today'),
  
  punchIn: () => request('/attendance/punch-in', { method: 'POST' }),
  
  punchOut: () => request('/attendance/punch-out', { method: 'POST' }),
  
  getMyAttendance: (month, year) => {
    let q = '';
    if (month && year) q = `?month=${month}&year=${year}`;
    return request(`/attendance/my${q}`);
  },

  getAllAttendance: (date) => {
    const q = date ? `?date=${date}` : '';
    return request(`/attendance/all${q}`);
  },

  getAttendanceStats: () => request('/attendance/stats'),

  getWeeklyTrend: () => request('/attendance/weekly-trend'),
};

// =========================================================
// LEAVES APIS
// =========================================================
export const leaveAPI = {
  getMyLeaves: () => request('/leaves/my'),
  
  getLeaveBalance: () => request('/leaves/balance'),
  
  applyLeave: (data) => request('/leaves', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getAllLeaves: () => request('/leaves'),

  approveLeave: (id) => request(`/leaves/${id}/approve`, { method: 'PUT' }),

  rejectLeave: (id, reason) => request(`/leaves/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  }),
};

// =========================================================
// PROJECTS APIS
// =========================================================
export const projectAPI = {
  getAllProjects: () => request('/projects'),
  
  getMyProjects: () => request('/projects/my'),

  createProject: (projectData) => request('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  }),

  updateProject: (id, projectData) => request(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  }),

  deleteProject: (id) => request(`/projects/${id}`, {
    method: 'DELETE',
  }),
};

// =========================================================
// PAYROLL APIS
// =========================================================
export const payrollAPI = {
  getMyPayslips: () => request('/payroll/my-payslips'),
  
  getAllPayslips: () => request('/payroll/hr/all'),

  generatePayroll: (data) => request('/payroll/hr/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  processPayrollBatch: (month, year) => request('/payroll/process', {
    method: 'POST',
    body: JSON.stringify({ month, year }),
  }),

  getPayslipById: (id) => request(`/payroll/payslip/${id}`),
};

// =========================================================
// DIRECT MESSAGING APIS
// =========================================================
export const messageAPI = {
  getInbox: () => request('/messages/inbox'),
  
  sendMessage: (msgData) => request('/messages', {
    method: 'POST',
    body: JSON.stringify(msgData),
  }),

  deleteMessage: (id) => request(`/messages/${id}`, {
    method: 'DELETE',
  }),
};

// =========================================================
// AUDIT LOGS APIS
// =========================================================
export const auditAPI = {
  getLogs: () => request('/admin/audit-logs'),
};
