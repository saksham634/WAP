import React, { useEffect, useState } from 'react';
import { attendanceAPI, userAPI } from '../../api';
import Header from '../../components/layout/Header';

export default function HRAttendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [punchData, setPunchData] = useState({
    status: 'NOT_CHECKED_IN',
    checkInTime: null,
    checkOutTime: null,
  });
  const [punchLoading, setPunchLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. My punch status
      try {
        const todayAtt = await attendanceAPI.getTodayStatus();
        if (todayAtt) {
          setPunchData({
            status: todayAtt.status || (todayAtt.checkInTime ? (todayAtt.checkOutTime ? 'CHECKED_OUT' : 'CHECKED_IN') : 'NOT_CHECKED_IN'),
            checkInTime: todayAtt.checkInTime || todayAtt.punchInTime || null,
            checkOutTime: todayAtt.checkOutTime || todayAtt.punchOutTime || null,
          });
        }
      } catch (e) {
        console.warn('Failed to load my punch status:', e);
      }

      // 2. Org attendance
      const users = await userAPI.getAllUsers();
      const logs = await attendanceAPI.getAllAttendance(selectedDate);
      if (Array.isArray(logs)) {
        setAttendanceRecords(logs);
      } else {
        const demoLogs = (users || []).map((u, i) => ({
          id: u.id || i + 1,
          employeeName: u.fullName || 'Staff Member',
          employeeEmail: u.email || '',
          employeeId: u.employeeId || '',
          department: u.department || u.designation || 'Staff',
          status: 'ABSENT',
          punchIn: '--',
          punchOut: '--',
          workDuration: '--',
        }));
        setAttendanceRecords(demoLogs);
      }
    } catch (err) {
      console.error('Failed to load organization attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handlePunchIn = async () => {
    setPunchLoading(true);
    setFeedback(null);
    try {
      await attendanceAPI.punchIn();
      setFeedback({ type: 'success', text: 'Checked in successfully!' });
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Check-in failed.' });
    } finally {
      setPunchLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setPunchLoading(true);
    setFeedback(null);
    try {
      await attendanceAPI.punchOut();
      setFeedback({ type: 'success', text: 'Checked out successfully!' });
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Check-out failed.' });
    } finally {
      setPunchLoading(false);
    }
  };

  const handleResetAttendance = async () => {
    setFeedback(null);
    try {
      await attendanceAPI.resetAttendance();
      setFeedback({ type: 'success', text: 'Attendance reset! You can now check in again.' });
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Reset failed.' });
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Header
        title="Attendance Logs"
        subtitle="Review real-time organization attendance, check-in timestamps, and shift durations"
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

      {/* Action Bar with Date Filter and HR Punch Buttons */}
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
            Workforce Attendance Sheet
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Daily check-in logs, biometric punches, and work hours across organization
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {punchData.status !== 'CHECKED_IN' ? (
              <button
                className="btn btn-primary"
                onClick={handlePunchIn}
                disabled={punchData.status === 'CHECKED_OUT' || punchLoading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: punchData.status === 'CHECKED_OUT' ? '#94a3b8' : '#007a7a',
                  color: 'white',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: punchData.status === 'CHECKED_OUT' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <i className="fa-solid fa-right-to-bracket"></i>
                {punchData.status === 'CHECKED_OUT' ? 'Shift Completed' : 'Punch In (HR)'}
              </button>
            ) : (
              <button
                className="btn btn-danger"
                onClick={handlePunchOut}
                disabled={punchLoading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <i className="fa-solid fa-right-from-bracket"></i> Punch Out (HR)
              </button>
            )}

            <button
              onClick={handleResetAttendance}
              title="Reset HR Attendance for testing"
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>
          </div>
        </div>
      </div>

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
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Staff Member</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Employee ID</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Status</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Punch In</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Punch Out</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Effective Work Duration</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading attendance logs...
                  </td>
                </tr>
              ) : attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No attendance records found for {selectedDate}.
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((rec) => {
                  const status = rec.status || 'PRESENT';
                  const isPresent = status === 'PRESENT';
                  const isOnLeave = status === 'ON_LEAVE';
                  return (
                    <tr key={rec.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
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
                            {(rec.employeeName || 'E').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>
                              {rec.employeeName}
                            </strong>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{rec.department || 'General'}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                        {rec.employeeId || ''}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            backgroundColor: isPresent ? '#dcfce7' : isOnLeave ? '#dbeafe' : '#fee2e2',
                            color: isPresent ? '#166534' : isOnLeave ? '#1e40af' : '#991b1b',
                          }}
                        >
                          {status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>
                        {rec.punchIn || '--'}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>
                        {rec.punchOut || '--'}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#007a7a', fontWeight: 600 }}>
                        {rec.workDuration || '--'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
