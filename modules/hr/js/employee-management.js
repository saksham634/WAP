const API_BASE = "http://localhost:8080/api";
let currentDesignationEmpId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadEmployees();
    
    // Wire Department Config button
    const btn = document.getElementById("btnDeptConfig");
    if (btn) {
        btn.addEventListener("click", () => {
            alert("Click the 'Assign' button next to any employee to configure their designation.");
        });
    }
});

async function loadEmployees() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const employeeList = document.getElementById("employeeList");
    const countEl = document.getElementById("employeeCount");

    if (employeeList) {
        employeeList.innerHTML = `<p style="padding: 20px; color: var(--text-light);">Loading employees...</p>`;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/users`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "../../../public/Login/LogIn.html";
            return;
        }

        if (response.ok) {
            const users = await response.json();
            // Phase 4: Filter out ROLE_ADMIN — only show HR and Employees
            const filtered = users.filter(u => u.role !== "ROLE_ADMIN");
            renderEmployeeList(filtered);
        } else {
            if (employeeList) employeeList.innerHTML = `<p style="padding: 20px; color: #dc2626;">Failed to load employees.</p>`;
        }
    } catch (error) {
        console.error("Error fetching employees:", error);
        if (employeeList) employeeList.innerHTML = `<p style="padding: 20px; color: #dc2626;">Could not connect to server.</p>`;
    }
}

function renderEmployeeList(users) {
    const employeeList = document.getElementById("employeeList");
    const countEl = document.getElementById("employeeCount");

    if (!employeeList) return;

    if (countEl) {
        countEl.innerText = `${users.length} Staff Members`;
    }

    employeeList.innerHTML = "";

    if (users.length === 0) {
        employeeList.innerHTML = `<p style="padding: 20px; color: var(--text-light);">No employees found.</p>`;
        return;
    }

    users.forEach(user => {
        const displayName = user.fullName || user.email || "Unknown";
        const initial = displayName.charAt(0).toUpperCase();
        const empId = user.employeeId || "N/A";
        const designation = user.designation || "Not Assigned";
        const roleName = user.role === "ROLE_HR" ? "HR Manager" : "Employee";
        const status = user.status || "Active";

        const isActive = status.toLowerCase() === "active";
        const statusColor = isActive ? "#007a7a" : "#dc2626";
        const statusBg = isActive ? "#eef8f8" : "#fef2f2";

        const row = document.createElement("div");
        row.className = "info-row align-center";
        row.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 14px 0;";
        row.innerHTML = `
            <div class="d-flex align-center" style="gap: 15px;">
                <div class="profile-avatar" style="width: 40px; height: 40px; font-size: 14px;">${initial}</div>
                <div>
                    <h4 style="font-size: 15px; margin-bottom: 2px;">${displayName}</h4>
                    <span style="font-size: 13px; color: var(--text-light);">${empId} • ${designation}</span>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 1px;">${roleName}</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <button class="assign-btn" data-id="${empId}" data-name="${displayName}" data-designation="${designation}" 
                    style="padding: 5px 12px; border: 1px solid #007a7a; border-radius: 8px; background: white; color: #007a7a; cursor: pointer; font-size: 12px; font-weight: 600;">
                    Assign
                </button>
                <span style="color: ${statusColor}; font-weight: 600; background: ${statusBg}; padding: 6px 12px; border-radius: 8px; font-size: 12px;">${status}</span>
            </div>
        `;
        employeeList.appendChild(row);
    });

    // Wire assign buttons
    employeeList.querySelectorAll(".assign-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            openDesignationModal(btn.dataset.id, btn.dataset.name, btn.dataset.designation);
        });
    });
}

function openDesignationModal(empId, empName, currentDesignation) {
    currentDesignationEmpId = empId;
    const modal = document.getElementById("designationModal");
    const nameEl = document.getElementById("designationEmpName");
    const selectEl = document.getElementById("designationSelect");
    const customEl = document.getElementById("designationCustom");

    if (nameEl) nameEl.textContent = empName + " (" + empId + ")";
    if (selectEl) selectEl.value = currentDesignation !== "Not Assigned" ? currentDesignation : "";
    if (customEl) customEl.value = "";

    if (modal) modal.style.display = "flex";
}

function closeDesignationModal() {
    const modal = document.getElementById("designationModal");
    if (modal) modal.style.display = "none";
    currentDesignationEmpId = null;
}

async function saveDesignation() {
    const selectEl = document.getElementById("designationSelect");
    const customEl = document.getElementById("designationCustom");
    
    const designation = customEl.value.trim() || selectEl.value;
    if (!designation) {
        alert("Please select or type a designation.");
        return;
    }

    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_BASE}/admin/users/${currentDesignationEmpId}/designation`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ designation })
        });

        if (res.ok) {
            alert("Designation updated to: " + designation);
            closeDesignationModal();
            loadEmployees();
        } else {
            const err = await res.json();
            alert("Error: " + (err.error || "Failed to update."));
        }
    } catch (e) {
        console.error("Error saving designation:", e);
        alert("Could not connect to server.");
    }
}
