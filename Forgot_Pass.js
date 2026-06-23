// Slider Navigation Functions
function goToSlide(index) {
    document.querySelector(".slider-container").style.transform =
        `translateX(-${index * 33.333}%)`;
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

// Forgot Password → OTP Verification
function goToOTP(){

    const email = document.getElementById("resetpass");

    console.log(email);
    console.log(email.value);
    console.log(email.checkValidity());

    if(!email.checkValidity()){
        email.reportValidity();
        return;
    }

    goToSlide(2);
}

// OTP Input Handling
document.addEventListener("DOMContentLoaded", () => {
    const otpInputs = document.querySelectorAll(".otp-input");
    console.log("OTP Inputs Found:", otpInputs.length);
    otpInputs.forEach((input, index) => {

        // Only allow numbers & move forward
        input.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "");

            if ( this.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        // Move backward on Backspace
        input.addEventListener("keydown", function (e) {
            if ( e.key === "Backspace" && this.value === "" && index > 0 ) {
                otpInputs[index - 1].focus();
            }
        });
    });
});