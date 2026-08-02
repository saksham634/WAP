package com.wap.dto;

public class PayrollResponseDTO {
    private Long id;
    private String employeeName;
    private String employeeId;
    private String payPeriod; // e.g., "8/2026"
    private String month;
    private String year;
    private String designation;
    private Double baseSalary;
    private Double allowances;
    private Integer presentDays;
    private Double deductions;
    private Double netSalary;
    private String status;
    private String generatedDate;

    public PayrollResponseDTO() {}

    public PayrollResponseDTO(Long id, String employeeName, String employeeId, String payPeriod, Double baseSalary, Double allowances, Integer presentDays, Double deductions, Double netSalary, String status) {
        this.id = id;
        this.employeeName = employeeName;
        this.employeeId = employeeId;
        this.payPeriod = payPeriod;
        this.baseSalary = baseSalary;
        this.allowances = allowances;
        this.presentDays = presentDays;
        this.deductions = deductions;
        this.netSalary = netSalary;
        this.status = status;
    }

    public PayrollResponseDTO(Long id, String employeeName, String employeeId, String payPeriod, String month, String year, String designation, Double baseSalary, Double allowances, Integer presentDays, Double deductions, Double netSalary, String status, String generatedDate) {
        this.id = id;
        this.employeeName = employeeName;
        this.employeeId = employeeId;
        this.payPeriod = payPeriod;
        this.month = month;
        this.year = year;
        this.designation = designation;
        this.baseSalary = baseSalary;
        this.allowances = allowances;
        this.presentDays = presentDays;
        this.deductions = deductions;
        this.netSalary = netSalary;
        this.status = status;
        this.generatedDate = generatedDate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getEmployeeName() { return employeeName; }
    public String getEmployeeId() { return employeeId; }
    public String getPayPeriod() { return payPeriod; }
    public String getMonth() { return month; }
    public String getYear() { return year; }
    public String getDesignation() { return designation; }
    public Double getBaseSalary() { return baseSalary; }
    public Double getAllowances() { return allowances; }
    public Integer getPresentDays() { return presentDays; }
    public Double getDeductions() { return deductions; }
    public Double getNetSalary() { return netSalary; }
    public String getStatus() { return status; }
    public String getGeneratedDate() { return generatedDate; }
}