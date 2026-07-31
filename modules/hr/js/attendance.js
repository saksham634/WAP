const API_BASE = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {
    loadAttendanceFeed();
});

async function loadAttendanceFeed() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        // Fetch real-time attendance records for today
        const response = await fetch(`${API_BASE}/attendance/org-today`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "../../../public/Login/LogIn.html";
            return;
        }

        if (response.ok) {
            const records = await response.json();
            updateAttendanceStats(records);
            renderAttendanceFeed(records);
        }
    } catch (error) {
        console.error("Error loading attendance feed:", error);
    }

    // Also fetch users to calculate attendance %
    try {
        const usersRes = await fetch(`${API_BASE}/admin/users`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (usersRes.ok) {
            const users = await usersRes.json();
            // Filter out admins
            const nonAdminUsers = users.filter(u => u.role !== "ROLE_ADMIN");
            const totalEmployees = nonAdminUsers.length || 1;
            
            // Count today's checked-in from the feed
            const checkedInEl = document.getElementById("hrCheckedIn");
            const checkedInCount = parseInt(checkedInEl?.textContent || "0");
            
            const pct = Math.round((checkedInCount / totalEmployees) * 100);
            const pctEl = document.getElementById("hrAttPct");
            if (pctEl) pctEl.textContent = pct + "%";
        }
    } catch (e) {
        console.error("Error loading users for attendance calc:", e);
    }
}

function updateAttendanceStats(records) {
    const checkedInEl = document.getElementById("hrCheckedIn");
    const onLeaveEl = document.getElementById("hrOnLeave");
    
    if (checkedInEl) checkedInEl.textContent = records.length;
    if (onLeaveEl) {
        const onLeave = records.filter(r => r.status === "ON_LEAVE").length;
        onLeaveEl.textContent = onLeave;
    }
}

function renderAttendanceFeed(records) {
    const feedCard = document.querySelector(".card.flex-1");
    if (!feedCard) return;

    // Remove existing info-rows
    const existingRows = feedCard.querySelectorAll(".info-row");
    existingRows.forEach(r => r.remove());

    if (records.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.style.cssText = "padding: 20px; color: var(--text-light);";
        emptyMsg.textContent = "No attendance records for today yet.";
        feedCard.appendChild(emptyMsg);
        return;
    }

    records.forEach((record, i) => {
        const row = document.createElement("div");
        row.className = "info-row align-center";
        if (i === records.length - 1) row.style.borderBottom = "none";

        const checkInText = record.checkIn || "Not checked in";
        const checkOutText = record.checkOut ? ` → Out: ${record.checkOut}` : "";

        row.innerHTML = `
            <span style="font-weight: 500;">${record.employeeId || 'N/A'} (${record.fullName || 'Unknown'})</span>
            <span style="color: #007a7a;"><i class="fa-solid fa-clock"></i> In: ${checkInText}${checkOutText}</span>
        `;
        feedCard.appendChild(row);
    });
}
