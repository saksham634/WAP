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
    private String department;
    private String phone;
    private String phoneNumber;
    private String profilePicture;
    private Double baseSalary;
    private Double allowances;
    private Double deductions;

    public UserDTO() {}

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
        this.department = designation;
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
        this.department = designation;
        this.baseSalary = baseSalary;
        this.allowances = allowances;
        this.deductions = deductions;
    }

    public UserDTO(Long id, String employeeId, String fullName, String email, String role, String status, String permissions, String designation, String phoneNumber, String profilePicture, Double baseSalary, Double allowances, Double deductions) {
        this.id = id;
        this.employeeId = employeeId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.status = status;
        this.permissions = permissions;
        this.designation = designation;
        this.department = designation;
        this.phone = phoneNumber;
        this.phoneNumber = phoneNumber;
        this.profilePicture = profilePicture;
        this.baseSalary = baseSalary;
        this.allowances = allowances;
        this.deductions = deductions;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getEmployeeId() { return employeeId; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getStatus() { return status; }
    public String getPermissions() { return permissions; }
    public String getDesignation() { return designation; }
    public String getDepartment() { return department != null ? department : designation; }
    public String getPhone() { return phone != null ? phone : phoneNumber; }
    public String getPhoneNumber() { return phoneNumber != null ? phoneNumber : phone; }
    public String getProfilePicture() { return profilePicture; }
    public Double getBaseSalary() { return baseSalary != null ? baseSalary : 0.0; }
    public Double getAllowances() { return allowances != null ? allowances : 0.0; }
    public Double getDeductions() { return deductions != null ? deductions : 0.0; }
}