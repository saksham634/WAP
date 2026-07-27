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

    renderAudit();
});

function renderAudit() {
    const logs = [
        { title: "User Password Reset", desc: "Admin requested password reset for EMP1024", time: "Today, 10:45 AM", icon: "fa-key" },
        { title: "Role Modified", desc: "Updated permissions for HR Manager role", time: "Yesterday, 14:20 PM", icon: "fa-user-shield" },
        { title: "Bulk Payroll Export", desc: "HR9012 downloaded April 2026 payroll report", time: "2 Days Ago", icon: "fa-file-export" }
    ];
    
    const container = document.getElementById("auditContainer");
    if(!container) return;

    container.innerHTML = logs.map(log => `
        <div class="audit-item">
            <div class="audit-icon"><i class="fa-solid ${log.icon}"></i></div>
            <div class="audit-content">
                <h4>${log.title}</h4>
                <p>${log.desc}</p>
                <span class="audit-meta"><i class="fa-regular fa-clock"></i> ${log.time}</span>
            </div>
        </div>
    `).join("");
}

async function loadAuditLogs() {
    try {
        const response = await fetch("http://localhost:8080/api/admin/audit-logs", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        if (response.ok) {
            const logs = await response.json();
            const container = document.querySelector(".Recent-activity, .audit-container");
            if (!container) return;
            
            container.innerHTML = "<h3>Recent Activity</h3>";
            logs.forEach(log => {
                container.innerHTML += `
                    <div class="activity-item" style="padding: 10px 0; border-bottom: 1px solid #eee;">
                        <strong>${log.action}</strong>
                        <p>${log.description}</p>
                        <small style="color: gray;">${new Date(log.timestamp).toLocaleString()}</small>
                    </div>`;
            });
        }
    } catch (e) {
        console.log("Using static or fallback audit logs.");
    }
}
document.addEventListener("DOMContentLoaded", loadAuditLogs);