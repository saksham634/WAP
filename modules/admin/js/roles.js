const API_BASE = "http://localhost:8080/api";

let allSystemUsers = [];
let selectedUser = null;
let currentPermissionsState = new Set();

const PERMISSION_DEFINITIONS = {
    ROLE_EMPLOYEE: [
        { key: "ATTENDANCE", title: "Daily Attendance & Check-In", icon: "fa-calendar-check", desc: "Enables employee to mark daily attendance, check-in, and check-out." },
        { key: "LEAVES", title: "Apply & Track Leaves", icon: "fa-plane-departure", desc: "Enables employee to submit leave requests and view application history." },
        { key: "PAYROLL", title: "View & Download Payslips", icon: "fa-file-invoice-dollar", desc: "Enables employee to view and download monthly salary slips." },
        { key: "PERSONAL_INFO", title: "Personal Profile Access", icon: "fa-id-card", desc: "Enables employee to view and update personal profile details." },
        { key: "DASHBOARD", title: "Employee Dashboard Access", icon: "fa-chart-pie", desc: "Enables employee to view the main employee overview dashboard." }
    ],
    ROLE_HR: [
        { key: "EMPLOYEE_MGMT", title: "Employee Directory & Workforce", icon: "fa-users-gear", desc: "Enables HR to view active staff directory and employee details." },
        { key: "LEAVE_APPROVALS", title: "Leave Approvals & Management", icon: "fa-clipboard-check", desc: "Enables HR to review, approve, or reject pending leave applications." },
        { key: "ATTENDANCE_OVERVIEW", title: "Live Attendance Overview", icon: "fa-chart-column", desc: "Enables HR to monitor daily organization-wide attendance feed." },
        { key: "PAYROLL_ADMIN", title: "Payroll Administration", icon: "fa-vault", desc: "Enables HR to process monthly payrolls and generate employee payslips." },
        { key: "DASHBOARD", title: "HR Dashboard Access", icon: "fa-chart-line", desc: "Enables HR to access the main HR analytics dashboard." }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    loadUsers();

    document.getElementById("roleFilter").addEventListener("change", filterUserDropdown);
    document.getElementById("userSelect").addEventListener("change", handleUserSelection);
    document.getElementById("savePermissionsBtn").addEventListener("click", saveUserPermissions);
    document.getElementById("resetDefaultsBtn").addEventListener("click", resetToDefaults);
});

function attachLogoutHandlers() {
    document.querySelectorAll('.sidebar-bottom a, .logout-btn, [data-action="logout"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = '../../../public/Login/LogIn.html';
        });
    });
}

async function loadUsers() {
    const token = localStorage.getItem("token");
    if (!token) return;

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
            allSystemUsers = await response.json();
            filterUserDropdown();
        } else {
            console.error("Failed to load users:", response.status);
        }
    } catch (error) {
        console.error("Error fetching system users:", error);
    }
}

function filterUserDropdown() {
    const roleFilter = document.getElementById("roleFilter").value;
    const userSelect = document.getElementById("userSelect");

    userSelect.innerHTML = `<option value="" disabled selected>-- Select an HR Manager or Employee --</option>`;

    const filteredUsers = allSystemUsers.filter(u => {
        if (u.role === "ROLE_ADMIN") return false; // Admin has full access
        if (roleFilter === "ALL") return true;
        return u.role === roleFilter;
    });

    if (filteredUsers.length === 0) {
        userSelect.innerHTML = `<option value="" disabled>No users found for selected role filter</option>`;
        return;
    }

    filteredUsers.forEach(user => {
        const option = document.createElement("option");
        option.value = user.employeeId;
        const roleLabel = user.role === "ROLE_HR" ? "HR Manager" : "Employee";
        option.textContent = `${user.fullName || user.email} (${user.employeeId || 'N/A'}) - [${roleLabel}]`;
        userSelect.appendChild(option);
    });
}

