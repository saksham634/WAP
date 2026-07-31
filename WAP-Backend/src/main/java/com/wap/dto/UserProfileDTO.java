package com.wap.dto;

public class UserProfileDTO {
    private String fullName;
    private String profilePicture;
    private String employeeId;
    private String email;
    private String phone;
    private String role;
    private String department;
    private String addressStreet;
    private String addressCityState;
    private String addressZip;
    private String emergencyName;
    private String emergencyRelation;
    private String emergencyPhone;

    public UserProfileDTO() {}

    public UserProfileDTO(String fullName, String profilePicture, String employeeId, String email, String phone, String role, String department, String addressStreet, String addressCityState, String addressZip, String emergencyName, String emergencyRelation, String emergencyPhone) {
        this.fullName = fullName;
        this.profilePicture = profilePicture;
        this.employeeId = employeeId;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.department = department;
        this.addressStreet = addressStreet;
        this.addressCityState = addressCityState;
        this.addressZip = addressZip;
        this.emergencyName = emergencyName;
        this.emergencyRelation = emergencyRelation;
        this.emergencyPhone = emergencyPhone;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getAddressStreet() {
        return addressStreet;
    }

    public void setAddressStreet(String addressStreet) {
        this.addressStreet = addressStreet;
    }

    public String getAddressCityState() {
        return addressCityState;
    }

    public void setAddressCityState(String addressCityState) {
        this.addressCityState = addressCityState;
    }

    public String getAddressZip() {
        return addressZip;
    }

    public void setAddressZip(String addressZip) {
        this.addressZip = addressZip;
    }

    public String getEmergencyName() {
        return emergencyName;
    }

    public void setEmergencyName(String emergencyName) {
        this.emergencyName = emergencyName;
    }

    public String getEmergencyRelation() {
        return emergencyRelation;
    }

    public void setEmergencyRelation(String emergencyRelation) {
        this.emergencyRelation = emergencyRelation;
    }

    public String getEmergencyPhone() {
        return emergencyPhone;
    }

    public void setEmergencyPhone(String emergencyPhone) {
        this.emergencyPhone = emergencyPhone;
    }
}
