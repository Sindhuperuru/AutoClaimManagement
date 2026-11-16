package com.insurance.claim.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "insurance_claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsuranceClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "claim_number", nullable = false, unique = true, length = 50)
    private String claimNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "policy_id", nullable = false)
    private InsurancePolicy policy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "accident_id", nullable = false)
    private Accident accident;

    @Column(nullable = false, length = 50)
    private String status; // SUBMITTED, UNDER_AGENT_REVIEW, DOCUMENTS_PENDING, UNDER_ASSESSMENT, UNDER_INVESTIGATION, UNDER_OFFICER_REVIEW, APPROVED, REJECTED, SETTLED, CLOSED

    @Column(name = "risk_level", length = 20)
    private String riskLevel = "LOW"; // LOW, MEDIUM, HIGH

    @Column(name = "risk_score")
    private Integer riskScore = 15;

    @Column(name = "estimated_damage", nullable = false, precision = 12, scale = 2)
    private BigDecimal estimatedDamage;

    @Column(name = "approved_settlement_amount", precision = 12, scale = 2)
    private BigDecimal approvedSettlementAmount = BigDecimal.ZERO;

    @Column(name = "process_instance_id", length = 100)
    private String processInstanceId;

    @Convert(converter = com.insurance.claim.config.LocalDateTimeConverter.class)
    @Column(name = "submission_date")
    private LocalDateTime submissionDate = LocalDateTime.now();

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Convert(converter = com.insurance.claim.config.LocalDateTimeConverter.class)
    @Column(name = "sla_due_date")
    private LocalDateTime slaDueDate;

    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ClaimDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ClaimReview> reviews = new ArrayList<>();

    @Convert(converter = com.insurance.claim.config.LocalDateTimeConverter.class)
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Convert(converter = com.insurance.claim.config.LocalDateTimeConverter.class)
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
