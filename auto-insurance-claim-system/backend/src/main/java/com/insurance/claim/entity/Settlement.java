package com.insurance.claim.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "settlements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Settlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "claim_id", referencedColumnName = "id", nullable = false)
    private InsuranceClaim claim;

    @Column(name = "claim_number", nullable = false, length = 50)
    private String claimNumber;

    @Column(name = "calculated_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal calculatedAmount;

    @Column(name = "deductible_deducted", nullable = false, precision = 10, scale = 2)
    private BigDecimal deductibleDeducted = BigDecimal.ZERO;

    @Column(name = "depreciation_deducted", nullable = false, precision = 10, scale = 2)
    private BigDecimal depreciationDeducted = BigDecimal.ZERO;

    @Column(name = "final_payable_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal finalPayableAmount;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod = "SIMULATED_DIRECT_DEPOSIT"; // SIMULATED_DIRECT_DEPOSIT, SIMULATED_WIRE, SIMULATED_CHEQUE

    @Column(name = "payment_status", length = 30)
    private String paymentStatus = "PENDING"; // PENDING, PROCESSING, COMPLETED, FAILED

    @Column(name = "transaction_reference", length = 100)
    private String transactionReference;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "account_number_masked", length = 50)
    private String accountNumberMasked;

    @Convert(converter = com.insurance.claim.config.LocalDateTimeConverter.class)
    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Convert(converter = com.insurance.claim.config.LocalDateTimeConverter.class)
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
