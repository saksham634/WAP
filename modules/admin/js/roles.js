document.addEventListener("DOMContentLoaded", () => {
    const sidebarPath = "../../../shared/components/sidebar-admin.html"; 
    fetch(sidebarPath)
        .then(res => res.text())
        .then(html => {
            const sidebarContainer = document.getElementById("global-sidebar");
            if(sidebarContainer) {
                sidebarContainer.innerHTML = html;
                const currentPage = window.location.pathname.split("/").pop().replace(".html", "");
                document.querySelectorAll(".sidebar a[data-page]").forEach(link => {
                    if (link.dataset.page === currentPage) link.parentElement.classList.add("active");
                });
            }
        });

    renderRoles();
});

function renderRoles() {
    const roles = [
        { title: "Administrator", icon: "fa-user-shield", perms: ["Full System Access", "Manage Users & Roles", "Audit Logs", "System Settings"] },
        { title: "HR Manager", icon: "fa-user-tie", perms: ["Employee Management", "Leave Approvals", "Payroll Processing", "View Attendance"] },
        { title: "Employee", icon: "fa-user", perms: ["View Dashboard", "Mark Attendance", "Apply Leaves", "Download Payslips"] }
    ];
    
    const container = document.getElementById("rolesContainer");
    if(!container) return;

    container.innerHTML = roles.map(role => `
        <div class="role-card">
            <div class="role-header">
                <h2>${role.title}</h2>
                <i class="fa-solid ${role.icon}"></i>
            </div>
            <ul class="perm-list">
                ${role.perms.map(p => `<li><i class="fa-solid fa-check"></i> ${p}</li>`).join("")}
            </ul>
            <button>Edit Permissions</button>
        </div>
    `).join("");
}