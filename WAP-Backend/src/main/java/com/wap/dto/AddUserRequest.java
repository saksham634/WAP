package com.wap.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddUserRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email address is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    private String phone;

    @NotBlank(message = "User role is required (ROLE_EMPLOYEE, ROLE_HR, or ROLE_ADMIN)")
    private String role;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    private String employeeId;
    private String department;
    private String designation;

    @Min(value = 0, message = "Base salary cannot be negative")
    private Double baseSalary;

    @Min(value = 0, message = "Allowances cannot be negative")
    private Double allowances;

    @Min(value = 0, message = "Deductions cannot be negative")
    private Double deductions;

    public String getDepartment() { return department != null ? department : designation; }
    public String getDesignation() { return designation != null ? designation : department; }
}