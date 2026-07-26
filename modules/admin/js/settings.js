document.addEventListener("DOMContentLoaded", () => {
    const sidebarPath = "../../../shared/components/sidebar-admin.html"; 
    fetch(sidebarPath)
        .then(res => res.text())
        .then(html => {
            const sidebarContainer = document.getElementById("global-sidebar");
            if(sidebarContainer) {
                sidebarContainer.innerHTML = html;
                const currentPage = window.location.pathname.split("/").pop().replace(".html", "");
                document.querySelectorAll(".sidebar a[data-page]").forEach(link => {
                    if (link.dataset.page === currentPage) link.parentElement.classList.add("active");
                });
            }
        });
});