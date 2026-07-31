document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    fetchSettings();

    document.getElementById("generalSettingsForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const companyName = document.getElementById("companyName").value;
        const timezone = document.getElementById("timezoneSelect").value;

        try {
            const res = await fetch("http://localhost:8080/api/admin/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ companyName, timezone })
            });

            if (res.ok) alert("General settings saved successfully!");
            else alert("Failed to save settings");
        } catch (error) {
            alert("Error saving settings.");
        }
    });

    document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (newPassword !== confirmPassword) {
            alert("New passwords do not match!");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/api/admin/users/me/password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();
            if (res.ok) {
                alert("Password changed successfully!");
                document.getElementById("changePasswordForm").reset();
            } else {
                alert(data.error || "Failed to change password");
            }
        } catch (error) {
            alert("Error changing password.");
        }
    });
});

function initTabs() {
    const tabs = document.querySelectorAll(".settings-nav button");
    const contents = document.querySelectorAll(".settings-form-area");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.style.display = "none");

            tab.classList.add("active");
            const target = tab.getAttribute("data-tab");
            document.getElementById(target + "-tab").style.display = "block";
        });
    });
}

async function fetchSettings() {
    const token = localStorage.getItem("token");
    try {
        const userRes = await fetch("http://localhost:8080/api/admin/users/me", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (userRes.ok) {
            const user = await userRes.json();
            document.getElementById("userEmailReadOnly").value = user.email;
        }

        const settingsRes = await fetch("http://localhost:8080/api/admin/settings", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (settingsRes.ok) {
            const settings = await settingsRes.json();
            if (settings.companyName) document.getElementById("companyName").value = settings.companyName;
            if (settings.timezone) document.getElementById("timezoneSelect").value = settings.timezone;
        }
    } catch (e) {
        console.error("Failed to load settings:", e);
    }
}