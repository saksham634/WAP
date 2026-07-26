package com.wap.dto;

public class UserDTO {
    private String employeeId;
    private String fullName;
    private String email;
    private String role;
    private String status;

    public UserDTO(String employeeId, String fullName, String email, String role, String status) {
        this.employeeId = employeeId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.status = status;
    }

    // Getters
    public String getEmployeeId() { return employeeId; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getStatus() { return status; }
}