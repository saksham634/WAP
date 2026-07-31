package com.wap.dto;

public class SettingsRequestDTO {
    private String companyName;
    private String timezone;

    public SettingsRequestDTO() {}

    public SettingsRequestDTO(String companyName, String timezone) {
        this.companyName = companyName;
        this.timezone = timezone;
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
}
