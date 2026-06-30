const sidebarContainer = document.getElementById("global-sidebar");
const sidebarType = sidebarContainer.dataset.sidebar;

fetch(`../../../shared/components/sidebar/${sidebarType}.html`)
    .then(res => res.text())
    .then(html => {
        sidebarContainer.innerHTML = html;
        console.log("Sidebar Loaded");
        const currentPage = window.location.pathname
            .split("/")
            .pop()
            .replace(".html", "");
        console.log("Current Page =", currentPage);

        // Remove existing active classes
        document.querySelectorAll(".sidebar-menu li").forEach(item => {
            item.classList.remove("active");
        });

        // Add active class to matching page
        document.querySelectorAll(".sidebar a[data-page]").forEach(link => {

            console.log(
                "Link =", link.dataset.page,
                "| Equal? =", link.dataset.page === currentPage
            );

            if (link.dataset.page === currentPage) {
                console.log("MATCH FOUND!");
                link.parentElement.classList.add("active");
            }
        });
        console.log(document.querySelector(".sidebar-menu li.active"));
    })
    .catch(error => {
        console.error("Sidebar failed to load:", error);
    });