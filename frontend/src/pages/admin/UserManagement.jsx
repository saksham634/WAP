import React, { useEffect, useState } from 'react';
import { userAPI } from '../../api';
import Header from '../../components/layout/Header';
import ConfirmModal from '../../components/common/ConfirmModal';
import { downloadStaffDirectoryCSV } from '../../utils/downloadUtils';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalError, setAddModalError] = useState(null);
  const [addModalLoading, setAddModalLoading] = useState(false);
  const [newUserData, setNewUserData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'ROLE_EMPLOYEE',
    employeeId: '',
    baseSalary: 60000,
    allowances: 15000,
    deductions: 5000,
  });

  // Edit User Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editModalError, setEditModalError] = useState(null);
  const [editModalLoading, setEditModalLoading] = useState(false);

  // Status feedback
  const [feedback, setFeedback] = useState(null);

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userAPI.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddModalError(null);
    setAddModalLoading(true);
    try {
      await userAPI.createUser(newUserData);
      setFeedback({ type: 'success', text: `Staff member "${newUserData.fullName}" created successfully!` });
      setIsAddModalOpen(false);
      setNewUserData({
        fullName: '',
        email: '',
        password: '',
        role: 'ROLE_EMPLOYEE',
        employeeId: '',
        baseSalary: 60000,
        allowances: 15000,
        deductions: 5000,
      });
      fetchUsers();
    } catch (err) {
      setAddModalError(err.message || 'Failed to create staff member.');
    } finally {
      setAddModalLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditModalError(null);
    setEditModalLoading(true);
    try {
      const identifier = editingUser.id || editingUser.employeeId;
      await userAPI.updateUser(identifier, editingUser);
      setFeedback({ type: 'success', text: 'User details & salary updated successfully!' });
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      setEditModalError(err.message || 'Failed to update user.');
    } finally {
      setEditModalLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setDeleteTarget(user);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const identifier = deleteTarget.id || deleteTarget.employeeId;
      await userAPI.deleteUser(identifier);
      setFeedback({ type: 'success', text: `User "${deleteTarget.fullName}" removed successfully.` });
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete user.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Header
        title="User Management"
        subtitle="Add, edit, and manage system users"
      />

      {/* Top Action Bar */}
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
            User & Employee Accounts
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Manage staff credentials, security roles, and base salary assignments
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setAddModalError(null);
            setIsAddModalOpen(true);
          }}
          style={{ padding: '10px 20px', borderRadius: '10px' }}
        >
          <i className="fa-solid fa-user-plus"></i> Add New Staff Member
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

      {/* Filter & Search Controls */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by name, email, or employee ID..."
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
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
          <option value="ALL">All Roles</option>
          <option value="ROLE_ADMIN">Administrators</option>
          <option value="ROLE_HR">HR Managers</option>
          <option value="ROLE_EMPLOYEE">Employees</option>
        </select>

        {users.length > 0 && (
          <button
            className="btn btn-outline"
            onClick={() => downloadStaffDirectoryCSV(filteredUsers.length > 0 ? filteredUsers : users)}
            style={{ padding: '12px 18px', borderRadius: '12px', whiteSpace: 'nowrap' }}
            title="Export staff directory to CSV"
          >
            <i className="fa-solid fa-file-csv" style={{ color: '#007a7a' }}></i> Export Staff CSV
          </button>
        )}
      </div>

      {/* Users Table */}
      <div
        className="card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '0',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Staff Member</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Employee ID</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Role</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Base Salary</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No users matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#007a7a',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px',
                            backgroundImage: u.profilePicture ? `url("${u.profilePicture}")` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          {!u.profilePicture && (u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U')}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>{u.fullName}</h4>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      {u.employeeId || 'N/A'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          backgroundColor:
                            u.role === 'ROLE_ADMIN'
                              ? '#fef3c7'
                              : u.role === 'ROLE_HR'
                              ? '#dbeafe'
                              : '#e6f4f4',
                          color:
                            u.role === 'ROLE_ADMIN'
                              ? '#92400e'
                              : u.role === 'ROLE_HR'
                              ? '#1e40af'
                              : '#007a7a',
                        }}
                      >
                        {(u.role || '').replace('ROLE_', '')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>
                      ₹{Number(u.baseSalary || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-outline"
                          onClick={() => {
                            setEditingUser({ ...u });
                            setEditModalError(null);
                            setIsEditModalOpen(true);
                          }}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <i className="fa-solid fa-pen"></i> Edit
                        </button>
                        {u.role !== 'ROLE_ADMIN' && (
                          <button
                            className="btn btn-outline"
                            onClick={() => handleDeleteClick(u)}
                            style={{
                              padding: '6px 10px',
                              color: '#ef4444',
                              borderColor: '#fca5a5',
                              backgroundColor: '#fef2f2',
                            }}
                            title="Delete or Deactivate User"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Staff Member</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                &times;
              </button>
            </div>

            {addModalError && (
              <div
                style={{
                  margin: '16px 20px 0 20px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '16px', color: '#dc2626' }}></i>
                <span style={{ fontWeight: 500 }}>{addModalError}</span>
              </div>
            )}

            <form onSubmit={handleAddUser}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserData.fullName}
                    onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newUserData.password}
                      onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Role
                    </label>
                    <select
                      value={newUserData.role}
                      onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="ROLE_EMPLOYEE">Employee</option>
                      <option value="ROLE_HR">HR Manager</option>
                      <option value="ROLE_ADMIN">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Employee ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EMP-1050"
                      value={newUserData.employeeId}
                      onChange={(e) => setNewUserData({ ...newUserData, employeeId: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Base Salary
                    </label>
                    <input
                      type="number"
                      value={newUserData.baseSalary}
                      onChange={(e) => setNewUserData({ ...newUserData, baseSalary: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Allowances
                    </label>
                    <input
                      type="number"
                      value={newUserData.allowances}
                      onChange={(e) => setNewUserData({ ...newUserData, allowances: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Deductions
                    </label>
                    <input
                      type="number"
                      value={newUserData.deductions}
                      onChange={(e) => setNewUserData({ ...newUserData, deductions: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={addModalLoading}>
                  {addModalLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Creating...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditModalOpen && editingUser && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User: {editingUser.fullName}</h3>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                &times;
              </button>
            </div>

            {editModalError && (
              <div
                style={{
                  margin: '16px 20px 0 20px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '16px', color: '#dc2626' }}></i>
                <span style={{ fontWeight: 500 }}>{editModalError}</span>
              </div>
            )}

            <form onSubmit={handleEditUser}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUser.fullName || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Role {editingUser.role === 'ROLE_ADMIN' && <span style={{ fontSize: '11px', color: '#007a7a', fontWeight: 'normal' }}>(Administrator role cannot be changed)</span>}
                  </label>
                  {editingUser.role === 'ROLE_ADMIN' ? (
                    <input
                      type="text"
                      disabled
                      value="Administrator (ROLE_ADMIN)"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f1f5f9',
                        color: '#64748b',
                        cursor: 'not-allowed',
                        boxSizing: 'border-box',
                      }}
                    />
                  ) : (
                    <select
                      value={editingUser.role || 'ROLE_EMPLOYEE'}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    >
                      <option value="ROLE_EMPLOYEE">Employee</option>
                      <option value="ROLE_HR">HR Manager</option>
                    </select>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Base Salary
                    </label>
                    <input
                      type="number"
                      value={editingUser.baseSalary || 0}
                      onChange={(e) => setEditingUser({ ...editingUser, baseSalary: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Allowances
                    </label>
                    <input
                      type="number"
                      value={editingUser.allowances || 0}
                      onChange={(e) => setEditingUser({ ...editingUser, allowances: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Deductions
                    </label>
                    <input
                      type="number"
                      value={editingUser.deductions || 0}
                      onChange={(e) => setEditingUser({ ...editingUser, deductions: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={editModalLoading}>
                  {editModalLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Custom In-App Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Deactivate / Delete User"
        message={deleteTarget ? `Are you sure you want to delete or deactivate the account for "${deleteTarget.fullName}" (${deleteTarget.email})?` : ''}
        confirmText="Delete Account"
        cancelText="Cancel"
        isDestructive={true}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
