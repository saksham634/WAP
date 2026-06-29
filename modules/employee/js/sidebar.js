// SIDEBAR MODULE

// Responsibilities:
// • Highlight active menu
// • Handle logout
// • Future sidebar interactions


// INITIALIZE SIDEBAR
export function initializeSidebar() {
    highlightActiveMenu();
    initializeLogout();
}

// HIGHLIGHT ACTIVE MENU
function highlightActiveMenu() {
    const currentPage = window.location.pathname.split("/").pop();
    const menuLinks = document.querySelectorAll(".sidebar-menu a");
    menuLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (!href) return;

        if (href === currentPage) {
            link.parentElement.classList.add("active");
        } 
        else {
            link.parentElement.classList.remove("active");
        }
    });
}

// LOGOUT
function initializeLogout() {
    const logoutButton = document.querySelector(".sidebar-bottom a");
    if (!logoutButton) return;
    logoutButton.addEventListener("click", function (event) {
        event.preventDefault();
        const confirmed = confirm("Are you sure you want to logout?");
        if (confirmed) {
            // Spring Security Logout URL
            // window.location.href = "/logout";
            console.log("Logout Successful");
        }
    });
}