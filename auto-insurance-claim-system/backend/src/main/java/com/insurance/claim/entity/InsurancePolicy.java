package com.insurance.claim.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "insurance_policies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsurancePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "policy_number", nullable = false, unique = true, length = 50)
    private String policyNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "policy_type", nullable = false, length = 50)
    private String policyType; // COMPREHENSIVE, THIRD_PARTY, COLLISION, ZERO_DEPRECIATION

    @Column(name = "sum_insured", nullable = false, precision = 12, scale = 2)
    private BigDecimal sumInsured;

    @Column(name = "premium_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal premiumAmount;

    @Column(name = "deductible_amount", precision = 10, scale = 2)
    private BigDecimal deductibleAmount = new BigDecimal("500.00");

    @Convert(converter = com.insurance.claim.config.LocalDateConverter.class)
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Convert(converter = com.insurance.claim.config.LocalDateConverter.class)
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE"; // ACTIVE, EXPIRED, CANCELLED, SUSPENDED

    @Column(name = "coverage_details", columnDefinition = "TEXT")
    private String coverageDetails;

    @Convert(converter = com.insurance.claim.config.LocalDateTimeConverter.class)
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Convert(converter = com.insurance.claim.config.LocalDateTimeConverter.class)
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
