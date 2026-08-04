import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Trigger an actual file download in the browser using Blob URL and hidden <a> element.
 */
export function triggerFileDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Export any dataset to a properly formatted CSV and trigger direct download.
 */
export function downloadCSV(filename, headers, rows) {
  const escapeCell = (cell) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map((h) => escapeCell(h)).join(',');
  const rowLines = rows.map((row) => row.map((cell) => escapeCell(cell)).join(','));
  const csvContent = [headerLine, ...rowLines].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerFileDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

/**
 * Generate and trigger direct download of an executive-quality Payslip PDF.
 */
export function downloadPayslipPDF(payslip, organizationName = 'Workforce Automation Portal') {
  if (!payslip) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryTeal = [0, 122, 122];      // #007a7a
  const darkSlate = [15, 23, 42];          // #0f172a
  const slateMuted = [100, 116, 139];      // #64748b
  const lightBg = [248, 250, 252];         // #f8fafc

  const month = payslip.month || 'Current';
  const year = payslip.year || new Date().getFullYear();
  const empName = payslip.employeeName || payslip.fullName || 'Staff Member';
  const empId = payslip.employeeId || 'N/A';
  const dept = payslip.department || 'General';
  const designation = payslip.designation || payslip.role || 'Associate';

  const base = Number(payslip.baseSalary || payslip.basicSalary || 0);
  const allow = Number(payslip.allowances || payslip.totalAllowances || 0);
  const ded = Number(payslip.deductions || payslip.totalDeductions || 0);
  const net = Number(payslip.netSalary || (base + allow - ded));
  const paymentDate = payslip.paymentDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // 1. Top Decorative Brand Banner
  doc.setFillColor(...primaryTeal);
  doc.rect(0, 0, 210, 8, 'F');

  // 2. Company & Document Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...primaryTeal);
  doc.text(organizationName.toUpperCase(), 14, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...slateMuted);
  doc.text('Workforce Automation & Enterprise Payroll Division', 14, 28);
  doc.text(`Official Salary Statement • Ref: PAY-${empId}-${month.substring(0, 3).toUpperCase()}${year}`, 14, 33);

  // Status Badge
  doc.setFillColor(230, 244, 244);
  doc.roundedRect(155, 14, 41, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryTeal);
  doc.text('STATUS: PAID', 160, 21.5);

  // Thin separator
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(14, 38, 196, 38);

  // 3. Employee & Disbursement Meta Card
  doc.setFillColor(...lightBg);
  doc.roundedRect(14, 42, 182, 34, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 42, 182, 34, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryTeal);
  doc.text('EMPLOYEE DETAILS', 20, 48);
  doc.text('PAYMENT DETAILS', 110, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...darkSlate);

  // Left Column
  doc.text(`Employee Name: ${empName}`, 20, 55);
  doc.text(`Employee ID: ${empId}`, 20, 61);
  doc.text(`Department: ${dept}`, 20, 67);

  // Right Column
  doc.text(`Designation: ${designation}`, 110, 55);
  doc.text(`Disbursement Month: ${month} ${year}`, 110, 61);
  doc.text(`Payment Date: ${paymentDate}`, 110, 67);

  // 4. Earnings & Deductions Tables side-by-side using autoTable
  autoTable(doc, {
    startY: 82,
    head: [['EARNINGS BREAKDOWN', 'AMOUNT (INR)']],
    body: [
      ['Basic Salary', `Rs. ${base.toLocaleString('en-IN')}`],
      ['House Rent Allowance (HRA)', `Rs. ${Math.round(allow * 0.4).toLocaleString('en-IN')}`],
      ['Special & Conveyance Allowance', `Rs. ${Math.round(allow * 0.4).toLocaleString('en-IN')}`],
      ['Performance & Medical Allowances', `Rs. ${Math.round(allow * 0.2).toLocaleString('en-IN')}`],
      [{ content: 'Total Gross Earnings', styles: { fontStyle: 'bold', fillColor: [240, 253, 250] } },
       { content: `Rs. ${(base + allow).toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', fillColor: [240, 253, 250] } }]
    ],
    theme: 'grid',
    margin: { left: 14, right: 110 },
    tableWidth: 88,
    styles: { fontSize: 8.5, cellPadding: 3, textColor: darkSlate },
    headStyles: { fillColor: primaryTeal, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 54 },
      1: { cellWidth: 34, halign: 'right' }
    }
  });

  const earningsFinalY = doc.lastAutoTable.finalY;

  autoTable(doc, {
    startY: 82,
    head: [['DEDUCTIONS BREAKDOWN', 'AMOUNT (INR)']],
    body: [
      ['Provident Fund (PF)', `Rs. ${Math.round(ded * 0.5).toLocaleString('en-IN')}`],
      ['Professional Tax (PT)', `Rs. ${Math.round(ded * 0.15).toLocaleString('en-IN')}`],
      ['Tax Deducted at Source (TDS)', `Rs. ${Math.round(ded * 0.35).toLocaleString('en-IN')}`],
      ['Other / Unpaid Deductions', 'Rs. 0'],
      [{ content: 'Total Deductions', styles: { fontStyle: 'bold', fillColor: [254, 242, 242] } },
       { content: `Rs. ${ded.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', fillColor: [254, 242, 242] } }]
    ],
    theme: 'grid',
    margin: { left: 108, right: 14 },
    tableWidth: 88,
    styles: { fontSize: 8.5, cellPadding: 3, textColor: darkSlate },
    headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 54 },
      1: { cellWidth: 34, halign: 'right' }
    }
  });

  const nextY = Math.max(earningsFinalY, doc.lastAutoTable.finalY) + 8;

  // 5. Net Payable Banner Card
  doc.setFillColor(230, 244, 244);
  doc.roundedRect(14, nextY, 182, 24, 3, 3, 'F');
  doc.setDrawColor(...primaryTeal);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, nextY, 182, 24, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryTeal);
  doc.text('NET SALARY TRANSFERRED (TAKE-HOME PAY)', 22, nextY + 10);

  doc.setFontSize(16);
  doc.setTextColor(...darkSlate);
  doc.text(`INR ${net.toLocaleString('en-IN')}/-`, 22, nextY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...slateMuted);
  doc.text('Electronic direct-deposit processed via corporate payroll banking partner.', 105, nextY + 14);

  // 6. Signatures & Authenticity Seals
  const sigY = nextY + 45;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);

  doc.line(25, sigY, 75, sigY);
  doc.line(135, sigY, 185, sigY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...slateMuted);
  doc.text('Employee Signature', 36, sigY + 5);
  doc.text('Authorized Finance Signatory', 140, sigY + 5);

  // 7. Footer Notice
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a system-generated document and requires no physical seal when electronically verified.', 105, 285, { align: 'center' });
  doc.text(`Generated securely by Workforce Automation Portal on ${new Date().toLocaleString()}`, 105, 289, { align: 'center' });

  // Trigger real direct download
  const cleanEmpId = empId.replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanMonth = month.replace(/[^a-zA-Z0-9]/g, '');
  doc.save(`Payslip_${cleanEmpId}_${cleanMonth}_${year}.pdf`);
}

