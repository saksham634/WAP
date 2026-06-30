console.log("HR DASHBOARD LOADER STARTED");

document.addEventListener("DOMContentLoaded", () => {
    
    // IMPORTANT: If your sidebar file is inside a "components" folder, 
    // change this string to: "../../../shared/components/sidebar.html"
    const sidebarPath = "/shared/components/sidebar-hr.html"; 

    fetch(sidebarPath)
        .then(res => {
            if (!res.ok) throw new Error("Sidebar not found at: " + sidebarPath);
            return res.text();
        })
        .then(html => {
            const sidebarContainer = document.getElementById("global-sidebar");
            if(sidebarContainer) {
                sidebarContainer.innerHTML = html;
                
                const currentPage = window.location.pathname
                    .split("/")
                    .pop()
                    .replace(".html", "");

                document.querySelectorAll(".sidebar a[data-page]").forEach(link => {
                    if (link.dataset.page === currentPage) {
                        link.parentElement.classList.add("active");
                    }
                });
            }
        })
        .catch(err => console.error("Error loading global sidebar:", err));
});