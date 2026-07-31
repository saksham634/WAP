// Base API URL for Admin endpoints
const API_BASE_URL = "http://localhost:8080/api/admin";

document.addEventListener("DOMContentLoaded", () => {
    // Fetch Live User Data on Load
    fetchAndRenderUsers();

    // 3. Attach listener to the Add User Form
    const addUserForm = document.getElementById("addUserForm");
    if (addUserForm) {
        addUserForm.addEventListener("submit", handleAddUser);
    }
});

// ==========================================
// ADD NEW USER LOGIC
// ==========================================
async function handleAddUser(e) {
    e.preventDefault(); // Prevent page refresh

    const token = localStorage.getItem("token");
    if (!token) return;

    // Build the payload matching our Java AddUserRequest DTO
    const payload = {
        fullName: document.getElementById("newUserName").value.trim(),
        email: document.getElementById("newUserEmail").value.trim(),
        phone: document.getElementById("newUserPhone").value.trim(),
        role: document.getElementById("newUserRole").value, // "ROLE_EMPLOYEE" or "ROLE_HR"
        password: document.getElementById("newUserPassword").value.trim()
    };

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("User successfully added to the system!");
            document.getElementById("addUserForm").reset(); // Clear inputs
            closeModal("addUserModal"); // Hide the modal
            fetchAndRenderUsers(); // Instantly refresh the data table
        } else {
            const data = await response.json();
            alert("Registration Failed: " + (data.error || "Unknown error occurred."));
        }
    } catch (error) {
        console.error("Error adding user:", error);
        alert("Could not connect to the server. Ensure Spring Boot is running.");
    }
}

// ==========================================
// MODAL HELPER FUNCTIONS
// ==========================================

// NEW: Function to open the modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "flex";
    }
}

// Existing: Function to close the modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none"; 
    }
}

// ==========================================
// FETCH AND RENDER USERS (Existing Logic)
// ==========================================
async function fetchAndRenderUsers() {
    const tbody = document.getElementById("userTableBody");
    if (!tbody) return;

    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../../../public/Login/LogIn.html";
        return;
    }

    try {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Loading users...</td></tr>`;

        const response = await fetch(`${API_BASE_URL}/users`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401 || response.status === 403) {
            alert("Session expired or unauthorized access. Please log in again.");
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "../../../public/Login/LogIn.html";
            return;
        }

        const users = await response.json();

        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No users found in the system.</td></tr>`;
            return;
        }

        tbody.innerHTML = users.map(user => {
            const statusClass = user.status ? user.status.toLowerCase() : "inactive";
            const rawRole = user.role.replace("ROLE_", "");
            const displayRole = rawRole.charAt(0) + rawRole.slice(1).toLowerCase();

            return `
                <tr>
                    <td><b>${user.employeeId}</b></td>
                    <td>${user.fullName}</td>
                    <td>${user.email}</td>
                    <td>${displayRole}</td>
                    <td><span class="badge ${statusClass}">${user.status}</span></td>
                    <td class="action-icons">
                        <i class="fa-solid fa-pen-to-square" title="Edit User" onclick="editUser('${user.employeeId}')" style="cursor: pointer;"></i>
                        <i class="fa-solid fa-trash" style="color: #DC2626; cursor: pointer;" title="Delete User" onclick="deleteUser('${user.employeeId}')"></i>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (error) {
        console.error("Error fetching users:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: #DC2626;">
                    Failed to connect to the server. Please ensure Spring Boot is running.
                </td>
            </tr>`;
    }
}


const API_USERS_URL = "http://localhost:8080/api/admin/users";

async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
        const response = await fetch(`${API_USERS_URL}/${userId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (response.ok) {
            alert("User deleted successfully.");
            location.reload();
        } else {
            alert("Failed to delete user.");
        }
    } catch (error) {
        console.error("Delete Error:", error);
        alert("Server connection error.");
    }
}

async function editUser(userId) {
    const newName = prompt("Enter updated full name:");
    if (!newName) return;

    try {
        const response = await fetch(`${API_USERS_URL}/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ fullName: newName })
        });

        if (response.ok) {
            alert("User updated successfully.");
            location.reload();
        } else {
            alert("Failed to update user.");
        }
    } catch (error) {
        console.error("Edit Error:", error);
        alert("Server connection error.");
    }
}