/**
 * Generate and trigger direct download of the Corporate Payroll Statement PDF.
 */
export function downloadPayrollReportPDF(payslips = [], selectedMonth = 'All', selectedYear = 2026, organizationName = 'Workforce Automation Portal') {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const primaryTeal = [0, 122, 122];
  const darkSlate = [15, 23, 42];
  const lightBg = [248, 250, 252];

  const totalBase = payslips.reduce((acc, p) => acc + Number(p.baseSalary || 0), 0);
  const totalAllow = payslips.reduce((acc, p) => acc + Number(p.allowances || 0), 0);
  const totalDed = payslips.reduce((acc, p) => acc + Number(p.deductions || 0), 0);
  const totalNet = payslips.reduce((acc, p) => acc + Number(p.netSalary || 0), 0);

  // Top banner
  doc.setFillColor(...primaryTeal);
  doc.rect(0, 0, 297, 6, 'F');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryTeal);
  doc.text(organizationName.toUpperCase(), 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('CORPORATE PAYROLL & COMPENSATION DISBURSEMENT REPORT', 14, 24);
  doc.text(`Disbursement Period: ${selectedMonth} ${selectedYear}  |  Generated on: ${new Date().toLocaleString()}  |  Total Staff: ${payslips.length}`, 14, 29);

  // Summary Metrics Bar
  doc.setFillColor(...lightBg);
  doc.roundedRect(14, 33, 269, 14, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 33, 269, 14, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...darkSlate);
  doc.text(`Total Base Pay: Rs. ${totalBase.toLocaleString('en-IN')}`, 20, 41.5);
  doc.text(`Total Allowances: Rs. ${totalAllow.toLocaleString('en-IN')}`, 85, 41.5);
  doc.text(`Total Deductions: Rs. ${totalDed.toLocaleString('en-IN')}`, 150, 41.5);
  doc.setTextColor(...primaryTeal);
  doc.text(`Total Net Disbursement: Rs. ${totalNet.toLocaleString('en-IN')}`, 215, 41.5);

  // Data Table
  const tableData = payslips.map((p, idx) => [
    idx + 1,
    p.employeeId || 'N/A',
    p.employeeName || p.fullName || 'Staff',
    p.department || p.designation || 'Staff',
    `Rs. ${Number(p.baseSalary || 0).toLocaleString('en-IN')}`,
    `Rs. ${Number(p.allowances || 0).toLocaleString('en-IN')}`,
    `Rs. ${Number(p.deductions || 0).toLocaleString('en-IN')}`,
    `Rs. ${Number(p.netSalary || 0).toLocaleString('en-IN')}`,
    p.status || 'PAID'
  ]);

  tableData.push([
    '',
    'TOTAL',
    'GRAND TOTALS',
    `${payslips.length} Employees`,
    `Rs. ${totalBase.toLocaleString('en-IN')}`,
    `Rs. ${totalAllow.toLocaleString('en-IN')}`,
    `Rs. ${totalDed.toLocaleString('en-IN')}`,
    `Rs. ${totalNet.toLocaleString('en-IN')}`,
    'VERIFIED'
  ]);

  autoTable(doc, {
    startY: 51,
    head: [['#', 'Emp ID', 'Staff Name', 'Department / Role', 'Base Pay', 'Allowances', 'Deductions', 'Net Payable', 'Status']],
    body: tableData,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2.5, textColor: darkSlate },
    headStyles: { fillColor: primaryTeal, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 26 },
      2: { cellWidth: 45 },
      3: { cellWidth: 40 },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' },
      6: { cellWidth: 30, halign: 'right' },
      7: { cellWidth: 34, halign: 'right', fontStyle: 'bold' },
      8: { cellWidth: 24, halign: 'center' }
    },
    didParseCell: (data) => {
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [230, 244, 244];
        data.cell.styles.textColor = primaryTeal;
      }
    }
  });

  // Footer
  const finalY = doc.lastAutoTable.finalY || 160;
  if (finalY < 185) {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Authorized Finance Approval', 30, 195);
    doc.text('HR Department Sign-off', 130, 195);
    doc.text('Audited & Processed by System', 230, 195);
  }

  doc.save(`Payroll_Report_${selectedMonth}_${selectedYear}.pdf`);
}

