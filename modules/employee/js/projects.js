const PROJECTS_API_URL = "http://localhost:8080/api/projects";

document.addEventListener("DOMContentLoaded", () => {
    loadProjects();
    checkRoleAndShowCreateBtn();
});

function checkRoleAndShowCreateBtn() {
    const role = localStorage.getItem("role");
    const createBtn = document.getElementById("createProjectBtn");
    if (createBtn) {
        if (role === "ROLE_ADMIN") {
            createBtn.style.display = "inline-flex";
            createBtn.onclick = openCreateProjectModal;
        } else {
            createBtn.style.display = "none";
        }
    }
}

let currentProjects = [];

async function loadProjects() {
    const token = localStorage.getItem("token");
    const grid = document.getElementById("projectsGrid");
    if (!grid) return;

    try {
        const res = await fetch(PROJECTS_API_URL, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            currentProjects = await res.json();
            renderProjects(currentProjects);
        } else {
            grid.innerHTML = "<p>Error loading projects.</p>";
        }
    } catch (e) {
        console.error("Error fetching projects:", e);
        grid.innerHTML = "<p>Failed to connect to Projects API.</p>";
    }
}

function renderProjects(projects) {
    const grid = document.getElementById("projectsGrid");
    if (!grid) return;

    if (!projects.length) {
        grid.innerHTML = "<p style='color: #64748b;'>No projects found for your organization.</p>";
        return;
    }

    grid.innerHTML = projects.map(p => {
        const memberCount = p.assignedUsers && p.assignedUsers.length > 0 ? p.assignedUsers.length : 0;
        const statusText = p.status === 'COMPLETED' ? 'Completed' : 'Ongoing';
        const statusColor = p.status === 'COMPLETED' ? '#10b981' : '#3b82f6';
        
        const startDateFormatted = p.startDate 
            ? new Date(p.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) 
            : 'N/A';

        return `
        <div class="card project-card" style="background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s ease;">
            <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1e293b; letter-spacing: -0.01em;">${escapeHtml(p.title)}</h3>
                    <span style="font-size: 11px; padding: 4px 8px; border-radius: 6px; font-weight: 600; background: ${getPriorityBg(p.priority)}; color: ${getPriorityColor(p.priority)}; letter-spacing: 0.02em;">${p.priority}</span>
                </div>
                <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0 0 20px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(p.description)}</p>

                <!-- PROGRESS BAR -->
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 500; color: #475569; margin-bottom: 8px;">
                        <span>Progress</span>
                        <span style="color: #0f172a; font-weight: 600;">${p.progress}%</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${p.progress}%; height: 100%; background: #0ea5e9; border-radius: 3px; transition: width 0.4s ease;"></div>
                    </div>
                </div>
            </div>

            <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 12px; font-size: 12px; color: #64748b;">
                    <div style="display: flex; align-items: center; gap: 4px; font-weight: 500;">
                        <i class="fa-solid fa-users" style="color: #94a3b8;"></i>
                        <span>${memberCount} Members</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px; font-weight: 500;">
                        <div style="width: 6px; height: 6px; border-radius: 50%; background: ${statusColor};"></div>
                        <span style="color: ${statusColor};">${statusText}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    ${localStorage.getItem("role") === "ROLE_ADMIN" ? `<button class="btn btn-outline" style="padding: 6px 10px; font-size: 12px; border-radius: 6px; color: #dc2626; border-color: #fca5a5;" onclick="deleteProject(${p.id})"><i class="fa-solid fa-trash"></i></button>` : ''}
                    <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px; border-radius: 6px; font-weight: 500;" onclick="viewProjectTeam(${p.id})">
                        View Team
                    </button>
                </div>
            </div>
            
            <div style="margin-top: 12px; font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
                <i class="fa-regular fa-calendar" style="color: #cbd5e1;"></i>
                <span>Started: ${startDateFormatted}</span>
            </div>
        </div>
        `;
    }).join('');
}

window.deleteProject = async function(projectId) {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${PROJECTS_API_URL}/${projectId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
            loadProjects();
        } else {
            alert("Failed to delete project");
        }
    } catch (e) {
        console.error("Error deleting project", e);
        alert("Connection error");
    }
}

