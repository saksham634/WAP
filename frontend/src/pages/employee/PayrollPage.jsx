import React, { useEffect, useState } from 'react';
import { payrollAPI } from '../../api';
import PayslipModal from '../../components/common/PayslipModal';
import Header from '../../components/layout/Header';

export default function PayrollPage() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePayslipModal, setActivePayslipModal] = useState(null);

  useEffect(() => {
    async function loadPayslips() {
      setLoading(true);
      try {
        const data = await payrollAPI.getMyPayslips();
        if (Array.isArray(data) && data.length > 0) {
          setPayslips(data);
        } else {
          // Default demo payslips
          setPayslips([
            {
              id: 1,
              month: 'August',
              year: '2026',
              baseSalary: 65000,
              allowances: 15000,
              deductions: 5000,
              netSalary: 75000,
              status: 'PAID',
              generatedDate: '2026-08-01',
            },
            {
              id: 2,
              month: 'July',
              year: '2026',
              baseSalary: 65000,
              allowances: 15000,
              deductions: 5000,
              netSalary: 75000,
              status: 'PAID',
              generatedDate: '2026-07-01',
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to load payslips:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPayslips();
  }, []);

  const latest = payslips[0] || {
    baseSalary: 65000,
    allowances: 15000,
    deductions: 5000,
    netSalary: 75000,
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Header
        title="My Salary & Payslip Statements"
        subtitle="Inspect monthly compensation breakdown, tax deductions, and download official PDF payslips"
      />

      {/* Salary Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="card" style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Base Salary</span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: '#0f172a', fontWeight: 800 }}>
            ₹{Number(latest.baseSalary || 0).toLocaleString()}
          </h3>
        </div>

        <div className="card" style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Monthly Allowances (HRA/Special)</span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: '#16a34a', fontWeight: 800 }}>
            +₹{Number(latest.allowances || 0).toLocaleString()}
          </h3>
        </div>

        <div className="card" style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Statutory Deductions (PF/Tax)</span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: '#dc2626', fontWeight: 800 }}>
            -₹{Number(latest.deductions || 0).toLocaleString()}
          </h3>
        </div>

        <div className="card" style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Net Disbursed Take-Home</span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: '#007a7a', fontWeight: 800 }}>
            ₹{Number(latest.netSalary || 0).toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Payslips History */}
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
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Disbursement Month</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Gross Earnings</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Deductions</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Net Take-Home</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>Status</th>
                <th style={{ padding: '14px 20px', fontSize: '13px', color: '#475569', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading payslips...
                  </td>
                </tr>
              ) : payslips.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No payslips available.
                  </td>
                </tr>
              ) : (
                payslips.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                      {p.month} {p.year}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#16a34a' }}>
                      ₹{(Number(p.baseSalary || 0) + Number(p.allowances || 0)).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#dc2626' }}>
                      -₹{Number(p.deductions || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 700, color: '#007a7a' }}>
                      ₹{Number(p.netSalary || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                        }}
                      >
                        {p.status || 'PAID'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        className="btn btn-outline"
                        onClick={() => setActivePayslipModal(p)}
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                      >
                        <i className="fa-solid fa-file-invoice" style={{ color: '#007a7a' }}></i> View & Download PDF
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
