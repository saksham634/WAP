const LEAVE_API_URL = "http://localhost:8080/api/leave";

document.addEventListener("DOMContentLoaded", () => {
    loadLeaveData();
    setupApplyLeaveForm();
});

async function loadLeaveData() {
    const token = localStorage.getItem("token");
    if (!token) return;

    // 1. Fetch Leave Summary KPIs
    try {
        const sumRes = await fetch(`${LEAVE_API_URL}/summary`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (sumRes.ok) {
            const summary = await sumRes.json();
            document.getElementById("leaveTotal").textContent = summary.totalLeaves || 24;
            document.getElementById("leaveUsed").textContent = summary.usedLeaves || 0;
            document.getElementById("leaveRemaining").textContent = summary.remainingLeaves || 24;
            document.getElementById("leavePending").textContent = summary.pendingLeaves || 0;
        }
    } catch (e) {
        console.error("Error loading leave summary:", e);
    }

    // 2. Fetch Leave History Records
    try {
        const listRes = await fetch(`${LEAVE_API_URL}/my-leaves`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (listRes.ok) {
            const leaves = await listRes.json();
            renderLeaveHistory(leaves);
        }
    } catch (e) {
        console.error("Error loading leave records:", e);
    }
}

function renderLeaveHistory(leaves) {
    const container = document.getElementById("upcomingLeavesContainer");
    if (!container) return;

    if (!leaves.length) {
        container.innerHTML = "<p style='padding: 15px; color: #64748b;'>No leave applications submitted yet.</p>";
        return;
    }

    container.innerHTML = leaves.map(l => {
        const startDate = new Date(l.startDate);
        const day = startDate.getDate() < 10 ? '0' + startDate.getDate() : startDate.getDate();
        const month = startDate.toLocaleString('default', { month: 'short' }).toUpperCase();
        
        let statusBg = "#f59e0b";
        let statusColor = "#ffffff";
        if (l.status === "APPROVED") { statusBg = "#10b981"; }
        else if (l.status === "REJECTED") { statusBg = "#ef4444"; }

        const rejectionHtml = (l.status === "REJECTED" && l.rejectionReason) 
            ? `<div style="font-size: 11px; color: #ef4444; margin-top: 4px; font-style: italic;">Reason: ${l.rejectionReason}</div>` 
            : '';

        return `
            <div class="leave-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; margin-bottom: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div class="leave-date" style="width: 44px; height: 44px; border-radius: 10px; background: #007a7a; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 700; font-size: 11px;">
                        <span style="font-size: 14px; line-height: 1;">${day}</span>
                        <span>${month}</span>
                    </div>
                    <div class="leave-content">
                        <h4 style="margin: 0 0 2px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${l.leaveType}</h4>
                        <p style="margin: 0; font-size: 12px; color: #64748b;">${l.startDate} to ${l.endDate}</p>
                        ${rejectionHtml}
                    </div>
                </div>
                <span style="padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; background: ${statusBg}; color: ${statusColor};">
                    ${l.status}
                </span>
            </div>
        `;
    }).join('');
}

function setupApplyLeaveForm() {
    const form = document.getElementById("applyLeaveForm");
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const startDate = document.getElementById("leaveStartDate").value;
        const endDate = document.getElementById("leaveEndDate").value;
        const leaveType = document.getElementById("leaveTypeSelect").value;
        const reason = document.getElementById("leaveReasonText").value;

        try {
            const res = await fetch(`${LEAVE_API_URL}/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ startDate, endDate, leaveType, reason })
            });

            if (res.ok) {
                alert("Leave request submitted successfully! It is now sent to HR for approval.");
                form.reset();
                loadLeaveData();
            } else {
                const errText = await res.text();
                alert("Failed to submit leave request: " + errText);
            }
        } catch (err) {
            console.error("Leave submission error:", err);
            alert("Error submitting leave request.");
        }
    };
}