window.viewProjectTeam = async function(projectId) {
    const project = currentProjects.find(p => p.id === projectId);
    const users = project ? project.assignedUsers : [];
    
    if (!users || users.length === 0) {
        alert("No members assigned to this project.");
        return;
    }
    
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    let teamHtml = "";
    
    if (role === "ROLE_ADMIN" || role === "ROLE_HR") {
        try {
            const res = await fetch(`${PROJECTS_API_URL}/${projectId}/team-stats`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const stats = await res.json();
                teamHtml = stats.map(s => `
                    <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: #0f172a;">${escapeHtml(s.fullName)}</strong>
                            <div style="font-size: 12px; color: #64748b;">${escapeHtml(s.designation || s.role)}</div>
                        </div>
                        <div style="text-align: right; font-size: 12px;">
                            <div style="color: ${s.presentDays < 10 ? '#ef4444' : '#10b981'};"><i class="fa-solid fa-user-check"></i> ${s.presentDays} Days Present</div>
                            <div style="color: #475569; margin-top: 4px;"><i class="fa-solid fa-indian-rupee-sign"></i> ${s.baseSalary.toLocaleString()}/mo</div>
                        </div>
                    </div>
                `).join("");
            }
        } catch (e) {
            console.error("Failed to fetch team stats", e);
        }
    }
    
    if (!teamHtml) {
        teamHtml = users.map(u => `
            <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; flex-direction: column;">
                <strong style="color: #0f172a;">${escapeHtml(u.fullName)}</strong>
                <span style="font-size: 12px; color: #64748b;">${escapeHtml(u.designation || u.role)} - ${escapeHtml(u.email)}</span>
            </div>
        `).join("");
    }

    const modal = document.createElement("div");
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px);
        z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 20px;
    `;
    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 24px; max-width: 400px; width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; font-size: 18px;">Project Team</h3>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: transparent; border: none; font-size: 20px; cursor: pointer;">&times;</button>
            </div>
            <div style="max-height: 300px; overflow-y: auto;">
                ${teamHtml}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function openCreateProjectModal() {
    const token = localStorage.getItem("token");
    
    // Fetch users for assignment dropdown
    let users = [];
    try {
        const userRes = await fetch("http://localhost:8080/api/admin/users", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (userRes.ok) users = await userRes.json();
    } catch (e) {
        console.error("Could not fetch users", e);
    }

    const userOptions = users.map(u => `<option value="${u.id}">${u.fullName} (${u.role})</option>`).join("");

    const modal = document.createElement("div");
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px);
        z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 20px;
    `;

    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 24px; max-width: 500px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">Create New Project</h3>
                <button id="closeProjModal" style="background: transparent; border: none; font-size: 24px; color: #64748b; cursor: pointer;">&times;</button>
            </div>
            <form id="createProjForm">
                <div style="margin-bottom: 14px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Project Title</label>
                    <input type="text" id="projTitle" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px;">
                </div>
                <div style="margin-bottom: 14px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Description</label>
                    <textarea id="projDesc" rows="3" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px; font-family: inherit;"></textarea>
                </div>
                <div style="display: flex; gap: 12px; margin-bottom: 14px;">
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Priority</label>
                        <select id="projPriority" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px;">
                            <option value="HIGH">HIGH</option>
                            <option value="MEDIUM" selected>MEDIUM</option>
                            <option value="LOW">LOW</option>
                        </select>
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Initial Progress (%)</label>
                        <input type="number" id="projProgress" value="10" min="0" max="100" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px;">
                    </div>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Assign Employees (Hold Ctrl/Cmd to select multiple)</label>
                    <select id="projTeamSelect" multiple style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px; height: 100px;">
                        ${userOptions}
                    </select>
                </div>
                <button type="submit" style="width: 100%; padding: 12px; background: #007a7a; color: white; border: none; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer;">
                    Create Project
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector("#closeProjModal").onclick = () => modal.remove();

    modal.querySelector("#createProjForm").onsubmit = async (e) => {
        e.preventDefault();
        const title = modal.querySelector("#projTitle").value;
        const description = modal.querySelector("#projDesc").value;
        const priority = modal.querySelector("#projPriority").value;
        const progress = parseInt(modal.querySelector("#projProgress").value) || 0;
        const assignedUserIds = Array.from(modal.querySelector("#projTeamSelect").selectedOptions).map(o => parseInt(o.value));

        try {
            const res = await fetch(PROJECTS_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title, description, priority, progress, assignedUserIds })
            });

            if (res.ok) {
                alert("Project created successfully!");
                modal.remove();
                loadProjects();
            } else {
                alert("Failed to create project.");
            }
        } catch (err) {
            alert("Error creating project.");
        }
    };
}

function getPriorityBg(p) {
    if (p === "HIGH") return "rgba(239, 68, 68, 0.1)";
    if (p === "LOW") return "rgba(16, 185, 129, 0.1)";
    return "rgba(245, 158, 11, 0.1)";
}

function getPriorityColor(p) {
    if (p === "HIGH") return "#ef4444";
    if (p === "LOW") return "#10b981";
    return "#f59e0b";
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
}
