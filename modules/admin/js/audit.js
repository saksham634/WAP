document.addEventListener("DOMContentLoaded", () => {
    fetchAuditLogs();
});

async function fetchAuditLogs() {
    try {
        const response = await fetch("http://localhost:8080/api/admin/audit", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        if (response.ok) {
            const logs = await response.json();
            const container = document.getElementById("auditContainer");
            if (!container) return;
            
            if (logs.length === 0) {
                container.innerHTML = "<p style='color: var(--text-secondary); text-align: center; padding: 2rem;'>No audit logs found.</p>";
                return;
            }

            container.innerHTML = logs.map(log => `
                <div class="audit-item">
                    <div class="audit-icon"><i class="fa-solid fa-clock-rotate-left"></i></div>
                    <div class="audit-content">
                        <h4>${log.action}</h4>
                        <p>Performed by: ${log.performedBy} (${log.userEmail})</p>
                        <span class="audit-meta"><i class="fa-regular fa-clock"></i> ${new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                </div>
            `).join("");
        }
    } catch (e) {
        console.error("Failed to load audit logs:", e);
    }
}