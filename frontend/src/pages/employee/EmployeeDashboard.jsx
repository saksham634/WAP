import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceAPI, payrollAPI, projectAPI, employeeAPI } from '../../api';
import Header from '../../components/layout/Header';
import { Line } from 'react-chartjs-2';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [statusData, setStatusData] = useState({
    status: 'NOT_CHECKED_IN',
    checkInTime: null,
    checkOutTime: null,
  });
  const [metrics, setMetrics] = useState({
    attendancePercentage: '0%',
    leavesTaken: 0,
    balanceLeaves: 24,
    todayStatus: 'Not Checked In',
    weeklyAttendanceTrend: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
    monthlyAttendanceTrend: { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 },
  });
  const [payslips, setPayslips] = useState([]);
  const [teamProjects, setTeamProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const userName = user?.fullName || localStorage.getItem('fullName') || 'Team Member';

  const loadData = async () => {
    try {
      // 1. Dashboard Metrics (Dynamic Weekly & Monthly Attendance Trends)
      try {
        const m = await employeeAPI.getDashboardMetrics();
        if (m) {
          setMetrics(m);
        }
      } catch (e) {
        console.warn('Dashboard metrics error:', e);
      }

      // 2. Attendance Status
      try {
        const res = await attendanceAPI.getTodayStatus();
        if (res) {
          setStatusData({
            status: res.status || (res.punchInTime ? (res.punchOutTime ? 'CHECKED_OUT' : 'CHECKED_IN') : 'NOT_CHECKED_IN'),
            checkInTime: res.punchInTime || res.checkInTime || null,
            checkOutTime: res.punchOutTime || res.checkOutTime || null,
          });
        }
      } catch (e) {
        console.warn('Attendance status error:', e);
      }

      // 3. Payslips
      try {
        const ps = await payrollAPI.getMyPayslips();
        if (Array.isArray(ps)) {
          setPayslips(ps.slice(0, 3));
        }
      } catch (e) {
        console.warn('Payslips error:', e);
      }

      // 4. Team Projects
      try {
        const projs = await projectAPI.getAllProjects();
        if (Array.isArray(projs)) {
          setTeamProjects(projs.slice(0, 3));
        }
      } catch (e) {
        console.warn('Projects error:', e);
      }
    } catch (err) {
      console.error('Failed to load employee dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      await attendanceAPI.punchIn();
      setFeedback({ type: 'success', text: 'Successfully checked in for the day!' });
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Check-in failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      await attendanceAPI.punchOut();
      setFeedback({ type: 'success', text: 'Successfully checked out. Have a great evening!' });
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Check-out failed. Please try again.' });
    } finally {
      setLoading(false);
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

  const [chartFilter, setChartFilter] = useState('This Week');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Dynamic Weekly vs Monthly Trend (Resets every week/month based on database checkins)
  const isMonthly = chartFilter === 'This Month';
  const activeTrend = isMonthly
    ? (metrics.monthlyAttendanceTrend || { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 })
    : (metrics.weeklyAttendanceTrend || { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 });

  const chartLabels = Object.keys(activeTrend);
  const chartValues = Object.values(activeTrend);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: isMonthly ? 'Weekly Avg Hours' : 'Daily Work Hours',
        data: chartValues,
        borderColor: '#007a7a',
        borderWidth: 3,
        backgroundColor: 'rgba(0, 122, 122, 0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#007a7a',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const isCheckedIn = statusData.status === 'CHECKED_IN';
  const isCheckedOut = statusData.status === 'CHECKED_OUT';

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Header
        title={`Welcome ${userName},`}
        subtitle="Here's your workforce overview for today."
      />

      <section className="top-section">
        {/* Left Panel */}
        <div className="left-panel">
          {/* Attendance Trend */}
          <section className="card attendance-card">
            <div className="card-header" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2>Attendance Trend</h2>
                <p>{isMonthly ? 'Monthly Hours Trend (Resets Monthly)' : 'Weekly Attendance Overview (Resets Weekly)'}</p>
              </div>
              <div className="dropdown" style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="filter-button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {chartFilter} <i className="fa-solid fa-chevron-down" style={{ fontSize: '11px' }}></i>
                </button>
                {isDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '6px',
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      zIndex: 20,
                      minWidth: '140px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      onClick={() => {
                        setChartFilter('This Week');
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '13px',
                        backgroundColor: chartFilter === 'This Week' ? '#f0fdf4' : 'transparent',
                        color: chartFilter === 'This Week' ? '#166534' : '#334155',
                        fontWeight: chartFilter === 'This Week' ? 600 : 400,
                      }}
                    >
                      This Week
                    </div>
                    <div
                      onClick={() => {
                        setChartFilter('This Month');
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        backgroundColor: chartFilter === 'This Month' ? '#f0fdf4' : 'transparent',
                        color: chartFilter === 'This Month' ? '#166534' : '#334155',
                        fontWeight: chartFilter === 'This Month' ? 600 : 400,
                      }}
                    >
                      This Month
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="chart-container" style={{ position: 'relative', height: '260px', width: '100%', padding: '10px 0' }}>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false } },
                    y: {
                      beginAtZero: true,
                      max: 12,
                      ticks: { stepSize: 2, callback: (val) => `${val}h` },
                      grid: { color: '#f1f5f9' },
                    },
                  },
                }}
              />
            </div>
          </section>

          {/* My Payslips */}
          <section className="card payroll-card" style={{ marginTop: '1.5rem' }}>
            <div className="card-header">
              <h2>My Payslips</h2>
              <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.875rem' }}>Recent salary records</p>
            </div>
            <div className="card-body" style={{ padding: '1rem', overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                    <th style={{ padding: '0.75rem' }}>Period</th>
                    <th style={{ padding: '0.75rem' }}>Base</th>
                    <th style={{ padding: '0.75rem' }}>Days Worked</th>
                    <th style={{ padding: '0.75rem' }}>Deductions</th>
                    <th style={{ padding: '0.75rem' }}>Net Salary</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                        No payslips generated yet.
                      </td>
                    </tr>
                  ) : (
                    payslips.map((ps, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{ps.payPeriod}</td>
                        <td style={{ padding: '0.75rem' }}>₹{(ps.baseSalary || 0).toLocaleString()}</td>
                        <td style={{ padding: '0.75rem' }}>{ps.presentDays}</td>
                        <td style={{ padding: '0.75rem', color: '#ef4444' }}>₹{(ps.deductions || 0).toLocaleString()}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 600, color: '#007a7a' }}>
                          ₹{(ps.netSalary || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span
                            className="status-badge"
                            style={{
                              background: '#dcfce7',
                              color: '#166534',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          >
                            {ps.status || 'PAID'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="card activity-card" style={{ marginTop: '1.5rem' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Recent Activity</h2>
              <a href="/employee/attendance" className="view-all" style={{ color: '#007a7a', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                View All
              </a>
            </div>
            <div style={{ padding: '0 1rem 1rem 1rem' }}>
              {statusData.status !== 'NOT_CHECKED_IN' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#dcfce7',
                      color: '#166534',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <i className="fa-solid fa-clock"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>Attendance Check-In</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Clocked in at {statusData.checkInTime || 'Today'}
                    </div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#e2e8f0',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <i className="fa-solid fa-user-check"></i>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>Dashboard Active</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Logged in securely</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          {/* Daily Attendance Actions */}
          <section className="card quick-actions-card" style={{ marginBottom: '1.5rem', flexShrink: 0 }}>
            <div className="card-header">
              <h2>Daily Attendance</h2>
            </div>
            <div className="card-body" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              {feedback && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '13px',
                    fontWeight: 500,
                    backgroundColor: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: feedback.type === 'success' ? '#166534' : '#991b1b',
                    border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className={feedback.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'}></i>
                    <span>{feedback.text}</span>
                  </div>
                  <button
                    onClick={() => setFeedback(null)}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              )}
              <p style={{ marginBottom: '1.2rem', color: 'var(--text-secondary, #64748b)', fontWeight: 500 }}>
                {isCheckedOut
                  ? 'Shift completed for today.'
                  : isCheckedIn
                  ? 'Currently clocked in.'
                  : 'You have not checked in yet today.'}
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleCheckIn}
                  className="btn btn-primary"
                  disabled={isCheckedIn || isCheckedOut || loading}
                  style={{
                    padding: '8px 18px',
                    backgroundColor: isCheckedIn || isCheckedOut ? '#94a3b8' : '#007a7a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isCheckedIn || isCheckedOut ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {isCheckedIn ? (statusData.checkInTime ? `Checked In (${statusData.checkInTime})` : 'Checked In') : 'Check In'}
                </button>

                <button
                  type="button"
                  onClick={handleCheckOut}
                  className="btn btn-secondary"
                  disabled={!isCheckedIn || isCheckedOut || loading}
                  style={{
                    padding: '8px 18px',
                    backgroundColor: !isCheckedIn || isCheckedOut ? '#94a3b8' : '#0284c7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: !isCheckedIn || isCheckedOut ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {isCheckedOut ? (statusData.checkOutTime ? `Checked Out (${statusData.checkOutTime})` : 'Checked Out') : 'Check Out'}
                </button>

                <button
                  type="button"
                  onClick={handleResetAttendance}
                  className="btn"
                  style={{
                    background: 'var(--bg-color, #f8fafc)',
                    color: 'var(--text-secondary, #64748b)',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    fontSize: '0.8rem',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <i className="fa-solid fa-rotate-left" style={{ marginRight: '4px' }}></i> Reset (Test)
                </button>
              </div>
            </div>
          </section>

          {/* Team Updates */}
          <section className="card updates-card">
            <div className="card-header">
              <h2>Team Updates</h2>
            </div>
            <div style={{ padding: '1rem 0' }}>
              {teamProjects.length > 0 ? (
                teamProjects.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      paddingBottom: '14px',
                      marginBottom: '14px',
                      borderBottom: idx < teamProjects.length - 1 ? '1px solid #f1f5f9' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'rgba(0, 122, 122, 0.1)',
                        color: '#007a7a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <i className="fa-solid fa-diagram-project"></i>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                        {p.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                        {p.progress || 0}% Complete • {p.assignedUsers && p.assignedUsers.length > 0 ? `${p.assignedUsers.length} Team Members` : (p.assignedMembers ? `${p.assignedMembers.split(',').length} Team Members` : 'Team Deliverable')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '12px', color: '#64748b', fontSize: '13px' }}>
                  No updates posted currently.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
