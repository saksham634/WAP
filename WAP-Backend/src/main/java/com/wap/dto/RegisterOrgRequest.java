package com.wap.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class RegisterOrgRequest {

    @NotBlank(message = "Company name is required")
    @JsonProperty("companyName")
    @JsonAlias({"organizationName", "orgName", "company"})
    private String companyName;

    @NotBlank(message = "Admin full name is required")
    @JsonProperty("adminName")
    @JsonAlias({"adminFullName", "fullName", "name"})
    private String adminName;

    @NotBlank(message = "Email address is required")
    @Email(message = "Please provide a valid email address")
    @JsonProperty("email")
    @JsonAlias({"adminEmail", "userEmail"})
    private String email;

    @JsonProperty("phone")
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    @JsonProperty("password")
    @JsonAlias({"adminPassword", "userPassword"})
    private String password;

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getAdminName() {
        return adminName;
    }

    public void setAdminName(String adminName) {
        this.adminName = adminName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}