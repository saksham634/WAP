package com.wap.dto;

public class EditUserRequest {
    private String fullName;

    public EditUserRequest() {}

    public EditUserRequest(String fullName) {
        this.fullName = fullName;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
}
