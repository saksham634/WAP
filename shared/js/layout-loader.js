const sidebarContainer = document.getElementById("global-sidebar");
const sidebarType = sidebarContainer ? sidebarContainer.dataset.sidebar : "employee";

fetch(`../../../shared/components/sidebar/${sidebarType}.html?v=${Date.now()}`)
    .then(res => res.text())
    .then(html => {
        if (sidebarContainer) {
            sidebarContainer.innerHTML = html;
        }
        console.log("Sidebar Loaded");
        const currentPage = window.location.pathname
            .split("/")
            .pop()
            .replace(".html", "");

        // Remove existing active classes
        document.querySelectorAll(".sidebar-menu li").forEach(item => {
            item.classList.remove("active");
        });

        // Add active class to matching page
        document.querySelectorAll(".sidebar a[data-page]").forEach(link => {
            if (link.dataset.page === currentPage) {
                link.parentElement.classList.add("active");
            }
        });

        // Universal logout handler
        const attachUniversalLogout = (e) => {
            e.preventDefault();
            e.stopPropagation();
            localStorage.clear();
            window.location.href = '../../../public/Login/LogIn.html';
        };

        document.querySelectorAll('.sidebar-bottom a, .logout-btn').forEach(el => {
            el.addEventListener('click', attachUniversalLogout);
        });

        document.querySelectorAll('.sidebar-bottom span').forEach(el => {
            if (el.textContent.trim().toLowerCase() === 'logout') {
                el.style.cursor = 'pointer';
                el.addEventListener('click', attachUniversalLogout);
            }
        });

        // Initialize Universal Mobile Toggle & Permissions
        initUniversalMobileSidebar();
        enforcePermissionsAndProfile(sidebarType, currentPage);
    })
    .catch(error => {
        console.error("Sidebar failed to load:", error);
    });

// =========================================================
// UNIVERSAL RESPONSIVE SIDEBAR TOGGLE SYSTEM
// =========================================================
function initUniversalMobileSidebar() {
    // 1. Ensure backdrop overlay exists
    let overlay = document.querySelector(".sidebar-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "sidebar-overlay";
        document.body.appendChild(overlay);
    }

    // 2. Ensure mobile-toggle button exists in header
    let toggleBtn = document.querySelector(".mobile-toggle");
    if (!toggleBtn) {
        const headerWelcome = document.querySelector(".page-header .welcome-section") || document.querySelector(".page-header");
        if (headerWelcome) {
            toggleBtn = document.createElement("button");
            toggleBtn.className = "mobile-toggle";
            toggleBtn.setAttribute("aria-label", "Toggle Menu");
            toggleBtn.innerHTML = `<i class="fa-solid fa-bars"></i>`;
            headerWelcome.prepend(toggleBtn);
        }
    } else {
        // Ensure FontAwesome icon if text-only button
        if (!toggleBtn.querySelector("i")) {
            toggleBtn.innerHTML = `<i class="fa-solid fa-bars"></i>`;
        }
    }

    // 3. Toggle Sidebar Open / Close
    const closeSidebar = () => {
        const sidebar = document.querySelector(".sidebar") || document.getElementById("global-sidebar");
        const globalSidebar = document.getElementById("global-sidebar");
        
        if (sidebar) sidebar.classList.remove("sidebar-open", "open");
        if (globalSidebar) globalSidebar.classList.remove("sidebar-open", "open");
        if (overlay) overlay.classList.remove("active");
    };

    const openSidebar = () => {
        const sidebar = document.querySelector(".sidebar") || document.getElementById("global-sidebar");
        const globalSidebar = document.getElementById("global-sidebar");

        if (sidebar) sidebar.classList.add("sidebar-open", "open");
        if (globalSidebar) globalSidebar.classList.add("sidebar-open", "open");
        if (overlay) overlay.classList.add("active");
    };

    if (toggleBtn) {
        toggleBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const sidebar = document.querySelector(".sidebar") || document.getElementById("global-sidebar");
            const isOpen = sidebar && (sidebar.classList.contains("sidebar-open") || sidebar.classList.contains("open"));

            if (isOpen) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    if (overlay) {
        overlay.addEventListener("click", closeSidebar);
    }

    // Close on navigation link click (mobile)
    document.querySelectorAll(".sidebar-menu a").forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 992) {
                closeSidebar();
            }
        });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeSidebar();
        }
    });

    // Auto-close overlay when resizing to desktop
    window.addEventListener("resize", () => {
        if (window.innerWidth > 992) {
            closeSidebar();
        }
    });
}

