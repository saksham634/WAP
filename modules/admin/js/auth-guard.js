document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    
    // 1. Authentication Guard: Check if logged in, else redirect to login
    if (!token) {
        window.location.href = "../../../public/Login/LogIn.html";
        return;
    }

    // 2. Load User Profile details in the top right header via API
    fetch("http://localhost:8080/api/admin/users/me", {
        headers: { "Authorization": `Bearer ${token}` },
        cache: "no-store"
    })
    .then(res => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
    })
    .then(user => {
        const userName = user.fullName || "Admin User";
        const employeeId = user.employeeId;
        const profilePicture = user.profilePicture;
        const role = user.role;
        
        // Update Profile Name display
        const profileNameEl = document.querySelectorAll(".right-panel header .user-name, .admin-name, h4.admin-title, div span.admin-text, .user-profile span, .profile-details h3, .profile-menu span");
        profileNameEl.forEach(el => {
            el.textContent = employeeId ? `${userName} (${employeeId})` : userName;
        });
        
        const profileRoleEl = document.querySelectorAll(".profile-details span");
        profileRoleEl.forEach(el => {
            el.textContent = role === "ROLE_ADMIN" ? "System Administrator" : (role === "ROLE_HR" ? "HR Manager" : "Employee");
        });
        
        const avatarBadge = document.querySelectorAll(".avatar-badge, .right-panel .avatar, #userAvatar, .user-avatar, .profile-avatar, .profile-menu img");
        avatarBadge.forEach(el => {
            if (profilePicture) {
                el.style.background = `url(${profilePicture}) center/cover`;
                el.style.color = "transparent";
                el.textContent = "";
            } else {
                const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
                el.style.background = "linear-gradient(135deg, #1f2937, #4b5563)";
                el.style.color = "white";
                el.textContent = initials;
            }
        });

        injectProfileModal(user);
    })
    .catch(err => {
        console.error("Error fetching user profile:", err);
        const fallbackUser = { fullName: "Admin User", email: "admin@example.com", profilePicture: null };
        injectProfileModal(fallbackUser);
    });

    // 3. Handle Logout functionality globally via event delegation (fallback)
    document.body.addEventListener("click", (e) => {
        const logoutTarget = e.target.closest("#logoutBtn, .logout-btn, .logout-link, sidebar .logout, a[href*='logout']");
        
        if (logoutTarget || (e.target.innerText && e.target.innerText.trim().toLowerCase() === 'logout')) {
            performLogout(e);
        }
    });
});

// Make performLogout globally available
window.performLogout = function(e) {
    if (e) e.preventDefault();
    localStorage.clear();
    window.location.href = "../../../public/Login/LogIn.html";
};

function injectProfileModal(user) {
    if (document.getElementById("profileSettingsModal")) return;

    const modalHtml = `
        <div id="profileSettingsModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center;">
            <div style="background: white; padding: 2rem; border-radius: 8px; width: 400px; max-width: 90%; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="margin: 0; font-size: 1.25rem;">Personal Profile</h2>
                    <button type="button" id="closeProfileModal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b;">&times;</button>
                </div>
                <form id="profileSettingsForm" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="text-align: center; margin-bottom: 1rem;">
                        <div id="profileImagePreview" style="width: 100px; height: 100px; border-radius: 50%; background: #e2e8f0; margin: 0 auto; overflow: hidden; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; ${user.profilePicture ? `background-image: url(${user.profilePicture})` : ''}">
                            ${!user.profilePicture ? '<i class="fa-solid fa-user" style="font-size: 3rem; color: #94a3b8;"></i>' : ''}
                        </div>
                        <label for="profileImageInput" style="display: inline-block; margin-top: 10px; cursor: pointer; color: #007a7a; font-weight: 500; font-size: 0.875rem;">Change Picture</label>
                        <input type="file" id="profileImageInput" accept="image/*" style="display: none;">
                    </div>
                    <div>
                        <label style="font-size: 0.875rem; font-weight: 500;">Full Name</label>
                        <input type="text" id="profileFullName" value="${user.fullName}" required style="width: 100%; padding: 0.5rem; margin-top: 0.25rem; border: 1px solid #cbd5e1; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="font-size: 0.875rem; font-weight: 500;">Email (Read-only)</label>
                        <input type="email" value="${user.email}" readonly style="width: 100%; padding: 0.5rem; margin-top: 0.25rem; border: 1px solid #e2e8f0; border-radius: 4px; background: #f8fafc; color: #64748b;">
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                        <button type="button" id="cancelProfileBtn" style="padding: 0.5rem 1rem; background: #e2e8f0; color: #334155; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
                        <button type="submit" style="padding: 0.5rem 1rem; background: #007a7a; color: white; border: none; border-radius: 4px; cursor: pointer;">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);

    const modal = document.getElementById("profileSettingsModal");
    let currentBase64Image = user.profilePicture || null;

    document.getElementById("profileImageInput").addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                currentBase64Image = event.target.result;
                document.getElementById("profileImagePreview").style.backgroundImage = \`url(\${currentBase64Image})\`;
                document.getElementById("profileImagePreview").innerHTML = '';
            };
            reader.readAsDataURL(file);
        }
    });

    const openModal = () => { modal.style.display = "flex"; };
    const closeModal = () => { modal.style.display = "none"; };

    document.querySelectorAll(".profile-section, .profile-avatar, .profile-details, .profile-menu").forEach(el => {
        el.style.cursor = "pointer";
        el.addEventListener("click", (e) => {
            // Prevent bubbling if we click a child element inside .profile-section
            if (e.target !== e.currentTarget && e.currentTarget.classList.contains('profile-section')) {
                return;
            }
            openModal();
        });
    });

    document.getElementById("closeProfileModal").addEventListener("click", closeModal);
    document.getElementById("cancelProfileBtn").addEventListener("click", closeModal);

    document.getElementById("profileSettingsForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const fullName = document.getElementById("profileFullName").value;
        const token = localStorage.getItem("token");

        fetch("http://localhost:8080/api/admin/users/me/profile", {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": \`Bearer \${token}\`
            },
            body: JSON.stringify({ fullName: fullName, profilePicture: currentBase64Image })
        })
        .then(res => res.json())
        .then(data => {
            if(data.error) alert(data.error);
            else {
                alert("Profile updated successfully!");
                window.location.reload();
            }
        })
        .catch(err => alert("Error updating profile: " + err));
    });
}