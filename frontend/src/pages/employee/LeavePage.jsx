import React, { useEffect, useState } from 'react';
import { leaveAPI } from '../../api';
import Header from '../../components/layout/Header';
import { downloadLeavesCSV } from '../../utils/downloadUtils';

export default function LeavePage() {
  const [balance, setBalance] = useState({
    casualLeaves: 8,
    sickLeaves: 6,
    paidLeaves: 12,
    totalAvailable: 26,
  });
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply Leave Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    leaveType: 'CASUAL',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const [feedback, setFeedback] = useState(null);

  const fetchLeaveData = async () => {
    setLoading(true);
    try {
      const [bal, history] = await Promise.all([
        leaveAPI.getLeaveBalance(),
        leaveAPI.getMyLeaves(),
      ]);
      if (bal) setBalance(bal);
      if (Array.isArray(history)) setLeaves(history);
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    if (newLeave.startDate < todayStr) {
      setFeedback({ type: 'error', text: 'Leave start date cannot be in the past.' });
      return;
    }
    if (newLeave.endDate < newLeave.startDate) {
      setFeedback({ type: 'error', text: 'Leave end date cannot be earlier than start date.' });
      return;
    }

    try {
      await leaveAPI.applyLeave(newLeave);
      setFeedback({ type: 'success', text: 'Leave application submitted successfully!' });
      setIsApplyModalOpen(false);
      setNewLeave({
        leaveType: 'CASUAL',
        startDate: todayStr,
        endDate: todayStr,
        reason: '',
      });
      fetchLeaveData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to submit leave request.' });
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Header
        title="Leave Management"
        subtitle="Check your accrued leave balance, apply for time off, and track supervisor reviews"
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
            Leave Management & Entitlements
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Check your accrued leave balance, apply for time off, and track supervisor reviews
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {leaves.length > 0 && (
            <button
              className="btn btn-outline"
              onClick={() => downloadLeavesCSV(leaves)}
              style={{ padding: '10px 18px', borderRadius: '10px' }}
              title="Download leave requests history as CSV"
            >
              <i className="fa-solid fa-file-csv" style={{ color: '#007a7a' }}></i> Export Leaves CSV
            </button>
          )}

          <button
            className="btn btn-primary"
            onClick={() => setIsApplyModalOpen(true)}
            style={{ padding: '10px 20px', borderRadius: '10px' }}
          >
            <i className="fa-solid fa-plane-departure"></i> Apply For Leave
          </button>
        </div>
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

      {/* Balance Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="card" style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Casual Leaves Available</span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#007a7a', fontWeight: 800 }}>
            {balance.casualLeaves ?? 8} Days
          </h3>
        </div>

        <div className="card" style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Sick / Medical Leaves</span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#3b82f6', fontWeight: 800 }}>
            {balance.sickLeaves ?? 6} Days
          </h3>
        </div>

        <div className="card" style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Annual Paid Leaves</span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#10b981', fontWeight: 800 }}>
            {balance.paidLeaves ?? 12} Days
          </h3>
        </div>

        <div className="card" style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Total Available Quota</span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#0f172a', fontWeight: 800 }}>
            {balance.totalAvailable ?? 26} Days
          </h3>
        </div>
      </div>

      {/* Leave Application History */}
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
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Leave Type</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Period (From - To)</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Days</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Reason</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading leave history...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No leave requests submitted yet.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => {
                  const isApproved = l.status === 'APPROVED';
                  const isPending = l.status === 'PENDING';
                  return (
                    <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
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
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#0f172a' }}>
                        {l.startDate} to {l.endDate}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                        {l.days || 1} Day{l.days > 1 ? 's' : ''}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b' }}>
                        {l.reason || 'Personal matters'}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
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
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLY LEAVE MODAL */}
      {isApplyModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsApplyModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Apply for Leave</h3>
              <button className="modal-close-btn" onClick={() => setIsApplyModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleApply}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Leave Category
                  </label>
                  <select
                    value={newLeave.leaveType}
                    onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="CASUAL">Casual Leave (Balance: {balance.casualLeaves ?? 8})</option>
                    <option value="SICK">Sick / Medical Leave (Balance: {balance.sickLeaves ?? 6})</option>
                    <option value="PAID">Annual Paid Leave (Balance: {balance.paidLeaves ?? 12})</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={newLeave.startDate}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        setNewLeave((prev) => ({
                          ...prev,
                          startDate: newStart,
                          endDate: prev.endDate < newStart ? newStart : prev.endDate,
                        }));
                      }}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      min={newLeave.startDate || new Date().toISOString().split('T')[0]}
                      value={newLeave.endDate}
                      onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Reason for Leave
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide details for leave request..."
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsApplyModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
