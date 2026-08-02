import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';

export default function Sidebar({ isOpen: propIsOpen, onClose: propOnClose }) {
  const { role, logout, hasPermission } = useAuth();
  const { isOpen: ctxIsOpen, close: ctxClose } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const isOpen = propIsOpen !== undefined ? propIsOpen : ctxIsOpen;
  const onClose = propOnClose || ctxClose;

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    if (role === 'ROLE_ADMIN') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: 'fa-solid fa-house' },
        { label: 'User Mgt', path: '/admin/users', icon: 'fa-solid fa-users-gear' },
        { label: 'Roles', path: '/admin/roles', icon: 'fa-solid fa-user-shield' },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: 'fa-solid fa-clipboard-list' },
        { label: 'Settings', path: '/admin/settings', icon: 'fa-solid fa-gear' },
        { label: 'Projects', path: '/admin/projects', icon: 'fa-solid fa-diagram-project' },
      ];
    } else if (role === 'ROLE_HR') {
      return [
        { label: 'Dashboard', path: '/hr/dashboard', icon: 'fa-solid fa-house', permission: 'DASHBOARD' },
        { label: 'Employee Mgt', path: '/hr/employees', icon: 'fa-solid fa-users', permission: 'EMPLOYEE_MGMT' },
        { label: 'Attendance', path: '/hr/attendance', icon: 'fa-solid fa-calendar-check', permission: 'ATTENDANCE_OVERVIEW' },
        { label: 'Leave Mgmt', path: '/hr/leaves', icon: 'fa-solid fa-calendar-days', permission: 'LEAVE_APPROVALS' },
        { label: 'Payroll', path: '/hr/payroll', icon: 'fa-solid fa-wallet', permission: 'PAYROLL_ADMIN' },
        { label: 'Projects', path: '/hr/projects', icon: 'fa-solid fa-diagram-project', permission: 'PROJECTS' },
      ].filter((item) => hasPermission(item.permission));
    } else {
      // Default: Employee
      return [
        { label: 'Dashboard', path: '/employee/dashboard', icon: 'fa-solid fa-house', permission: 'DASHBOARD' },
        { label: 'Attendance', path: '/employee/attendance', icon: 'fa-solid fa-calendar-check', permission: 'ATTENDANCE' },
        { label: 'Leave Management', path: '/employee/leaves', icon: 'fa-solid fa-calendar-days', permission: 'LEAVES' },
        { label: 'Payroll', path: '/employee/payroll', icon: 'fa-solid fa-wallet', permission: 'PAYROLL' },
        { label: 'Personal Info', path: '/employee/personal-info', icon: 'fa-solid fa-user', permission: 'PERSONAL_INFO' },
        { label: 'Projects', path: '/employee/projects', icon: 'fa-solid fa-diagram-project', permission: 'PROJECTS' },
      ].filter((item) => hasPermission(item.permission));
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open open' : ''}`}>
      <div className="sidebar-top">
        {/* LOGO & Mobile Close */}
        <div className="sidebar-header-row">
          <div className="logo">
            <div className="logo-icon">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div className="logo-text">
              <h2>Workforce</h2>
              <span>Analytics Platform</span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close Sidebar"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* MENU */}
        <nav className="sidebar-menu">
          <ul>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path} className={isActive ? 'active' : ''}>
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth <= 992 && onClose) onClose();
                    }}
                  >
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* BOTTOM */}
      <div className="sidebar-bottom">
        <ul>
          <li>
            <a href="#logout" className="logout-btn" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Logout</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}
