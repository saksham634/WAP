const ATTENDANCE_API_URL = "http://localhost:8080/api/attendance";

// Run this as soon as the page loads
document.addEventListener("DOMContentLoaded", () => {
    fetchAttendanceStatus();
});

// 1. Fetch current status
async function fetchAttendanceStatus() {
    const token = localStorage.getItem("token");
    if (!token) return; // Let your routing logic handle missing tokens

    try {
        const response = await fetch(`${ATTENDANCE_API_URL}/status`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateAttendanceUI(data);
        }
    } catch (error) {
        console.error("Error fetching attendance status:", error);
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
            const data = await response.json();
            updateAttendanceUI(data);
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
            const data = await response.json();
            updateAttendanceUI(data);
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
        checkInBtn.innerText = `Checked In (${data.checkInTime})`;
        checkOutBtn.disabled = false;
        if (statusText) statusText.innerText = "Currently clocked in.";
    } 
    else if (data.status === "CHECKED_OUT") {
        checkInBtn.disabled = true;
        checkInBtn.innerText = `Checked In (${data.checkInTime})`;
        checkOutBtn.disabled = true;
        checkOutBtn.innerText = `Checked Out (${data.checkOutTime})`;
        if (statusText) statusText.innerText = "Shift completed for today.";
    }
}