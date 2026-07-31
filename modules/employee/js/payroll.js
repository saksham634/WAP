const API_BASE = "http://localhost:8080/api/payroll";

document.addEventListener("DOMContentLoaded", () => {
    loadPayslips();
});

async function loadPayslips() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const tbody = document.getElementById("employeePayslipsBody");
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">Loading payslips...</td></tr>`;
    }

    try {
        const response = await fetch(`${API_BASE}/my-payslips`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "../../../public/Login/LogIn.html";
            return;
        }

        if (response.ok) {
            const payslips = await response.json();
            renderPayslips(payslips);
        } else {
            if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: red;">Failed to load payslips.</td></tr>`;
        }
    } catch (e) {
        console.error("Error loading payslips:", e);
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: red;">Could not connect to server.</td></tr>`;
    }
    
    // Always fetch official salary structure regardless of payslips status
    updateSalaryOverview([]);
}

function renderPayslips(payslips) {
    const tbody = document.getElementById("employeePayslipsBody");
    if (!tbody) return;

    if (payslips.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-light);">No payslips generated yet.</td></tr>`;
        return;
    }

    window.globalPayslips = payslips;
    tbody.innerHTML = "";
    
    payslips.forEach(ps => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="font-weight: 500;">#PAY-${ps.id}</td>
            <td>${ps.payPeriod}</td>
            <td>₹${ps.baseSalary.toLocaleString()}</td>
            <td style="font-weight: 600; color: #007a7a;">₹${ps.netSalary.toLocaleString()}</td>
            <td><span class="status-badge" style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${ps.status}</span></td>
            <td>
                <button class="btn btn-outline" style="padding: 4px 10px; font-size: 12px;" onclick="downloadPayslip(${ps.id})">
                    <i class="fa-solid fa-download"></i> PDF
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateSalaryOverview(payslips) {
    // Instead of using the payslip, we should fetch the official HR assigned salary structure.
    // However, since we already have it in the User profile endpoint, let's fetch it.
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:8080/api/employee/profile", {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : null)
    .then(user => {
        if (!user) return;
        const base = user.baseSalary || 0;
        const allow = user.allowances || 0;
        const ded = user.deductions || 0;
        
        // Deductions can be estimated or just left as N/A if it depends on attendance
        // We'll show the standard structure
        if (document.getElementById("valBaseSalary")) {
            document.getElementById("valBaseSalary").textContent = `₹${base.toLocaleString()}`;
        }
        if (document.getElementById("valAllowances")) {
            document.getElementById("valAllowances").textContent = `₹${allow.toLocaleString()}`;
        }
        if (document.getElementById("valDeductions")) {
            document.getElementById("valDeductions").textContent = `₹${ded.toLocaleString()}`;
        }
        if (document.getElementById("valNetSalary")) {
            document.getElementById("valNetSalary").textContent = `Up to ₹${(base + allow - ded).toLocaleString()}`;
        }
    })
    .catch(e => console.error("Error fetching user profile for salary overview", e));
}

window.downloadPayslip = function(id) {
    const ps = window.globalPayslips.find(p => p.id === id);
    if (!ps) {
        alert("Payslip not found.");
        return;
    }

    const printWindow = window.open('', '_blank');
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payslip - ${ps.employeeName}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #334155; }
                .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #007a7a; padding-bottom: 20px; }
                .header h1 { margin: 0; color: #007a7a; font-size: 28px; }
                .header p { margin: 5px 0 0 0; color: #64748b; }
                .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
                .details-col { width: 45%; }
                .details-col p { margin: 8px 0; font-size: 14px; }
                .details-col strong { display: inline-block; width: 120px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                th { background-color: #f8fafc; color: #475569; font-weight: 600; }
                .total-row { background-color: #f1f5f9; font-weight: bold; }
                .net-salary { text-align: right; font-size: 20px; color: #0f172a; border-top: 2px solid #007a7a; padding-top: 15px; }
                .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Official Payslip</h1>
                <p>Pay Period: ${ps.payPeriod}</p>
            </div>
            
            <div class="details">
                <div class="details-col">
                    <p><strong>Employee Name:</strong> ${ps.employeeName}</p>
                    <p><strong>Employee ID:</strong> ${ps.employeeId}</p>
                </div>
                <div class="details-col">
                    <p><strong>Payslip ID:</strong> #PAY-${ps.id}</p>
                    <p><strong>Status:</strong> ${ps.status}</p>
                    <p><strong>Days Present:</strong> ${ps.presentDays}</p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Earnings</th>
                        <th>Amount</th>
                        <th>Deductions</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Base Salary</td>
                        <td>₹${ps.baseSalary.toLocaleString()}</td>
                        <td>Fixed Deductions</td>
                        <td>₹${ps.deductions.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td>Allowances</td>
                        <td>₹${ps.allowances.toLocaleString()}</td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>

            <div class="net-salary">
                Net Salary Payable: <span style="color: #007a7a;">₹${ps.netSalary.toLocaleString()}</span>
            </div>

            <div class="footer">
                This is a system generated document and does not require a signature.
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                }
            </script>
        </body>
        </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
};