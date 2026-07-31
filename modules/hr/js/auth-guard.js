document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    
    // 1. Authentication Guard: Check if logged in, else redirect to login
    if (!token) {
        window.location.href = "../../../public/Login/LogIn.html";
        return;
    }

    // 2. We can decode the JWT to check the role, or just assume they are HR.
    // For now, if the token is invalid, APIs will return 401/403.
    // Let's add a global fetch interceptor to catch 401/403 and redirect.
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        try {
            const response = await originalFetch(...args);
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                window.location.href = "../../../public/Login/LogIn.html";
            }
            return response;
        } catch (error) {
            throw error;
        }
    };
});
