const HR_PAYROLL_API_URL = "http://localhost:8080/api/payroll/hr";

document.addEventListener("DOMContentLoaded", () => {
    const payrollForm = document.getElementById("generatePayrollForm");
    if (payrollForm) {
        payrollForm.addEventListener("submit", handleGeneratePayroll);
    }
});

async function handleGeneratePayroll(e) {
    e.preventDefault(); // Prevent page refresh
    
    const token = localStorage.getItem("token");
    if (!token) return;

    // Gather data from the form
    const payload = {
        userId: parseInt(document.getElementById("payrollUserId").value),
        month: parseInt(document.getElementById("payrollMonth").value),
        year: parseInt(document.getElementById("payrollYear").value),
        baseSalary: parseFloat(document.getElementById("payrollBaseSalary").value)
    };

    try {
        const response = await fetch(`${HR_PAYROLL_API_URL}/generate`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            
            // Show a success message with the calculated final salary
            alert(`Success! Payslip generated for ${data.employeeName}.\n\nNet Salary: ₹${data.netSalary.toLocaleString()}\nDeductions: ₹${data.deductions.toLocaleString()}`);
            
            document.getElementById("generatePayrollForm").reset(); // Clear form for the next entry
        } else {
            const result = await response.json();
            alert("Error: " + (result.error || "Failed to generate payroll."));
        }
    } catch (error) {
        console.error("Payroll generation error:", error);
        alert("Could not connect to the server.");
    }
}