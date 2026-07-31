package com.wap.dto;

public class PayrollResponseDTO {
    private Long id;
    private String employeeName;
    private String employeeId;
    private String payPeriod; // e.g., "7/2026"
    private Double baseSalary;
    private Double allowances;
    private Integer presentDays;
    private Double deductions;
    private Double netSalary;
    private String status;

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

    // Getters
    public Long getId() { return id; }
    public String getEmployeeName() { return employeeName; }
    public String getEmployeeId() { return employeeId; }
    public String getPayPeriod() { return payPeriod; }
    public Double getBaseSalary() { return baseSalary; }
    public Double getAllowances() { return allowances; }
    public Integer getPresentDays() { return presentDays; }
    public Double getDeductions() { return deductions; }
    public Double getNetSalary() { return netSalary; }
    public String getStatus() { return status; }
}