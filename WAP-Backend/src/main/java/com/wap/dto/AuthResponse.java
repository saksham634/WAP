package com.wap.dto;

public class AuthResponse {

    private String token;       // backward compatibility
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Long expiresIn;
    private String role;
    private String employeeId;
    private String fullName;
    private String email;
    private String message;

    public AuthResponse() {}

    // Legacy constructor for backward compatibility
    public AuthResponse(String token, String role, String employeeId, String fullName, String email, String message) {
        this.token = token;
        this.accessToken = token;
        this.role = role;
        this.employeeId = employeeId;
        this.fullName = fullName;
        this.email = email;
        this.message = message;
        this.tokenType = "Bearer";
    }

    // Full constructor
    public AuthResponse(String token, String accessToken, String refreshToken, String tokenType,
                         Long expiresIn, String role, String employeeId, String fullName, String email, String message) {
        this.token = token;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = tokenType != null ? tokenType : "Bearer";
        this.expiresIn = expiresIn;
        this.role = role;
        this.employeeId = employeeId;
        this.fullName = fullName;
        this.email = email;
        this.message = message;
    }

    // ===================== Builder Pattern (manual) =====================

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private Long expiresIn;
        private String role;
        private String employeeId;
        private String fullName;
        private String email;
        private String message;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder accessToken(String accessToken) { this.accessToken = accessToken; return this; }
        public AuthResponseBuilder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }
        public AuthResponseBuilder tokenType(String tokenType) { this.tokenType = tokenType; return this; }
        public AuthResponseBuilder expiresIn(Long expiresIn) { this.expiresIn = expiresIn; return this; }
        public AuthResponseBuilder role(String role) { this.role = role; return this; }
        public AuthResponseBuilder employeeId(String employeeId) { this.employeeId = employeeId; return this; }
        public AuthResponseBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder message(String message) { this.message = message; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, accessToken, refreshToken, tokenType, expiresIn, role, employeeId, fullName, email, message);
        }
    }

    // ===================== Getters & Setters =====================

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(Long expiresIn) { this.expiresIn = expiresIn; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}