console.log("Recent Activity Loaded");

const activities = [
    {
        title: "New Employee Joined",
        description: "Emma Wilson joined the HR department.",
        time: "10 mins ago",
        icon: "fa-solid fa-user-plus"
    },
    {
        title: "Leave Request Approved",
        description: "Michael Johnson's leave request has been approved.",
        time: "35 mins ago",
        icon: "fa-solid fa-calendar-check"
    },
    {
        title: "Payroll Processed",
        description: "Monthly payroll has been successfully processed.",
        time: "1 hour ago",
        icon: "fa-solid fa-money-check-dollar"
    },
    {
        title: "Training Completed",
        description: "Sophia Lee completed Cyber Security Training.",
        time: "2 hours ago",
        icon: "fa-solid fa-graduation-cap"
    }
];

const list = document.querySelector(".activity-list");

activities.forEach(activity => {

    list.innerHTML += `
        <div class="activity-item">

            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>

            <div class="activity-content">

                <h4 class="activity-title">
                    ${activity.title}
                </h4>

                <p class="activity-description">
                    ${activity.description}
                </p>

                <span class="activity-time">
                    ${activity.time}
                </span>

            </div>

        </div>
    `;

});