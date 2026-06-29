//    ATTENDANCE DASHBOARD
//    Main JavaScript Entry File

//    Responsibilities:
//    • Import all attendance modules
//    • Initialize modules
//    • Keep this file clean

// IMPORT MODULES
import { initializeClock } from "./clock.js";
import { initializeCalendar } from "./calendar.js";
import { loadUpcomingHolidays } from "./holidays.js";
import { loadUpcomingLeaves } from "./leaves.js";
import { initializeSidebar } from "./sidebar.js";

// INITIALIZE DASHBOARD
function initialize() {
    console.log("Attendance Dashboard Initialized");
    initializeSidebar();
    initializeClock();
    initializeCalendar();
    loadUpcomingHolidays();
    loadUpcomingLeaves();
}

// PAGE LOAD
document.addEventListener("DOMContentLoaded", initialize);