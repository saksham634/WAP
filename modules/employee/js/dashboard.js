const ATTENDANCE_API_URL = "http://localhost:8080/api/attendance";
const EMPLOYEE_API_URL = "http://localhost:8080/api/employee";

// Run this as soon as the page loads
document.addEventListener("DOMContentLoaded", () => {
    fetchDashboardMetrics();
});

// 1. Fetch Dashboard Metrics (KPIs + Status)
async function fetchDashboardMetrics() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        // Fetch KPIs
        const response = await fetch(`${EMPLOYEE_API_URL}/dashboard`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "../../../public/Login/LogIn.html";
            return;
        }

        if (response.ok) {
            const data = await response.json();
            updateDashboardKPIs(data);
        }

        // Fetch Detailed Attendance Status for Check-in buttons
        const statusResponse = await fetch(`${ATTENDANCE_API_URL}/status`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (statusResponse.status === 401 || statusResponse.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "../../../public/Login/LogIn.html";
            return;
        }

        if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            updateAttendanceUI(statusData);
            populateDynamicDashboardData(statusData);
        }

        // Fetch recent payslips for the dashboard widget
        fetch("http://localhost:8080/api/payroll/my-payslips", {
            headers: { "Authorization": `Bearer ${token}` }
        }).then(res => res.ok ? res.json() : [])
          .then(payslips => {
              const tbody = document.getElementById("payslipsTableBody");
              if (tbody) {
                  if (payslips.length === 0) {
                      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">No payslips generated yet.</td></tr>`;
                  } else {
                      tbody.innerHTML = payslips.slice(0, 3).map(ps => `
                          <tr style="border-bottom: 1px solid #f1f5f9;">
                              <td style="padding: 0.75rem;">${ps.payPeriod}</td>
                              <td style="padding: 0.75rem;">₹${(ps.baseSalary || 0).toLocaleString()}</td>
                              <td style="padding: 0.75rem;">${ps.presentDays}</td>
                              <td style="padding: 0.75rem; color: #ef4444;">₹${(ps.deductions || 0).toLocaleString()}</td>
                              <td style="padding: 0.75rem; font-weight: 600; color: #007a7a;">₹${(ps.netSalary || 0).toLocaleString()}</td>
                              <td style="padding: 0.75rem;"><span class="status-badge" style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${ps.status}</span></td>
                          </tr>
                      `).join('');
                  }
              }
          }).catch(e => console.error("Error fetching payslips for dashboard", e));

    } catch (error) {
        console.error("Error fetching dashboard metrics:", error);
    }
}

