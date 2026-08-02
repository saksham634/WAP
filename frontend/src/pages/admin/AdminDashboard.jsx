import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import Header from '../../components/layout/Header';
import { adminAPI } from '../../api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    onLeave: 0,
    roleDistribution: null,
    weeklyAttendanceTrend: null,
    systemAlerts: [],
  });
  useEffect(() => {
    async function fetchMetrics() {
      try {
        const data = await adminAPI.getDashboardMetrics();
        if (data) {
          setMetrics(data);
        }
      } catch (err) {
        console.warn('Failed to load admin dashboard metrics:', err);
      }
    }
    fetchMetrics();
  }, []);

  // Role Doughnut Chart Data
  const roleLabels = metrics.roleDistribution ? Object.keys(metrics.roleDistribution) : ['ADMIN', 'HR', 'EMPLOYEE'];
  const roleValues = metrics.roleDistribution ? Object.values(metrics.roleDistribution) : [1, 2, 5];

  const roleChartData = {
    labels: roleLabels,
    datasets: [
      {
        label: 'Employees by Role',
        data: roleValues,
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#6366F1'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  // Weekly Attendance Trend Line Chart Data
  const trendLabels = metrics.weeklyAttendanceTrend ? Object.keys(metrics.weeklyAttendanceTrend) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const trendValues = metrics.weeklyAttendanceTrend ? Object.values(metrics.weeklyAttendanceTrend) : [0, 0, 0, 0, 0, 0, 0];

  const lineChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Present Employees',
        data: trendValues,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.25)',
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#3B82F6',
        pointBorderWidth: 3,
      },
    ],
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'danger':
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      case 'primary':
        return '#6366f1';
      default:
        return '#10b981';
    }
  };

  const getAlertBg = (type) => {
    switch (type) {
      case 'danger':
      case 'error':
        return 'rgba(239, 68, 68, 0.1)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.1)';
      case 'info':
        return 'rgba(59, 130, 246, 0.1)';
      case 'primary':
        return 'rgba(99, 102, 241, 0.1)';
      default:
        return 'rgba(16, 185, 129, 0.1)';
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <Header
        title="System Administration"
        subtitle="Platform overview and system health metrics."
      />

      {/* Summary Stats Section */}
      <section
        className="stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1rem',
        }}
      >
        <div className="card stat-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #3B82F6' }}>
          <h3 style={{ color: 'var(--text-secondary, #64748b)', fontSize: '1rem', marginBottom: '0.5rem' }}>
            Total Employees
          </h3>
          <h2 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--text-primary, #0f172a)' }}>
            {metrics.totalEmployees ?? 0}
          </h2>
        </div>

        <div className="card stat-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #10B981' }}>
          <h3 style={{ color: 'var(--text-secondary, #64748b)', fontSize: '1rem', marginBottom: '0.5rem' }}>
            Checked In Today
          </h3>
          <h2 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--text-primary, #0f172a)' }}>
            {metrics.presentToday ?? 0}
          </h2>
        </div>

        <div className="card stat-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #F59E0B' }}>
          <h3 style={{ color: 'var(--text-secondary, #64748b)', fontSize: '1rem', marginBottom: '0.5rem' }}>
            Pending Leaves
          </h3>
          <h2 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--text-primary, #0f172a)' }}>
            {metrics.pendingLeaves ?? 0}
          </h2>
        </div>

        <div className="card stat-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #EF4444' }}>
          <h3 style={{ color: 'var(--text-secondary, #64748b)', fontSize: '1rem', marginBottom: '0.5rem' }}>
            On Leave Today
          </h3>
          <h2 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--text-primary, #0f172a)' }}>
            {metrics.onLeave ?? 0}
          </h2>
        </div>
      </section>

      {/* Dashboard Top Section */}
      <section className="top-section">
        {/* Left Panel */}
        <div className="left-panel">
          {/* Analytics Chart Card */}
          <section className="card analytics-card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h2>Role Distribution</h2>
              <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.875rem' }}>Company-wide breakdown</p>
            </div>

            <div className="card-body" style={{ padding: '1rem' }}>
              <div className="chart-container" style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Doughnut
                  data={roleChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: '#64748b', font: { family: 'Inter' } },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </section>

          {/* Weekly Attendance Trend */}
          <section className="card attendance-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2>Weekly Attendance Trend</h2>
                <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.875rem' }}>
                  Daily check-in activity for past 7 days
                </p>
              </div>
              <span
                className="badge badge-success"
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10B981',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                <i className="fa-solid fa-bolt" style={{ marginRight: '4px' }}></i> Real-time
              </span>
            </div>
            <div className="chart-container" style={{ position: 'relative', height: '300px', padding: '10px' }}>
              <Line
                data={lineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: '#6b7280' } },
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1, precision: 0, color: '#6b7280' },
                      grid: { color: '#eef2f7' },
                    },
                  },
                }}
              />
            </div>
          </section>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          {/* System Alerts */}
          <section className="card updates-card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2>System & Operational Alerts</h2>
                <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.875rem' }}>
                  Real-time workforce & audit notifications
                </p>
              </div>
            </div>
            <div id="alertsContainer" style={{ padding: '10px 0' }}>
              {metrics.systemAlerts && metrics.systemAlerts.length > 0 ? (
                metrics.systemAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="alert-item"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      padding: '12px',
                      marginBottom: '10px',
                      background: 'var(--surface-secondary, #f8fafc)',
                      borderRadius: '10px',
                      borderLeft: `4px solid ${getAlertColor(alert.type)}`,
                    }}
                  >
                    <div
                      className={`alert-icon ${alert.type}`}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: getAlertBg(alert.type),
                        color: getAlertColor(alert.type),
                        fontSize: '16px',
                        flexShrink: 0,
                      }}
                    >
                      <i className={alert.icon || 'fa-solid fa-bell'}></i>
                    </div>
                    <div className="alert-content" style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                        {alert.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                        {alert.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  <i className="fa-solid fa-circle-check" style={{ fontSize: '24px', color: '#10B981', marginBottom: '8px' }}></i>
                  <p style={{ margin: 0, fontSize: '14px' }}>All systems and services are operating normally.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
