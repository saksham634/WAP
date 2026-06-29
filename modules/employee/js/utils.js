// UTILITIES MODULE

// Responsibilities:
// • Common helper functions
// • Date formatting
// • Time formatting
// • Month names
// • Capitalize text


// FORMAT DATE
export function formatDate(date) {
    return date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// FORMAT TIME
export function formatTime(date) {
    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
}

// MONTH NAME
export function getMonthName(monthIndex) {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    return months[monthIndex];
}

// DAY NAME
export function getDayName(dayIndex) {
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];
    return days[dayIndex];
}

// CAPITALIZE TEXT
export function capitalize(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// CREATE ELEMENT
export function createElement(tag, className = "", text = "") {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }

    if (text) {
        element.textContent = text;
    }
    return element;
}

// CLEAR ELEMENT
export function clearElement(element) {
    if (!element) return;
    element.innerHTML = "";
}