// =========================================================
// UNIVERSAL PROFILE & PERMISSIONS ENFORCER
// =========================================================
async function enforcePermissionsAndProfile(sidebarType, currentPage) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Default Profile Info
    const userName = localStorage.getItem("fullName") || localStorage.getItem("userName") || localStorage.getItem("userEmail") || "User";
    let roleStr = "Employee";
    if (role === "ROLE_ADMIN") roleStr = "System Administrator";
    if (role === "ROLE_HR") roleStr = "HR Manager";

    // Update welcome headings
    document.querySelectorAll('.welcome-section h1').forEach(h1 => {
        const text = h1.textContent;
        if (text.includes("Welcome")) {
            h1.textContent = `Welcome ${userName},`;
        } else if (text.includes("Good Morning")) {
            h1.textContent = `Good Morning, ${userName}`;
        }
    });

    // Initialize Interactive Top-Right Profile Dropdown & Avatar Sync
    setupUniversalProfileDropdown();
    setupUniversalDirectMessaging();

    if (role === "ROLE_ADMIN" || !token) return; // Admin has full access

    try {
        const response = await fetch("http://localhost:8080/api/admin/users/me", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const userData = await response.json();
            const permsString = userData.permissions || "";
            const userPerms = new Set(permsString.split(",").map(p => p.trim()).filter(Boolean));

            // Map pages to permission keys
            const permMap = {
                employee: {
                    "dashboard": "DASHBOARD",
                    "attendance": "ATTENDANCE",
                    "leave": "LEAVES",
                    "payroll": "PAYROLL",
                    "personal-info": "PERSONAL_INFO"
                },
                hr: {
                    "dashboard": "DASHBOARD",
                    "employee-management": "EMPLOYEE_MGMT",
                    "attendance": "ATTENDANCE_OVERVIEW",
                    "leave": "LEAVE_APPROVALS",
                    "payroll": "PAYROLL_ADMIN"
                }
            };

            const roleMap = permMap[sidebarType] || permMap["employee"];

            // 1. Disable navigation items for disabled permissions
            document.querySelectorAll(".sidebar a[data-page]").forEach(link => {
                const pageKey = link.dataset.page;
                const requiredPerm = roleMap[pageKey];

                if (requiredPerm && !userPerms.has("ALL") && !userPerms.has(requiredPerm)) {
                    link.style.opacity = "0.4";
                    link.style.cursor = "not-allowed";
                    link.title = "This feature has been disabled by System Administrator.";
                    link.innerHTML += `<i class="fa-solid fa-lock" style="margin-left: auto; font-size: 12px; color: #ef4444;"></i>`;
                    
                    link.addEventListener("click", (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        alert("Access Denied: This feature has been disabled for your account by System Administrator.");
                    }, true);
                }
            });

            // 2. Check current page permission
            const currentRequiredPerm = roleMap[currentPage];
            if (currentRequiredPerm && !userPerms.has("ALL") && !userPerms.has(currentRequiredPerm)) {
                blockCurrentPageAccess(currentRequiredPerm);
            }
        }
    } catch (e) {
        console.error("Error fetching user permissions in layout loader:", e);
    }
}

function blockCurrentPageAccess(permKey) {
    const mainContent = document.querySelector(".main-content");
    if (!mainContent) return;

    // Create Disabled Overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(248, 250, 252, 0.95);
        backdrop-filter: blur(4px);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 40px;
    `;

    overlay.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; max-width: 500px;">
            <div style="width: 70px; height: 70px; background: #fee2e2; color: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 20px auto;">
                <i class="fa-solid fa-lock"></i>
            </div>
            <h2 style="font-size: 22px; color: #0f172a; margin-bottom: 10px;">Access Restricted</h2>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                The <strong>${permKey}</strong> feature has been disabled for your account by your System Administrator. Please contact your HR or Admin if you need access.
            </p>
            <a href="./dashboard.html" class="btn btn-primary" style="padding: 10px 24px; background: #007a7a; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Return to Dashboard
            </a>
        </div>
    `;

    mainContent.style.position = "relative";
    mainContent.appendChild(overlay);
}

