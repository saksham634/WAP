// Slider Navigation
let currentSlide = 0;
function goToSlide(index) {
    currentSlide = index;
    const slider = document.querySelector(".slider-container");
    slider.style.transition = "transform 0.6s ease";
    slider.style.transform = `translateX(-${index * 20}%)`;
}

// Login → Forgot Password
function showForgot(event) {
    event.preventDefault();
    goToSlide(1);
}

// Forgot Password → Login
function showLogin(event) {
    event.preventDefault();
    goToSlide(0);
}

// Forgot Password → OTP
function goToOTP() {
    const email = document.getElementById("resetpass");
    if (!email.checkValidity()) {
        email.reportValidity();
        return;
    }
    goToSlide(2);
}

// OTP Input Handling
document.addEventListener("DOMContentLoaded", () => {
    const otpInputs = document.querySelectorAll(".otp-input");
    otpInputs.forEach((input, index) => {
        input.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "");
            if (
                this.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        input.addEventListener("keydown", function (e) {
            if ( e.key === "Backspace" && this.value === "" && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });
});

// OTP → Reset Password
function goToUpdatePassword() {
    goToSlide(3);
}

// Update Password
function updatePassword() {
    const oldPass = document.getElementById("oldPassword").value.trim();
    const newPass = document.getElementById("newPassword").value.trim();
    const confirmPass = document.getElementById("confirmPassword").value.trim();

    if (
        oldPass === "" ||
        newPass === "" ||
        confirmPass === ""
    ) {
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
    // Backend API call will be added later
    showSuccessCard();
}

// Success Card
function showSuccessCard() {
    document.getElementById("resetPasswordForm").reset();
    goToSlide(4);
}

// Reset Entire Authentication Flow
function resetAuthFlow() {
    const slider = document.querySelector(".slider-container");

    // Disable animation temporarily
    slider.style.transition = "none";

    // Instantly move to Login card
    slider.style.transform = "translateX(0%)";
    currentSlide = 0;

    // Force browser repaint
    void slider.offsetWidth;

    // Restore animation
    slider.style.transition = "transform 0.6s ease";

    // Clear Forgot Password Email
    const emailField = document.getElementById("resetpass");
    if (emailField) {
        emailField.value = "";
    }

    // Clear OTP Inputs
    document.querySelectorAll(".otp-input").forEach(input => {
        input.value = "";
    });

    // Clear Reset Password Fields
    const oldPassword = document.getElementById("oldPassword");
    const newPassword = document.getElementById("newPassword");
    const confirmPassword = document.getElementById("confirmPassword");
    if (oldPassword) oldPassword.value = "";
    if (newPassword) newPassword.value = "";
    if (confirmPassword) confirmPassword.value = "";

    // Clear Login Fields
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    if (loginEmail) loginEmail.value = "";
    if (loginPassword) loginPassword.value = "";

    // Reset entire reset-password form
    const resetForm = document.getElementById("resetPasswordForm");
    if (resetForm) {
        resetForm.reset();
    }
}