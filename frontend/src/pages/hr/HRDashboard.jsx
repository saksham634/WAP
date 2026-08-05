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
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
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
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      <Header
        title="Welcome HR Admin,"
        subtitle="Here's your organization workforce overview and daily operations."
      />

      {/* Top Stat Overview KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          width: '100%',
        }}
      >
        <div className="card" style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Total Workforce</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#e6f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#007a7a' }}>
              <i className="fa-solid fa-users"></i>
            </div>
          </div>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', color: '#0f172a', fontWeight: 800 }}>
            {metrics.totalEmployees || 0}
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Registered staff members</span>
        </div>

        <div className="card" style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Checked In Today</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <i className="fa-solid fa-user-check"></i>
            </div>
          </div>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', color: '#16a34a', fontWeight: 800 }}>
            {metrics.presentToday || 0}
          </h3>
          <span style={{ fontSize: '12px', color: '#16a34a' }}>Live biometric punches</span>
        </div>

        <div className="card" style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Pending Approvals</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <i className="fa-solid fa-clock"></i>
            </div>
          </div>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', color: '#d97706', fontWeight: 800 }}>
            {metrics.pendingLeaves || 0}
          </h3>
          <a href="/hr/leaves" style={{ fontSize: '12px', color: '#007a7a', textDecoration: 'none', fontWeight: 600 }}>
            Review Leave Requests &rarr;
          </a>
        </div>

        <div className="card" style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>On Leave Today</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
              <i className="fa-solid fa-calendar-xmark"></i>
            </div>
          </div>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', color: '#dc2626', fontWeight: 800 }}>
            {metrics.onLeave || 0}
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Approved leaves</span>
        </div>
      </div>

      {/* Main Dashboard Responsive Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          width: '100%',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Attendance Trend & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          {/* Workforce Attendance Trend */}
          <div className="card" style={{ borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div className="card-header" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>
                  Workforce Attendance Trend
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  {isMonthly ? 'Monthly Attendance Rate' : 'Weekly Attendance Distribution'}
                </p>
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
            <div style={{ position: 'relative', height: '280px', width: '100%' }}>
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

          {/* Recent HR Activity & Updates */}
          <div className="card" style={{ borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Recent Activity & Alerts</h2>
              <a href="/hr/leaves" style={{ color: '#007a7a', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                View All &rarr;
              </a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-clock-rotate-left" style={{ color: '#d97706' }}></i>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                    {metrics.pendingLeaves || 0} Pending Leave Approval{metrics.pendingLeaves === 1 ? '' : 's'}
                  </span>
                </div>
                <a href="/hr/leaves" className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }}>
                  Review
                </a>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-user-check" style={{ color: '#16a34a' }}></i>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                    {metrics.presentToday || 0} Employees Present on Duty
                  </span>
                </div>
                <a href="/hr/attendance" className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }}>
                  Logs
                </a>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-users" style={{ color: '#007a7a' }}></i>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                    {metrics.totalEmployees || 0} Registered Workforce Members
                  </span>
                </div>
                <a href="/hr/employees" className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }}>
                  Directory
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pending Approvals Box, HR Punch, & Payroll */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          {/* Prominent Pending Approvals Card (Always Visible) */}
          <div
            className="card"
            style={{
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '20px',
              borderLeft: '5px solid #d97706',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>
                  Pending Approvals
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Actions requiring HR manager attention
                </p>
              </div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '12px',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                }}
              >
                {metrics.pendingLeaves || 0} Pending
              </span>
            </div>

            <div style={{ padding: '12px 16px', backgroundColor: '#fffbeb', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#fde68a',
                    color: '#92400e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '15px',
                  }}
                >
                  {metrics.pendingLeaves || 0}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', color: '#92400e', fontWeight: 700 }}>
                    Leave Application Requests
                  </h4>
                  <span style={{ fontSize: '12px', color: '#78350f' }}>
                    {metrics.pendingLeaves > 0 ? 'Pending employee leave approvals' : 'All leave applications up to date'}
                  </span>
                </div>
              </div>
              <a
                href="/hr/leaves"
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap', backgroundColor: '#d97706', borderColor: '#d97706' }}
              >
                Open Leaves
              </a>
            </div>
          </div>

          {/* HR Daily Attendance & Punch Card */}
          <div className="card" style={{ borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '20px', textAlign: 'center' }}>
            <div className="card-header" style={{ textAlign: 'left', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>My Daily Attendance</h2>
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>HR Punch Status & Biometric Times</p>
            </div>
            {punchFeedback && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  marginBottom: '12px',
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
            <p style={{ marginBottom: '14px', color: '#475569', fontWeight: 500, fontSize: '13px' }}>
              {punchData.status === 'CHECKED_OUT'
                ? 'Shift completed for today.'
                : punchData.status === 'CHECKED_IN'
                ? 'Currently clocked in.'
                : 'You have not checked in yet today.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePunchIn}
                className="btn btn-primary"
                disabled={punchData.status === 'CHECKED_IN' || punchData.status === 'CHECKED_OUT' || punchLoading}
                style={{
                  padding: '10px 18px',
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
                  padding: '10px 18px',
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
                  fontSize: '13px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                title="Reset Attendance (Test)"
              >
                <i className="fa-solid fa-rotate-left"></i>
              </button>
            </div>
          </div>

          {/* Quick Payroll Generation Card */}
          <div className="card" style={{ borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div className="card-header" style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>Quick Generate Payroll</h2>
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Process individual monthly payslip</p>
            </div>
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
            <form onSubmit={handleGeneratePayroll} style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px', fontSize: '13px', color: '#334155' }}>
                  Select Employee
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                >
                  <option value="" disabled>Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName || emp.email} ({emp.employeeId || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px', fontSize: '13px', color: '#334155' }}>
                    Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
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

                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px', fontSize: '13px', color: '#334155' }}>
                    Year
                  </label>
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={payrollLoading}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '10px',
                  backgroundColor: '#007a7a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                {payrollLoading ? 'Processing...' : 'Process Payroll'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
