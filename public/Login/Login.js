// ==================================================
// SLIDER NAVIGATION
// ==================================================
const API_BASE_URL = "http://localhost:8080/api/auth";
let currentSlide = 0;

function goToSlide(index) {
    currentSlide = index;
    const slider = document.querySelector(".slider-container");
    if (!slider) return;
    slider.style.transition = "transform 0.6s ease";
    // Modified for 8 slides (100% / 8 = 12.5%)
    slider.style.transform = `translateX(-${index * 12.5}%)`;
}

async function handleLogin() {
    const emailField = document.getElementById("loginEmail");
    const passwordField = document.getElementById("loginPassword");
    
    const email = emailField.value.trim();
    const password = passwordField.value.trim();

    if (email === "" || password === "") {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("employeeId", data.employeeId || "");
            localStorage.setItem("fullName", data.fullName || "");
            localStorage.setItem("userEmail", data.email || email);
            localStorage.setItem("userName", data.fullName || data.employeeId || data.email || "Admin User");

            if (data.role === "ROLE_ADMIN") {
                window.location.href = "../../modules/admin/pages/dashboard.html";
            } else if (data.role === "ROLE_HR") {
                window.location.href = "../../modules/hr/pages/dashboard.html";
            } else {
                window.location.href = "../../modules/employee/pages/dashboard.html";
            }
        } else {
            alert(data.message || "Invalid email or password.");
            passwordField.value = "";
            passwordField.focus();
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Could not connect to the server. Please ensure Spring Boot is running.");
    }
}

// ==================================================
// FORGOT PASSWORD FLOW (WITH REAL OTP)
// ==================================================

// Helper to pull combined values from multiple OTP boxes if used
function getCombinedOtp(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return "";
    let otp = "";
    container.querySelectorAll(".otp-input").forEach(input => {
        otp += input.value.trim();
    });
    return otp;
}

// Step 1: Request Password Reset OTP
async function goToOTP() {
    const emailInput = document.getElementById("resetpass");
    if (!emailInput.checkValidity()) {
        emailInput.reportValidity();
        return;
    }

    const email = emailInput.value.trim();

    try {
        const response = await fetch(`${API_BASE_URL}/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        if (response.ok) {
            alert("OTP successfully sent to " + email);
            goToSlide(2); // Move to OTP slide
        } else {
            alert(data.error || "Failed to send OTP. Ensure it's a valid public domain (Gmail, Outlook, iCloud, etc.).");
        }
    } catch (error) {
        console.error("OTP Send Error:", error);
        alert("Could not connect to server.");
    }
}

// Step 2: Verify Password Reset OTP before letting them change password
async function goToUpdatePassword() {
    const email = document.getElementById("resetpass").value.trim();
    // Assuming your OTP container for forgot password uses a unique ID or selector
    const otp = getCombinedOtp("#forgotPasswordOtpContainer") || document.getElementById("forgotOtpInput")?.value.trim();

    if (!otp || otp.length < 6) {
        alert("Please enter the complete 6-digit OTP code.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, otp: otp })
        });

        const data = await response.json();

        if (response.ok) {
            goToSlide(3); // Move to New Password update slide
        } else {
            alert(data.error || "Invalid or expired OTP.");
        }
    } catch (error) {
        console.error("OTP Verification Error:", error);
        alert("Could not connect to server.");
    }
}

// Step 3: Finalize Password Update
async function updatePassword() {
    const email = document.getElementById("resetpass").value.trim();
    const newPass = document.getElementById("newPassword").value.trim();
    const confirmPass = document.getElementById("confirmPassword").value.trim();

    if (newPass === "" || confirmPass === "") {
        alert("Please fill all fields.");
        return;
    }
    if (newPass.length < 8) {
        alert("Password must contain at least 8 characters.");
        return;
    }
    if (newPass !== confirmPass) {
        alert("New Password and Confirm Password do not match.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, newPassword: newPass })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Password updated successfully!");
            const resetForm = document.getElementById("resetPasswordForm");
            if (resetForm) resetForm.reset();
            goToSlide(4); // Or return to slide 0 for login
        } else {
            alert(data.message || "Failed to update password.");
        }
    } catch (error) {
        console.error("Update Password Error:", error);
        alert("Could not connect to server.");
    }
}

// ==================================================
// ORGANIZATION REGISTRATION FLOW (WITH REAL OTP)
// ==================================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Triggered when clicking "Send OTP" during Org Registration
async function sendOrgRegistrationOtp() {
    const email = document.getElementById("regEmail").value.trim();

    if (!email || !isValidEmail(email)) {
        alert("Please enter a valid email address first.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Verification OTP sent to " + email);
            goToSlide(6);
        } else {
            alert(data.error || "Only valid public domains (Gmail, Outlook, iCloud, Yahoo) are permitted.");
        }
    } catch (error) {
        console.error("Org OTP Error:", error);
        alert("Could not connect to server.");
    }
}

// Final Step: Verify OTP and Create Organization
async function verifyOrgOTP() {
    const email = document.getElementById("regEmail").value.trim();
    // Pulls from your multi-input boxes on Slide 6 (#registerOtpContainer)
    const otp = getCombinedOtp("#registerOtpContainer");
    
    const company = document.getElementById("regCompany").value.trim();
    const adminName = document.getElementById("regAdminName").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    if (otp.length !== 6) {
        alert("Please enter the complete 6-digit OTP code.");
        return;
    }

    try {
        // 1. Verify the OTP against backend
        const verifyRes = await fetch(`${API_BASE_URL}/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, otp: otp })
        });
        const verifyData = await verifyRes.json();

        if (!verifyRes.ok) {
            alert(verifyData.error || "Invalid OTP.");
            return;
        }

        // 2. If valid, register the organization
        const regRes = await fetch(`${API_BASE_URL}/register-org`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                companyName: company,
                adminName: adminName,
                email: email,
                phone: phone,
                password: password
            })
        });
        const regData = await regRes.json();

        if (regRes.ok) {
            goToSlide(7); // Jump to Success Slide
        } else {
            alert("Registration Failed: " + (regData.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Verification Error:", error);
        alert("Could not connect to server. Ensure Spring Boot is running.");
    }
}
// ==================================================
// RESET AUTHENTICATION FLOW
// ==================================================
function resetAuthFlow() {
    const slider = document.querySelector(".slider-container");
    if (!slider) return;
    
    slider.style.transition = "none";
    slider.style.transform = "translateX(0%)";
    currentSlide = 0;
    
    void slider.offsetWidth;
    slider.style.transition = "transform 0.6s ease";

    const resetForm = document.getElementById("resetPasswordForm");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    
    if (resetForm) resetForm.reset();
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();

    const resetEmail = document.getElementById("resetpass");
    if (resetEmail) resetEmail.value = "";

    document.querySelectorAll(".otp-input").forEach(input => {
        input.value = "";
    });
}

// ==================================================
// MULTIPLE OTP INPUT HANDLING
// ==================================================
document.addEventListener("DOMContentLoaded", () => {
    const otpContainers = document.querySelectorAll(".otp-container");
    
    otpContainers.forEach(container => {
        const inputs = container.querySelectorAll(".otp-input");
        
        inputs.forEach((input, index) => {
            input.addEventListener("input", function () {
                this.value = this.value.replace(/\D/g, ""); // Allow only numbers
                if (this.value.length === 1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });

            input.addEventListener("keydown", function (e) {
                if (e.key === "Backspace" && this.value === "" && index > 0) {
                    inputs[index - 1].focus();
                }
            });
        });
    });
});