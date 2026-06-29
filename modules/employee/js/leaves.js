// LEAVES MODULE

// Responsibilities:
// • Store upcoming leave data
// • Render upcoming leaves
// • Populate the leave list
// • Replace with Spring Boot API later


// UPCOMING LEAVES (Dummy Data)
const upcomingLeaves = [
    {
        day: "05",
        month: "JUL",
        title: "Casual Leave",
        description: "Approved"
    },

    {
        day: "18",
        month: "JUL",
        title: "Annual Leave",
        description: "Pending Approval"
    }
];

// LOAD UPCOMING LEAVES
export function loadUpcomingLeaves() {
    const container = document.getElementById("leaveList");
    if (!container) return;
    container.innerHTML = "";
    let html = "";
    upcomingLeaves.forEach(leave => {
        html += `
            <div class="leave-item">
                <div class="date-box">
                    <strong>${leave.day}</strong>
                    <span>${leave.month}</span>
                </div>

                <div class="details">
                    <h4>${leave.title}</h4>
                    <p>${leave.description}</p>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}