import React, { useEffect, useState } from 'react';
import { userAPI } from '../../api';
import Header from '../../components/layout/Header';

export default function RolesManagement() {
  const [selectedRole, setSelectedRole] = useState('ROLE_EMPLOYEE');
  const [permissionsMap, setPermissionsMap] = useState({
    ROLE_HR: ['DASHBOARD', 'EMPLOYEE_MGMT', 'ATTENDANCE_OVERVIEW', 'LEAVE_APPROVALS', 'PAYROLL_ADMIN', 'PROJECTS'],
    ROLE_EMPLOYEE: ['DASHBOARD', 'ATTENDANCE', 'LEAVES', 'PAYROLL', 'PROJECTS', 'PERSONAL_INFO'],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const availablePermissions = [
    { key: 'DASHBOARD', label: 'Access Main Dashboard', desc: 'Allows viewing personal/organization KPI summaries.' },
    { key: 'EMPLOYEE_MGMT', label: 'Employee Directory & Profiles', desc: 'Allows managing directory records and job designations.' },
    { key: 'ATTENDANCE_OVERVIEW', label: 'Organization Attendance Logs', desc: 'Allows reviewing organization-wide attendance check-ins.' },
    { key: 'ATTENDANCE', label: 'Self Attendance & Punch-in/out', desc: 'Allows marking personal daily check-in and viewing attendance records.' },
    { key: 'LEAVE_APPROVALS', label: 'Leave Request Approvals', desc: 'Allows approving or rejecting staff time-off submissions.' },
    { key: 'LEAVES', label: 'Apply & Track Leaves', desc: 'Allows submitting leave requests and checking balance.' },
    { key: 'PAYROLL_ADMIN', label: 'Payroll Generation & Reports', desc: 'Allows processing batch monthly payroll and organization summaries.' },
    { key: 'PAYROLL', label: 'View & Download Payslips', desc: 'Allows viewing personal salary breakdown and PDF slips.' },
    { key: 'PROJECTS', label: 'Projects & Team Assignments', desc: 'Allows viewing active company projects, timelines, and teams.' },
    { key: 'PERSONAL_INFO', label: 'Personal Information & Profile', desc: 'Allows editing personal contacts, addresses, and documents.' },
  ];

  useEffect(() => {
    async function loadPermissions() {
      setLoading(true);
      try {
        const data = await userAPI.getRolePermissions();
        if (data && typeof data === 'object') {
          setPermissionsMap((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error('Failed to load permissions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPermissions();
  }, []);

  const handleTogglePermission = (permKey) => {
    const currentList = permissionsMap[selectedRole] || [];
    let updated;
    if (currentList.includes(permKey)) {
      updated = currentList.filter((p) => p !== permKey);
    } else {
      updated = [...currentList, permKey];
    }
    setPermissionsMap({
      ...permissionsMap,
      [selectedRole]: updated,
    });
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await userAPI.saveRolePermissions(permissionsMap);
      setFeedback({ type: 'success', text: 'Security permissions matrix saved and enforced successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to save permissions.' });
    } finally {
      setSaving(false);
    }
  };

  const activePermissions = permissionsMap[selectedRole] || [];

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Header
        title="Roles & Permissions"
        subtitle="Configure access control policies across user roles"
      />

      {/* Top Header Card */}
      <div
        className="card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px 24px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#0f172a', fontWeight: 700 }}>
            Roles & Feature Permissions Matrix
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Configure access control policies and restrict module privileges across user tiers
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSavePermissions}
          disabled={saving}
          style={{ padding: '10px 20px', borderRadius: '10px' }}
        >
          <i className="fa-solid fa-floppy-disk"></i> {saving ? 'Saving Matrix...' : 'Save & Enforce Policies'}
        </button>
      </div>

      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: feedback.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            fontSize: '13px',
          }}
        >
          {feedback.text}
        </div>
      )}

      {/* Role Selection Tabs */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          className={`btn ${selectedRole === 'ROLE_EMPLOYEE' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setSelectedRole('ROLE_EMPLOYEE')}
          style={{ padding: '10px 20px', borderRadius: '10px' }}
        >
          <i className="fa-solid fa-user"></i> Standard Employee Role
        </button>

        <button
          className={`btn ${selectedRole === 'ROLE_HR' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setSelectedRole('ROLE_HR')}
          style={{ padding: '10px 20px', borderRadius: '10px' }}
        >
          <i className="fa-solid fa-user-tie"></i> HR Manager Role
        </button>

        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          <i className="fa-solid fa-shield-halved" style={{ color: '#f59e0b' }}></i>
          <span>Administrator retains unconstrained superuser access (ALL).</span>
        </div>
      </div>

      {/* Permissions List Card */}
      <div
        className="card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e2e8f0',
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a' }}>
          Permissions for{' '}
          <span style={{ color: '#007a7a' }}>
            {selectedRole === 'ROLE_HR' ? 'HR Manager' : 'Employee'}
          </span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {availablePermissions.map((perm) => {
            const isChecked = activePermissions.includes(perm.key);
            return (
              <div
                key={perm.key}
                onClick={() => handleTogglePermission(perm.key)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: isChecked ? '1px solid #007a7a' : '1px solid #e2e8f0',
                  backgroundColor: isChecked ? '#f0fdfa' : '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#007a7a',
                    marginTop: '2px',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>
                    {perm.label}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    {perm.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
