import React, { useEffect, useState } from 'react';
import { leaveAPI } from '../../api';
import Header from '../../components/layout/Header';

export default function HRLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feedback, setFeedback] = useState(null);
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    leaveId: null,
    reason: '',
    submitting: false,
  });

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await leaveAPI.getAllLeaves();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load leave records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApprove = async (id) => {
    try {
      await leaveAPI.approveLeave(id);
      setFeedback({ type: 'success', text: 'Leave request approved successfully!' });
      fetchLeaves();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to approve leave.' });
    }
  };

  const openRejectModal = (id) => {
    setRejectModal({
      isOpen: true,
      leaveId: id,
      reason: '',
      submitting: false,
    });
  };

  const closeRejectModal = () => {
    setRejectModal({
      isOpen: false,
      leaveId: null,
      reason: '',
      submitting: false,
    });
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectModal.leaveId) return;

    setRejectModal((prev) => ({ ...prev, submitting: true }));
    try {
      await leaveAPI.rejectLeave(rejectModal.leaveId, rejectModal.reason || 'Operational requirements');
      setFeedback({ type: 'success', text: 'Leave request rejected.' });
      closeRejectModal();
      fetchLeaves();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to reject leave.' });
      setRejectModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const filteredLeaves = leaves.filter((l) => statusFilter === 'ALL' || l.status === statusFilter);

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Header
        title="Leave Management"
        subtitle="Review, approve, or reject employee time-off requests"
      />

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
            Leave Management & Approvals
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Review staff vacation submissions, medical leaves, and approval histories
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            fontSize: '14px',
            outline: 'none',
          }}
        >
          <option value="ALL">All Submissions</option>
          <option value="PENDING">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
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

      <div
        className="card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: 0,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Employee</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Leave Type</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Period / Duration</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Reason</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Status</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading leaves...
                  </td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No leave requests found for this filter.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((l) => {
                  const isPending = l.status === 'PENDING';
                  const isApproved = l.status === 'APPROVED';
                  return (
                    <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              backgroundColor: '#007a7a',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px',
                            }}
                          >
                            {(l.employeeName || 'E').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>
                              {l.employeeName || 'Staff Member'}
                            </strong>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{l.employeeEmail || ''}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '10px',
                            backgroundColor: '#e6f4f4',
                            color: '#007a7a',
                          }}
                        >
                          {l.leaveType || 'CASUAL'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#334155' }}>
                        {l.startDate} to {l.endDate} ({l.days || 1} day{l.days > 1 ? 's' : ''})
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>
                        {l.reason || 'Personal'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            backgroundColor: isApproved ? '#dcfce7' : isPending ? '#fef3c7' : '#fee2e2',
                            color: isApproved ? '#166534' : isPending ? '#92400e' : '#991b1b',
                          }}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        {isPending ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-success"
                              onClick={() => handleApprove(l.id)}
                              title="Approve Leave"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              <i className="fa-solid fa-check"></i>
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => openRejectModal(l.id)}
                              title="Reject Leave"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={closeRejectModal}
        >
          <div
            className="modal-card"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                <i className="fa-solid fa-ban"></i>
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                Reject Leave Request
              </h3>
            </div>

            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
              Please specify the reason for declining this leave request so the employee is informed.
            </p>

            <form onSubmit={handleConfirmReject}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Rejection Reason
                </label>
                <textarea
                  rows="3"
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. Critical project milestone in progress, please reschedule"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeRejectModal}
                  disabled={rejectModal.submitting}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#64748b',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectModal.submitting}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#ffffff',
                    backgroundColor: '#dc2626',
                    border: 'none',
                    cursor: rejectModal.submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {rejectModal.submitting && <i className="fa-solid fa-spinner fa-spin"></i>}
                  Reject Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
