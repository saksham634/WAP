package com.wap.dto;

public class AddUserRequest {
    private String fullName;
    private String email;
    private String phone;
    private String role; // "ROLE_EMPLOYEE" or "ROLE_HR"
    private String password;
    private String employeeId;
    private String department;
    private String designation;
    private Double baseSalary;
    private Double allowances;
    private Double deductions;

    // Getters and Setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getDepartment() { return department != null ? department : designation; }
    public void setDepartment(String department) { this.department = department; }

    public String getDesignation() { return designation != null ? designation : department; }
    public void setDesignation(String designation) { this.designation = designation; }

    public Double getBaseSalary() { return baseSalary; }
    public void setBaseSalary(Double baseSalary) { this.baseSalary = baseSalary; }

    public Double getAllowances() { return allowances; }
    public void setAllowances(Double allowances) { this.allowances = allowances; }

    public Double getDeductions() { return deductions; }
    public void setDeductions(Double deductions) { this.deductions = deductions; }
}