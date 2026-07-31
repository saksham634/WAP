// SIDEBAR MODULE

// Responsibilities:
// • Highlight active menu
// • Handle logout
// • Future sidebar interactions


// INITIALIZE SIDEBAR
export function initializeSidebar() {
    highlightActiveMenu();
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
