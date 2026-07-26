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