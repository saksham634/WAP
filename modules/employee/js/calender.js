// ==========================================================
// CALENDAR MODULE
//
// Responsibilities:
// • Generate monthly calendar
// • Highlight today's date
// • Mark Present / Leave / Absent days
// • Render calendar dynamically
// ==========================================================


// ==========================================================
// IMPORTS
// ==========================================================

import { getAttendanceData } from "./api.js";


// ==========================================================
// INITIALIZE CALENDAR
// ==========================================================

export async function initializeCalendar() {

    const attendanceData = await getAttendanceData();

    renderCalendar(new Date(), attendanceData);

}


// ==========================================================
// RENDER CALENDAR
// ==========================================================

function renderCalendar(currentDate, attendanceData) {

    const calendar = document.getElementById("attendanceCalendar");

    if (!calendar) return;

    calendar.innerHTML = "";

    const year = currentDate.getFullYear();

    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();

    const totalDays = new Date(year, month + 1, 0).getDate();

    createWeekHeader(calendar);

    createBlankDays(calendar, firstDay);

    createMonthDays(
        calendar,
        totalDays,
        month,
        year,
        attendanceData
    );

}


// ==========================================================
// WEEK HEADER
// ==========================================================

function createWeekHeader(calendar) {

    const weekDays = [

        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"

    ];

    weekDays.forEach(day => {

        const element = document.createElement("div");

        element.className = "calendar-weekday";

        element.textContent = day;

        calendar.appendChild(element);

    });

}


// ==========================================================
// EMPTY CELLS
// ==========================================================

function createBlankDays(calendar, count) {

    for (let i = 0; i < count; i++) {

        const blank = document.createElement("div");

        blank.className = "calendar-empty";

        calendar.appendChild(blank);

    }

}


// ==========================================================
// MONTH DAYS
function createMonthDays(
    calendar,
    totalDays,
    month,
    year,
    attendanceData
) {
    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement("div");
        cell.classList.add("calendar-day");
        cell.textContent = day;
        if (isToday(day, month, year)) {
            cell.classList.add("today");
        }

        if (attendanceData.present.includes(day)) {
            cell.classList.add("present");
        }

        if (attendanceData.leave.includes(day)) {
            cell.classList.add("leave");
        }

        if (attendanceData.absent.includes(day)) {
            cell.classList.add("absent");
        }
        calendar.appendChild(cell);
    }
}

// CHECK TODAY
function isToday(day, month, year) {
    const today = new Date();
    return (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
    );
}