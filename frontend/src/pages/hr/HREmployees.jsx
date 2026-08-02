import React, { useEffect, useState } from 'react';
import { userAPI } from '../../api';
import Header from '../../components/layout/Header';

export default function HREmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Edit Employee State
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await userAPI.getAllUsers();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    try {
      const identifier = selectedEmp.id || selectedEmp.employeeId;
      await userAPI.updateUser(identifier, selectedEmp);
      setFeedback({ type: 'success', text: 'Employee details & compensation updated successfully!' });
      setIsEditModalOpen(false);
      fetchEmployees();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update employee.' });
    }
  };

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      (emp.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Header
        title="Employee Directory & Profiles"
        subtitle="Inspect workforce profiles, departments, and compensation structures"
      />

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

      {/* Filter Controls */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search employees by name, email, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px 12px 40px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <i
            className="fa-solid fa-magnifying-glass"
            style={{ position: 'absolute', left: '14px', top: '15px', color: '#94a3b8' }}
          ></i>
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            fontSize: '14px',
            outline: 'none',
            minWidth: '180px',
          }}
        >
          <option value="ALL">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Human Resources">Human Resources</option>
          <option value="Marketing">Marketing</option>
          <option value="Finance">Finance</option>
          <option value="Sales">Sales</option>
        </select>
      </div>

      {/* Employee Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: '#007a7a', marginBottom: '12px' }}></i>
          <p style={{ margin: 0 }}>Loading employee directory...</p>
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No employees found matching filter.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {filtered.map((emp) => (
            <div
              key={emp.id}
              className="card"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#007a7a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '18px',
                    backgroundImage: emp.profilePicture ? `url("${emp.profilePicture}")` : 'none',
                    backgroundSize: 'cover',
                  }}
                >
                  {!emp.profilePicture && (emp.fullName ? emp.fullName.charAt(0).toUpperCase() : 'E')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {emp.fullName}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{emp.employeeId || ''}</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {emp.email}
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  fontSize: '12px',
                }}
              >
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Department</span>
                  <strong style={{ color: '#0f172a' }}>{emp.department || 'Engineering'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Role</span>
                  <strong style={{ color: '#007a7a' }}>{(emp.role || 'ROLE_EMPLOYEE').replace('ROLE_', '')}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Gross Pay</span>
                  <strong style={{ color: '#16a34a' }}>
                    ₹{(Number(emp.baseSalary || 60000) + Number(emp.allowances || 15000)).toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Phone</span>
                  <strong style={{ color: '#334155' }}>{emp.phone || '+91 98765 43210'}</strong>
                </div>
              </div>

              <button
                className="btn btn-outline"
                onClick={() => {
                  setSelectedEmp(emp);
                  setIsEditModalOpen(true);
                }}
                style={{ width: '100%', fontSize: '13px' }}
              >
                <i className="fa-solid fa-pen-to-square"></i> Edit Details & Salary
              </button>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedEmp && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Employee: {selectedEmp.fullName}</h3>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveEmployee}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedEmp.fullName || ''}
                    onChange={(e) => setSelectedEmp({ ...selectedEmp, fullName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Department
                    </label>
                    <input
                      type="text"
                      value={selectedEmp.department || ''}
                      onChange={(e) => setSelectedEmp({ ...selectedEmp, department: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={selectedEmp.phone || ''}
                      onChange={(e) => setSelectedEmp({ ...selectedEmp, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <h4 style={{ margin: '10px 0 4px 0', fontSize: '14px', color: '#007a7a' }}>
                  Compensation & Salary Structure
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Base Salary (₹)
                    </label>
                    <input
                      type="number"
                      value={selectedEmp.baseSalary || 0}
                      onChange={(e) => setSelectedEmp({ ...selectedEmp, baseSalary: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Allowances (₹)
                    </label>
                    <input
                      type="number"
                      value={selectedEmp.allowances || 0}
                      onChange={(e) => setSelectedEmp({ ...selectedEmp, allowances: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Deductions (₹)
                    </label>
                    <input
                      type="number"
                      value={selectedEmp.deductions || 0}
                      onChange={(e) => setSelectedEmp({ ...selectedEmp, deductions: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
