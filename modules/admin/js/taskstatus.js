console.log("Task Status Loaded");

const taskData = {
    total: 84,
    completed: 67,
    pending: 11,
    overdue: 6
};

const percent = Math.round(
    (taskData.completed / taskData.total) * 100
);

const circle = document.querySelector(".task-circle");
circle.style.background = `
conic-gradient(
    var(--primary) ${percent * 3.6}deg,
    #e8ecef ${percent * 3.6}deg
)`;

document.querySelector(".task-percent").textContent = `${percent}%`;
document.querySelector(".completed-count").textContent = taskData.completed;
document.querySelector(".pending-count").textContent = taskData.pending;
document.querySelector(".overdue-count").textContent = taskData.overdue;