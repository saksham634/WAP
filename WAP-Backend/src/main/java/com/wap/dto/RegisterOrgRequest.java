package com.wap.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterOrgRequest {

    @NotBlank(message = "Company name is required")
    @JsonAlias({"organizationName", "orgName", "company"})
    private String companyName;

    @NotBlank(message = "Admin full name is required")
    @JsonAlias({"adminFullName", "fullName", "name"})
    private String adminName;

    @NotBlank(message = "Email address is required")
    @Email(message = "Please provide a valid email address")
    @JsonAlias({"adminEmail", "userEmail"})
    private String email;

    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    @JsonAlias({"adminPassword", "userPassword"})
    private String password;
}