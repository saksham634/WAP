package com.wap.dto;

public class UserSummaryDTO {
    private Long id;
    private String fullName;
    private String role;
    private String designation;
    private String email;

    public UserSummaryDTO(Long id, String fullName, String role, String designation, String email) {
        this.id = id;
        this.fullName = fullName;
        this.role = role;
        this.designation = designation;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getRole() {
        return role;
    }

    public String getDesignation() {
        return designation;
    }

    public String getEmail() {
        return email;
    }
}
