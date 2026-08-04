package com.wap.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payroll", uniqueConstraints = {
    @UniqueConstraint(name = "uk_payroll_user_month_year", columnNames = {"user_id", "payMonth", "payYear"})
})
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer payMonth; // 1 to 12

    @Column(nullable = false)
    private Integer payYear;

    @Column(nullable = false)
    private Double baseSalary;

    @Column(columnDefinition = "double default 0.0")
    private Double allowances = 0.0;

    @Column(nullable = false)
    private Integer presentDays;

    @Column(nullable = false)
    private Double deductions; // Calculated from unpaid leaves/absences

    @Column(nullable = false)
    private Double netSalary;

    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, PROCESSED, PAID

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime generatedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getPayMonth() { return payMonth; }
    public void setPayMonth(Integer payMonth) { this.payMonth = payMonth; }

    public Integer getPayYear() { return payYear; }
    public void setPayYear(Integer payYear) { this.payYear = payYear; }

    public Double getBaseSalary() { return baseSalary; }
    public void setBaseSalary(Double baseSalary) {
		this.baseSalary = baseSalary;
	}

	public Double getAllowances() {
		return allowances;
	}

	public void setAllowances(Double allowances) {
		this.allowances = allowances;
	}

	public Integer getPresentDays() { return presentDays; }
    public void setPresentDays(Integer presentDays) { this.presentDays = presentDays; }

    public Double getDeductions() { return deductions; }
    public void setDeductions(Double deductions) { this.deductions = deductions; }

    public Double getNetSalary() { return netSalary; }
    public void setNetSalary(Double netSalary) { this.netSalary = netSalary; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}