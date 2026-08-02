package com.wap.dto;

public class SettingsRequestDTO {
    private String companyName;
    private String timezone;
    private String workHours;

    public SettingsRequestDTO() {}

    public SettingsRequestDTO(String companyName, String timezone) {
        this.companyName = companyName;
        this.timezone = timezone;
    }

    public SettingsRequestDTO(String companyName, String timezone, String workHours) {
        this.companyName = companyName;
        this.timezone = timezone;
        this.workHours = workHours;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getWorkHours() {
        return workHours;
    }

    public void setWorkHours(String workHours) {
        this.workHours = workHours;
    }
}
