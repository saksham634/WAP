import React, { useEffect, useState, useCallback } from 'react';
import { payrollAPI, userAPI } from '../../api';
import PayslipModal from '../../components/common/PayslipModal';
import Header from '../../components/layout/Header';
import { downloadPayrollReportPDF, downloadPayrollReportCSV, downloadPayslipPDF } from '../../utils/downloadUtils';
import { useAuth } from '../../context/AuthContext';

export default function HRPayroll() {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [activePayslipModal, setActivePayslipModal] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await payrollAPI.getAllPayslips();
      const nonAdminData = (Array.isArray(data) ? data : []).filter(
        (p) => !((p.role || '').toUpperCase().includes('ADMIN') || (p.employeeName || '').toLowerCase().includes('admin'))
      );
      if (nonAdminData.length > 0) {
        setPayslips(nonAdminData);
      } else {
        // Fallback: construct demo records from current users excluding admin
        const users = await userAPI.getAllUsers();
        const nonAdminUsers = (users || []).filter((u) => !(u.role || '').toUpperCase().includes('ADMIN'));
        const demo = nonAdminUsers.map((u, i) => {
          const base = Number(u.baseSalary || 0);
          const allow = Number(u.allowances || 0);
          const ded = Number(u.deductions || 0);
          return {
            id: u.id || i + 1,
            employeeName: u.fullName || 'Staff Member',
            employeeEmail: u.email || '',
            employeeId: u.employeeId || '',
            designation: u.department || u.designation || 'Staff',
            month: selectedMonth,
            year: selectedYear,
            baseSalary: base,
            allowances: allow,
            deductions: ded,
            netSalary: Math.max(0, base + allow - ded),
            status: 'PENDING',
          };
        });
        setPayslips(demo);
      }
    } catch (err) {
      console.error('Failed to load payroll list:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  const handleProcessBatch = async () => {
    setProcessing(true);
    setFeedback(null);
    try {
      await payrollAPI.processPayrollBatch(selectedMonth, selectedYear);
      setFeedback({ type: 'success', text: `Payroll batch for ${selectedMonth} ${selectedYear} processed successfully!` });
      fetchPayroll();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to process payroll batch.' });
    } finally {
      setProcessing(false);
    }
  };

  // Organization Payroll PDF & CSV Exports
  const handleDownloadOrgReport = () => {
    downloadPayrollReportPDF(payslips, selectedMonth, selectedYear, user?.organizationName || 'Workforce Automation Portal');
  };

  const handleDownloadOrgCSV = () => {
    downloadPayrollReportCSV(payslips, selectedMonth, selectedYear);
  };

  const totalMonthlySpend = payslips.reduce((acc, p) => acc + Number(p.netSalary || 0), 0);

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Header
        title="Payroll Administration"
        subtitle="Manage salary disbursements, generate statements, and review organization payroll"
      />

      {/* Top Action Card */}
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
            Payroll Administration & Statements
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Batch process monthly salary disbursements and export company payroll documentation
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
              }}
            >
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
              }}
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>

          <button
            className="btn btn-outline"
            onClick={handleDownloadOrgReport}
            style={{ padding: '10px 16px', borderRadius: '10px' }}
            title="Download official organization payroll PDF report"
          >
            <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444' }}></i> Download Org PDF
          </button>

          <button
            className="btn btn-outline"
            onClick={handleDownloadOrgCSV}
            style={{ padding: '10px 16px', borderRadius: '10px' }}
            title="Export payroll disbursement list to CSV"
          >
            <i className="fa-solid fa-file-csv" style={{ color: '#007a7a' }}></i> Export CSV
          </button>

          <button
            className="btn btn-primary"
            onClick={handleProcessBatch}
            disabled={processing}
            style={{ padding: '10px 18px', borderRadius: '10px' }}
          >
            <i className="fa-solid fa-calculator"></i> {processing ? 'Processing Batch...' : 'Process Monthly Batch'}
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

      {/* Batch Summary Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}
      >
        <div
          className="card"
          style={{
            padding: '20px 24px',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
          }}
        >
          <span style={{ fontSize: '13px', color: '#64748b' }}>Total Payroll Payout</span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#007a7a', fontWeight: 800 }}>
            ₹{totalMonthlySpend.toLocaleString()}
          </h3>
          <span style={{ fontSize: '12px', color: '#16a34a', marginTop: '2px', display: 'block' }}>
            {payslips.length} Employee accounts processed
          </span>
        </div>

        <div
          className="card"
          style={{
            padding: '20px 24px',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
          }}
        >
          <span style={{ fontSize: '13px', color: '#64748b' }}>Active Period</span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#0f172a', fontWeight: 800 }}>
            {selectedMonth} {selectedYear}
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'block' }}>
            Current disbursement cycle
          </span>
        </div>
      </div>

      {/* Payslips Table */}
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
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Base Pay</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Allowances</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Deductions</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Net Take-Home</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading payroll data...
                  </td>
                </tr>
              ) : payslips.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No payslips generated for this cycle. Click "Process Monthly Batch" to calculate.
                  </td>
                </tr>
              ) : (
                payslips.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>
                        {p.employeeName || 'Staff Member'}
                      </strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{p.employeeEmail || ''}</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      {p.employeeId || ''}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#0f172a' }}>
                      ₹{Number(p.baseSalary || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#16a34a' }}>
                      +₹{Number(p.allowances || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#dc2626' }}>
                      -₹{Number(p.deductions || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 700, color: '#007a7a' }}>
                      ₹{Number(p.netSalary || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn btn-outline"
                          onClick={() => setActivePayslipModal(p)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          title="View detailed breakdown modal"
                        >
                          <i className="fa-solid fa-eye"></i> View
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => downloadPayslipPDF(p, user?.organizationName || 'Workforce Automation Portal')}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          title="Download employee official payslip PDF"
                        >
                          <i className="fa-solid fa-download"></i> Download PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PayslipModal
        isOpen={!!activePayslipModal}
        onClose={() => setActivePayslipModal(null)}
        payslip={activePayslipModal}
      />
    </div>
  );
}
