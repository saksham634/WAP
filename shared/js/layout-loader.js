fetch("/shared/components/sidebar.html")
    .then(res => res.text())
    .then(html => {
        document.getElementById("global-sidebar").innerHTML = html;
    })
    .catch(err => console.error("Sidebar load failed:", err));