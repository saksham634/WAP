import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Header from '../../components/layout/Header';
import { adminAPI, userAPI, payrollAPI, attendanceAPI } from '../../api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function HRDashboard() {
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    onLeave: 0,
    weeklyAttendanceTrend: {},
    monthlyAttendanceTrend: {},
    systemAlerts: [],
  });
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartFilter, setChartFilter] = useState('This Week');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [payrollMessage, setPayrollMessage] = useState(null);

  // HR Personal Punch Status
  const [punchData, setPunchData] = useState({
    status: 'NOT_CHECKED_IN',
    checkInTime: null,
    checkOutTime: null,
  });
  const [punchLoading, setPunchLoading] = useState(false);
  const [punchFeedback, setPunchFeedback] = useState(null);

  const loadData = async () => {
    try {
      const data = await adminAPI.getDashboardMetrics();
      if (data) setMetrics(data);

      const users = await userAPI.getAllUsers();
      if (Array.isArray(users)) {
        setEmployees(users.filter((u) => u.role !== 'ROLE_ADMIN'));
      }

      // Load HR personal attendance status
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
        console.warn('Failed to load HR punch status:', e);
      }
    } catch (err) {
      console.warn('Error loading HR dashboard:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePunchIn = async () => {
    setPunchLoading(true);
    setPunchFeedback(null);
    try {
      await attendanceAPI.punchIn();
      setPunchFeedback({ type: 'success', text: 'Checked in successfully!' });
      loadData();
    } catch (err) {
      setPunchFeedback({ type: 'error', text: err.message || 'Check-in failed.' });
    } finally {
      setPunchLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setPunchLoading(true);
    setPunchFeedback(null);
    try {
      await attendanceAPI.punchOut();
      setPunchFeedback({ type: 'success', text: 'Checked out successfully!' });
      loadData();
    } catch (err) {
      setPunchFeedback({ type: 'error', text: err.message || 'Check-out failed.' });
    } finally {
      setPunchLoading(false);
    }
  };

  const handleResetAttendance = async () => {
    setPunchFeedback(null);
    try {
      await attendanceAPI.resetAttendance();
      setPunchFeedback({ type: 'success', text: 'Attendance reset! You can now punch in again.' });
      loadData();
    } catch (err) {
      setPunchFeedback({ type: 'error', text: err.message || 'Reset failed.' });
    }
  };

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setPayrollMessage({ type: 'error', text: 'Please select an employee first.' });
      return;
    }
    setPayrollLoading(true);
    setPayrollMessage(null);
    try {
      const result = await payrollAPI.generatePayroll({
        userId: Number(selectedUserId),
        month: Number(selectedMonth),
        year: Number(selectedYear),
      });
      setPayrollMessage({ type: 'success', text: `Payroll generated! Net: ₹${(result.netSalary || 0).toLocaleString()}` });
    } catch (err) {
      setPayrollMessage({ type: 'error', text: err.message || 'Failed to process payroll.' });
    } finally {
      setPayrollLoading(false);
    }
  };

  // Build Dynamic Chart Data (Weekly vs Monthly Calendar Resets)
  const isMonthly = chartFilter === 'This Month';
  const activeTrend = isMonthly
    ? (metrics.monthlyAttendanceTrend || { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 })
    : (metrics.weeklyAttendanceTrend || { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 });

  const labels = Object.keys(activeTrend);
  const presentValues = Object.values(activeTrend);
  const total = metrics.totalEmployees || 5;
  const absentValues = presentValues.map((v) => Math.max(0, total - v));

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: isMonthly ? 'Avg Present' : 'Present',
        data: presentValues,
        backgroundColor: '#007a7a',
        borderRadius: 4,
      },
      {
        label: isMonthly ? 'Avg Absent' : 'Absent/Leave',
        data: absentValues,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Header
        title="Welcome HR Admin,"
        subtitle="Here's your organization overview for today."
      />

      <div className="top-section">
        {/* Left Panel */}
        <div className="left-panel">
          {/* Workforce Attendance Trend */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2>Workforce Attendance Trend</h2>
                <p>Organization Overview</p>
              </div>
              <div className="dropdown" style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="filter-button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {chartFilter} <i className="fa-solid fa-chevron-down" style={{ marginLeft: '5px' }}></i>
                </button>
                {isDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '5px',
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      zIndex: 10,
                      minWidth: '140px',
                    }}
                  >
                    <div
                      onClick={() => {
                        setChartFilter('This Week');
                        setIsDropdownOpen(false);
                      }}
                      style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}
                    >
                      This Week
                    </div>
                    <div
                      onClick={() => {
                        setChartFilter('This Month');
                        setIsDropdownOpen(false);
                      }}
                      style={{ padding: '10px 15px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      This Month
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="chart-placeholder" style={{ position: 'relative', height: '280px', width: '100%', padding: '10px' }}>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { stacked: true, grid: { display: false } },
                    y: { stacked: true, beginAtZero: true, grid: { color: '#f1f5f9' } },
                  },
                }}
              />
            </div>
          </div>

          {/* Recent HR Activity */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Recent HR Activity</h2>
              <a href="/hr/leaves" className="view-all" style={{ color: '#007a7a', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                View All
              </a>
            </div>
            <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: 'var(--text, #0f172a)', fontWeight: 500 }}>
                <i className="fa-solid fa-check-circle" style={{ color: '#007a7a', marginRight: '10px' }}></i>
                Pending Leaves: {metrics.pendingLeaves || 0}
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Active</span>
            </div>
            <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ color: 'var(--text, #0f172a)', fontWeight: 500 }}>
                <i className="fa-solid fa-user-plus" style={{ color: '#007a7a', marginRight: '10px' }}></i>
                Active Staff: {metrics.totalEmployees || 0} Registered
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Today</span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          {/* HR Daily Attendance & Punch Card */}
          <div className="card quick-actions-card" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <div className="card-header" style={{ textAlign: 'left' }}>
              <h2>My Daily Attendance</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>HR Punch Status & Biometric Times</p>
            </div>
            <div className="card-body" style={{ padding: '1.25rem 1rem' }}>
              {punchFeedback && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '13px',
                    backgroundColor: punchFeedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: punchFeedback.type === 'success' ? '#166534' : '#991b1b',
                    border: `1px solid ${punchFeedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{punchFeedback.text}</span>
                  <button
                    onClick={() => setPunchFeedback(null)}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                  >
                    &times;
                  </button>
                </div>
              )}
              <p style={{ marginBottom: '1rem', color: '#475569', fontWeight: 500, fontSize: '13px' }}>
                {punchData.status === 'CHECKED_OUT'
                  ? 'Shift completed for today.'
                  : punchData.status === 'CHECKED_IN'
                  ? 'Currently clocked in.'
                  : 'You have not checked in yet today.'}
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handlePunchIn}
                  className="btn btn-primary"
                  disabled={punchData.status === 'CHECKED_IN' || punchData.status === 'CHECKED_OUT' || punchLoading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: punchData.status === 'CHECKED_IN' || punchData.status === 'CHECKED_OUT' ? '#94a3b8' : '#007a7a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: punchData.status === 'CHECKED_IN' || punchData.status === 'CHECKED_OUT' ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  {punchData.status === 'CHECKED_IN' ? (punchData.checkInTime ? `In (${punchData.checkInTime})` : 'Checked In') : 'Check In'}
                </button>

                <button
                  type="button"
                  onClick={handlePunchOut}
                  className="btn btn-secondary"
                  disabled={punchData.status !== 'CHECKED_IN' || punchLoading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: punchData.status !== 'CHECKED_IN' ? '#94a3b8' : '#0284c7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: punchData.status !== 'CHECKED_IN' ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  {punchData.status === 'CHECKED_OUT' ? (punchData.checkOutTime ? `Out (${punchData.checkOutTime})` : 'Checked Out') : 'Check Out'}
                </button>

                <button
                  type="button"
                  onClick={handleResetAttendance}
                  className="btn"
                  style={{
                    background: '#f8fafc',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.8rem',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  title="Reset Attendance (Test)"
                >
                  <i className="fa-solid fa-rotate-left"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Generate Employee Payroll Card */}
          <div className="card payroll-generation-card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h2>Generate Employee Payroll</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Process monthly salary</p>
            </div>
            <div className="card-body" style={{ padding: '1.5rem' }}>
              {payrollMessage && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    fontSize: '13px',
                    backgroundColor: payrollMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: payrollMessage.type === 'success' ? '#166534' : '#991b1b',
                  }}
                >
                  {payrollMessage.text}
                </div>
              )}
              <form onSubmit={handleGeneratePayroll} style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.5rem', fontSize: '13px' }}>
                    Select Employee
                  </label>
                  <select
                    className="form-control"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
                  >
                    <option value="" disabled>Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName || emp.email} ({emp.employeeId || 'Staff'})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.5rem', fontSize: '13px' }}>
                      Month
                    </label>
                    <select
                      className="form-control"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
                    >
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.5rem', fontSize: '13px' }}>
                      Year
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={payrollLoading}
                  style={{
                    width: '100%',
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#007a7a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {payrollLoading ? 'Processing...' : 'Process Payroll'}
                </button>
              </form>
            </div>
          </div>

          {/* Department Updates */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h2>Department Updates</h2>
            </div>
            <div className="status-list" style={{ padding: '1rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div className="profile-avatar" style={{ width: '40px', height: '40px', fontSize: '14px' }}>
                  <i className="fa-solid fa-user-plus"></i>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', margin: '0 0 4px 0', color: '#0f172a' }}>
                    {metrics.totalEmployees || 0} Employees Enrolled
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-light, #64748b)', margin: 0 }}>
                    Organization-wide Workforce
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="card flex-1">
            <div className="card-header">
              <h2>Pending Approvals</h2>
            </div>
            <div className="status-list" style={{ padding: '1rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div
                  className="event-date"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{metrics.pendingLeaves || 0}</h3>
                  <span style={{ fontSize: '10px', fontWeight: 600 }}>LVS</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', margin: '0 0 4px 0', color: '#0f172a' }}>Leave Requests</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-light, #64748b)', margin: 0 }}>
                    Require Manager Approval
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
