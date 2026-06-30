document.addEventListener("DOMContentLoaded", () => {
    
    // Absolute path to the working HR sidebar
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
                
                // Get the current HTML file name (e.g., "leave", "attendance")
                const currentPage = window.location.pathname
                    .split("/")
                    .pop()
                    .replace(".html", "");

                // Match it with the data-page attribute in the sidebar and highlight
                document.querySelectorAll(".sidebar a[data-page]").forEach(link => {
                    if (link.dataset.page === currentPage) {
                        link.parentElement.classList.add("active");
                    }
                });
            }
        })
        .catch(err => console.error("Error loading global sidebar:", err));
});