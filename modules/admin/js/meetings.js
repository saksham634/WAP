console.log("Meetings Loaded");

const meetings = [
    {
        time: "09:30",
        period: "AM",
        title: "HR Team Meeting",
        location: "Conference Room A",
        participants: ["EW", "JB", "SL"]
    },
    {
        time: "11:00",
        period: "AM",
        title: "Project Planning",
        location: "Meeting Room 2",
        participants: ["AP", "RK", "MN", "JS"]
    },
    {
        time: "03:00",
        period: "PM",
        title: "Client Review",
        location: "Online (Teams)",
        participants: ["AD", "EW"]
    }
];

const list = document.querySelector(".meeting-list");

meetings.forEach(meeting => {

    const participantsHTML = meeting.participants
        .map(initials => `
            <div class="participant">
                ${initials}
            </div>
        `)
        .join("");

    list.innerHTML += `
        <div class="meeting-item">

            <div class="meeting-time">
                <span class="time">${meeting.time}</span>
                <span class="period">${meeting.period}</span>
            </div>

            <div class="meeting-details">

                <h4 class="meeting-title">
                    ${meeting.title}
                </h4>

                <p class="meeting-location">
                    <i class="fa-solid fa-location-dot"></i>
                    ${meeting.location}
                </p>

                <div class="meeting-participants">
                    ${participantsHTML}
                    <span class="participant-count">
                        ${meeting.participants.length} Participants
                    </span>
                </div>

            </div>

        </div>
    `;

});