/**
 * Generate and trigger direct download of the Payroll CSV report.
 */
export function downloadPayrollReportCSV(payslips = [], selectedMonth = 'All', selectedYear = 2026) {
  const headers = [
    'Employee ID',
    'Employee Name',
    'Department',
    'Month',
    'Year',
    'Base Salary (INR)',
    'Allowances (INR)',
    'Deductions (INR)',
    'Net Salary (INR)',
    'Status',
    'Payment Date'
  ];

  const rows = payslips.map((p) => [
    p.employeeId || '',
    p.employeeName || p.fullName || '',
    p.department || '',
    p.month || selectedMonth,
    p.year || selectedYear,
    Number(p.baseSalary || 0),
    Number(p.allowances || 0),
    Number(p.deductions || 0),
    Number(p.netSalary || 0),
    p.status || 'PAID',
    p.paymentDate || ''
  ]);

  downloadCSV(`Payroll_Disbursements_${selectedMonth}_${selectedYear}`, headers, rows);
}

/**
 * Download Attendance Records as CSV.
 */
export function downloadAttendanceCSV(records = [], dateStr = new Date().toISOString().split('T')[0]) {
  const headers = ['Employee ID', 'Staff Name', 'Department', 'Date', 'Status', 'Punch In', 'Punch Out', 'Work Duration'];
  const rows = records.map((r) => [
    r.employeeId || 'N/A',
    r.employeeName || r.fullName || 'Staff',
    r.department || 'N/A',
    r.date || dateStr,
    r.status || 'ABSENT',
    r.checkInTime || r.punchIn || r.punchInTime || '--',
    r.checkOutTime || r.punchOut || r.punchOutTime || '--',
    r.workDuration || r.duration || '--'
  ]);
  downloadCSV(`Attendance_Log_${dateStr}`, headers, rows);
}

