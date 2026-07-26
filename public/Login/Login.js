// ==================================================
// SLIDER NAVIGATION
// ==================================================
const API_BASE_URL = "http://localhost:8080/api/auth";
let currentSlide = 0;

function goToSlide(index) {
    currentSlide = index;
    const slider = document.querySelector(".slider-container");
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
        // Send POST request to Spring Boot
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            // Save the JWT token and Role in the browser
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            // Route to the correct dashboard based on backend Role
            if (data.role === "ROLE_ADMIN") {
                window.location.href = "../../modules/admin/pages/dashboard.html";
            } else if (data.role === "ROLE_HR") {
                window.location.href = "../../modules/hr/pages/dashboard.html";
            } else {
                window.location.href = "../../modules/employee/pages/dashboard.html";
            }
        } else {
            // Display error from backend (e.g., Invalid credentials)
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
// FORGOT PASSWORD FLOW
// ==================================================
function goToOTP() {
    const email = document.getElementById("resetpass");
    if (!email.checkValidity()) {
        email.reportValidity();
        return;
    }
    // TODO: Connect to backend API to send actual email OTP here
    goToSlide(2);
}

function goToUpdatePassword() {
    // TODO: Connect to backend API to verify OTP before moving to next slide
    goToSlide(3);
}

function updatePassword() {
    const oldPass = document.getElementById("oldPassword").value.trim();
    const newPass = document.getElementById("newPassword").value.trim();
    const confirmPass = document.getElementById("confirmPassword").value.trim();

    if (oldPass === "" || newPass === "" || confirmPass === "") {
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
    
    // TODO: Connect to backend API to execute password change
    document.getElementById("resetPasswordForm").reset();
    goToSlide(4);
}

// ==================================================
// ORGANIZATION REGISTRATION FLOW
// ==================================================

// Email Regex Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function sendOrgRegistration() {
    const company = document.getElementById("regCompany").value.trim();
    const adminName = document.getElementById("regAdminName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    if (!company || !adminName || !email || !phone || !password) {
        alert("Please fill out all registration fields.");
        return;
    }

    if (!isValidEmail(email)) {
        alert("Please enter a valid official email address.");
        return;
    }

    if (password.length < 8) {
        alert("Admin password must be at least 8 characters.");
        return;
    }

    try {
        // Send POST request to Spring Boot
        const response = await fetch(`${API_BASE_URL}/register-org`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                companyName: company,
                adminName: adminName,
                email: email,
                phone: phone,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Jump directly to the Success Slide (Slide 7)
            goToSlide(7); 
            
            // Clear the form fields
            document.getElementById("registerForm").reset();
        } else {
            alert("Registration Failed: " + data.message);
        }
    } catch (error) {
        console.error("Registration Error:", error);
        alert("Could not connect to the server. Please ensure Spring Boot is running.");
    }
}

// ==================================================
// RESET AUTHENTICATION FLOW
// ==================================================
function resetAuthFlow() {
    const slider = document.querySelector(".slider-container");
    
    // Disable animation temporarily for instant jump back to start
    slider.style.transition = "none";
    slider.style.transform = "translateX(0%)";
    currentSlide = 0;
    
    // Force browser repaint
    void slider.offsetWidth;
    slider.style.transition = "transform 0.6s ease";

    // Clear all standard forms
    const resetForm = document.getElementById("resetPasswordForm");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    
    if (resetForm) resetForm.reset();
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();

    // Clear singular floating inputs
    const resetEmail = document.getElementById("resetpass");
    if (resetEmail) resetEmail.value = "";

    // Clear ALL OTP containers
    document.querySelectorAll(".otp-input").forEach(input => {
        input.value = "";
    });
}

// ==================================================
// MULTIPLE OTP INPUT HANDLING
// ==================================================
document.addEventListener("DOMContentLoaded", () => {
    // Scope OTP input logic specifically per container to prevent overlapping
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