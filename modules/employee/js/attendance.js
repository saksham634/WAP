//    ATTENDANCE DASHBOARD
//    Main JavaScript Entry File

// IMPORT MODULES
import { initializeClock } from "./clock.js";
import { initializeCalendar } from "./calender.js"; // Note the 'e' in calender.js

// INITIALIZE DASHBOARD
function initialize() {
    console.log("Attendance Dashboard Initialized");
    initializeClock();
    initializeCalendar();
    
    // Mock Holidays since holidays.js doesn't exist
    const holidayList = document.getElementById("holidayList");
    if (holidayList) {
        holidayList.innerHTML = `
            <div class="holiday-item" style="display:flex; justify-content:space-between; align-items:center; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <div class="holiday-date" style="text-align:center; background:#f3f4f6; padding:8px 12px; border-radius:8px;">
                    <h4 style="margin:0; font-size:18px; color:var(--primary-color);">15</h4>
                    <span style="font-size:12px; color:#6b7280; font-weight:bold;">AUG</span>
                </div>
                <div class="holiday-info" style="flex:1; margin-left:15px;">
                    <h5 style="margin:0; font-size:15px; color:#1f2937;">Independence Day</h5>
                    <p style="margin:0; font-size:13px; color:#6b7280;">National Holiday</p>
                </div>
            </div>
            <div class="holiday-item" style="display:flex; justify-content:space-between; align-items:center; padding: 10px 0;">
                <div class="holiday-date" style="text-align:center; background:#f3f4f6; padding:8px 12px; border-radius:8px;">
                    <h4 style="margin:0; font-size:18px; color:var(--primary-color);">02</h4>
                    <span style="font-size:12px; color:#6b7280; font-weight:bold;">OCT</span>
                </div>
                <div class="holiday-info" style="flex:1; margin-left:15px;">
                    <h5 style="margin:0; font-size:15px; color:#1f2937;">Gandhi Jayanti</h5>
                    <p style="margin:0; font-size:13px; color:#6b7280;">National Holiday</p>
                </div>
            </div>
        `;
    }
}

// PAGE LOAD
document.addEventListener("DOMContentLoaded", initialize);