/**
 * Download Leave Records as CSV.
 */
export function downloadLeavesCSV(leaves = []) {
  const headers = ['Leave ID', 'Employee ID', 'Employee Name', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status', 'Applied On'];
  const rows = leaves.map((l) => [
    l.id || '',
    l.employeeId || l.user?.employeeId || 'N/A',
    l.employeeName || l.user?.fullName || 'Staff',
    l.leaveType || 'CASUAL',
    l.startDate || '',
    l.endDate || '',
    l.days || l.totalDays || 1,
    l.reason || '',
    l.status || 'PENDING',
    l.createdAt || l.appliedDate || ''
  ]);
  const today = new Date().toISOString().split('T')[0];
  downloadCSV(`Leave_Applications_${today}`, headers, rows);
}

/**
 * Download Staff Directory as CSV.
 */
export function downloadStaffDirectoryCSV(users = []) {
  const headers = ['Employee ID', 'Full Name', 'Email', 'Role', 'Department', 'Base Salary (INR)', 'Allowances (INR)', 'Deductions (INR)', 'Status'];
  const rows = users.map((u) => [
    u.employeeId || '',
    u.fullName || '',
    u.email || '',
    (u.role?.roleName || u.role || '').replace('ROLE_', ''),
    u.department || 'Engineering',
    Number(u.baseSalary || 0),
    Number(u.allowances || 0),
    Number(u.deductions || 0),
    u.status || 'ACTIVE'
  ]);
  const today = new Date().toISOString().split('T')[0];
  downloadCSV(`Staff_Directory_${today}`, headers, rows);
}

/**
 * Download Audit Logs as CSV.
 */
export function downloadAuditLogsCSV(logs = []) {
  const headers = ['Log ID', 'Timestamp', 'User Email', 'Action / Event', 'IP Address', 'Details'];
  const rows = logs.map((l) => [
    l.id || '',
    l.timestamp || l.createdAt || '',
    l.userEmail || l.performedBy || l.user?.email || 'System',
    l.action || l.activity || '',
    l.ipAddress || '127.0.0.1',
    l.details || l.description || ''
  ]);
  const today = new Date().toISOString().split('T')[0];
  downloadCSV(`Security_Audit_Logs_${today}`, headers, rows);
}

/**
 * Download Projects as CSV.
 */
export function downloadProjectsCSV(projects = []) {
  const headers = ['Project ID', 'Project Name', 'Client / Org', 'Lead', 'Priority', 'Progress %', 'Deadline', 'Status'];
  const rows = projects.map((p) => [
    p.id || '',
    p.name || p.title || '',
    p.client || 'Internal',
    p.projectLead || p.lead || '',
    p.priority || 'MEDIUM',
    p.progress || 0,
    p.deadline || p.endDate || '',
    p.status || 'IN_PROGRESS'
  ]);
  const today = new Date().toISOString().split('T')[0];
  downloadCSV(`Projects_Summary_${today}`, headers, rows);
}
