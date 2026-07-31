package com.wap.dto;

public class UserDTO {
    private Long id;
    private String employeeId;
    private String fullName;
    private String email;
    private String role;
    private String status;
    private String permissions;
    private String designation;
    private Double baseSalary;
    private Double allowances;
    private Double deductions;

    public UserDTO(Long id, String employeeId, String fullName, String email, String role, String status) {
        this.id = id;
        this.employeeId = employeeId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.status = status;
    }

    public UserDTO(Long id, String employeeId, String fullName, String email, String role, String status, String permissions) {
        this.id = id;
        this.employeeId = employeeId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.status = status;
        this.permissions = permissions;
    }

    public UserDTO(Long id, String employeeId, String fullName, String email, String role, String status, String permissions, String designation) {
        this.id = id;
        this.employeeId = employeeId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.status = status;
        this.permissions = permissions;
        this.designation = designation;
    }

    public UserDTO(Long id, String employeeId, String fullName, String email, String role, String status, String permissions, String designation, Double baseSalary, Double allowances, Double deductions) {
        this.id = id;
        this.employeeId = employeeId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.status = status;
        this.permissions = permissions;
        this.designation = designation;
        this.baseSalary = baseSalary;
        this.allowances = allowances;
        this.deductions = deductions;
    }

    // Getters
    public Long getId() { return id; }
    public String getEmployeeId() { return employeeId; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getStatus() { return status; }
    public String getPermissions() { return permissions; }
    public String getDesignation() { return designation; }
    public Double getBaseSalary() { return baseSalary; }
    public Double getAllowances() { return allowances; }
    public Double getDeductions() { return deductions; }
}