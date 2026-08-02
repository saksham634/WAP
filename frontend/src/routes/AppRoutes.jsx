import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import RolesManagement from '../pages/admin/RolesManagement';
import ProjectsManagement from '../pages/admin/ProjectsManagement';
import SettingsPage from '../pages/admin/SettingsPage';
import AuditLogs from '../pages/admin/AuditLogs';

// HR Pages
import HRDashboard from '../pages/hr/HRDashboard';
import HREmployees from '../pages/hr/HREmployees';
import HRAttendance from '../pages/hr/HRAttendance';
import HRLeaves from '../pages/hr/HRLeaves';
import HRPayroll from '../pages/hr/HRPayroll';
import HRProjects from '../pages/hr/HRProjects';

// Employee Pages
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import AttendancePage from '../pages/employee/AttendancePage';
import LeavePage from '../pages/employee/LeavePage';
import PayrollPage from '../pages/employee/PayrollPage';
import EmployeeProjects from '../pages/employee/EmployeeProjects';
import PersonalInfoPage from '../pages/employee/PersonalInfoPage';

// Fallback / Redirect component
function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = user?.role || 'ROLE_EMPLOYEE';
  if (role === 'ROLE_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'ROLE_HR') return <Navigate to="/hr/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
}

function UnauthorizedPage() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px',
      }}
    >
      <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '54px', color: '#ef4444', marginBottom: '16px' }}></i>
      <h2 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 8px 0' }}>403 - Access Prohibited</h2>
      <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '400px', margin: '0 0 24px 0' }}>
        You do not have sufficient permissions to access this administrative module.
      </p>
      <button className="btn btn-primary" onClick={() => window.history.back()}>
        <i className="fa-solid fa-arrow-left"></i> Return to Previous Page
      </button>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="roles" element={<RolesManagement />} />
        <Route path="projects" element={<ProjectsManagement />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="audit-logs" element={<AuditLogs />} />
      </Route>

      {/* HR Protected Routes */}
      <Route
        path="/hr"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_HR']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/hr/dashboard" replace />} />
        <Route path="dashboard" element={<ProtectedRoute requiredPermission="DASHBOARD"><HRDashboard /></ProtectedRoute>} />
        <Route path="employees" element={<ProtectedRoute requiredPermission="EMPLOYEE_MGMT"><HREmployees /></ProtectedRoute>} />
        <Route path="attendance" element={<ProtectedRoute requiredPermission="ATTENDANCE_OVERVIEW"><HRAttendance /></ProtectedRoute>} />
        <Route path="leaves" element={<ProtectedRoute requiredPermission="LEAVE_APPROVALS"><HRLeaves /></ProtectedRoute>} />
        <Route path="payroll" element={<ProtectedRoute requiredPermission="PAYROLL_ADMIN"><HRPayroll /></ProtectedRoute>} />
        <Route path="projects" element={<ProtectedRoute requiredPermission="PROJECTS"><HRProjects /></ProtectedRoute>} />
      </Route>

      {/* Employee Protected Routes */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_HR', 'ROLE_EMPLOYEE']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/employee/dashboard" replace />} />
        <Route path="dashboard" element={<ProtectedRoute requiredPermission="DASHBOARD"><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="attendance" element={<ProtectedRoute requiredPermission="ATTENDANCE"><AttendancePage /></ProtectedRoute>} />
        <Route path="leaves" element={<ProtectedRoute requiredPermission="LEAVES"><LeavePage /></ProtectedRoute>} />
        <Route path="payroll" element={<ProtectedRoute requiredPermission="PAYROLL"><PayrollPage /></ProtectedRoute>} />
        <Route path="projects" element={<ProtectedRoute requiredPermission="PROJECTS"><EmployeeProjects /></ProtectedRoute>} />
        <Route path="personal-info" element={<ProtectedRoute requiredPermission="PERSONAL_INFO"><PersonalInfoPage /></ProtectedRoute>} />
      </Route>

      <Route
        path="/unauthorized"
        element={
          <AppLayout>
            <UnauthorizedPage />
          </AppLayout>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
