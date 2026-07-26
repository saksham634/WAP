package com.wap.dto;

public class AuthResponse {
    private String token;
    private String role;
    private String message;

    public AuthResponse(String token, String role, String message) {
        this.token = token;
        this.role = role;
        this.message = message;
    }

    public String getToken() { return token; }
    public String getRole() { return role; }
    public String getMessage() { return message; }
}