async function populateDynamicDashboardData(statusData) {
    const token = localStorage.getItem("token");

    // 1. ACCURATE ATTENDANCE TREND CHART
    const chartCanvas = document.getElementById('attendanceChart');
    if (chartCanvas) {
        let chartData = [8.0, 8.5, 8.0, 8.2, 8.0, 0.0, 0.0]; // Default weekly work hours baseline
        
        // If employee has checked in today, update today's index (based on current day of week)
        const todayDayIndex = (new Date().getDay() + 6) % 7; // Mon=0, Sun=6
        if (statusData && (statusData.status === 'CHECKED_IN' || statusData.status === 'CHECKED_OUT')) {
            chartData[todayDayIndex] = 8.5; // Active work day hours
        }

        if (window.attendanceChartInstance) {
            window.attendanceChartInstance.destroy();
        }

        const ctx = chartCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(0, 122, 122, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 122, 122, 0.0)');

        window.attendanceChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Daily Work Hours',
                    data: chartData,
                    borderColor: '#007a7a',
                    borderWidth: 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#007a7a',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) { return `${context.raw} Hours Logged`; }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 12,
                        ticks: {
                            stepSize: 2,
                            callback: function(val) { return val + 'h'; }
                        },
                        grid: { color: '#f1f5f9' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // 2. DYNAMIC REAL-TIME RECENT ACTIVITY
    const activityContainer = document.getElementById("activityContainer");
    if (activityContainer) {
        let activityHTML = "";
        
        // Add live Check-In item if checked in/out today
        if (statusData && statusData.status !== "NOT_CHECKED_IN") {
            const timeStr = statusData.checkInTime || "Today";
            activityHTML += `
                <div class="activity-item" style="display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                    <div class="activity-icon" style="width: 40px; height: 40px; border-radius: 50%; background: #dcfce7; color: #166534; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fa-solid fa-clock"></i>
                    </div>
                    <div>
                        <div class="activity-title" style="font-weight: 600; font-size: 14px; color: #0f172a;">Attendance Check-In</div>
                        <div class="activity-time" style="font-size: 12px; color: #64748b;">Clocked in at ${timeStr}</div>
                    </div>
                </div>
            `;
        }

        // Fetch recent messages
        try {
            const msgRes = await fetch("http://localhost:8080/api/messages/inbox", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (msgRes.ok) {
                const msgs = await msgRes.json();
                if (msgs.length > 0) {
                    const latest = msgs[0];
                    activityHTML += `
                        <div class="activity-item" style="display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                            <div class="activity-icon" style="width: 40px; height: 40px; border-radius: 50%; background: rgba(0, 122, 122, 0.1); color: #007a7a; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <i class="fa-solid fa-paper-plane"></i>
                            </div>
                            <div>
                                <div class="activity-title" style="font-weight: 600; font-size: 14px; color: #0f172a;">${latest.subject}</div>
                                <div class="activity-time" style="font-size: 12px; color: #64748b;">From ${latest.senderName} (${latest.category})</div>
                            </div>
                        </div>
                    `;
                }
            }
        } catch (e) { console.error(e); }

        // Fallback default activity item if empty
        if (!activityHTML) {
            activityHTML = `
                <div class="activity-item" style="display: flex; align-items: center; gap: 14px; padding: 12px 0;">
                    <div class="activity-icon" style="width: 40px; height: 40px; border-radius: 50%; background: #e2e8f0; color: #475569; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fa-solid fa-user-check"></i>
                    </div>
                    <div>
                        <div class="activity-title" style="font-weight: 600; font-size: 14px; color: #0f172a;">Dashboard Active</div>
                        <div class="activity-time" style="font-size: 12px; color: #64748b;">Logged in securely</div>
                    </div>
                </div>
            `;
        }

        activityContainer.innerHTML = activityHTML;
    }

    // 3. DYNAMIC TEAM UPDATES (FROM PROJECTS API)
    const updatesContainer = document.getElementById("teamUpdatesContainer");
    if (updatesContainer) {
        try {
            const projRes = await fetch("http://localhost:8080/api/projects", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (projRes.ok) {
                const projects = await projRes.json();
                if (projects.length > 0) {
                    updatesContainer.innerHTML = projects.slice(0, 3).map(p => `
                        <div class="update-item" style="display: flex; align-items: flex-start; gap: 14px; padding-bottom: 14px; border-bottom: 1px solid #f1f5f9;">
                            <div class="update-icon" style="width: 38px; height: 38px; border-radius: 10px; background: rgba(0, 122, 122, 0.1); color: #007a7a; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <i class="fa-solid fa-diagram-project"></i>
                            </div>
                            <div class="update-content">
                                <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${p.title}</h4>
                                <p style="margin: 0; font-size: 12px; color: #64748b;">${p.progress}% Complete • Assigned: ${p.assignedTeam || 'Team'}</p>
                            </div>
                        </div>
                    `).join('');
                }
            }
        } catch (e) { console.error(e); }
    }
}

function updateDashboardKPIs(data) {
    // Attempt to locate standard KPI card h2 elements by DOM structure or specific IDs
    // Since dashboard.html might not have IDs on these <h2> tags, we can target them via class query
    const kpiValues = document.querySelectorAll(".kpi-card h2");
    if (kpiValues.length >= 4) {
        kpiValues[0].innerText = data.attendancePercentage || "N/A";
        kpiValues[1].innerText = data.leavesTaken !== undefined ? data.leavesTaken : "N/A";
        kpiValues[2].innerText = data.balanceLeaves !== undefined ? data.balanceLeaves : "N/A";
        kpiValues[3].innerText = data.todayStatus || "N/A";
    }
}

// 2. Handle Check-In
async function handleCheckIn() {
    const token = localStorage.getItem("token");
    
    try {
        const response = await fetch(`${ATTENDANCE_API_URL}/check-in`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            fetchDashboardMetrics(); // Refresh all KPIs
            alert("Successfully checked in for the day!");
        } else {
            const errorMsg = await response.text();
            alert("Check-in failed: " + errorMsg);
        }
    } catch (error) {
        console.error("Check-in error:", error);
    }
}

// 3. Handle Check-Out
async function handleCheckOut() {
    const token = localStorage.getItem("token");
    
    try {
        const response = await fetch(`${ATTENDANCE_API_URL}/check-out`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            fetchDashboardMetrics(); // Refresh all KPIs
            alert("Successfully checked out. Have a great evening!");
        } else {
            const errorMsg = await response.text();
            alert("Check-out failed: " + errorMsg);
        }
    } catch (error) {
        console.error("Check-out error:", error);
    }
}

// 4. Update the Dashboard UI
function updateAttendanceUI(data) {
    const checkInBtn = document.getElementById("checkInBtn");
    const checkOutBtn = document.getElementById("checkOutBtn");
    const statusText = document.getElementById("attendanceStatusText"); // Optional: if you have a status label

    if (!checkInBtn || !checkOutBtn) return;

    if (data.status === "NOT_CHECKED_IN") {
        checkInBtn.disabled = false;
        checkOutBtn.disabled = true;
        if (statusText) statusText.innerText = "You have not checked in yet today.";
    } 
    else if (data.status === "CHECKED_IN") {
        checkInBtn.disabled = true;
        checkInBtn.innerText = data.checkInTime ? `Checked In (${data.checkInTime})` : "Checked In";
        checkOutBtn.disabled = false;
        if (statusText) statusText.innerText = "Currently clocked in.";
    } 
    else if (data.status === "CHECKED_OUT") {
        checkInBtn.disabled = true;
        checkInBtn.innerText = data.checkInTime ? `Checked In (${data.checkInTime})` : "Checked In";
        checkOutBtn.disabled = true;
        checkOutBtn.innerText = data.checkOutTime ? `Checked Out (${data.checkOutTime})` : "Checked Out";
        if (statusText) statusText.innerText = "Shift completed for today.";
    }
}

// Reset Attendance for Testing
async function resetAttendance() {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${ATTENDANCE_API_URL}/reset`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (response.ok) {
            alert("Attendance reset! You can now check in again.");
            fetchDashboardMetrics();
        }
    } catch (error) {
        console.error("Error resetting attendance:", error);
    }
}

// 5. Populate Mock Data for Dashboard Lists
function populateMockData() {
    // Recent Activity
    const activityContainer = document.getElementById("activityContainer");
    if (activityContainer && activityContainer.innerHTML.trim() === "") {
        activityContainer.innerHTML = `
            <div class="activity-item">
                <div class="activity-left">
                    <div class="activity-icon"><i class="fa-solid fa-right-to-bracket"></i></div>
                    <div>
                        <div class="activity-title">Logged In</div>
                        <div class="activity-time">Today, 09:00 AM</div>
                    </div>
                </div>
            </div>
            <div class="activity-item">
                <div class="activity-left">
                    <div class="activity-icon" style="background:#fef3c7; color:#d97706;"><i class="fa-solid fa-file-invoice"></i></div>
                    <div>
                        <div class="activity-title">Leave Request Approved</div>
                        <div class="activity-time">Yesterday, 04:30 PM</div>
                    </div>
                </div>
            </div>
            <div class="activity-item">
                <div class="activity-left">
                    <div class="activity-icon" style="background:#e0e7ff; color:#4f46e5;"><i class="fa-solid fa-bullhorn"></i></div>
                    <div>
                        <div class="activity-title">Project Deadline Updated</div>
                        <div class="activity-time">2 days ago</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Team Updates
    const updatesContainer = document.getElementById("teamUpdatesContainer");
    if (updatesContainer && updatesContainer.innerHTML.trim() === "") {
        updatesContainer.innerHTML = `
            <div class="update-item">
                <div class="update-icon" style="background: #eef8f8; color: #0d9488;">
                    <i class="fa-solid fa-rocket"></i>
                </div>
                <div class="update-content">
                    <h4>New Release Deployed</h4>
                    <p>Version 2.4.0 is now live in production environment.</p>
                </div>
            </div>
            <div class="update-item">
                <div class="update-icon" style="background: #fef2f2; color: #ef4444;">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div class="update-content">
                    <h4>Maintenance Scheduled</h4>
                    <p>Server downtime expected this Saturday at 2:00 AM.</p>
                </div>
            </div>
        `;
    }



    // Initialize Chart if canvas exists
    const chartCanvas = document.getElementById('attendanceChart');
    if (chartCanvas && !window.attendanceChartInstance) {
        const ctx = chartCanvas.getContext('2d');
        window.attendanceChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                datasets: [{
                    label: 'Hours Worked',
                    data: [8, 8.5, 7.5, 9, 8],
                    backgroundColor: '#0d9488',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }
}