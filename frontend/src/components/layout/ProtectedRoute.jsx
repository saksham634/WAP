import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [], requiredPermission = null }) {
  const { isAuthenticated, role, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f8fafc',
          color: '#007a7a',
          fontSize: '18px',
          fontWeight: 600,
        }}
      >
        <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '12px' }}></i>
        Loading Workforce Portal...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role restrictions
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === 'ROLE_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'ROLE_HR') return <Navigate to="/hr/dashboard" replace />;
    return <Navigate to="/employee/dashboard" replace />;
  }

  // Check permission restriction
  if (requiredPermission && !hasPermission(requiredPermission)) {
    const homePath =
      role === 'ROLE_ADMIN'
        ? '/admin/dashboard'
        : role === 'ROLE_HR'
        ? '/hr/dashboard'
        : '/employee/dashboard';

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            padding: '40px',
            borderRadius: '18px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
            maxWidth: '480px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              margin: '0 auto 20px auto',
            }}
          >
            <i className="fa-solid fa-lock"></i>
          </div>
          <h2 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>
            Access Restricted
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            The <strong>{requiredPermission}</strong> feature has been disabled for your account by your System Administrator.
          </p>
          <Link to={homePath} className="btn btn-primary" style={{ padding: '10px 24px' }}>
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
