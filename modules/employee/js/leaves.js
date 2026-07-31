// LEAVES MODULE

const LEAVE_API_URL = "http://localhost:8080/api/leave";
const EMPLOYEE_API_URL = "http://localhost:8080/api/employee";

document.addEventListener("DOMContentLoaded", () => {
    loadLeaveSummary();
    loadUpcomingLeaves();
    setupLeaveForm();
});

// LOAD LEAVE SUMMARY (from dashboard metrics)
async function loadLeaveSummary() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch(`${EMPLOYEE_API_URL}/dashboard`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            const leaveBoxes = document.querySelectorAll(".leave-box h3");
            if (leaveBoxes.length >= 3) {
                // Total leaves isn't explicitly returned, assume 20 for now or calculate from taken + balance
                const total = data.leavesTaken + data.balanceLeaves;
                leaveBoxes[0].innerText = total || 0;
                leaveBoxes[1].innerText = data.leavesTaken || 0;
                leaveBoxes[2].innerText = data.balanceLeaves || 0;
                // leaveBoxes[3] is pending, we might need to count from my-leaves later
            }
        }
    } catch (error) {
        console.error("Error loading leave summary:", error);
    }
}

// LOAD UPCOMING LEAVES
export async function loadUpcomingLeaves() {
    const container = document.getElementById("leaveList") || document.querySelector(".leave-list");
    if (!container) return;
    
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch(`${LEAVE_API_URL}/my-leaves`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
            const leaves = await response.json();
            container.innerHTML = "";
            let html = "";
            let pendingCount = 0;
            
            leaves.forEach(leave => {
                if (leave.status === "PENDING") pendingCount++;
                
                const dateObj = new Date(leave.startDate);
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                
                // Capitalize status
                const statusText = leave.status.charAt(0) + leave.status.slice(1).toLowerCase();
                
                html += `
                    <div class="leave-item">
                        <div class="leave-date" style="text-align:center; padding-right:15px; border-right: 2px solid var(--border-color); margin-right: 15px;">
                            <h3 style="margin:0; font-size: 1.5rem; color: var(--primary-color);">${day}</h3>
                            <span style="font-size:0.8rem; font-weight:600; color: var(--text-secondary);">${month}</span>
                        </div>
                        <div class="leave-content">
                            <h4 style="margin:0; font-size: 1.1rem; color: var(--text-primary);">${leave.leaveType}</h4>
                            <p style="margin:5px 0 0; font-size:0.9rem; color: var(--text-secondary);">${statusText}</p>
                        </div>
                    </div>
                `;
            });
            
            if (leaves.length === 0) {
                html = "<p style='color: var(--text-secondary); padding: 15px;'>No leaves found.</p>";
            }
            container.innerHTML = html;
            
            // Update Pending count if available
            const leaveBoxes = document.querySelectorAll(".leave-box h3");
            if (leaveBoxes.length >= 4) {
                leaveBoxes[3].innerText = pendingCount;
            }
        }
    } catch (error) {
        console.error("Error loading leaves:", error);
    }
}

// SETUP LEAVE FORM
function setupLeaveForm() {
    const form = document.querySelector(".leave-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const inputs = form.querySelectorAll("input[type='date']");
        const select = form.querySelector("select");
        const textarea = form.querySelector("textarea");
        
        if (inputs.length < 2) return;
        
        const startDate = inputs[0].value;
        const endDate = inputs[1].value;
        const leaveType = select.value.toUpperCase().replace(" ", "_");
        const reason = textarea.value;
        
        if (!startDate || !endDate || !reason) {
            alert("Please fill in all fields.");
            return;
        }

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${LEAVE_API_URL}/submit`, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    startDate: startDate,
                    endDate: endDate,
                    leaveType: leaveType,
                    reason: reason
                })
            });
            
            if (response.ok) {
                alert("Leave request submitted successfully!");
                form.reset();
                loadLeaveSummary();
                loadUpcomingLeaves();
            } else {
                const data = await response.json();
                alert(data.error || "Failed to submit leave request.");
            }
        } catch (error) {
            console.error("Error submitting leave:", error);
            alert("An error occurred.");
        }
    });
}