function handleUserSelection(e) {
    const employeeId = e.target.value;
    selectedUser = allSystemUsers.find(u => u.employeeId === employeeId);

    if (!selectedUser) return;

    // Show User Banner
    const banner = document.getElementById("selectedUserBanner");
    banner.style.display = "flex";

    document.getElementById("userNameDisplay").textContent = selectedUser.fullName || selectedUser.email;
    document.getElementById("userIdBadge").textContent = selectedUser.employeeId || "EMP-0000";
    document.getElementById("userEmailDisplay").textContent = selectedUser.email;

    const roleBadge = document.getElementById("userRoleBadge");
    if (selectedUser.role === "ROLE_HR") {
        roleBadge.textContent = "HR Manager";
        roleBadge.className = "badge badge-role hr";
    } else {
        roleBadge.textContent = "Employee";
        roleBadge.className = "badge badge-role";
    }

    const avatarBadge = document.getElementById("userAvatarBadge");
    const nameStr = selectedUser.fullName || selectedUser.email || "User";
    avatarBadge.textContent = nameStr.charAt(0).toUpperCase();

    // Parse current permissions
    const permString = selectedUser.permissions || "";
    currentPermissionsState = new Set(permString.split(",").map(p => p.trim()).filter(Boolean));

    renderPermissionToggles();
}

function renderPermissionToggles() {
    const grid = document.getElementById("permissionsGrid");
    if (!grid || !selectedUser) return;

    const definitions = PERMISSION_DEFINITIONS[selectedUser.role] || PERMISSION_DEFINITIONS["ROLE_EMPLOYEE"];

    grid.innerHTML = definitions.map(def => {
        const isEnabled = currentPermissionsState.has(def.key);
        return `
            <div class="perm-card ${isEnabled ? '' : 'disabled'}" id="perm-card-${def.key}">
                <div class="perm-header">
                    <div class="perm-title-group">
                        <div class="perm-icon-wrapper">
                            <i class="fa-solid ${def.icon}"></i>
                        </div>
                        <h3 class="perm-title">${def.title}</h3>
                    </div>
                    <label class="switch">
                        <input type="checkbox" data-key="${def.key}" ${isEnabled ? 'checked' : ''} onchange="togglePermissionState('${def.key}', this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
                <p class="perm-desc">${def.desc}</p>
                <div class="perm-footer">
                    <span class="status-indicator ${isEnabled ? 'on' : 'off'}" id="status-indicator-${def.key}">
                        <i class="fa-solid ${isEnabled ? 'fa-check-circle' : 'fa-circle-xmark'}"></i>
                        ${isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <span style="font-size: 12px; color: #94a3b8; font-weight: 500;">Key: ${def.key}</span>
                </div>
            </div>
        `;
    }).join("");
}

window.togglePermissionState = function(key, isChecked) {
    if (isChecked) {
        currentPermissionsState.add(key);
    } else {
        currentPermissionsState.delete(key);
    }

    const card = document.getElementById(`perm-card-${key}`);
    const indicator = document.getElementById(`status-indicator-${key}`);

    if (card && indicator) {
        if (isChecked) {
            card.classList.remove("disabled");
            indicator.className = "status-indicator on";
            indicator.innerHTML = `<i class="fa-solid fa-check-circle"></i> Enabled`;
        } else {
            card.classList.add("disabled");
            indicator.className = "status-indicator off";
            indicator.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Disabled`;
        }
    }
};

async function saveUserPermissions() {
    if (!selectedUser) {
        alert("Please select a user first.");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    const saveBtn = document.getElementById("savePermissionsBtn");
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right: 6px;"></i> Saving...`;

    const permissionsList = Array.from(currentPermissionsState);

    try {
        const response = await fetch(`${API_BASE}/admin/users/${selectedUser.employeeId}/permissions`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ permissions: permissionsList })
        });

        if (response.ok) {
            selectedUser.permissions = permissionsList.join(",");
            alert(`Permissions updated successfully for ${selectedUser.fullName || selectedUser.employeeId}!`);
        } else {
            const err = await response.json();
            alert("Error: " + (err.error || "Failed to update permissions."));
        }
    } catch (error) {
        console.error("Error saving permissions:", error);
        alert("Could not connect to server.");
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
}

function resetToDefaults() {
    if (!selectedUser) return;

    if (selectedUser.role === "ROLE_HR") {
        currentPermissionsState = new Set(["EMPLOYEE_MGMT", "LEAVE_APPROVALS", "ATTENDANCE_OVERVIEW", "PAYROLL_ADMIN", "DASHBOARD"]);
    } else {
        currentPermissionsState = new Set(["ATTENDANCE", "LEAVES", "PAYROLL", "PERSONAL_INFO", "DASHBOARD"]);
    }

    renderPermissionToggles();
}