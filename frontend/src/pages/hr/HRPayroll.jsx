import React, { useEffect, useState } from 'react';
import { payrollAPI, userAPI } from '../../api';
import PayslipModal from '../../components/common/PayslipModal';
import Header from '../../components/layout/Header';

export default function HRPayroll() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [activePayslipModal, setActivePayslipModal] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const data = await payrollAPI.getAllPayslips();
      if (Array.isArray(data) && data.length > 0) {
        setPayslips(data);
      } else {
        // Fallback: construct demo records from current users if not yet processed
        const users = await userAPI.getAllUsers();
        const demo = (users || []).map((u, i) => {
          const base = Number(u.baseSalary || 60000);
          const allow = Number(u.allowances || 15000);
          const ded = Number(u.deductions || 5000);
          return {
            id: i + 1,
            employeeName: u.fullName,
            employeeEmail: u.email,
            employeeId: u.employeeId || `EMP-${100 + i}`,
            designation: u.department ? `${u.department} Staff` : 'Software Engineer',
            month: selectedMonth,
            year: selectedYear,
            baseSalary: base,
            allowances: allow,
            deductions: ded,
            netSalary: base + allow - ded,
            status: 'PAID',
          };
        });
        setPayslips(demo);
      }
    } catch (err) {
      console.error('Failed to load payroll list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

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

  // Organization Payroll PDF Export
  const handleDownloadOrgReport = () => {
    const totalBase = payslips.reduce((acc, p) => acc + Number(p.baseSalary || 0), 0);
    const totalAllow = payslips.reduce((acc, p) => acc + Number(p.allowances || 0), 0);
    const totalDed = payslips.reduce((acc, p) => acc + Number(p.deductions || 0), 0);
    const totalNet = payslips.reduce((acc, p) => acc + Number(p.netSalary || 0), 0);

    const win = window.open('', '', 'width=1000,height=800');
    win.document.write(`
      <html>
        <head>
          <title>Organization Payroll Statement - ${selectedMonth} ${selectedYear}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #0f172a; }
            .header { text-align: center; border-bottom: 3px solid #007a7a; padding-bottom: 20px; margin-bottom: 24px; }
            .header h1 { color: #007a7a; margin: 0 0 6px 0; font-size: 24px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; font-size: 13px; }
            th { background-color: #f1f5f9; color: #334155; }
            .num { text-align: right; }
            .total-row { font-weight: bold; background-color: #e6f4f4; color: #005c5c; }
            .signatures { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 20px; }
            .sig-box { width: 200px; text-align: center; border-top: 1px solid #64748b; padding-top: 8px; font-size: 13px; color: #475569; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Workforce Automation Portal</h1>
            <p>Official Corporate Payroll & Compensation Disbursement Report</p>
          </div>

          <div class="meta">
            <div>
              <strong>Disbursement Period:</strong> ${selectedMonth} ${selectedYear}<br>
              <strong>Organization:</strong> Acme Innovations Inc
            </div>
            <div style="text-align: right;">
              <strong>Generated Date:</strong> ${new Date().toLocaleDateString()}<br>
              <strong>Total Staff Processed:</strong> ${payslips.length}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Designation</th>
                <th class="num">Base Pay (₹)</th>
                <th class="num">Allowances (₹)</th>
                <th class="num">Deductions (₹)</th>
                <th class="num">Net Payable (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${payslips
                .map(
                  (p) => `
                <tr>
                  <td>${p.employeeId || 'N/A'}</td>
                  <td>${p.employeeName || 'Staff'}</td>
                  <td>${p.designation || 'Staff'}</td>
                  <td class="num">${Number(p.baseSalary || 0).toLocaleString()}</td>
                  <td class="num">${Number(p.allowances || 0).toLocaleString()}</td>
                  <td class="num">${Number(p.deductions || 0).toLocaleString()}</td>
                  <td class="num"><strong>${Number(p.netSalary || 0).toLocaleString()}</strong></td>
                  <td>${p.status || 'PAID'}</td>
                </tr>
              `
                )
                .join('')}
              <tr class="total-row">
                <td colspan="3">ORGANIZATION GRAND TOTALS</td>
                <td class="num">₹${totalBase.toLocaleString()}</td>
                <td class="num">₹${totalAllow.toLocaleString()}</td>
                <td class="num">₹${totalDed.toLocaleString()}</td>
                <td class="num">₹${totalNet.toLocaleString()}</td>
                <td>--</td>
              </tr>
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-box">Prepared by (HR Manager)</div>
            <div class="sig-box">Verified by (Finance Officer)</div>
            <div class="sig-box">Approved by (Administrator)</div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 250);
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

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline"
            onClick={handleDownloadOrgReport}
            style={{ padding: '10px 18px', borderRadius: '10px' }}
          >
            <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444' }}></i> Download Org PDF Report
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
                      {p.employeeId || 'EMP-001'}
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
                      <button
                        className="btn btn-outline"
                        onClick={() => setActivePayslipModal(p)}
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                      >
                        <i className="fa-solid fa-eye"></i> View Payslip
                      </button>
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
