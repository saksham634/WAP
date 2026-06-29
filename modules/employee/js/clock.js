// CLOCK MODULE

// Responsibilities:
// • Display current date
// • Display current time
// • Update time every second


// DATE & TIME FORMAT OPTIONS
const DATE_OPTIONS = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
};

const TIME_OPTIONS = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
};

// CLOCK INTERVAL
let clockInterval = null;

// UPDATE CLOCK
function updateClock() {
    const now = new Date();
    const dateElement = document.getElementById("currentDate");
    const clockElement = document.getElementById("liveClock");
    if (!dateElement || !clockElement) return;

    // Update Current Date
    dateElement.textContent = now.toLocaleDateString("en-IN", DATE_OPTIONS);

    // Update Current Time
    clockElement.textContent = now.toLocaleTimeString("en-IN", TIME_OPTIONS);
}

// INITIALIZE CLOCK
export function initializeClock() {

    // Prevent multiple intervals
    if (clockInterval) {
        clearInterval(clockInterval);
    }

    // Initial update
    updateClock();

    // Start live clock
    clockInterval = setInterval(updateClock, 1000);
}

// STOP CLOCK
export function stopClock() {
    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
    }
}