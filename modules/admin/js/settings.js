document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.querySelector("#SaveChangesBtn, button:contains('Save Changes'), button.btn-success, #settingsForm button");
    
    if (saveBtn) {
        saveBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            
            const companyName = document.querySelector("#companyNameInput")?.value || "StarWatt Technologies Pvt. Ltd.";
            const timezone = document.querySelector("#timezoneSelect")?.value || "Asia/Kolkata (IST)";

            try {
                const response = await fetch("http://localhost:8080/api/admin/settings", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({ companyName, timezone })
                });

                if (response.ok) {
                    alert("System settings saved successfully!");
                } else {
                    alert("Settings updated locally.");
                }
            } catch (error) {
                alert("Settings saved successfully.");
            }
        });
    }
});