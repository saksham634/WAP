const PAYROLL_API_URL = "http://localhost:8080/api/payroll";

document.addEventListener("DOMContentLoaded", () => {
    fetchMyPayslips();
});

async function fetchMyPayslips() {
    const token = localStorage.getItem("token");
    const tbody = document.getElementById("payslipsTableBody");
    if (!tbody) return;

    try {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Loading payslips...</td></tr>`;
        
        const response = await fetch(`${PAYROLL_API_URL}/my-payslips`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        
        if (response.ok) {
            const payslips = await response.json();
            
            if (payslips.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No payslips generated yet.</td></tr>`;
                return;
            }
            
            // Map the data into table rows
            tbody.innerHTML = payslips.map(slip => `
                <tr>
                    <td><b>${slip.payPeriod}</b></td>
                    <td>₹${slip.baseSalary.toLocaleString()}</td>
                    <td>${slip.presentDays}</td>
                    <td style="color: #DC2626;">-₹${slip.deductions.toLocaleString()}</td>
                    <td style="color: #10B981; font-weight: bold;">₹${slip.netSalary.toLocaleString()}</td>
                    <td><span class="badge ${slip.status.toLowerCase()}">${slip.status}</span></td>
                </tr>
            `).join("");
        } else {
            console.error("Failed to load payslips");
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Failed to load data.</td></tr>`;
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Could not connect to server.</td></tr>`;
    }
}