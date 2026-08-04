import React from 'react';
import { downloadPayslipPDF } from '../../utils/downloadUtils';
import { useAuth } from '../../context/AuthContext';

export default function PayslipModal({ isOpen, onClose, payslip }) {
  const { user } = useAuth();
  if (!isOpen || !payslip) return null;

  const handleDownloadPDF = () => {
    downloadPayslipPDF(payslip, user?.organizationName || 'Workforce Automation Portal');
  };

  const handlePrint = () => {
    const printContent = document.getElementById('payslipPrintArea');
    const win = window.open('', '', 'width=900,height=700');
    win.document.write(`
      <html>
        <head>
          <title>Payslip - ${payslip.employeeId || 'Staff'}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #007a7a; padding-bottom: 20px; margin-bottom: 24px; }
            .header h1 { color: #007a7a; margin: 0 0 6px 0; }
            .grid { display: flex; justify-content: space-between; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; font-size: 14px; }
            th { background-color: #f1f5f9; }
            .total-row { font-weight: bold; background-color: #f8fafc; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
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

  const base = Number(payslip.baseSalary || payslip.basicSalary || 0);
  const allow = Number(payslip.allowances || payslip.totalAllowances || 0);
  const ded = Number(payslip.deductions || payslip.totalDeductions || 0);
  const net = Number(payslip.netSalary || base + allow - ded);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content-card"
        style={{ maxWidth: '720px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-file-invoice-dollar" style={{ color: '#007a7a', fontSize: '20px' }}></i>
            <h3 style={{ margin: 0 }}>Payslip Details - {payslip.month || 'Current'} {payslip.year || '2026'}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body" id="payslipPrintArea">
          <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '2px solid #007a7a', marginBottom: '20px' }}>
            <h2 style={{ margin: '0 0 4px 0', color: '#007a7a', fontSize: '22px' }}>
              Workforce Automation Portal
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Salary & Earnings Statement for {payslip.month || 'Current'} {payslip.year || '2026'}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Employee Name</p>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>{payslip.employeeName || payslip.fullName || 'Staff Member'}</h4>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Employee ID</p>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>{payslip.employeeId || 'N/A'}</h4>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Designation / Role</p>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>{payslip.designation || 'Staff'}</h4>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Payment Status</p>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                }}
              >
                {payslip.status || 'PAID'}
              </span>
            </div>
          </div>

          <div className="table-responsive" style={{ marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={{ padding: '10px 14px', borderBottom: '2px solid #cbd5e1' }}>Earnings Component</th>
                  <th style={{ padding: '10px 14px', borderBottom: '2px solid #cbd5e1', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '10px 14px', borderBottom: '2px solid #cbd5e1' }}>Deductions Component</th>
                  <th style={{ padding: '10px 14px', borderBottom: '2px solid #cbd5e1', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>Basic Salary</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>₹{base.toLocaleString()}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>Provident Fund (PF)</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>₹{Math.round(ded * 0.6).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>House Rent Allowance (HRA)</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>₹{Math.round(allow * 0.6).toLocaleString()}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>Professional Tax</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>₹{Math.round(ded * 0.4).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>Special Allowance</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>₹{Math.round(allow * 0.4).toLocaleString()}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>Other Deductions</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>₹0</td>
                </tr>
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                  <td style={{ padding: '12px 14px', borderTop: '2px solid #cbd5e1' }}>Total Gross Earnings</td>
                  <td style={{ padding: '12px 14px', borderTop: '2px solid #cbd5e1', textAlign: 'right', color: '#16a34a' }}>
                    ₹{(base + allow).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 14px', borderTop: '2px solid #cbd5e1' }}>Total Deductions</td>
                  <td style={{ padding: '12px 14px', borderTop: '2px solid #cbd5e1', textAlign: 'right', color: '#dc2626' }}>
                    ₹{ded.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              backgroundColor: '#e6f4f4',
              border: '1px solid #99d6d6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '13px', color: '#007a7a', fontWeight: 600 }}>NET TAKE-HOME PAY</span>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '24px', color: '#005c5c', fontWeight: 800 }}>
                ₹{net.toLocaleString()}
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Generated electronically via WAP
            </span>
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-outline" onClick={handlePrint} title="Open browser print dialog">
            <i className="fa-solid fa-print"></i> Print Preview
          </button>
          <button className="btn btn-primary" onClick={handleDownloadPDF} title="Download official PDF file to device">
            <i className="fa-solid fa-download"></i> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
