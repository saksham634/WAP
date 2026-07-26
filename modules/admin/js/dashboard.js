// Sidebar Loader Logic
document.addEventListener("DOMContentLoaded", () => {
    const sidebarPath = "../../../shared/components/sidebar-admin.html"; 

    fetch(sidebarPath)
        .then(res => {
            if (!res.ok) throw new Error("Sidebar not found at: " + sidebarPath);
            return res.text();
        })
        .then(html => {
            const sidebarContainer = document.getElementById("global-sidebar");
            if(sidebarContainer) {
                sidebarContainer.innerHTML = html;
                
                const currentPage = window.location.pathname
                    .split("/")
                    .pop()
                    .replace(".html", "");

                document.querySelectorAll(".sidebar a[data-page]").forEach(link => {
                    if (link.dataset.page === currentPage) {
                        link.parentElement.classList.add("active");
                    }
                });
            }
        })
        .catch(err => console.error("Error loading global sidebar:", err));
        
    // Initialize Dashboard Components
    initializeSystemChart();
    renderSystemAlerts();
});

// Platform Usage Data (Chart.js)
function initializeSystemChart() {
    const canvas = document.getElementById("systemChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.35)"); // Blue tint for admin
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
                data: [850, 920, 1102, 1050, 980, 450, 520],
                borderColor: "#3B82F6",
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: "#ffffff",
                pointBorderColor: "#3B82F6",
                pointBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: "index",
                intersect: false
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#ffffff",
                    titleColor: "#1f2937",
                    bodyColor: "#6b7280",
                    borderColor: "#e5e7eb",
                    borderWidth: 1,
                    displayColors: false,
                    padding: 12,
                    callbacks: {
                        label: function (context) {
                            return " Active Sessions : " + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: "#6b7280", font: { size: 13 } }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 200,
                        color: "#6b7280"
                    },
                    grid: { color: "#eef2f7" }
                }
            }
        }
    });
}

// System Alerts Data
const systemAlerts = [
    {
        icon: "fa-solid fa-triangle-exclamation",
        type: "warning",
        title: "High Memory Usage",
        description: "Server-02 is experiencing 92% memory utilization."
    },
    {
        icon: "fa-solid fa-shield-halved",
        type: "danger",
        title: "Failed Login Attempts",
        description: "Multiple failed logins detected from IP 192.168.1.45."
    },
    {
        icon: "fa-solid fa-cloud-arrow-up",
        type: "info",
        title: "Database Backup",
        description: "Automated daily backup completed successfully."
    }
];

function renderSystemAlerts() {
    const container = document.getElementById("alertsContainer");
    if (!container) return;
    
    container.innerHTML = systemAlerts.map(alert => `
        <div class="alert-item">
            <div class="alert-icon ${alert.type}">
                <i class="${alert.icon}"></i>
            </div>
            <div class="alert-content">
                <h4>${alert.title}</h4>
                <p>${alert.description}</p>
            </div>
        </div>
    `).join("");
}