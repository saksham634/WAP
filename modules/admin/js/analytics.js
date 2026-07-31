const ANALYTICS_API_URL = "http://localhost:8080/api/admin";

document.addEventListener("DOMContentLoaded", () => {
    fetchDashboardMetrics();
});

let weeklyTrendChartInstance = null;
let roleChartInstance = null;

async function fetchDashboardMetrics() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch(`${ANALYTICS_API_URL}/dashboard`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            // 1. Update Top-Level Statistic Cards safely
            updateStatCard("totalEmployeesStat", data.totalEmployees);
            updateStatCard("todayAttendanceStat", data.presentToday);
            updateStatCard("pendingLeavesStat", data.pendingLeaves);
            updateStatCard("onLeaveStat", data.onLeave);

            // 2. Render Role Distribution Chart
            if (data.roleDistribution) {
                renderRoleChart(data.roleDistribution);
            }

            // 3. Render Weekly Attendance Trend Line Chart
            if (data.weeklyAttendanceTrend) {
                renderWeeklyTrendChart(data.weeklyAttendanceTrend);
            }

            // 4. Render Dynamic System Alerts
            if (data.systemAlerts && data.systemAlerts.length > 0) {
                renderDynamicAlerts(data.systemAlerts);
            }
        } else {
            console.warn("Backend metrics endpoint response error.");
        }
    } catch (error) {
        console.warn("Error connecting to analytics API:", error);
    }
}

function updateStatCard(elementId, value) {
    const el = document.getElementById(elementId);
    if (el && value !== undefined) {
        el.innerText = value;
    }
}

function renderRoleChart(roleData) {
    const canvas = document.getElementById("roleDistributionChart");
    if (!canvas) return;

    if (roleChartInstance) {
        roleChartInstance.destroy();
    }

    const ctx = canvas.getContext("2d");
    const labels = Object.keys(roleData);
    const dataPoints = Object.values(roleData);

    roleChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Employees by Role',
                data: dataPoints,
                backgroundColor: [
                    '#3B82F6', // Blue
                    '#10B981', // Green
                    '#F59E0B', // Amber
                    '#6366F1'  // Indigo
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#64748b', font: { family: 'Inter' } }
                }
            }
        }
    });
}

function renderWeeklyTrendChart(trendData) {
    const canvas = document.getElementById("systemChart");
    if (!canvas) return;

    if (weeklyTrendChartInstance) {
        weeklyTrendChartInstance.destroy();
    }

    const ctx = canvas.getContext("2d");
    const labels = Object.keys(trendData);
    const dataPoints = Object.values(trendData);

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.35)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

    weeklyTrendChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Present Employees",
                data: dataPoints,
                borderColor: "#3B82F6",
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.35,
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
                            return " Checked In : " + context.parsed.y + " employee(s)";
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: "#6b7280", font: { size: 13, family: "Inter" } }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0,
                        color: "#6b7280"
                    },
                    grid: { color: "#eef2f7" }
                }
            }
        }
    });
}

function renderDynamicAlerts(alertsList) {
    const container = document.getElementById("alertsContainer");
    if (!container) return;

    container.innerHTML = alertsList.map(alert => `
        <div class="alert-item" style="display: flex; align-items: flex-start; gap: 14px; padding: 12px; margin-bottom: 10px; background: var(--surface-secondary, #f8fafc); border-radius: 10px; border-left: 4px solid ${getAlertColor(alert.type)};">
            <div class="alert-icon ${alert.type}" style="width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: ${getAlertBg(alert.type)}; color: ${getAlertColor(alert.type)}; font-size: 16px; flex-shrink: 0;">
                <i class="${alert.icon || 'fa-solid fa-bell'}"></i>
            </div>
            <div class="alert-content" style="flex: 1;">
                <h4 style="margin: 0 0 4px 0; font-size: 0.9rem; font-weight: 600; color: #1e293b;">${escapeHtml(alert.title)}</h4>
                <p style="margin: 0; font-size: 0.8rem; color: #64748b; line-height: 1.4;">${escapeHtml(alert.description)}</p>
            </div>
        </div>
    `).join("");
}

function getAlertColor(type) {
    switch (type) {
        case "danger": case "error": return "#ef4444";
        case "warning": return "#f59e0b";
        case "info": return "#3b82f6";
        case "primary": return "#6366f1";
        default: return "#10b981";
    }
}

function getAlertBg(type) {
    switch (type) {
        case "danger": case "error": return "rgba(239, 68, 68, 0.1)";
        case "warning": return "rgba(245, 158, 11, 0.1)";
        case "info": return "rgba(59, 130, 246, 0.1)";
        case "primary": return "rgba(99, 102, 241, 0.1)";
        default: return "rgba(16, 185, 129, 0.1)";
    }
}

function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}