// Attendance Data
const attendanceData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: [92, 96, 94, 98, 95, 90, 93]
};

// Global Chart Instance
let attendanceChartInstance = null;

// Initialize Chart
function initializeAttendanceChart() {
    const canvas = document.getElementById("attendanceChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, "rgba(0,163,163,0.35)");
    gradient.addColorStop(1, "rgba(0,163,163,0)");

    //  DESTROY OLD CHART
    if (attendanceChartInstance) {
        attendanceChartInstance.destroy();
    }
    attendanceChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: attendanceData.labels,
            datasets: [{
                data: attendanceData.values,
                borderColor: "#007a7a",
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: "#ffffff",
                pointBorderColor: "#007a7a",
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
                            return " Attendance : " + context.parsed.y + "%";
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: "#6b7280",
                        font: { size: 13 }
                    }
                },
                y: {
                    min: 80,
                    max: 100,
                    ticks: {
                        stepSize: 5,
                        color: "#6b7280",
                        callback: function (value) {
                            return value + "%";
                        }
                    },
                    grid: { color: "#eef2f7" }
                }
            }
        }
    });
}

// Team Updates
const teamUpdates = [
    {
        icon: "fa-solid fa-user-plus",
        title: "Aarav Sharma joined the Engineering team",
        description: "Today • HR Department"
    },
    {
        icon: "fa-solid fa-medal",
        title: "Sales team achieved monthly target",
        description: "2 Hours Ago"
    },
    {
        icon: "fa-solid fa-graduation-cap",
        title: "Cyber Security training assigned",
        description: "Yesterday"
    }
];

function renderTeamUpdates() {
    const container = document.getElementById("teamUpdatesContainer");
    if (!container) return;
    container.innerHTML = teamUpdates.map(update => `
        <div class="update-item">
            <div class="update-icon">
                <i class="${update.icon}"></i>
            </div>
            <div class="update-content">
                <h4>${update.title}</h4>
                <p>${update.description}</p>
            </div>
        </div>
    `).join("");
}

// Upcoming Events
const upcomingEvents = [
    {
        day: "28",
        month: "JUN",
        title: "Sprint Planning Meeting",
        description: "10:00 AM • Conference Room"
    },
    {
        day: "30",
        month: "JUN",
        title: "Payroll Processing",
        description: "Finance Department"
    },
    {
        day: "05",
        month: "JUL",
        title: "Team Building Activity",
        description: "Outdoor Event"
    }
];

function renderUpcomingEvents() {
    const container = document.getElementById("eventsContainer");
    if (!container) return;
    container.innerHTML = upcomingEvents.map(event => `
        <div class="event-item">
            <div class="event-date">
                <h3>${event.day}</h3>
                <span>${event.month}</span>
            </div>
            <div class="event-content">
                <h4>${event.title}</h4>
                <p>${event.description}</p>
            </div>
        </div>
    `).join("");
}

// Recent Activity
const recentActivities = [
    {
        icon: "fa-solid fa-check-circle",
        title: "Checked In",
        time: "09:02 AM"
    },
    {
        icon: "fa-solid fa-calendar-check",
        title: "Leave Approved",
        time: "Yesterday"
    },
    {
        icon: "fa-solid fa-wallet",
        title: "Payslip Generated",
        time: "2 Days Ago"
    },
    {
        icon: "fa-solid fa-graduation-cap",
        title: "Training Assigned",
        time: "3 Days Ago"
    }
];

function renderRecentActivities() {
    const container = document.getElementById("activityContainer");
    if (!container) return;
    container.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-left">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-title">
                    ${activity.title}
                </div>
            </div>
            <div class="activity-time">
                ${activity.time}
            </div>
        </div>
    `).join("");
}

// Master Init (Run Once)
function initializeDashboard() {
    initializeAttendanceChart();
    renderTeamUpdates();
    renderUpcomingEvents();
    renderRecentActivities();
}

// Safe DOM Init
document.addEventListener("DOMContentLoaded", function () {
    initializeDashboard();
});