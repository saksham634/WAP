const ANALYTICS_API_URL = "http://localhost:8080/api/analytics";

document.addEventListener("DOMContentLoaded", () => {
    fetchDashboardMetrics();
});

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
            
            // 1. Update Top-Level Statistic Cards
            updateStatCard("totalEmployeesStat", data.totalEmployees);
            updateStatCard("todayAttendanceStat", data.todayAttendance);
            updateStatCard("pendingLeavesStat", data.pendingLeaves);

            // 2. Render the Role Distribution Chart
            renderRoleChart(data.roleDistribution);
        } else {
            console.error("Failed to load analytics data");
        }
    } catch (error) {
        console.error("Error connecting to analytics API:", error);
    }
}

function updateStatCard(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) {
        // Simple animation effect for numbers
        el.innerText = value;
    }
}

function renderRoleChart(roleData) {
    const canvas = document.getElementById("roleDistributionChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const labels = Object.keys(roleData);
    const dataPoints = Object.values(roleData);

    new Chart(ctx, {
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