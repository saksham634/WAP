document.addEventListener("DOMContentLoaded", () => {
    loadPersonalInfo();
    setupEditHandlers();
    setupQuickActions();
});

async function loadPersonalInfo() {
    const token = localStorage.getItem("token");
    let userData = {};
    
    try {
        const res = await fetch("http://localhost:8080/api/admin/users/me", {
            headers: { "Authorization": `Bearer ${token}` },
            cache: "no-store"
        });
        if (res.ok) {
            userData = await res.json();
            // Sync to local storage for quick access elsewhere
            if (userData.phone) localStorage.setItem("userPhone", userData.phone);
        }
    } catch (e) {
        console.error("Failed to fetch user data:", e);
    }

    // 1. Employee Profile Info
    const fullName = userData.fullName || localStorage.getItem("fullName") || "Employee User";
    const employeeId = userData.employeeId || localStorage.getItem("employeeId") || "EMP-1024";
    const email = userData.email || localStorage.getItem("userEmail") || "employee@company.com";
    const phone = userData.phone || localStorage.getItem("userPhone") || "Not set";
    const role = localStorage.getItem("role") === "ROLE_ADMIN" ? "System Administrator" : (localStorage.getItem("role") === "ROLE_HR" ? "HR Manager" : "Employee");
    const dept = userData.department || localStorage.getItem("userDept") || "General";

    document.getElementById("infoFullName").textContent = fullName;
    document.getElementById("infoEmpId").textContent = employeeId;
    document.getElementById("infoEmail").textContent = email;
    document.getElementById("infoPhone").textContent = phone;
    document.getElementById("infoDesignation").textContent = role;
    document.getElementById("infoDepartment").textContent = dept;

    // 2. Address Details
    const street = userData.addressStreet || localStorage.getItem("addrStreet") || "Not set";
    const cityState = userData.addressCityState || localStorage.getItem("addrCityState") || "Not set";
    const zip = userData.addressZip || localStorage.getItem("addrZip") || "Not set";

    document.getElementById("addrStreet").textContent = street;
    document.getElementById("addrCityState").textContent = cityState;
    document.getElementById("addrZip").textContent = zip;

    // 3. Emergency Contact Details
    const emergName = userData.emergencyName || localStorage.getItem("emergName") || "Not set";
    const emergRel = userData.emergencyRelation || localStorage.getItem("emergRelation") || "Not set";
    const emergPhone = userData.emergencyPhone || localStorage.getItem("emergPhone") || "Not set";

    document.getElementById("emergName").textContent = emergName;
    document.getElementById("emergRelation").textContent = emergRel;
    document.getElementById("emergPhone").textContent = emergPhone;
}

