const HR_LEAVE_API_URL = "http://localhost:8080/api/leave/hr";

document.addEventListener("DOMContentLoaded", () => {
    loadPendingLeaves();
});

async function loadPendingLeaves() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const list = document.getElementById("leaveList");
    if (list) {
        list.innerHTML = `<p style="padding: 20px; color: var(--text-light);">Loading pending leaves...</p>`;
    }

    try {
        const response = await fetch(`${HR_LEAVE_API_URL}/pending`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "../../../public/Login/LogIn.html";
            return;
        }

        if (response.ok) {
            const leaves = await response.json();
            renderLeaves(leaves);
        } else {
            if (list) list.innerHTML = `<p style="padding: 20px; color: #dc2626;">Failed to load leave requests.</p>`;
        }
    } catch (error) {
        console.error("Error loading pending leaves:", error);
        if (list) list.innerHTML = `<p style="padding: 20px; color: #dc2626;">Could not connect to server.</p>`;
    }
}

function renderLeaves(leaves) {
    const list = document.getElementById("leaveList");
    if (!list) return;

    list.innerHTML = "";

    if (leaves.length === 0) {
        list.innerHTML = `<p style="padding: 20px; color: var(--text-light);">No pending leave requests. All caught up! 🎉</p>`;
        return;
    }

    leaves.forEach(leave => {
        // LeaveResponseDTO fields: id, employeeName, leaveType, startDate, endDate, reason, status
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        const day = startDate.getDate().toString().padStart(2, '0');
        const month = startDate.toLocaleString('default', { month: 'short' }).toUpperCase();

        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const div = document.createElement("div");
        div.className = "info-row align-center";
        div.style.padding = "20px 0";
        div.id = `leave-row-${leave.id}`;

        div.innerHTML = `
            <div class="d-flex align-center" style="gap: 15px;">
                <div class="event-date">
                    <h3>${day}</h3>
                    <span>${month}</span>
                </div>
                <div>
                    <h4 style="font-size: 15px; margin-bottom: 4px;">${leave.leaveType || 'Leave'} • ${diffDays} Day${diffDays > 1 ? 's' : ''}</h4>
                    <span style="font-size: 13px; color: var(--text-light);">Requested by: ${leave.employeeName || 'Unknown'}</span>
                    <div style="font-size: 12px; color: #888; margin-top: 2px;">Reason: ${leave.reason || 'N/A'}</div>
                </div>
            </div>
            <div class="d-flex" style="gap: 10px;">
                <button class="filter-button reject-btn" style="background: #dc2626; color: white;" data-id="${leave.id}">Reject</button>
                <button class="filter-button approve-btn" style="background: #007a7a; color: white;" data-id="${leave.id}">Approve</button>
            </div>
        `;

        list.appendChild(div);
    });

    // Attach event listeners for approve/reject buttons
    list.querySelectorAll(".approve-btn").forEach(btn => {
        btn.addEventListener("click", () => updateLeaveStatus(btn.dataset.id, "APPROVED"));
    });
    list.querySelectorAll(".reject-btn").forEach(btn => {
        btn.addEventListener("click", () => updateLeaveStatus(btn.dataset.id, "REJECTED"));
    });
}

async function updateLeaveStatus(id, status) {
    const token = localStorage.getItem("token");
    if (!token) return;

    let reason = null;
    if (status === "REJECTED") {
        reason = prompt("Please provide a reason for rejecting this leave request:");
        if (reason === null) return; // User cancelled
        if (!reason.trim()) {
            alert("Rejection reason is required.");
            return;
        }
    }

    try {
        const response = await fetch(`${HR_LEAVE_API_URL}/update/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: status, reason: reason })
        });

        if (response.ok) {
            // Remove the row with a fade effect
            const row = document.getElementById(`leave-row-${id}`);
            if (row) {
                row.style.transition = "opacity 0.3s ease";
                row.style.opacity = "0";
                setTimeout(() => {
                    row.remove();
                    // Check if list is now empty
                    const list = document.getElementById("leaveList");
                    if (list && list.children.length === 0) {
                        list.innerHTML = `<p style="padding: 20px; color: var(--text-light);">No pending leave requests. All caught up! 🎉</p>`;
                    }
                }, 300);
            }
        } else {
            const err = await response.json();
            alert("Error: " + (err.error || "Could not update status."));
        }
    } catch (error) {
        console.error("Error updating leave status:", error);
        alert("Could not connect to server.");
    }
}
