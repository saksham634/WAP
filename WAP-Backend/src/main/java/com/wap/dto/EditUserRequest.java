package com.wap.dto;

public class EditUserRequest {
    private String fullName;
    private String email;
    private String role;
    private String department;
    private String designation;
    private String status;
    private String phone;
    private String phoneNumber;
    private Double baseSalary;
    private Double allowances;
    private Double deductions;

    public EditUserRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDesignation() { return designation != null ? designation : department; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPhone() { return phone != null ? phone : phoneNumber; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPhoneNumber() { return phoneNumber != null ? phoneNumber : phone; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Double getBaseSalary() { return baseSalary; }
    public void setBaseSalary(Double baseSalary) { this.baseSalary = baseSalary; }

    public Double getAllowances() { return allowances; }
    public void setAllowances(Double allowances) { this.allowances = allowances; }

    public Double getDeductions() { return deductions; }
    public void setDeductions(Double deductions) { this.deductions = deductions; }
}