function setupEditHandlers() {
    // Edit Contact Info (Phone & Email)
    document.getElementById("editProfileBtn").onclick = () => {
        const currentEmail = document.getElementById("infoEmail").textContent;
        const currentPhone = document.getElementById("infoPhone").textContent !== "Not set" ? document.getElementById("infoPhone").textContent : "";

        openModal("Edit Contact Info", `
            <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 4px;">Email Address</label>
                <input type="email" id="modalEditEmail" value="${currentEmail}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px;">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 4px;">Phone Number</label>
                <input type="text" id="modalEditPhone" value="${currentPhone}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px;">
            </div>
        `, async () => {
            const newPhone = document.getElementById("modalEditPhone").value;
            if (newPhone) {
                const token = localStorage.getItem("token");
                try {
                    await fetch("http://localhost:8080/api/admin/users/me/profile", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify({ phone: newPhone })
                    });
                    localStorage.setItem("userPhone", newPhone);
                } catch(e) { console.error("Save failed", e); }
            }
            loadPersonalInfo();
        });
    };

    // Edit Address Details
    document.getElementById("editAddressBtn").onclick = () => {
        const currentStreet = document.getElementById("addrStreet").textContent !== "Not set" ? document.getElementById("addrStreet").textContent : "";
        const currentCityState = document.getElementById("addrCityState").textContent !== "Not set" ? document.getElementById("addrCityState").textContent : "";
        const currentZip = document.getElementById("addrZip").textContent !== "Not set" ? document.getElementById("addrZip").textContent : "";

        openModal("Edit Residential Address", `
            <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 4px;">Street Address</label>
                <input type="text" id="modalEditStreet" value="${currentStreet}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px;">
            </div>
            <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 4px;">City & State</label>
                <input type="text" id="modalEditCity" value="${currentCityState}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px;">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 4px;">Country & Zip Code</label>
                <input type="text" id="modalEditZip" value="${currentZip}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px;">
            </div>
        `, async () => {
            const token = localStorage.getItem("token");
            const payload = {
                addressStreet: document.getElementById("modalEditStreet").value,
                addressCityState: document.getElementById("modalEditCity").value,
                addressZip: document.getElementById("modalEditZip").value
            };
            try {
                await fetch("http://localhost:8080/api/admin/users/me/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
            } catch(e) { console.error("Save failed", e); }
            loadPersonalInfo();
        });
    };

    // Edit Emergency Contact
    document.getElementById("editEmergencyBtn").onclick = () => {
        const currentName = document.getElementById("emergName").textContent !== "Not set" ? document.getElementById("emergName").textContent : "";
        const currentRel = document.getElementById("emergRelation").textContent !== "Not set" ? document.getElementById("emergRelation").textContent : "";
        const currentPhone = document.getElementById("emergPhone").textContent !== "Not set" ? document.getElementById("emergPhone").textContent : "";

        openModal("Edit Emergency Contact", `
            <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 4px;">Contact Person Name</label>
                <input type="text" id="modalEditEmergName" value="${currentName}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px;">
            </div>
            <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 4px;">Relationship</label>
                <input type="text" id="modalEditEmergRel" value="${currentRel}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px;">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 4px;">Phone Number</label>
                <input type="text" id="modalEditEmergPhone" value="${currentPhone}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px;">
            </div>
        `, async () => {
            const token = localStorage.getItem("token");
            const payload = {
                emergencyName: document.getElementById("modalEditEmergName").value,
                emergencyRelation: document.getElementById("modalEditEmergRel").value,
                emergencyPhone: document.getElementById("modalEditEmergPhone").value
            };
            try {
                await fetch("http://localhost:8080/api/admin/users/me/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
            } catch(e) { console.error("Save failed", e); }
            loadPersonalInfo();
        });
    };
}

function setupQuickActions() {
    // Show ID Badge
    document.getElementById("showEmpIdBox").onclick = () => {
        const empId = localStorage.getItem("employeeId") || "EMP-1024";
        const name = localStorage.getItem("fullName") || "Employee User";
        const role = localStorage.getItem("role") === "ROLE_ADMIN" ? "System Administrator" : "Employee";
        
        openModal("Employee Digital ID Badge", `
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #007a7a, #0d9488); color: white; border-radius: 16px;">
                <div style="width: 70px; height: 70px; border-radius: 50%; background: white; color: #007a7a; font-size: 28px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
                    ${name.charAt(0)}
                </div>
                <h3 style="margin: 0; font-size: 20px;">${name}</h3>
                <p style="margin: 4px 0 12px 0; opacity: 0.9; font-size: 13px;">${role}</p>
                <div style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: 700; font-size: 14px;">
                    ID: ${empId}
                </div>
            </div>
        `, null, false);
    };

    // Request Docs Modal (2 Options: Employee Info PDF & Salary Slips PDF)
    document.getElementById("requestDocsBox").onclick = () => {
        openModal("Request & Download Documents", `
            <div style="display: flex; flex-direction: column; gap: 14px;">
                <button id="dlEmpInfoPdfBtn" style="padding: 16px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; font-weight: 600; color: #0f172a; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 14px;">
                    <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(0, 122, 122, 0.1); color: #007a7a; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
                        <i class="fa-solid fa-file-pdf"></i>
                    </div>
                    <div>
                        <div style="font-size: 15px; font-weight: 700;">Download Complete Employee Info (PDF)</div>
                        <div style="font-size: 13px; color: #64748b;">Official employee record & employment profile</div>
                    </div>
                </button>

                <button id="dlSalarySlipsPdfBtn" style="padding: 16px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; font-weight: 600; color: #0f172a; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 14px;">
                    <div style="width: 42px; height: 42px; border-radius: 10px; background: #dcfce7; color: #166534; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
                        <i class="fa-solid fa-receipt"></i>
                    </div>
                    <div>
                        <div style="font-size: 15px; font-weight: 700;">Download Past Salary Slips (PDF)</div>
                        <div style="font-size: 13px; color: #64748b;">Monthly salary records & breakdown</div>
                    </div>
                </button>
            </div>
        `, null, false);

        document.getElementById("dlEmpInfoPdfBtn").onclick = () => {
            window.print();
        };

        document.getElementById("dlSalarySlipsPdfBtn").onclick = () => {
            window.location.href = "./payroll.html";
        };
    };
}

function openModal(title, bodyHTML, onSaveCallback, showSaveBtn = true) {
    const modal = document.createElement("div");
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px);
        z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 20px;
    `;

    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 24px; max-width: 480px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
                <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">${title}</h3>
                <button id="closeInfoModal" style="background: transparent; border: none; font-size: 24px; color: #64748b; cursor: pointer;">&times;</button>
            </div>
            <div>${bodyHTML}</div>
            ${showSaveBtn ? `
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button id="saveInfoModalBtn" style="flex: 1; padding: 12px; background: #007a7a; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">
                    Save Changes
                </button>
                <button id="cancelInfoModalBtn" style="padding: 12px 20px; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 10px; font-weight: 600; cursor: pointer;">
                    Cancel
                </button>
            </div>` : ''}
        </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector("#closeInfoModal").onclick = close;
    if (modal.querySelector("#cancelInfoModalBtn")) modal.querySelector("#cancelInfoModalBtn").onclick = close;

    if (showSaveBtn && onSaveCallback) {
        modal.querySelector("#saveInfoModalBtn").onclick = async () => {
            const btn = modal.querySelector("#saveInfoModalBtn");
            btn.textContent = "Saving...";
            btn.disabled = true;
            await onSaveCallback();
            close();
        };
    }
}
