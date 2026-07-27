document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    
    // 1. Authentication Guard: Check if logged in, else redirect to login
    if (!token) {
        window.location.href = "../../../index.html"; // Adjust relative path to your Login.html if needed
        return;
    }

    // 2. Load User Profile details in the top right header if stored
    const userName = localStorage.getItem("userName") || "Admin User";
    const userRole = localStorage.getItem("role") || "ROLE_ADMIN";
    
    // Update Profile Name display if element exists
    const profileNameEl = document.querySelector(".right-panel header .user-name, .admin-name, h4.admin-title, div span.admin-text, .user-profile span");
    
    // Generate initials for avatar badge (e.g., "AD" from "Admin User")
    const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
    const avatarBadge = document.querySelector(".avatar-badge, .right-panel .avatar, #userAvatar, .user-avatar");
    if (avatarBadge) {
        avatarBadge.textContent = initials;
    }

    // 3. Handle Logout functionality globally
    const logoutBtn = document.getElementById("logoutBtn") || document.querySelector("a[href*='logout'], .logout-link, sidebar .logout, div:has(> i.fa-sign-out-alt), button:has(i.fa-sign-out-alt), a:has(i.fa-sign-out-alt)");
    
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "../../../index.html"; // Point to your login page
        });
    }
});