// =========================================================
// UNIVERSAL INTERACTIVE PROFILE DROPDOWN & CAMERA CHANGER
// =========================================================
function setupUniversalProfileDropdown() {
    const profileSections = document.querySelectorAll('.profile-section');
    if (!profileSections.length) return;

    const userName = localStorage.getItem("fullName") || localStorage.getItem("userName") || "User";
    const userEmail = localStorage.getItem("userEmail") || "user@workforce.com";
    const employeeId = localStorage.getItem("employeeId") || "EMP-001";
    const role = localStorage.getItem("role");
    let roleStr = "Employee";
    if (role === "ROLE_ADMIN") roleStr = "System Administrator";
    if (role === "ROLE_HR") roleStr = "HR Manager";

    // Update text across header profile details
    document.querySelectorAll('.profile-details h3').forEach(el => el.textContent = userName);
    document.querySelectorAll('.profile-details span').forEach(el => el.textContent = roleStr);

    const avatarLetter = userEmail ? userEmail.charAt(0).toUpperCase() : (userName !== "User" ? userName.charAt(0).toUpperCase() : "U");

    const syncAvatarImages = () => {
        const pic = localStorage.getItem("profilePicture");
        document.querySelectorAll('.profile-avatar, .profile-card-avatar').forEach(el => {
            if (pic) {
                el.style.backgroundImage = `url("${pic}")`;
                el.style.backgroundSize = "cover";
                el.style.backgroundPosition = "center";
                el.textContent = "";
            } else {
                el.style.backgroundImage = "";
                el.textContent = avatarLetter;
            }
        });
    };

    syncAvatarImages();

    profileSections.forEach(section => {
        // Remove duplicate profile-menu buttons or loose chevron arrows in HTML
        section.querySelectorAll('.profile-menu, .fa-chevron-down, .fa-ellipsis-vertical').forEach(el => {
            if (!el.classList.contains('profile-dropdown-arrow')) {
                el.remove();
            }
        });

        // Ensure exactly one chevron arrow exists
        if (!section.querySelector('.profile-dropdown-arrow')) {
            const arrow = document.createElement('i');
            arrow.className = 'fa-solid fa-chevron-down profile-dropdown-arrow';
            section.appendChild(arrow);
        }

        section.addEventListener('click', (e) => {
            e.stopPropagation();
            const existingCard = section.querySelector('.profile-dropdown-card');
            
            document.querySelectorAll('.profile-dropdown-card').forEach(card => {
                if (card !== existingCard) card.remove();
            });
            document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));

            if (existingCard) {
                existingCard.remove();
                section.classList.remove('active');
                return;
            }

            section.classList.add('active');

            // Build Profile Dropdown Card
            const card = document.createElement('div');
            card.className = 'profile-dropdown-card';

            const currentPic = localStorage.getItem("profilePicture");
            const avatarStyle = currentPic ? `background-image: url("${currentPic}"); background-size: cover; background-position: center;` : '';
            const avatarContent = currentPic ? '' : avatarLetter;

            card.innerHTML = `
                <div class="profile-card-header">
                    <div class="profile-card-avatar-wrapper" id="changeAvatarBtn" title="Click to change profile picture">
                        <div class="profile-card-avatar" style="${avatarStyle}">${avatarContent}</div>
                        <div class="profile-avatar-camera-btn">
                            <i class="fa-solid fa-camera"></i>
                        </div>
                    </div>
                    <div class="profile-card-info">
                        <h3>${userName}</h3>
                        <span class="role-badge">${roleStr}</span>
                        <div class="profile-card-detail-item">
                            <i class="fa-solid fa-envelope"></i>
                            <span>${userEmail}</span>
                        </div>
                        <div class="profile-card-detail-item">
                            <i class="fa-solid fa-id-badge"></i>
                            <span>ID: ${employeeId}</span>
                        </div>
                    </div>
                </div>

                <div class="profile-card-actions">
                    <button class="profile-card-btn primary" id="uploadFilePicBtn">
                        <i class="fa-solid fa-upload"></i>
                        <span>Upload Picture</span>
                    </button>
                    <button class="profile-card-btn" id="takeCameraPicBtn">
                        <i class="fa-solid fa-camera"></i>
                        <span>Take On-Spot Snapshot</span>
                    </button>
                    ${currentPic ? `
                    <button class="profile-card-btn danger" id="removePicBtn">
                        <i class="fa-solid fa-trash-can"></i>
                        <span>Remove Picture</span>
                    </button>` : ''}
                    <button class="profile-card-btn danger" id="cardLogoutBtn">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        <span>Logout</span>
                    </button>
                </div>
            `;

            section.appendChild(card);

            // Hidden file input
            let fileInput = document.getElementById('universalAvatarFileInput');
            if (!fileInput) {
                fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.id = 'universalAvatarFileInput';
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';
                document.body.appendChild(fileInput);
            }

            fileInput.onchange = (evt) => {
                const file = evt.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = async (re) => {
                        const dataUrl = re.target.result;
                        localStorage.setItem("profilePicture", dataUrl);
                        syncAvatarImages();
                        if (card) card.remove();
                        section.classList.remove('active');
                        
                        // Send to backend
                        const token = localStorage.getItem("token");
                        try {
                            await fetch("http://localhost:8080/api/admin/users/me/profile", {
                                method: "PUT",
                                headers: { 
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`
                                },
                                body: JSON.stringify({ profilePicture: dataUrl })
                            });
                        } catch (err) {
                            console.error("Failed to save profile picture to backend", err);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            };

            card.querySelector('#changeAvatarBtn').addEventListener('click', (e) => {
                e.stopPropagation();
                fileInput.click();
            });

            card.querySelector('#uploadFilePicBtn').addEventListener('click', (e) => {
                e.stopPropagation();
                fileInput.click();
            });

            card.querySelector('#takeCameraPicBtn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (card) card.remove();
                section.classList.remove('active');
                openCameraSnapshotModal(syncAvatarImages);
            });

            if (card.querySelector('#removePicBtn')) {
                card.querySelector('#removePicBtn').addEventListener('click', async (e) => {
                    e.stopPropagation();
                    localStorage.removeItem("profilePicture");
                    syncAvatarImages();
                    if (card) card.remove();
                    section.classList.remove('active');

                    // Send to backend
                    const token = localStorage.getItem("token");
                    try {
                        await fetch("http://localhost:8080/api/admin/users/me/profile", {
                            method: "PUT",
                            headers: { 
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({ profilePicture: null })
                        });
                    } catch (err) {
                        console.error("Failed to remove profile picture from backend", err);
                    }
                });
            }

            card.querySelector('#cardLogoutBtn').addEventListener('click', (e) => {
                e.stopPropagation();
                localStorage.clear();
                window.location.href = '../../../public/Login/LogIn.html';
            });
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.profile-section')) {
            document.querySelectorAll('.profile-dropdown-card').forEach(card => card.remove());
            document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
        }
    });
}

function openCameraSnapshotModal(onCaptureSuccess) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(4px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;

    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 24px; max-width: 440px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); text-align: center; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">Take Profile Picture</h3>
                <button id="closeCamModal" style="background: transparent; border: none; font-size: 24px; color: #64748b; cursor: pointer; line-height: 1;">&times;</button>
            </div>
            <div style="position: relative; width: 100%; height: 280px; background: #0f172a; border-radius: 14px; overflow: hidden; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
                <video id="camVideo" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"></video>
                <div id="camLoading" style="position: absolute; color: white; font-size: 14px;">Accessing camera...</div>
            </div>
            <div style="display: flex; gap: 12px;">
                <button id="captureCamBtn" style="flex: 1; padding: 12px; background: #007a7a; color: white; border-radius: 10px; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <i class="fa-solid fa-camera"></i> Capture & Save
                </button>
                <button id="cancelCamBtn" style="padding: 12px 20px; background: #f1f5f9; color: #475569; border-radius: 10px; border: 1px solid #cbd5e1; font-weight: 600; cursor: pointer;">
                    Cancel
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const video = modal.querySelector('#camVideo');
    const loadingText = modal.querySelector('#camLoading');
    let mediaStream = null;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
            .then(stream => {
                mediaStream = stream;
                video.srcObject = stream;
                loadingText.style.display = 'none';
            })
            .catch(err => {
                console.error("Camera access error:", err);
                loadingText.textContent = "Camera access denied or unavailable.";
            });
    } else {
        loadingText.textContent = "Camera API not supported by browser.";
    }

    const stopStream = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }
        modal.remove();
    };

    modal.querySelector('#closeCamModal').onclick = stopStream;
    modal.querySelector('#cancelCamBtn').onclick = stopStream;

    modal.querySelector('#captureCamBtn').onclick = async () => {
        if (!mediaStream) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/png');
        localStorage.setItem("profilePicture", dataUrl);
        
        stopStream();
        if (onCaptureSuccess) onCaptureSuccess();

        // Send to backend
        const token = localStorage.getItem("token");
        try {
            await fetch("http://localhost:8080/api/admin/users/me/profile", {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ profilePicture: dataUrl })
            });
        } catch (err) {
            console.error("Failed to save camera snapshot to backend", err);
        }
    };
}

// =========================================================
// UNIVERSAL DIRECT MESSAGING & REQUESTS SYSTEM
// =========================================================
function setupUniversalDirectMessaging() {
    const pageHeader = document.querySelector('.page-header');
    if (!pageHeader) return;

    let msgBtn = document.querySelector('.header-messaging-btn');
    if (!msgBtn) {
        msgBtn = document.createElement('button');
        msgBtn.className = 'header-messaging-btn';
        msgBtn.title = 'Direct Messages & Requests';
        msgBtn.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
            border-radius: 12px;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            color: #007a7a;
            font-size: 18px;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.06);
            margin-right: 12px;
            transition: all 0.2s ease;
            position: relative;
        `;
        msgBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i>`;

        const profileSec = pageHeader.querySelector('.profile-section');
        if (profileSec) {
            pageHeader.insertBefore(msgBtn, profileSec);
        } else {
            pageHeader.appendChild(msgBtn);
        }
    }

    msgBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openDirectMessagingModal();
    };
}

async function openDirectMessagingModal() {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role") || "ROLE_EMPLOYEE";

    const modal = document.createElement('div');
    modal.className = 'universal-messaging-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(4px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;

    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; max-width: 650px; width: 100%; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #e2e8f0;">
            <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(0, 122, 122, 0.1); color: #007a7a; display: flex; align-items: center; justify-content: center; font-size: 18px;">
                        <i class="fa-solid fa-comments"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">Direct Messages & Requests</h3>
                        <p style="margin: 0; font-size: 13px; color: #64748b;">Send & receive organization requests</p>
                    </div>
                </div>
                <button id="closeMsgModal" style="background: transparent; border: none; font-size: 24px; color: #64748b; cursor: pointer; line-height: 1;">&times;</button>
            </div>

            <!-- TAB NAV -->
            <div style="display: flex; border-bottom: 1px solid #e2e8f0; background: #ffffff; padding: 0 24px;">
                <button id="msgTabInbox" style="padding: 14px 20px; border: none; background: transparent; font-weight: 600; font-size: 14px; color: #007a7a; border-bottom: 3px solid #007a7a; cursor: pointer;">
                    <i class="fa-solid fa-inbox"></i> Inbox / Received
                </button>
                <button id="msgTabCompose" style="padding: 14px 20px; border: none; background: transparent; font-weight: 600; font-size: 14px; color: #64748b; border-bottom: 3px solid transparent; cursor: pointer;">
                    <i class="fa-solid fa-paper-plane"></i> Send Request / Message
                </button>
            </div>

            <!-- BODY CONTENT -->
            <div id="msgModalBody" style="padding: 24px; overflow-y: auto; flex: 1;">
                <div id="inboxView">Loading messages...</div>
                <div id="composeView" style="display: none;">
                    <form id="directMsgForm">
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Send To (Recipient)</label>
                            <select id="msgRecipientRole" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 14px; color: #0f172a;">
                                ${userRole !== 'ROLE_HR' ? '<option value="ROLE_HR">HR Manager</option>' : ''}
                                ${userRole !== 'ROLE_ADMIN' ? '<option value="ROLE_ADMIN">System Administrator</option>' : ''}
                                <option value="SPECIFIC_USER">Specific Employee</option>
                                <option value="ALL">All Company Staff</option>
                            </select>
                        </div>
                        <div id="specificEmpWrapper" style="display: none; margin-bottom: 16px;">
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Select Employee</label>
                            <select id="msgSpecificEmployee" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 14px; color: #0f172a;">
                                <option value="">Loading company employees...</option>
                            </select>
                        </div>
                        <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                            <div style="flex: 1;">
                                <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Category</label>
                                <select id="msgCategory" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 14px; color: #0f172a;">
                                    <option value="REQUEST">Official Request</option>
                                    <option value="UPDATE">Work Update</option>
                                    <option value="GENERAL">General Inquiry</option>
                                </select>
                            </div>
                        </div>
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Subject</label>
                            <input type="text" id="msgSubject" required placeholder="e.g. Request for Leave Balance Update / Project Task Update" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 14px;">
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Message Content</label>
                            <textarea id="msgContent" rows="4" required placeholder="Type your detailed message or request here..." style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 14px; font-family: inherit;"></textarea>
                        </div>
                        <button type="submit" style="width: 100%; padding: 12px; background: #007a7a; color: white; border: none; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <i class="fa-solid fa-paper-plane"></i> Send Direct Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#closeMsgModal');
    closeBtn.onclick = () => modal.remove();

    const recipientSelect = modal.querySelector('#msgRecipientRole');
    const specificEmpWrapper = modal.querySelector('#specificEmpWrapper');
    const specificEmpSelect = modal.querySelector('#msgSpecificEmployee');

    recipientSelect.onchange = async () => {
        if (recipientSelect.value === 'SPECIFIC_USER') {
            specificEmpWrapper.style.display = 'block';
            try {
                const uRes = await fetch('http://localhost:8080/api/admin/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (uRes.ok) {
                    const users = await uRes.json();
                    specificEmpSelect.innerHTML = users.map(u => `<option value="${u.email}">${u.fullName} (${u.email}) - ${u.role}</option>`).join('');
                }
            } catch (e) {
                specificEmpSelect.innerHTML = '<option value="user@workforce.com">Default Employee (user@workforce.com)</option>';
            }
        } else {
            specificEmpWrapper.style.display = 'none';
        }
    };

    const tabInbox = modal.querySelector('#msgTabInbox');
    const tabCompose = modal.querySelector('#msgTabCompose');
    const inboxView = modal.querySelector('#inboxView');
    const composeView = modal.querySelector('#composeView');

    tabInbox.onclick = () => {
        tabInbox.style.color = '#007a7a';
        tabInbox.style.borderBottomColor = '#007a7a';
        tabCompose.style.color = '#64748b';
        tabCompose.style.borderBottomColor = 'transparent';
        inboxView.style.display = 'block';
        composeView.style.display = 'none';
        fetchInboxMessages();
    };

    tabCompose.onclick = () => {
        tabCompose.style.color = '#007a7a';
        tabCompose.style.borderBottomColor = '#007a7a';
        tabInbox.style.color = '#64748b';
        tabInbox.style.borderBottomColor = 'transparent';
        composeView.style.display = 'block';
        inboxView.style.display = 'none';
    };

    const fetchInboxMessages = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/messages/inbox', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const messages = await res.json();
                if (!messages.length) {
                    inboxView.innerHTML = `<div style="text-align: center; padding: 40px; color: #64748b;"><i class="fa-solid fa-inbox" style="font-size: 32px; color: #cbd5e1; margin-bottom: 10px;"></i><p>No messages in your inbox yet.</p></div>`;
                    return;
                }

                inboxView.innerHTML = messages.map(m => `
                    <div style="padding: 14px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <strong style="color: #0f172a; font-size: 14px;">${m.senderName}</strong>
                                <span style="font-size: 11px; padding: 2px 8px; border-radius: 10px; background: rgba(0, 122, 122, 0.1); color: #007a7a; font-weight: 600;">${m.senderRole.replace('ROLE_', '')}</span>
                                <span style="font-size: 11px; padding: 2px 8px; border-radius: 10px; background: #e2e8f0; color: #475569; font-weight: 600;">${m.category}</span>
                            </div>
                            <span style="font-size: 12px; color: #94a3b8;">${new Date(m.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 style="margin: 0 0 6px 0; font-size: 14px; color: #1e293b; font-weight: 600;">${m.subject}</h4>
                        <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5; white-space: pre-wrap;">${m.content}</p>
                    </div>
                `).join('');
            }
        } catch (err) {
            inboxView.innerHTML = `<p style="color: #ef4444;">Failed to load inbox messages.</p>`;
        }
    };

    fetchInboxMessages();

    // Handle Form Submit
    const form = modal.querySelector('#directMsgForm');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const recipientRole = modal.querySelector('#msgRecipientRole').value;
        const recipientEmail = recipientRole === 'SPECIFIC_USER' ? specificEmpSelect.value : null;
        const category = modal.querySelector('#msgCategory').value;
        const subject = modal.querySelector('#msgSubject').value;
        const content = modal.querySelector('#msgContent').value;

        try {
            const res = await fetch('http://localhost:8080/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ recipientRole, recipientEmail, category, subject, content })
            });

            if (res.ok) {
                alert('Direct message sent successfully!');
                form.reset();
                specificEmpWrapper.style.display = 'none';
                tabInbox.click();
            } else {
                alert('Failed to send direct message.');
            }
        } catch (err) {
            alert('Error sending direct message.');
        }
    };
}